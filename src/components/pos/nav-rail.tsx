import { Link, useRouter } from "@tanstack/react-router";
import {
  BellDot,
  ClipboardList,
  Columns3,
  FilePlus2,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const railItems: { to: string; label: string; icon: LucideIcon; match: string }[] = [
  { to: "/order/new", label: "New Order", icon: FilePlus2, match: "/order" },
  { to: "/floor", label: "Floor Plan", icon: LayoutGrid, match: "/floor" },
  { to: "/rooms", label: "Rooms", icon: BellDot, match: "/rooms" },
  { to: "/tickets", label: "Tickets", icon: ClipboardList, match: "/tickets" },
  { to: "/board", label: "Order Status", icon: Columns3, match: "/board" },
];

/**
 * Primary navigation rail (matches the live handheld app): a slim dark icon
 * strip on every screen size that expands to reveal labels when tapped.
 */
export function NavRail() {
  const router = useRouter();
  const { settings, session } = usePos();
  const [expanded, setExpanded] = useState(false);
  const pathname = router.state.location.pathname;

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "relative z-20 hidden shrink-0 flex-col bg-shell transition-[width] duration-200 md:flex",
        expanded ? "w-40" : "w-12",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        aria-expanded={expanded}
        className="flex min-h-[56px] items-center gap-2 px-2 text-left"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-xs font-extrabold text-accent-foreground">
          e
        </span>
        {expanded ? (
          <span className="truncate text-xs font-bold text-shell-foreground">
            {session.station ?? "Test Revenue Center"}
          </span>
        ) : null}
      </button>

      <ul className="flex flex-1 flex-col">
        {railItems.map(({ to, label, icon: Icon, match }) => {
          const active = pathname.startsWith(match);
          return (
            <li key={to}>
              <Link
                to={to}
                onClick={() => setExpanded(false)}
                className={cn(
                  "flex min-h-[64px] items-center gap-2 px-2 transition-colors",
                  active
                    ? "bg-surface text-foreground"
                    : "text-shell-foreground/70 hover:bg-white/10",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {expanded ? <span className="truncate text-xs font-bold">{label}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        to="/settings"
        onClick={() => setExpanded(false)}
        className={cn(
          "flex min-h-[64px] items-center gap-2 border-t border-white/10 px-2 transition-colors hover:bg-white/10",
          pathname.startsWith("/settings") || pathname.startsWith("/system")
            ? "bg-surface text-foreground"
            : "text-shell-foreground/80",
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-current text-xs font-extrabold">
          e
        </span>
        {expanded ? (
          <span className="truncate text-xs font-bold">Ver {settings.appVersion}</span>
        ) : (
          <span className="sr-only">Settings</span>
        )}
      </Link>
    </nav>
  );
}
