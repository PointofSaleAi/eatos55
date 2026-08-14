import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Boxes,
  CalendarClock,
  CircleDollarSign,
  CircleDot,
  Coins,
  CreditCard,
  Globe,
  Grid2x2,
  HandCoins,
  Inbox,
  Info,
  Layers,
  LayoutList,
  PencilRuler,
  Percent,
  Printer,
  Receipt,
  ReceiptText,
  ScrollText,
  Server,
  Settings as SettingsIcon,
  Store,
  Tablet,
  Timer,
  Users,
} from "lucide-react";

import type { AppSettings } from "@/lib/pos-store";

/**
 * Settings rows are descriptors, not strings: the detail screen renders the
 * right control per kind and only lets managers change them.
 */
export type DetailRow =
  /** Comes from Back Office - read-only for everyone. */
  | { kind: "readonly"; label: string; value?: string }
  | { kind: "toggle"; label: string; field: keyof AppSettings }
  | { kind: "choice"; label: string; field: keyof AppSettings; options: string[] }
  | { kind: "text"; label: string; field: keyof AppSettings }
  /** Editable collection (discounts, modifier groups, …). */
  | { kind: "list"; label: string; field: keyof AppSettings; addLabel?: string };

export type DetailScreen = {
  title: string;
  backLabel?: string;
  intro?: string;
  icon?: LucideIcon;
  rows?: DetailRow[];
  /** Shown when a collection is empty. */
  empty?: string;
  note?: string;
};

const ro = (label: string, value?: string): DetailRow =>
  value === undefined ? { kind: "readonly", label } : { kind: "readonly", label, value };

