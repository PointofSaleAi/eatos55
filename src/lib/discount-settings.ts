import { menu } from "@/lib/demo-data";

export type DiscountType = "Percentage" | "Amount";
export type DiscountDay = { enabled: boolean; start: string; end: string };
export type DiscountRule = {
  id: string; name: string; value: string; type: DiscountType;
  individual: boolean; categoriesOn: boolean; categories: string[]; products: string[];
  managerPin: boolean; onlyShowName: boolean; open: boolean;
  scheduled: boolean; startDate: string; endDate: string; startTime: string; endTime: string;
  days?: DiscountDay[];
  archived?: boolean;
};

export const defaultDiscountDays = (): DiscountDay[] => Array.from({ length: 7 }, () => ({ enabled: false, start: "00:00", end: "23:59" }));

export const discountCategories = (): string[] => Array.from(new Set(menu.map(m => m.category))).sort((a, b) => a.localeCompare(b));

const base = (): Omit<DiscountRule, "id" | "name" | "value"> => ({
  type: "Percentage", individual: false, categoriesOn: false, categories: [], products: [],
  managerPin: false, onlyShowName: false, open: false,
  scheduled: false, startDate: "", endDate: "", startTime: "", endTime: "",
});

export const referenceDiscounts: DiscountRule[] = [
  { ...base(), id: "disc-big-sale", name: "Big Sale Hour", value: "15", managerPin: true },
  { ...base(), id: "disc-limited", name: "Limited Sale", value: "10", onlyShowName: true, products: menu[0] ? [menu[0].name] : [] },
];

export const newDiscount = (): DiscountRule => ({ ...base(), id: `disc-${crypto.randomUUID()}`, name: "", value: "" });

export function discountErrors(d: DiscountRule) {
  const v = Number(d.value);
  const badValue = !d.open && (d.value.trim() === "" || !Number.isFinite(v) || v <= 0 || (d.type === "Percentage" && v > 100));
  return {
    name: d.name.trim() ? "" : "Please enter a name for the discount",
    value: badValue ? "Enter a valid value for the discount" : "",
    schedule: d.scheduled && d.startDate && d.endDate && d.endDate < d.startDate ? "End date must be on or after start date" : "",
  };
}
export const discountValid = (d: DiscountRule) => Object.values(discountErrors(d)).every(e => !e);
export const formatDiscount = (d: DiscountRule) => d.open ? "Open" : d.type === "Percentage" ? `${Number(d.value || 0).toFixed(1)}%` : `$${Number(d.value || 0).toFixed(2)}`;
