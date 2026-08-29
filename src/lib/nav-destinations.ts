import {
  ClipboardList,
  Columns3,
  FilePlus2,
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

/**
 * Rail destinations in the order used by the reference app: the menu grid first,
 * then new order, floor plan, tickets, rooms and the order status board.
 */
export const railPrimary: NavLink[] = [
  { to: "/order/menu", label: "Menu", icon: LayoutGrid },
  { to: "/order/new", label: "New Order", icon: FilePlus2 },
  { to: "/floor", label: "Floor Plan", icon: Sofa },
  { to: "/tickets", label: "Tickets", icon: Receipt },
  { to: "/rooms", label: "Rooms", icon: Grid2x2 },
  { to: "/board", label: "Order Status", icon: Columns3 },
];

