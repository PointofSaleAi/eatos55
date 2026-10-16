import { useSyncExternalStore } from "react";

/** Demo-only inventory counts; never changes New Order, sales or 86 status. */
export type InvVariant = { id: string; name: string; par: number; onHand: number };
export type InvProduct = { id: string; name: string; sku: string; price: string; category: string; variants: InvVariant[] };

export const INVENTORY_CATEGORIES = [
  "Hot Drink", "DBL Spirits", "Red Wine 250ml", "Colombian Flavor Fiesta Appetizer", "wqwqw", "Sourdough Pizzas", "SANDWICHES / CIABATTAS",
  "Drinks", "Foods", "DESSERTS", "Draught Half", "Draught Pints", "Draught Shandy", "Draught Soft Drinks", "Half Shandy", "Reception",
  "Soft Drinks", "Cocktails", "Juices", "Starters", "Mains", "Sides", "Kids Menu", "Burgers", "Breakfast", "Bar Snacks", "Retail", "Specials", "Ice Cream",
];

const v = (pid: string, name: string, par = 0, onHand = 0, i = 0): InvVariant => ({ id: `${pid}-v${i}`, name, par, onHand });
const p = (name: string, sku: string, price: string, category: string, variants?: [string, number, number][]): InvProduct => {
  const id = `inv-${name}`;
  return { id, name, sku, price, category, variants: (variants ?? [[name, 0, 0]]).map(([n, a, b], i) => v(id, n, a, b, i)) };
};
const SEED: InvProduct[] = [
  p("2 for £14 spritz deal", "1", "14.00", "Drinks", [["spritz deal", 5, 5]]),
  p("Apple Juice - Pint", "1", "3.50", "Soft Drinks", [["Apple Juice - Pint", 15.621, 50.512]]),
  p("BLT Sandwich", "1", "8.00", "SANDWICHES / CIABATTAS"),
  p("Camomile", "1", "3.00", "Hot Drink", [["Camomile", 20, 60]]),
  p("Car Charger", "1", "5.00", "Retail"),
  p("Cheesecake", "1", "15.00", "DESSERTS"),
  p("Chicken Pizza", "123", "12.22", "Sourdough Pizzas", [["med", 1, 1]]),
  p("Crumpets", "1", "3.50", "Breakfast"),
  p("Fruit Shoot", "1", "1.50", "Kids Menu", [["Apple", 0, 0], ["Orange", 0, 0]]),
  p("Garlic Bread", "1", "3.50", "Starters", [["Regular", 0, 0], ["Cheese", 0, 0], ["Large", 0, 0], ["Large Cheese", 0, 0]]),
  p("Kids Ice Cream", "1", "10.00", "Ice Cream"),
  p("Nachos", "1", "10.00", "Bar Snacks", [["Regular", 0, 0], ["Large", 0, 0]]),
  p("Side of Toast", "1", "2.00", "Sides"),
  p("Steak Pie", "1", "14.00", "Mains"),
  p("Tomato Soup", "1", "6.50", "Starters"),
];

export const isLow = (x: InvVariant) => x.par > 0 && x.onHand < x.par;
export const isOut = (x: InvVariant) => x.onHand <= 0;

const KEY = "eatos.pos.inventory-settings";
let cache: InvProduct[] | null = null;
const listeners = new Set<() => void>();
function read() {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? JSON.parse(raw) : SEED; } catch { cache = SEED; }
  return cache!;
}
function write(next: InvProduct[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function useInventorySettings() {
  const products = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
  return {
    products,
    patchVariant(pid: string, vid: string, q: Partial<InvVariant>) {
      write(read().map((x) => (x.id !== pid ? x : { ...x, variants: x.variants.map((y) => (y.id === vid ? { ...y, ...q } : y)) })));
    },
  };
}
