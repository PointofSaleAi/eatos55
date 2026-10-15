import type { ComponentType } from "react";
import {
  BedDouble,
  Gauge,
  ClipboardList,
  CreditCard,
  FileText,
  Headset,
  Receipt,
  Settings as SettingsIcon,
  Sofa,

} from "lucide-react";
import { OrderOSIcon } from "@/components/pos/icons/orderos-icon";
import { NewOrderIcon, TableOrderIcon, TicketsIcon } from "@/components/pos/icons/rail-icons";

/** Rail/drawer icon: any component that takes a className (Lucide or custom SVG). */
export type NavIcon = ComponentType<{ className?: string }>;
export type NavLink = { to: string; label: string; icon: NavIcon };
export type NavGroup = { title: string; links: NavLink[] };

/**
 * Shared top-level destinations for the phone drawer and the landscape nav rail
 * so both stay in sync. Deeper screens are reached by drilling into a section.
 */
export const navGroups: NavGroup[] = [
  {
    title: "Ordering",
    links: [
      { to: "/order/menu", label: "Dashboard", icon: Gauge },
      { to: "/order/new", label: "New Order", icon: ClipboardList },
    ],
  },

  {
    title: "Service",
    links: [
      { to: "/floor", label: "Table Order", icon: Sofa },
      { to: "/rooms", label: "Rooms", icon: BedDouble },
      { to: "/tickets", label: "Tickets", icon: Receipt },
      { to: "/board", label: "orderOS", icon: OrderOSIcon },
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
 * Rail destinations in the order used by the reference app: new order first,
 * then floor plan, rooms, tickets and the order status board. The Dashboard
 * opens from the venue/profile tile at the top of the rail instead.
 */
export const railPrimary: NavLink[] = [
  { to: "/order/new", label: "New Order", icon: NewOrderIcon },

  { to: "/floor", label: "Table Order", icon: TableOrderIcon },
  { to: "/rooms", label: "Rooms", icon: BedDouble },
  { to: "/tickets", label: "Tickets", icon: TicketsIcon },
  { to: "/board", label: "orderOS", icon: OrderOSIcon },
];

