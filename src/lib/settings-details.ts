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

export type DetailRow = { label: string; value?: string };

export type DetailScreen = {
  title: string;
  backLabel?: string;
  intro?: string;
  icon?: LucideIcon;
  /** Read-only detail rows. */
  rows?: DetailRow[];
  /** Optional pick list bound to a settings field. */
  choice?: { field: keyof AppSettings; options: string[]; label: string };
  /** Shown instead of rows when there is nothing configured. */
  empty?: string;
  note?: string;
};

/** Content for every Settings row that used to be a toast-only tap. */
export const settingsDetails: Record<string, DetailScreen> = {
  "restaurant-information": {
    title: "Restaurant Information",
    backLabel: "General",
    icon: Store,
    rows: [
      { label: "Name", value: "EATOS Kitchen · Downtown" },
      { label: "Address", value: "418 W 25th St" },
      { label: "City", value: "New York, NY 10001" },
      { label: "Phone", value: "(212) 555-0148" },
      { label: "Tax ID", value: "88-4102397" },
      { label: "Time Zone", value: "America/New_York" },
    ],
    note: "Restaurant details are maintained in Back Office and read-only on the handheld.",
  },
  "restaurant-settings": {
    title: "Restaurant Settings",
    backLabel: "General",
    icon: SettingsIcon,
    rows: [
      { label: "Service Mode", value: "Table Service" },
      { label: "Auto-print Receipts", value: "On" },
      { label: "Ask For Tip", value: "On" },
      { label: "Cash Rounding", value: "Nearest cent" },
      { label: "Require Manager Void", value: "Yes" },
    ],
  },
  language: {
    title: "Language",
    backLabel: "General",
    icon: Globe,
    choice: { field: "language", options: ["English"], label: "Installed languages" },
    note: "Additional language packs are installed from Back Office.",
  },
  currency: {
    title: "Currency",
    backLabel: "General",
    icon: CircleDollarSign,
    choice: { field: "currency", options: ["USD", "CAD", "EUR", "GBP"], label: "Currency" },
  },
  "tax-alias": {
    title: "Tax Alias",
    backLabel: "General",
    icon: Percent,
    choice: { field: "taxAlias", options: ["Tax", "VAT", "GST"], label: "Alias shown on receipts" },
  },
  "schedule-info": {
    title: "Schedule Info",
    backLabel: "General",
    icon: CalendarClock,
    rows: [
      { label: "Today", value: "11:00 AM – 11:00 PM" },
      { label: "Your Shift", value: "5:00 PM – 1:00 AM" },
      { label: "Break", value: "30 min · unused" },
      { label: "Next Shift", value: "Tomorrow 5:00 PM" },
    ],
    note: "Shift schedule syncs from Back Office.",
  },
  "timed-pricing": {
    title: "Timed Pricing",
    backLabel: "General",
    icon: Timer,
    empty: "No timed pricing rules on this device.",
  },
  about: {
    title: "About",
    backLabel: "General",
    icon: Info,
    rows: [
      { label: "App Version", value: "5.200.27 (+11350)" },
      { label: "Framework", value: "3.44.2" },
      { label: "Build Date", value: "31.07.26" },
      { label: "Device", value: "aurora 22" },
      { label: "Platform", value: "Handheld" },
    ],
  },

  // Menu
  categories: {
    title: "Categories",
    backLabel: "Menu",
    icon: LayoutList,
    rows: [
      { label: "Breakfast", value: "12 items" },
      { label: "Sandwiches", value: "9 items" },
      { label: "Drinks", value: "14 items" },
      { label: "Desserts", value: "6 items" },
    ],
    note: "Categories sync from Back Office.",
  },
  modifiers: {
    title: "Modifiers",
    backLabel: "Menu",
    icon: CircleDot,
    empty: "No modifier groups on this device.",
  },
  "add-ons": {
    title: "Add-Ons",
    backLabel: "Menu",
    icon: Grid2x2,
    empty: "No add-ons configured.",
  },
  inventory: {
    title: "Inventory",
    backLabel: "Menu",
    icon: PencilRuler,
    rows: [
      { label: "Tracking", value: "On" },
      { label: "Low Stock Alerts", value: "On" },
      { label: "Sold Out Items", value: "2" },
    ],
  },
  "default-modifiers": {
    title: "Default Modifiers",
    backLabel: "Menu",
    icon: Boxes,
    empty: "No default modifiers set.",
  },
  groups: {
    title: "Groups",
    backLabel: "Menu",
    icon: Layers,
    empty: "No product groups on this device.",
  },

  // Payments
  gratuity: {
    title: "Gratuity",
    backLabel: "Payments",
    icon: HandCoins,
    rows: [
      { label: "Ask For Tip", value: "On" },
      { label: "Presets", value: "18% · 20% · 25%" },
      { label: "Custom Tip", value: "Allowed" },
    ],
  },
  taxes: {
    title: "Taxes",
    backLabel: "Payments",
    icon: ScrollText,
    rows: [
      { label: "Default Rate", value: "8.75%" },
      { label: "Alias", value: "Tax" },
      { label: "Inclusive Pricing", value: "On" },
    ],
  },
  discounts: {
    title: "Discounts",
    backLabel: "Payments",
    icon: BadgePercent,
    empty: "No discounts configured.",
  },
  "service-charge": {
    title: "Service Charge",
    backLabel: "Payments",
    icon: ReceiptText,
    empty: "No service charge on this device.",
  },
  "cash-management": {
    title: "Cash Management",
    backLabel: "Payments",
    icon: Coins,
    rows: [
      { label: "Cash Drawer", value: "Not assigned" },
      { label: "Open Register", value: "Manager only" },
      { label: "Blind Close", value: "Off" },
    ],
  },
  receipts: {
    title: "Receipts",
    backLabel: "Payments",
    icon: Receipt,
    rows: [
      { label: "Auto-print", value: "On" },
      { label: "Email Receipts", value: "Off" },
      { label: "Footer Message", value: "Thank you!" },
    ],
  },

  // Hardware / Network
  printer: {
    title: "Printer",
    backLabel: "Hardware",
    icon: Printer,
    rows: [
      { label: "Kitchen Printer", value: "Connected" },
      { label: "Connection", value: "Wi-Fi · 10.0.1.42" },
      { label: "Paper Width", value: "80 mm" },
    ],
  },
  "card-reader": {
    title: "Card Reader",
    backLabel: "Hardware",
    icon: Tablet,
    rows: [
      { label: "Built-in Reader", value: "Ready" },
      { label: "Contactless", value: "Enabled" },
      { label: "Firmware", value: "2.14.0" },
    ],
  },
  "cash-drawer": {
    title: "Cash Drawer",
    backLabel: "Hardware",
    icon: Inbox,
    empty: "No cash drawer paired with this handheld.",
  },
  "hardware-emulators": {
    title: "Hardware Emulators",
    backLabel: "Hardware",
    icon: CreditCard,
    rows: [
      { label: "Printer Emulator", value: "Enabled" },
      { label: "Reader Emulator", value: "Enabled" },
    ],
    note: "Emulators are enabled for demo mode.",
  },
  servers: {
    title: "Servers",
    backLabel: "Network",
    icon: Server,
    rows: [
      { label: "Server", value: "aurora 22" },
      { label: "Status", value: "Connected · 38 ms" },
      { label: "Sync", value: "Up to date" },
    ],
  },

  // Workforce
  employee: {
    title: "Employee",
    backLabel: "Workforce",
    icon: Users,
    rows: [
      { label: "Elizer Cruz", value: "Supervisor" },
      { label: "Maya Reyes", value: "Server" },
      { label: "Tom Alvarez", value: "Bartender" },
      { label: "Dana Whitfield", value: "Manager" },
    ],
    note: "Employee list syncs from Back Office.",
  },
};
