export type ServiceChargeAmountType = "Percentage" | "Amount";
export type ServiceChargeAppliedAs = "Basic" | "Auto Service Fee" | "Tip";
export type ServiceChargeRule = {
  id: string; name: string; value: string; type: ServiceChargeAmountType;
  onlyShowName: boolean; taxes: string[]; orderTypes: string[];
  appliedAs: ServiceChargeAppliedAs; autoApply: boolean; minSeats: number;
  archived?: boolean;
};

export const serviceChargeOrderTypes = ["Restaurant", "Take Out", "Banquet", "Delivery", "Drive Thru"];
export const serviceChargeAppliedAs: ServiceChargeAppliedAs[] = ["Basic", "Auto Service Fee", "Tip"];

const base = (): Omit<ServiceChargeRule, "id" | "name" | "value" | "type"> => ({
  onlyShowName: false, taxes: [], orderTypes: [], appliedAs: "Basic", autoApply: false, minSeats: 0,
});

export const referenceServiceCharges: ServiceChargeRule[] = [
  { ...base(), id: "sc-delivery-fee", name: "Delivery Fee", value: "20", type: "Amount" },
  { ...base(), id: "sc-half-payment", name: "Half Payment", value: "50", type: "Percentage" },
];

export const newServiceCharge = (): ServiceChargeRule => ({ ...base(), id: `sc-${crypto.randomUUID()}`, name: "", value: "", type: "Percentage" });

export function serviceChargeErrors(s: ServiceChargeRule) {
  const v = Number(s.value);
  return {
    name: s.name.trim() ? "" : "Please enter a name for the service charge",
    value: s.value.trim() === "" || !Number.isFinite(v) || v <= 0 || (s.type === "Percentage" && v > 100) ? "Enter a valid amount for the service charge" : "",
    seats: s.autoApply && s.minSeats < 1 ? "Table size must be greater than 0" : "",
  };
}
export const serviceChargeValid = (s: ServiceChargeRule) => Object.values(serviceChargeErrors(s)).every(e => !e);
export const formatServiceCharge = (s: ServiceChargeRule) => s.type === "Percentage" ? `${Number(s.value || 0).toFixed(1)}%` : `$${Number(s.value || 0).toFixed(2)}`;
