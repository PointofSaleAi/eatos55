import { useSyncExternalStore } from "react";

/** Demo-only category settings; never changes New Order categories or printing. */
export const COURSES = ["None", "Starter", "Main", "Dessert"];
export const PRINTERS = ["EPSON U220(66)", "Star Main POS(42)", "POS EXPO(1)", "Sunmi Printer(21)", "iMin Printer(37)", "TSP143IV (STR-001)(15)", "EPSON-U220(98)"];

export type CategoryRule = {
  id: string; name: string; position: string; course: string; displayName: string; code: string;
  printers: string[]; labelPrinting: boolean; allergenPrompt: boolean; parent: string; products: string[]; archived: boolean;
};

export function newCategory(): CategoryRule {
  return { id: `cat-${Date.now()}`, name: "", position: "", course: "None", displayName: "", code: "", printers: [], labelPrinting: false, allergenPrompt: false, parent: "", products: [], archived: false };
}
const c = (name: string, parent: string, position: string): CategoryRule => ({ ...newCategory(), id: `seed-${name}`, name, parent, position });
const SEED: CategoryRule[] = [
  c("Colombian Flavor Fiesta Appetizer", "Drinks", "1"), c("DBL Spirits", "Drinks", "4"), c("DESSERTS", "Foods", "5"),
  c("Draught Half", "Drinks", "11"), c("Draught Pints", "Drinks", "10"), c("Draught Shandy", "Drinks", "10"),
  c("Draught Soft Drinks", "Drinks", "7"), c("Drinks", "", "2"), c("Foods", "", "1"), c("Half Shandy", "Drinks", "10"),
  c("Hot Drink", "Drinks", "14"), c("Reception", "", "3"), c("Red Wine 250ml", "", "6"),
];

const KEY = "eatos.pos.category-settings";
let cache: CategoryRule[] | null = null;
const listeners = new Set<() => void>();
function read() {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? JSON.parse(raw) : SEED; } catch { cache = SEED; }
  return cache!;
}
function write(next: CategoryRule[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function useCategorySettings() {
  const categories = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
  return {
    categories,
    save(r: CategoryRule) { const cur = read(); write(cur.some((x) => x.id === r.id) ? cur.map((x) => (x.id === r.id ? r : x)) : [...cur, r]); },
    patch(id: string, p: Partial<CategoryRule>) { write(read().map((x) => (x.id === id ? { ...x, ...p } : x))); },
  };
}
