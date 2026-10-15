export const printerSettingGroups = [
  { label: "Bill Settings", rows: [
    ["billAutoPrint", "Auto Print", false],
    ["singleItem", "Display on Single Item", true],
    ["freeItems", "Free Items on Bill", true],
    ["freeModifiers", "Free Modifiers on Bill", true],
  ], copies: "billCopies", caption: "Number of bill copies to print per order" },
  { label: "Receipt Settings", rows: [
    ["receiptAutoPrint", "Auto Print", false],
    ["refundReceipt", "Auto Print Refund Receipt", true],
    ["itemisedReceipt", "Itemised Receipt", true],
    ["customerCopy", "Print Customer Copy", true],
  ], copies: "receiptCopies", caption: "Number of receipt copies to print per transaction" },
  { label: "Kitchen Settings", rows: [
    ["largeItemText", "Large Kitchen Order Ticket Item Text", false],
    ["largeOrderNumber", "Large Kitchen Order Ticket Order Number", false],
    ["individualItems", "Print Each Item Individually", false],
    ["reverseFont", "Reverse Kitchen Order Ticket Font Style", false],
    ["showCovers", "Show Covers on KOT", true],
  ], copies: "kitchenCopies", caption: "Number of KOT copies to print per order" },
] as const;
export type PrinterToggleKey = typeof printerSettingGroups[number]["rows"][number][0] | "suggestedTip" | "clockReport" | "signatureTipLine";
export type PrinterCopiesKey = typeof printerSettingGroups[number]["copies"];
export type PrinterPreferences = Record<PrinterToggleKey, boolean> & Record<PrinterCopiesKey, number> & {
  modifierSize: string[];
  printWith: string[];
  salesOver: number;
};
export const defaultPrinterPreferences: PrinterPreferences = {
  ...Object.fromEntries(printerSettingGroups.flatMap(group => group.rows.map(([key, , value]) => [key, value]))) as Record<PrinterToggleKey, boolean>,
  suggestedTip: true, clockReport: true, signatureTipLine: true,
  billCopies: 1, receiptCopies: 1, kitchenCopies: 1,
  modifierSize: ["Tall", "Wide", "Bold"], printWith: [], salesOver: 0,
};