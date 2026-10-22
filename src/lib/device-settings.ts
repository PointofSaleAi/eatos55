export const deviceSettingGroups = [
  { label: "Pin & Security", rows: [
    ["openRegister", "Open Register", false], ["summaryPrint", "Summary print on clock-out", true],
    ["lockAfterAttempts", "Lock app after 5 attempts", true], ["forceCheck", "Force Check", true],
    ["forceClockIn", "Force Clock In", false], ["forceLogin", "Force login after each order", false],
    ["hideBreak", "Hide Break on PIN Screen", false], ["hideFeedback", "Hide Employee Feedback", false],
    ["quickLogin", "Quick Employee Login (No PIN)", false],
  ] },
  { label: "Menu", rows: [["showProductPrices", "Show Product Prices", true]] },
  { label: "Ordering", rows: [
    ["hideFire", "Hide Fire Button", false], ["mandatoryOrderType", "Mandatory Order Type", false],
    ["requireOrderName", "Require name in order type selection", false], ["saveOrder", "Save Button in Order Placement", true],
    ["delivery", "Delivery", true], ["incompletePopup", "Enable Incomplete Transaction Popup", true],
    ["printChildKot", "Print KOT by Child Category", true], ["transferPin", "Manager pin needed for order transfer", true],
  ] },
  { label: "Payment", rows: [["splitBill", "Split Bill", true], ["drawerWarning", "Show Cash Drawer Warning", false]] },
  { label: "OrderOS", rows: [["merchant", "Enable Merchant", true]] },
  { label: "Table", rows: [
    ["hideSeat", "Hide Seat Selector", true], ["resetTables", "Reset Tables Daily", true],
    ["reservationTab", "Reservation Tab Enabled", true], ["autoAvailable", "Auto-Set Table to Available", true],
  ] },
  { label: "Kitchen Display System", rows: [["kitchenDisplay", "Switch to Kitchen Display", true]] },
] as const;
export type DeviceToggleKey = typeof deviceSettingGroups[number]["rows"][number][0];
export type DevicePreferences = {
  toggles: Record<DeviceToggleKey, boolean>;
  autoLockTimer: string;
  menuSort: string;
  modifierStyle: string;
  designTheme: string;
};
export const defaultDevicePreferences: DevicePreferences = {
  toggles: Object.fromEntries(deviceSettingGroups.flatMap((group) => group.rows.map(([key, , value]) => [key, value]))) as Record<DeviceToggleKey, boolean>,
  autoLockTimer: "Never", menuSort: "Drag & Drop", modifierStyle: "Standard", designTheme: "Classic",
};

export function productPricesVisible(preferences: DevicePreferences): boolean {
  return preferences.toggles.showProductPrices !== false;
}