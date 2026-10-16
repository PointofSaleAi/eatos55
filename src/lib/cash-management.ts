import { useSyncExternalStore } from "react";

/** Demo-only cash drawer state. Never opens a real drawer or changes checkout totals. */
export type CashLog = { id: string; date: string; time: string; name: string; reason: string; payIn: number; payOut: number; note?: string };
export type CashState = { previousClose: number; openingTill: number; tillOpen: boolean; logs: CashLog[]; tips: Record<string, number> };

const KEY = "eatos.pos.cash-management";
export const PAY_IN_REASONS = ["Change Order", "Tips", "Other"];
export const PAY_OUT_REASONS = ["Tips", "Cash Refund", "Cash Out", "Delivery", "Grocery", "Other"];

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function seed(): CashState {
  const date = todayKey();
  return {
    previousClose: 0, openingTill: 0, tillOpen: false, tips: { e2: 100 },
    logs: [
      { id: "s3", date, time: "09:34 AM", name: "Elizer Cruz", reason: "Close Drawer", payIn: 0, payOut: 100 },
      { id: "s2", date, time: "09:33 AM", name: "Elizer Cruz", reason: "Open Till", payIn: 1000, payOut: 0 },
      { id: "s1", date, time: "09:32 AM", name: "Dana Whitfield", reason: "Change Order", payIn: 100, payOut: 0 },
    ],
  };
}

let state: CashState | null = null;
const listeners = new Set<() => void>();
function read(): CashState {
  if (state) return state;
  try { const raw = localStorage.getItem(KEY); state = raw ? JSON.parse(raw) : seed(); } catch { state = seed(); }
  return state!;
}
const SERVER = seed();
function write(next: CashState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

/** Cash expected in the drawer since the till was opened. */
export function estimatedCash(s: CashState) {
  if (!s.tillOpen) return 0;
  const date = todayKey();
  const openIdx = s.logs.findIndex((l) => l.reason === "Open Till" && l.date === date);
  const since = openIdx === -1 ? [] : s.logs.slice(0, openIdx);
  return s.openingTill + since.reduce((sum, l) => sum + l.payIn - l.payOut, 0);
}

export function useCashManagement() {
  const s = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SERVER);
  const log = (entry: Omit<CashLog, "id" | "date" | "time">) => ({ ...entry, id: `${Date.now()}`, date: todayKey(), time: nowTime() });
  return {
    state: s,
    estimated: estimatedCash(s),
    openTill(amount: number, name: string) {
      const cur = read();
      write({ ...cur, tillOpen: true, openingTill: amount, logs: [log({ name, reason: "Open Till", payIn: amount, payOut: 0 }), ...cur.logs] });
    },
    record(kind: "in" | "out", amount: number, employee: { id: string; name: string }, reason: string, note: string) {
      const cur = read();
      const tips = { ...cur.tips };
      if (reason === "Tips") tips[employee.id] = Math.max(0, (tips[employee.id] ?? 0) + (kind === "in" ? amount : -amount));
      write({ ...cur, tips, logs: [log({ name: employee.name, reason, payIn: kind === "in" ? amount : 0, payOut: kind === "out" ? amount : 0, ...(note ? { note } : {}) }), ...cur.logs] });
    },
    closeDrawer(name: string) {
      const cur = read();
      const remaining = estimatedCash(cur);
      write({ ...cur, tillOpen: false, openingTill: 0, previousClose: remaining, logs: [log({ name, reason: "Close Drawer", payIn: 0, payOut: remaining }), ...cur.logs] });
    },
  };
}
