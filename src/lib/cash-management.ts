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
  return state ?? seed();
}
const SERVER = seed();
function write(next: CashState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

/** Cash since the last close, including pay-ins made before opening the till. */
export function estimatedCash(s: CashState) {
  const closeIdx = s.logs.findIndex((l) => l.reason === "Close Drawer");
  const since = closeIdx === -1 ? s.logs : s.logs.slice(0, closeIdx);
  const movements = since.filter((l) => l.reason !== "Open Till");
  return Math.round(((s.tillOpen ? s.openingTill : 0) + movements.reduce((sum, l) => sum + l.payIn - l.payOut, 0)) * 100) / 100;
}

export type CashAction =
  | { kind: "open"; amount: number; name: string }
  | { kind: "in" | "out"; amount: number; employee: { id: string; name: string }; reason: string; note: string }
  | { kind: "close"; name: string };

/** Atomic demo transitions also protect against stale or repeated actions. */
export function applyCashAction(cur: CashState, action: CashAction, at = new Date()): CashState {
  const entry = (row: Omit<CashLog, "id" | "date" | "time">): CashLog => ({
    ...row, id: crypto.randomUUID(), date: todayKey(at),
    time: at.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  });
  if (action.kind === "open") {
    if (cur.tillOpen) throw new Error("Close the drawer before adjusting the opening balance");
    if (!Number.isFinite(action.amount) || action.amount < 0) throw new Error("Enter a valid opening amount");
    const amount = Math.round(action.amount * 100) / 100;
    return { ...cur, tillOpen: true, openingTill: amount, logs: [entry({ name: action.name, reason: "Open Till", payIn: amount, payOut: 0 }), ...cur.logs] };
  }
  if (!cur.tillOpen && action.kind !== "in") throw new Error("Open the till balance first");
  if (action.kind === "close") {
    const remaining = estimatedCash(cur);
    return { ...cur, tillOpen: false, openingTill: 0, previousClose: remaining, logs: [entry({ name: action.name, reason: "Close Drawer", payIn: 0, payOut: remaining }), ...cur.logs] };
  }
  if (!Number.isFinite(action.amount) || action.amount <= 0) throw new Error("Enter an amount first");
  const amount = Math.round(action.amount * 100) / 100;
  if (action.kind === "out" && amount > estimatedCash(cur)) throw new Error("Pay out is more than the cash in drawer");
  const reasons = action.kind === "in" ? PAY_IN_REASONS : PAY_OUT_REASONS;
  if (!action.employee.id || !action.employee.name || !reasons.includes(action.reason)) throw new Error("Select an employee and a reason");
  const note = action.note.trim();
  if (action.reason === "Other" && !note) throw new Error("Add a note for Other");
  const tips = { ...cur.tips };
  if (action.reason === "Tips") tips[action.employee.id] = Math.max(0, Math.round(((tips[action.employee.id] ?? 0) + (action.kind === "in" ? amount : -amount)) * 100) / 100);
  return { ...cur, tips, logs: [entry({ name: action.employee.name, reason: action.reason, payIn: action.kind === "in" ? amount : 0, payOut: action.kind === "out" ? amount : 0, ...(note ? { note } : {}) }), ...cur.logs] };
}

export function useCashManagement() {
  const s = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SERVER);
  return {
    state: s,
    estimated: estimatedCash(s),
    openTill(amount: number, name: string) {
      write(applyCashAction(read(), { kind: "open", amount, name }));
    },
    record(kind: "in" | "out", amount: number, employee: { id: string; name: string }, reason: string, note: string) {
      write(applyCashAction(read(), { kind, amount, employee, reason, note }));
    },
    closeDrawer(name: string) {
      write(applyCashAction(read(), { kind: "close", name }));
    },
  };
}
