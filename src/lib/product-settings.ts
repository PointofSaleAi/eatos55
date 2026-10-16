import { useSyncExternalStore } from "react";

/** Demo-only product catalogue settings; never changes what New Order sells or prices. */
export const UOMS = ["kg (Kilogram)", "g (Gram)", "lb (Pound)", "oz (Ounce)", "l (Litre)", "ml (Millilitre)", "gal (Gallon)", "pt (Pint)", "fl oz (Fluid Ounce)", "ea (Each)"];
export const uomShort = (u: string) => u.split(" (")[0];

export type Variant = { id: string; name: string; sku: string; barcode: string; inventory: string; threshold: string; uom: string; price: string; adjusted: string; timed: string };
export type ProductRule = {
  id: string; name: string; menuName: string; displayName: string; printerName: string; printers: string[];
  code: string; barcode: string; categories: string[]; course: string; modifiers: string[]; addOns: string[];
  description: string; addToMenu: boolean; eightySixed: boolean; inventory: boolean; negative: boolean; uomOnKot: boolean;
  variants: Variant[]; defaultModifiers: string[]; vat: string[]; discounts: string[]; photo: string; archived: boolean;
};

export const varId = () => `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
export const newVariant = (name = ""): Variant => ({ id: varId(), name, sku: "", barcode: "", inventory: "", threshold: "", uom: "", price: "", adjusted: "", timed: "" });
export function newProduct(): ProductRule {
  return { id: `prod-${Date.now()}`, name: "", menuName: "", displayName: "", printerName: "", printers: [], code: "", barcode: "", categories: [], course: "None",
    modifiers: [], addOns: [], description: "", addToMenu: true, eightySixed: false, inventory: false, negative: false, uomOnKot: false,
    variants: [], defaultModifiers: [], vat: [], discounts: [], photo: "", archived: false };
}
const p = (name: string, price: string, variants = 1): ProductRule => ({
  ...newProduct(), id: `seed-${name}`, name, menuName: name, displayName: name, printerName: name,
  variants: Array.from({ length: variants }, (_, i) => ({ ...newVariant(i ? `Variant ${i + 1}` : name), id: `seed-v-${name}-${i}`, sku: "1", price, uom: "ea (Each)" })),
});
const SEED: ProductRule[] = [
  p("2 for £14 spritz deal", "14.00"), p("APEROL Spritz", "7.95"), p("Apple Juice - Pint", "3.50"), p("Beef Burger", "15.00", 2),
  p("Beef Chilli Potato", "10.00", 2), p("BLT Sandwich", "8.00"), p("Breakfast Sandwich", "7.00"), p("Brixton - Half", "3.00"),
  p("Brixton - Half Shandy", "2.40"), p("Brixton - Pint", "6.00"), p("Brixton - Shandy", "4.85"),
];

const KEY = "eatos.pos.product-settings";
let cache: ProductRule[] | null = null;
const listeners = new Set<() => void>();
function read() {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? JSON.parse(raw) : SEED; } catch { cache = SEED; }
  return cache!;
}
function write(next: ProductRule[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full (e.g. large photo) */ }
  listeners.forEach((l) => l());
}
export function useProductSettings() {
  const products = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
  return {
    products,
    save(r: ProductRule) { const cur = read(); write(cur.some((x) => x.id === r.id) ? cur.map((x) => (x.id === r.id ? r : x)) : [...cur, r]); },
    patch(id: string, q: Partial<ProductRule>) { write(read().map((x) => (x.id === id ? { ...x, ...q } : x))); },
  };
}
