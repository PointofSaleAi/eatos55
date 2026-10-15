export const peripheralSettingScreens = {
  hardware: { title: "Hardware Control", groups: [
    { label: "Card Settings", rows: [["cardReaderBeep", "Card Reader Beep", true]] },
    { label: "Kitchen Display System Setting", rows: [["kitchenNotification", "Kitchen Display System Notification", true]] },
    { label: "QR Settings", rows: [["qrBillReceipt", "Enable QR Bill/Receipt", false]] },
  ] },
  guest: { title: "Guest Facing Display", groups: [
    { label: "Customer Display", rows: [
      ["autoCloseWithoutDisplay", "Auto-Close without Display", false],
      ["builtInCustomerDisplay", "Built-in Customer Display", true],
      ["displayTips", "Display Tips on Customer Display", false],
    ] },
    { label: "Payments & tips", rows: [["requestCardReaderTip", "Request Tip From CardReader", false]] },
    { label: "QR on display", rows: [["qrPaymentCfd", "Enable QR Payment on CFD", false]] },
  ] },
} as const;
export type PeripheralToggleKey = typeof peripheralSettingScreens[keyof typeof peripheralSettingScreens]["groups"][number]["rows"][number][0];
export type PeripheralPreferences = Record<PeripheralToggleKey, boolean>;
export const defaultPeripheralPreferences = Object.fromEntries(
  Object.values(peripheralSettingScreens).flatMap((screen) => screen.groups.flatMap((group) => group.rows.map(([key, , value]) => [key, value]))),
) as PeripheralPreferences;