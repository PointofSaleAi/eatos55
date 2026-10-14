import { Bell, BookUser, Briefcase, FileText, Headset, Images, LifeBuoy, Mail, SlidersHorizontal, SmartphoneNfc, Tablet, UserRoundCog, Utensils, Wallet, Wifi, type LucideIcon } from "lucide-react";
import type { TileColor } from "@/components/pos/settings-rows";

type SettingsDestination = { to: string; label: string; icon: LucideIcon; color: TileColor; manager?: boolean };

/** Shared destinations for the header menu, settings hub and settings sidebar. */
export const settingsGroups: SettingsDestination[][] = [
  [
    { to: "/settings/general", label: "General", icon: UserRoundCog, color: "green" },
    { to: "/settings/guestbook", label: "Guestbook", icon: BookUser, color: "slate" },
    { to: "/settings/login-screen", label: "Login Screen", icon: Images, color: "blue" },
    { to: "/settings/control-center", label: "Control Center", icon: SmartphoneNfc, color: "violet" },
    { to: "/settings/menu", label: "Menu", icon: Utensils, color: "orange" },
    { to: "/settings/payments", label: "Payments", icon: Wallet, color: "indigo" },
    { to: "/settings/workforce", label: "Workforce", icon: Briefcase, color: "purple" },
    { to: "/settings/reports", label: "Reports", icon: FileText, color: "slate" },
    { to: "/settings/more", label: "Advanced", icon: SlidersHorizontal, color: "slate", manager: true },
  ],
  [
    { to: "/settings/network", label: "Network", icon: Wifi, color: "sky" },
    { to: "/settings/hardware", label: "Hardware", icon: Tablet, color: "violet" },
  ],
  [
    { to: "/settings/notifications", label: "Notifications", icon: Bell, color: "grey" },
    { to: "/system/customer-support", label: "Customer Support", icon: Headset, color: "red" },
    { to: "/system/contact-us", label: "Contact Us", icon: Mail, color: "blue" },
    { to: "/system/help-center", label: "Help Center", icon: LifeBuoy, color: "sky" },
  ],
];