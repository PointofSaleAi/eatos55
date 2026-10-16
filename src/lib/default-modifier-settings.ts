import { useSyncExternalStore } from "react";

/** Demo-only default modifiers; never changes New Order or product defaults. */
export const DEFAULT_MODIFIER_TYPES = ["Normal", "Exceptional"];
export type DefaultModifier = { id: string; name: string; type: string; archived: boolean };
export const newDefaultModifier = (): DefaultModifier => ({ id: `dm-${Date.now()}`, name: "", type: "Normal", archived: false });

const SEED: DefaultModifier[] = ["Bacon", "Baked Beans", "Brownie Pieces", "Butter", "Cheese", "Chili Jam", "Choc Sauce", "Coleslaw", "Dairy", "Egg", "Gherkins", "Gluten"]
  .map((name) => ({ id: `seed-${name}`, name, type: "Normal", archived: false }));

const KEY = "eatos.pos.default-modifier-settings";
let cache: DefaultModifier[] | null = null;
const listeners = new Set<() => void>();
function read() {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? JSON.parse(raw) : SEED; } catch { cache = SEED; }
  return cache!;
}
function write(next: DefaultModifier[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function useDefaultModifierSettings() {
  const items = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
  return {
    items,
    save(r: DefaultModifier) { const cur = read(); write(cur.some((x) => x.id === r.id) ? cur.map((x) => (x.id === r.id ? r : x)) : [...cur, r]); },
    patch(id: string, q: Partial<DefaultModifier>) { write(read().map((x) => (x.id === id ? { ...x, ...q } : x))); },
  };
}
