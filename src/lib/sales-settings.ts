export type SalesPreferences = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  serviceCharge: string;
  orderType: string;
  paymentMethod: string;
  discountType: string;
  discount: boolean;
  promoCode: boolean;
  includeServiceCharge: boolean;
  refund: boolean;
  vatInNet: boolean;
  roomCharge: boolean;
};

export const defaultSalesPreferences: SalesPreferences = {
  startDate: "2026-10-15", endDate: "2027-10-15",
  startTime: "12:00 AM", endTime: "11:59 PM",
  serviceCharge: "All", orderType: "All", paymentMethod: "All", discountType: "Select",
  discount: false, promoCode: false, includeServiceCharge: false,
  refund: false, vatInNet: false, roomCharge: false,
};