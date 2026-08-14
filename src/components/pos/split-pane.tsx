import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { TicketsScreen } from "@/components/pos/tickets-screen";
import { cn } from "@/lib/utils";
import {
  Bell,
  Briefcase,
  FileText,
  Headset,
  LifeBuoy,
  Mail,
  SmartphoneNfc,
  Tablet,
  UserRoundCog,
  Utensils,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/**
 * Two-pane layout for landscape tablet/web: list pane on the left, the routed
 * screen on the right. On phones the shell never renders this - the routed
 * screen keeps the whole viewport and navigation stays push/pop.
 */
export function SplitPane({
  list,
  children,
  listClassName,
}: {
  list: ReactNode;
  children: ReactNode;
  listClassName?: string;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "flex min-h-0 w-[22rem] shrink-0 flex-col overflow-hidden border-r border-border bg-surface lg:w-[26rem]",
          listClassName,
        )}
      >
        {list}
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}

/** Right-pane placeholder shown when nothing is selected yet. */
export function PaneEmpty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid min-h-0 flex-1 place-items-center px-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-pill bg-muted text-muted-foreground">
          <Inbox className="size-7" />
        </span>
        <h2 className="mt-4 text-fs-lg font-extrabold text-foreground">{title}</h2>
        <p className="mt-1 text-fs-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

type SettingsLink = { to: string; label: string; icon: LucideIcon };

const settingsGroups: SettingsLink[][] = [
  [
    { to: "/settings/general", label: "General", icon: UserRoundCog },
    { to: "/settings/control-center", label: "Control Center", icon: SmartphoneNfc },
    { to: "/settings/menu", label: "Menu", icon: Utensils },
    { to: "/settings/payments", label: "Payments", icon: Wallet },
    { to: "/settings/workforce", label: "Workforce", icon: Briefcase },
    { to: "/settings/sales-summary", label: "Sales Summary Report", icon: FileText },
  ],
  [
    { to: "/settings/network", label: "Network", icon: Wifi },
    { to: "/settings/hardware", label: "Hardware", icon: Tablet },
  ],
  [
    { to: "/settings/notifications", label: "Notifications", icon: Bell },
    { to: "/system/customer-support", label: "Customer Support", icon: Headset },
    { to: "/system/contact-us", label: "Contact Us", icon: Mail },
    { to: "/system/help-center", label: "Help Center", icon: LifeBuoy },
  ],
];

/** Apple-style settings sidebar used as the list pane in landscape. */
export function SettingsNavList() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-4">
        <h2 className="truncate t-title text-foreground">Settings</h2>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {settingsGroups.map((group, i) => (
          <ul key={i} className="mb-3 overflow-hidden rounded-row border border-border bg-background">
            {group.map((l) => {
              const active = pathname === l.to || pathname.startsWith(`${l.to}/`);
              return (
                <li key={l.to} className="border-b border-border last:border-b-0">
                  <Link
                    to={l.to}
                    preload="intent"
                    className={cn(
                      "flex min-h-tap items-center gap-3 px-3 py-2.5 t-row transition-colors",
                      active ? "bg-accent/15 text-accent" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <l.icon className={cn("size-5 shrink-0", active ? "" : "text-accent")} />
                    <span className="min-w-0 flex-1 truncate">{l.label}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </>
  );
}

/**
 * Picks the list pane for the current section in landscape.
 * Returns null when the route has no companion list (payment flows, access…).
 */
export function useSectionPane(): { list: ReactNode; replaceChildren?: ReactNode } | null {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const p = pathname.replace(/\/+$/, "") || "/";

  if (p === "/tickets" || p.startsWith("/tickets/")) {
    // The list pane keeps its own scroll; detail routes render on the right.
    return {
      list: <TicketsScreen pane />,
      ...(p === "/tickets"
        ? {
            replaceChildren: (
              <PaneEmpty
                title="No ticket selected"
                detail="Pick a ticket on the left to see its items, payments and actions."
              />
            ),
          }
        : {}),
    };
  }
  if (p.startsWith("/settings") || p.startsWith("/system")) {
    return {
      list: <SettingsNavList />,
      ...(p === "/settings"
        ? {
            replaceChildren: (
              <PaneEmpty
                title="Settings"
                detail="Choose a topic on the left to review or change it."
              />
            ),
          }
        : {}),
    };
  }
  return null;
}
