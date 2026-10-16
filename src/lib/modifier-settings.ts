import { useSyncExternalStore } from "react";

/** Demo-only modifier settings; never changes the New Order product modal or prices. */
export const ORDER_TYPE_TAGS = ["Dine In", "To Go", "Delivery", "Banquet", "Drive Thru"];

export type ModifierOption = { id: string; name: string; price: string };
export type ModifierRule = {
  id: string; name: string; orderTypes: string[]; served: boolean; eightySixed: boolean;
  hasOptions: boolean; options: ModifierOption[]; maxOn: boolean; max: number; archived: boolean;
};

export const optId = () => `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
export function newModifier(): ModifierRule {
  return { id: `mod-${Date.now()}`, name: "", orderTypes: [], served: false, eightySixed: false, hasOptions: false, options: [], maxOn: false, max: 1, archived: false };
}
const m = (name: string, price = "0.00", type = "Regular"): ModifierRule => ({
  ...newModifier(), id: `seed-${name}`, name, orderTypes: [...ORDER_TYPE_TAGS], hasOptions: true,
  options: [{ id: `seed-opt-${name}`, name: type, price }], maxOn: true, max: 1,
});
const SEED: ModifierRule[] = [
  m("Add Blackcurrent", "0.60"), m("Add Lime", "0.60"), m("aperol spritz"), m("Apple and Blackcurrant Fruit Shoot"), m("Apples"),
  m("Apricot Jam"), m("BBQ Sauce"), m("Beans"), m("Blue Cheese"), m("Brown Bread"), m("Caramel Syrup", "0.50"), m("Celery Allergy"),
  m("Poached"), m("Rare"), m("Rasberry Jam"), m("Regular Cheese"), m("Salad"), m("Scrambled"), m("Seasonal Veg"), m("Shellfish-Free"),
  m("Slimline Tonic", "1.85", "Slimline Tonic"), m("Sour Cream and Chives"), m("Soy Milk", "0.50"), m("Soy-Free"), m("Sriracha Sauce"),
  m("Strawberry"), m("Sweet Chilli"), m("Tartar Sauce"), m("Toffee Sauce"), m("Tonic Water", "1.85"), m("Truffle Parm Fries", "1.50"),
  m("Vanilla"), m("Vanilla Syrup", "0.50"), m("Vegan"), m("Vegetarian"), m("Well Done"), m("White Bread"),
];

function createRuleStore(KEY: string, SEED: ModifierRule[]) {
  let cache: ModifierRule[] | null = null;
  const listeners = new Set<() => void>();
  function read() {
    if (cache) return cache;
    try { const raw = localStorage.getItem(KEY); cache = raw ? JSON.parse(raw) : SEED; } catch { cache = SEED; }
    return cache!;
  }
  function write(next: ModifierRule[]) {
    cache = next;
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    listeners.forEach((l) => l());
  }
  return function useRules() {
    const modifiers = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
    return {
      modifiers,
      save(r: ModifierRule) { const cur = read(); write(cur.some((x) => x.id === r.id) ? cur.map((x) => (x.id === r.id ? r : x)) : [...cur, r]); },
      patch(id: string, p: Partial<ModifierRule>) { write(read().map((x) => (x.id === id ? { ...x, ...p } : x))); },
    };
  };
}
export type RuleStoreHook = ReturnType<typeof createRuleStore>;
export const useModifierSettings = createRuleStore("eatos.pos.modifier-settings", SEED);

const a = (name: string, type = "Regular", max = 1): ModifierRule => ({ ...m(name, "1.00", type), id: `seed-addon-${name}`, max });
const ADDON_SEED: ModifierRule[] = ["Add Bacon", "Add Cheese", "Add Chicken", "Add Chorizo", "Add Ham", "Add Honey", "Add Mushroom", "Add Olives", "Add Pepperoni", "Add Pineapple", "Add Sausage"]
  .map((n) => a(n)).concat(a("Add One Egg", "Fried", 3));
/** Demo-only add-ons; never changes New Order product add-ons or prices. */
export const useAddOnSettings = createRuleStore("eatos.pos.addon-settings", ADDON_SEED);
