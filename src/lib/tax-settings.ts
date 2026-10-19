import { menu } from "@/lib/demo-data";

export type TaxType = "Exclusive" | "Inclusive";
export type TaxRule = { id: string; name: string; amount: string; type: TaxType | ""; applicableTo: string[]; products: string[]; archived?: boolean };

export const taxApplicableTo = ["Banquet", "Cash Drawer", "Custom Item", "Delivery", "Dine-In", "Pick Up", "Take Out", "Online Ordering", "Service Charge", "Drive Thru"];
export const taxProducts = (): string[] => Array.from(new Set(menu.map(item => item.name))).sort((a, b) => a.localeCompare(b));

export const referenceTaxes: TaxRule[] = [
  { id: "tax-vat", name: "VAT", amount: "20", type: "Inclusive", applicableTo: [...taxApplicableTo], products: taxProducts() },
];

export const newTax = (): TaxRule => ({ id: `tax-${crypto.randomUUID()}`, name: "", amount: "", type: "", applicableTo: [], products: [] });

export function taxErrors(tax: TaxRule) {
  const value = Number(tax.amount);
  return {
    name: tax.name.trim() ? "" : "Name cannot be empty",
    amount: tax.amount.trim() === "" || !Number.isFinite(value) || value < 0 || value > 100 ? "Enter a percentage between 0 and 100" : "",
    type: tax.type ? "" : "Please select a type",
  };
}
export const taxValid = (tax: TaxRule) => Object.values(taxErrors(tax)).every(e => !e);
export const formatTaxAmount = (amount: string, digits = 2) => `${Number(amount || 0).toFixed(digits)}%`;
