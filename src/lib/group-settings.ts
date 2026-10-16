import { useSyncExternalStore } from "react";

/** Demo-only modifier/add-on groups; never changes New Order modifiers or add-ons. */
export type GroupType = "" | "Modifier" | "Add-On";
export type GroupRule = {
  id: string; name: string; displayName: string; type: GroupType; items: string[]; defaults: string[]; position: string;
  mandatory: boolean; min: number; limit: boolean; max: number; archived: boolean;
};
export const newGroup = (): GroupRule => ({ id: `grp-${Date.now()}`, name: "", displayName: "", type: "", items: [], defaults: [], position: "", mandatory: false, min: 1, limit: false, max: 1, archived: false });
const g = (name: string, type: GroupType): GroupRule => ({ ...newGroup(), id: `seed-${name}`, name, displayName: name, type });
const SEED: GroupRule[] = [
  g("Add Ons", "Add-On"),
  ...["Allergen", "Burger and Sandwich Sides Choice", "Cheese Choice", "Choice of Dipping Sauce", "Choice of Peas", "Choice of Side", "Coffee Options", "Coffee Syrup", "DRAUGHT ADDONS", "Egg Style Choice", "Gammon Side Choice"].map((n) => g(n, "Modifier")),
];

const KEY = "eatos.pos.group-settings";
let cache: GroupRule[] | null = null;
const listeners = new Set<() => void>();
function read() {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? JSON.parse(raw) : SEED; } catch { cache = SEED; }
  return cache!;
}
function write(next: GroupRule[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function useGroupSettings() {
  const groups = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
  return {
    groups,
    save(r: GroupRule) { const cur = read(); write(cur.some((x) => x.id === r.id) ? cur.map((x) => (x.id === r.id ? r : x)) : [...cur, r]); },
    patch(id: string, q: Partial<GroupRule>) { write(read().map((x) => (x.id === id ? { ...x, ...q } : x))); },
  };
}
