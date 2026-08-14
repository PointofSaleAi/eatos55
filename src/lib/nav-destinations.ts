import {
  ClipboardList,
  CreditCard,
  FileText,
  Grid2x2,
  Headset,
  LayoutGrid,
  Receipt,
  Settings as SettingsIcon,
  Sofa,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { to: string; label: string; icon: LucideIcon };
export type NavGroup = { title: string; links: NavLink[] };

/**
 * Shared top-level destinations for the phone drawer and the landscape nav rail
 * so both stay in sync. Deeper screens are reached by drilling into a section.
 */
export const navGroups: NavGroup[] = [
  {
    title: "Ordering",
    links: [
      { to: "/order/new", label: "New Order", icon: ClipboardList },
      { to: "/order/menu", label: "Menus", icon: Utensils },
    ],
  },
  {
    title: "Service",
    links: [
      { to: "/floor", label: "Floor Plan", icon: Sofa },
      { to: "/rooms", label: "Rooms", icon: Grid2x2 },
      { to: "/tickets", label: "Tickets", icon: Receipt },
      { to: "/board", label: "Order Status Board", icon: LayoutGrid },
    ],
  },
  {
    title: "Money",
    links: [
      { to: "/payment/method", label: "Payments", icon: CreditCard },
      { to: "/settings/sales-summary", label: "Sales Summary", icon: FileText },
    ],
  },
  {
    title: "App",
    links: [
      { to: "/settings", label: "Settings", icon: SettingsIcon },
      { to: "/system/customer-support", label: "Support", icon: Headset },
    ],
  },
];

/** Compact rail destinations: the five most used screens. */
export const railPrimary: NavLink[] = [
  { to: "/floor", label: "Home", icon: Sofa },
  { to: "/tickets", label: "Tickets", icon: Receipt },
  { to: "/board", label: "Board", icon: LayoutGrid },
  { to: "/order/new", label: "Order", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];
