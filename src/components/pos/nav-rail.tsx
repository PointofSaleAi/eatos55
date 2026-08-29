import { Link, useRouterState } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Wordmark } from "@/components/pos/brand";
import { railPrimary } from "@/lib/nav-destinations";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/**
 * Landscape navigation rail, laid out like the reference app: venue avatar at
 * the top, a plain icon stack of the primary destinations, then the eatOS mark
 * and the version label pinned to the bottom. Manager Controls, Clock Out and
 * Sign Out live in the navigation drawer / pull-down pad.
 */
export function NavRail() {
  const [expanded, setExpanded] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { settings, session } = usePos();

  // Always starts collapsed: expansion is a per-visit choice, never remembered.
  const toggle = useCallback(() => setExpanded((v) => !v), []);

  const venue = settings.restaurantName.split("·")[0]!.trim();
  const venueInitials =
    venue
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2) || "E";

  return (
    <nav
      aria-label="Main"
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-surface pt-[calc(0.75rem+var(--sat,0px))] pb-[calc(0.75rem+var(--sab,0px))] transition-[width] duration-200 md:flex",
        expanded ? "w-60" : "w-[4.5rem]",
      )}
    >
      {/* Venue / revenue center */}
      <div className={cn("flex items-center gap-2 px-3 pt-3", expanded ? "" : "justify-center")}>
        <button
          type="button"
          onClick={toggle}
          title={venue}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-fs-sm font-extrabold uppercase text-accent-foreground"
        >
          {venueInitials}
        </button>
        {expanded ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-fs-sm font-extrabold text-foreground">{venue}</span>
            <span className="block truncate text-fs-xs text-muted-foreground">
              {session.station || "Main dining"}
            </span>
          </span>
        ) : null}
      </div>

      {/* Primary destinations. Empty space in this column toggles the rail. */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) toggle();
        }}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pt-3"
      >
        <ul className="space-y-1">
          {railPrimary.map((l) => {
            const active = pathname === l.to || pathname.startsWith(`${l.to}/`);
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  preload="intent"
                  title={l.label}
                  aria-label={l.label}
                  className={cn(
                    "flex min-h-ctl-lg items-center gap-3 rounded-card text-fs-sm transition-colors",
                    expanded ? "justify-start px-2" : "justify-center px-0",
                    active
                      ? "bg-accent/15 font-extrabold text-accent"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <l.icon className={cn("size-6 shrink-0", active ? "text-accent" : "")} />
                  {expanded ? (
                    <span className="min-w-0 flex-1 truncate">{l.label}</span>
                  ) : null}

                </Link>
              </li>
            );
          })}
          <li>
            <Link
              to="/settings"
              preload="intent"
              title="Settings"
              aria-label="Settings"
              className={cn(
                "flex min-h-ctl-lg items-center gap-3 rounded-card text-fs-sm transition-colors",
                expanded ? "justify-start px-2" : "justify-center px-0",
                pathname.startsWith("/settings")
                  ? "bg-accent/15 font-extrabold text-accent"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <SettingsIcon
                className={cn(
                  "size-6 shrink-0",
                  pathname.startsWith("/settings") ? "text-accent" : "",
                )}
              />
              {expanded ? (
                <span className="min-w-0 flex-1 truncate">Settings</span>
              ) : null}

            </Link>
          </li>
        </ul>
      </div>

      {/* Brand + version */}
      <div className="shrink-0 px-3 pt-2">
        <Link
          to="/settings"
          aria-label="About this app"
          className="flex flex-col items-center gap-1 rounded-card py-2 transition-colors hover:bg-muted"
        >
          <Wordmark className={cn("w-auto", expanded ? "h-5" : "h-4")} />
          <span className="text-center text-[0.5625rem] font-bold leading-tight text-muted-foreground">
            {expanded
              ? `${settings.appVersion} / 3.44.2 / 31.07.26`
              : `${settings.appVersion}`}
          </span>
        </Link>
      </div>
    </nav>
  );
}
