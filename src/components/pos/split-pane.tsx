import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Inbox } from "lucide-react";
import { useState, type ReactNode } from "react";
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
  SlidersHorizontal,
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
  listClassName?: string | undefined;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "flex min-h-0 w-[19rem] shrink-0 flex-col overflow-hidden border-r border-border bg-surface lg:w-[21rem]",
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
    { to: "/settings/reports", label: "Reports", icon: FileText },
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

/** Top level settings destinations reachable straight from the sidebar. */
const settingsTopLevel = new Set(settingsGroups.flat().map((l) => l.to));

/** True when this path is a sidebar destination, so the sidebar is the way back. */
export function isSettingsTopLevel(pathname: string) {
  return settingsTopLevel.has(pathname.replace(/\/+$/, "") || "/");
}

/**
 * Apple-style settings sidebar used as the list pane in landscape.
 * Tapping the "Settings" heading collapses it to an icon-only strip, matching
 * the nav rail: the choice is per visit and never remembered.
 */
export function SettingsNavList() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col transition-[width] duration-200",
        collapsed ? "w-[4.75rem]" : "w-[19rem] lg:w-[21rem]",
      )}
    >
      <div className="shrink-0 border-b border-border px-2 pb-3 pt-4">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand settings list" : "Collapse settings list"}
          title={collapsed ? "Expand settings list" : "Collapse settings list"}
          className={cn(
            "flex min-h-tap w-full items-center gap-2 rounded-row px-2 text-left transition-colors hover:bg-muted",
            collapsed && "justify-center",
          )}
        >
          <SlidersHorizontal className="size-5 shrink-0 text-accent" />
          {collapsed ? null : <h2 className="truncate t-title text-foreground">Settings</h2>}
        </button>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-2 lg:p-3">
        {settingsGroups.map((group, i) => (
          <ul key={i} className="mb-3 overflow-hidden rounded-row border border-border bg-background">
            {group.map((l) => {
              const active = pathname === l.to || pathname.startsWith(`${l.to}/`);
              return (
                <li key={l.to} className="border-b border-border last:border-b-0">
                  <Link
                    to={l.to}
                    preload="intent"
                    title={l.label}
                    className={cn(
                      "flex min-h-tap items-center gap-3 px-3 py-2.5 t-row transition-colors",
                      collapsed && "justify-center px-0",
                      active ? "bg-accent/15 text-accent" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <l.icon className={cn("size-5 shrink-0", active ? "" : "text-accent")} />
                    {collapsed ? null : (
                      <>
                        <span className="min-w-0 flex-1 truncate">{l.label}</span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Picks the list pane for the current section in landscape.
 * Returns null when the route has no companion list (payment flows, access…).
 */
export function useSectionPane(): {
  list: ReactNode;
  replaceChildren?: ReactNode;
  listClassName?: string;
} | null {
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
      // The settings pane owns its width so it can collapse to icons.
      list: <SettingsNavList />,
      listClassName: "w-auto lg:w-auto",
    };
  }
  return null;
}
