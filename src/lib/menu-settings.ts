import { useSyncExternalStore } from "react";

/** Demo-only menu schedules; never changes what New Order sells. */
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const REVENUE_CENTERS = ["Manila", "Alabang", "Sucat", "Bicutan"];
export const CHANNELS = [
  { id: "pos", label: "Keep Menu Active for Point Of Sale" },
  { id: "pop", label: "Keep Menu Active for Point Of Purchase" },
  { id: "kiosk", label: "Keep Menu Active for KIOSK" },
  { id: "orderos", label: "Keep Menu Active for Order-OS" },
] as const;
export type ChannelId = (typeof CHANNELS)[number]["id"];
export type DaySlot = { on: boolean; start: string; end: string };
export type Channel = { enabled: boolean; start: string; end: string; days: DaySlot[] };
export type MenuRule = {
  id: string; name: string; active: boolean; archived: boolean;
  channels: Record<ChannelId, Channel>; categories: string[]; revenueCenters: string[];
};

const days = (on: boolean, start = "12:00 AM", end = "11:59 PM"): DaySlot[] => WEEKDAYS.map(() => ({ on, start, end }));
export const emptyChannel = (): Channel => ({ enabled: false, start: "", end: "", days: days(false) });
export function newMenu(): MenuRule {
  return { id: `menu-${Date.now()}`, name: "", active: true, archived: false, categories: [], revenueCenters: [],
    channels: { pos: emptyChannel(), pop: emptyChannel(), kiosk: emptyChannel(), orderos: emptyChannel() } };
}
const SEED: MenuRule[] = [{
  id: "boathouse", name: "Boathouse", active: true, archived: false,
  categories: ["Breakfast", "Burgers", "Drinks"], revenueCenters: ["Manila"],
  channels: {
    pos: { enabled: true, start: "2026-01-01", end: "2029-12-31", days: days(true) },
    pop: emptyChannel(), kiosk: emptyChannel(),
    orderos: { enabled: true, start: "2026-02-10", end: "2033-02-16", days: days(true, "11:00 AM", "09:00 PM") },
  },
}];

/** Status-row dates: earliest enabled channel. */
export function menuDates(m: MenuRule) {
  const ch = CHANNELS.map((c) => m.channels[c.id]).find((c) => c.enabled && c.start);
  return { start: ch?.start ?? "", end: ch?.end ?? "" };
}
export function fmtDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "Choose";
}
/** Validation per enabled channel; null when ok. */
export function channelError(c: Channel): string | null {
  if (!c.enabled) return null;
  if (!c.start) return "Please select start date";
  if (!c.end) return "Please select end date";
  if (c.end < c.start) return "End date must be after start date";
  return null;
}

const KEY = "eatos.pos.menu-settings";
let cache: MenuRule[] | null = null;
const listeners = new Set<() => void>();
function read() {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? JSON.parse(raw) : SEED; } catch { cache = SEED; }
  return cache!;
}
function write(next: MenuRule[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function useMenuSettings() {
  const menus = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
  return {
    menus,
    save(m: MenuRule) { const cur = read(); write(cur.some((x) => x.id === m.id) ? cur.map((x) => (x.id === m.id ? m : x)) : [...cur, m]); },
    patch(id: string, p: Partial<MenuRule>) { write(read().map((x) => (x.id === id ? { ...x, ...p } : x))); },
  };
}
