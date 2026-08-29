import { Link, useRouterState } from "@tanstack/react-router";
import { Lock, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { Wordmark } from "@/components/pos/brand";
import { railPrimary } from "@/lib/nav-destinations";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const cell =
  "flex min-h-ctl-lg items-center gap-3 rounded-card border-2 border-transparent text-fs-sm transition-colors";
const rest = "text-shell-foreground/60 hover:bg-shell-foreground/10 hover:text-shell-foreground";
const active = "border-shell-foreground font-extrabold text-shell-foreground";

/**
 * Landscape navigation rail, laid out like the reference terminal: grip handle,
 * lock, venue logo tile, then one plain icon stack with the active destination
 * shown as an outlined cell, and the eatOS mark plus version pinned at the
 * bottom. Manager Controls, Clock Out and Sign Out live in the pull-down pad.
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

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <nav
      aria-label="Main"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggle();
      }}
      className={cn(
        "hidden shrink-0 flex-col bg-shell pt-[calc(0.5rem+var(--sat,0px))] pb-[calc(0.5rem+var(--sab,0px))] transition-[width] duration-200 md:flex",
        expanded ? "w-60" : "w-[4.25rem]",
      )}
    >
      {/* Grip handle: toggles the rail */}
      <button
        type="button"
        onClick={toggle}
        aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        aria-expanded={expanded}
        className="mx-auto flex h-7 w-10 items-center justify-center text-shell-foreground/50 transition-colors hover:text-shell-foreground"
      >
        <span className="grid grid-cols-3 gap-[2px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="size-[3px] rounded-full bg-current" />
          ))}
        </span>
      </button>

      {/* Lock the terminal */}
      <div className={cn("flex px-2 pt-1", expanded ? "" : "justify-center")}>
        <Link
          to="/access/clock-in"
          title="Lock terminal"
          aria-label="Lock terminal"
          className={cn(cell, rest, expanded ? "flex-1 px-2" : "size-11 justify-center px-0")}
        >
          <Lock className="size-5 shrink-0" />
          {expanded ? <span className="min-w-0 flex-1 truncate">Lock terminal</span> : null}
        </Link>
      </div>

      {/* Venue / revenue center */}
      <div className={cn("flex items-center gap-2 px-2 pt-1", expanded ? "" : "justify-center")}>
        <button
          type="button"
          onClick={toggle}
          title={venue}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-card bg-shell-foreground/15 text-fs-sm font-extrabold uppercase text-shell-foreground"
        >
          {venueInitials}
        </button>
        {expanded ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-fs-sm font-extrabold text-shell-foreground">
              {venue}
            </span>
            <span className="block truncate text-fs-xs text-shell-foreground/60">
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
          {railPrimary.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                preload="intent"
                title={l.label}
                aria-label={l.label}
                className={cn(
                  cell,
                  expanded ? "justify-start px-2" : "justify-center px-0",
                  isActive(l.to) ? active : rest,
                )}
              >
                <l.icon className="size-6 shrink-0" />
                {expanded ? <span className="min-w-0 flex-1 truncate">{l.label}</span> : null}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/settings"
              preload="intent"
              title="Settings"
              aria-label="Settings"
              className={cn(
                cell,
                expanded ? "justify-start px-2" : "justify-center px-0",
                isActive("/settings") ? active : rest,
              )}
            >
              <SettingsIcon className="size-6 shrink-0" />
              {expanded ? <span className="min-w-0 flex-1 truncate">Settings</span> : null}
            </Link>
          </li>
          <li>
            <button
              type="button"
              title="Shift assistant"
              aria-label="Shift assistant"
              onClick={() => window.dispatchEvent(new CustomEvent("pos:open-dashboard"))}
              className={cn(
                cell,
                rest,
                "w-full",
                expanded ? "justify-start px-2" : "justify-center px-0",
              )}
            >
              <Sparkles className="size-6 shrink-0" />
              {expanded ? <span className="min-w-0 flex-1 truncate">Shift assistant</span> : null}
            </button>
          </li>
        </ul>
      </div>

      {/* Brand + version */}
      <div className="shrink-0 px-3 pt-2">
        <Link
          to="/settings"
          aria-label="About this app"
          className="flex flex-col items-center gap-1 rounded-card py-2 transition-colors hover:bg-shell-foreground/10"
        >
          <Wordmark invert className={cn("w-auto", expanded ? "h-5" : "h-4")} />
          <span className="text-center text-[0.5625rem] font-bold leading-tight text-shell-foreground/60">
            Ver {settings.appVersion}
            <br />
            FL 3.44.2
          </span>
        </Link>
      </div>
    </nav>
  );
}