/** Content for every Settings detail screen. */
export const settingsDetails: Record<string, DetailScreen> = {
  "device-name": {
    title: "Device Name",
    backLabel: "General",
    icon: Tablet,
    rows: [
      { kind: "text", label: "Name", field: "deviceName" },
      ro("Serial", "HH-22-9041"),
      ro("Assigned To", "Front of house"),
    ],
    note: "Serial and assignment come from Back Office.",
  },
  "restaurant-information": {
    title: "Restaurant Information",
    backLabel: "General",
    icon: Store,
    rows: [
      { kind: "text", label: "Name", field: "restaurantName" },
      { kind: "text", label: "Address", field: "restaurantAddress" },
      { kind: "text", label: "City", field: "restaurantCity" },
      { kind: "text", label: "Phone", field: "restaurantPhone" },
      { kind: "text", label: "Tax ID", field: "taxId" },
      {
        kind: "choice",
        label: "Time Zone",
        field: "timezone",
        options: [
          "America/New_York",
          "America/Chicago",
          "America/Denver",
          "America/Los_Angeles",
        ],
      },
    ],
  },
  "restaurant-settings": {
    title: "Restaurant Settings",
    backLabel: "General",
    icon: SettingsIcon,
    rows: [
      {
        kind: "choice",
        label: "Service Mode",
        field: "deviceService",
        options: ["Table Service", "Quick Service"],
      },
      { kind: "toggle", label: "Auto-print Receipts", field: "autoPrintReceipts" },
      { kind: "toggle", label: "Ask For Tip", field: "askForTip" },
      {
        kind: "choice",
        label: "Cash Rounding",
        field: "cashRounding",
        options: ["Nearest cent", "Nearest 5 cents", "Nearest dollar"],
      },
      { kind: "toggle", label: "Require Manager Void", field: "requireManagerVoid" },
    ],
  },
  language: {
    title: "Language",
    backLabel: "General",
    icon: Globe,
    rows: [{ kind: "choice", label: "Language", field: "language", options: ["English"] }],
    note: "Additional language packs are installed from Back Office.",
  },
  currency: {
    title: "Currency",
    backLabel: "General",
    icon: CircleDollarSign,
    rows: [
      {
        kind: "choice",
        label: "Currency",
        field: "currency",
        options: ["USD", "CAD", "EUR", "GBP"],
      },
    ],
  },
  "tax-alias": {
    title: "Tax Alias",
    backLabel: "General",
    icon: Percent,
    rows: [
      {
        kind: "choice",
        label: "Alias shown on receipts",
        field: "taxAlias",
        options: ["Tax", "VAT", "GST"],
      },
    ],
  },
  "schedule-info": {
    title: "Schedule Info",
    backLabel: "General",
    icon: CalendarClock,
    rows: [
      ro("Today", "11:00 AM – 11:00 PM"),
      ro("Your Shift", "5:00 PM – 1:00 AM"),
      ro("Break", "30 min · unused"),
      ro("Next Shift", "Tomorrow 5:00 PM"),
    ],
    note: "Shift schedule syncs from Back Office.",
  },
  "timed-pricing": {
    title: "Timed Pricing",
    backLabel: "General",
    icon: Timer,
    rows: [
      { kind: "list", label: "Rules", field: "timedPricing", addLabel: "Add Rule" },
    ],
    empty: "No timed pricing rules on this device.",
  },
  about: {
    title: "About",
    backLabel: "General",
    icon: Info,
    rows: [
      ro("App Version", "5.200.27 (+11350)"),
      ro("Framework", "3.44.2"),
      ro("Build Date", "31.07.26"),
      ro("Device", "aurora 22"),
      ro("Platform", "Handheld"),
    ],
  },

  // Menu
  categories: {
    title: "Categories",
    backLabel: "Menu",
    icon: LayoutList,
    rows: [{ kind: "list", label: "Categories", field: "categories", addLabel: "Add Category" }],
    empty: "No categories on this device.",
  },
  modifiers: {
    title: "Modifiers",
    backLabel: "Menu",
    icon: CircleDot,
    rows: [
      { kind: "list", label: "Modifier Groups", field: "modifierGroups", addLabel: "Add Group" },
    ],
    empty: "No modifier groups on this device.",
  },
  "add-ons": {
    title: "Add-Ons",
    backLabel: "Menu",
    icon: Grid2x2,
    rows: [{ kind: "list", label: "Add-Ons", field: "addOns", addLabel: "Add Add-On" }],
    empty: "No add-ons configured.",
  },
  inventory: {
    title: "Inventory",
    backLabel: "Menu",
    icon: PencilRuler,
    rows: [
      { kind: "toggle", label: "Tracking", field: "trackInventory" },
      { kind: "toggle", label: "Low Stock Alerts", field: "lowStockAlerts" },
      { kind: "toggle", label: "Show Sold Out Items", field: "showSoldOut" },
      ro("Sold Out Items", "2"),
    ],
  },
  "default-modifiers": {
    title: "Default Modifiers",
    backLabel: "Menu",
    icon: Boxes,
    rows: [
      {
        kind: "list",
        label: "Default Modifiers",
        field: "defaultModifiers",
        addLabel: "Add Default",
      },
    ],
    empty: "No default modifiers set.",
  },
  groups: {
    title: "Groups",
    backLabel: "Menu",
    icon: Layers,
    rows: [{ kind: "list", label: "Groups", field: "productGroups", addLabel: "Add Group" }],
    empty: "No product groups on this device.",
  },

  // Payments
  gratuity: {
    title: "Gratuity",
    backLabel: "Payments",
    icon: HandCoins,
    rows: [
      { kind: "toggle", label: "Ask For Tip", field: "askForTip" },
      { kind: "text", label: "Presets", field: "tipPresets" },
      { kind: "choice", label: "Tip Basis", field: "tipBasis", options: ["Pre-tax", "Post-tax"] },
      {
        kind: "choice",
        label: "Custom Tip",
        field: "customTip",
        options: ["Allowed", "Not allowed"],
      },
    ],
  },
  taxes: {
    title: "Taxes",
    backLabel: "Payments",
    icon: ScrollText,
    rows: [
      { kind: "text", label: "Default Rate", field: "taxRate" },
      { kind: "choice", label: "Alias", field: "taxAlias", options: ["Tax", "VAT", "GST"] },
      { kind: "toggle", label: "Inclusive Pricing", field: "inclusivePricing" },
    ],
  },
  discounts: {
    title: "Discounts",
    backLabel: "Payments",
    icon: BadgePercent,
    rows: [{ kind: "list", label: "Discounts", field: "discounts", addLabel: "Add Discount" }],
    empty: "No discounts configured.",
  },
  "service-charge": {
    title: "Service Charge",
    backLabel: "Payments",
    icon: ReceiptText,
    rows: [
      { kind: "toggle", label: "Enabled", field: "serviceChargeEnabled" },
      { kind: "text", label: "Name", field: "serviceChargeName" },
      { kind: "text", label: "Rate", field: "serviceChargeRate" },
      {
        kind: "choice",
        label: "Applies To",
        field: "serviceChargeAppliesTo",
        options: ["All orders", "Dine-in", "Delivery"],
      },
      { kind: "list", label: "Rules", field: "serviceCharges", addLabel: "Add Rule" },
    ],
  },
  "cash-management": {
    title: "Cash Management",
    backLabel: "Payments",
    icon: Coins,
    rows: [
      { kind: "text", label: "Cash Drawer", field: "cashDrawerAssigned" },
      {
        kind: "choice",
        label: "Open Register",
        field: "openRegister",
        options: ["Manager only", "Any employee"],
      },
      { kind: "toggle", label: "Blind Close", field: "blindClose" },
      { kind: "toggle", label: "Open Drawer On Sale", field: "openDrawerOnSale" },
    ],
  },
  receipts: {
    title: "Receipts",
    backLabel: "Payments",
    icon: Receipt,
    rows: [
      { kind: "toggle", label: "Auto-print", field: "autoPrintReceipts" },
      { kind: "toggle", label: "Email Receipts", field: "emailReceipts" },
      { kind: "toggle", label: "Print Logo", field: "printLogo" },
      { kind: "text", label: "Footer Message", field: "receiptFooter" },
    ],
  },

  // Hardware / Network
  printer: {
    title: "Printer",
    backLabel: "Hardware",
    icon: Printer,
    rows: [
      { kind: "text", label: "Kitchen Printer", field: "printerName" },
      { kind: "text", label: "Connection", field: "printerConnection" },
      {
        kind: "choice",
        label: "Paper Width",
        field: "paperWidth",
        options: ["58 mm", "80 mm"],
      },
      { kind: "toggle", label: "Printer Emulator", field: "printerEmulator" },
    ],
  },
  "card-reader": {
    title: "Card Reader",
    backLabel: "Hardware",
    icon: Tablet,
    rows: [
      ro("Built-in Reader", "Ready"),
      { kind: "toggle", label: "Contactless", field: "contactless" },
      { kind: "toggle", label: "Reader Emulator", field: "readerEmulator" },
      ro("Firmware", "2.14.0"),
    ],
  },
  "cash-drawer": {
    title: "Cash Drawer",
    backLabel: "Hardware",
    icon: Inbox,
    rows: [
      { kind: "text", label: "Paired Drawer", field: "cashDrawerAssigned" },
      { kind: "toggle", label: "Open Drawer On Sale", field: "openDrawerOnSale" },
      { kind: "toggle", label: "Blind Close", field: "blindClose" },
    ],
  },
  "hardware-emulators": {
    title: "Hardware Emulators",
    backLabel: "Hardware",
    icon: CreditCard,
    rows: [
      { kind: "toggle", label: "Printer Emulator", field: "printerEmulator" },
      { kind: "toggle", label: "Reader Emulator", field: "readerEmulator" },
    ],
    note: "Emulators are enabled for demo mode.",
  },
  servers: {
    title: "Servers",
    backLabel: "Network",
    icon: Server,
    rows: [
      { kind: "text", label: "Server", field: "deviceName" },
      ro("Status", "Connected · 38 ms"),
      ro("Sync", "Up to date"),
    ],
  },

  // Workforce
  employee: {
    title: "Employee",
    backLabel: "Workforce",
    icon: Users,
    rows: [
      ro("Elizer Cruz", "Supervisor"),
      ro("Maya Reyes", "Server"),
      ro("Tom Alvarez", "Bartender"),
      ro("Dana Whitfield", "Manager"),
    ],
    note: "Employee list syncs from Back Office.",
  },
};
