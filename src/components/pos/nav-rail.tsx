import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EMark, Wordmark } from "@/components/pos/brand";
import { formatVersionLabel } from "@/lib/demo-data";
import { railPrimary } from "@/lib/nav-destinations";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const cell =
  "flex min-h-ctl-lg items-center gap-3 rounded-card border-2 border-transparent text-fs-sm transition-colors";
const rest = "text-shell-foreground/60 hover:bg-shell-foreground/10 hover:text-shell-foreground";
const active =
  "border-shell-foreground/25 bg-shell-foreground/10 font-extrabold text-shell-foreground shadow-[inset_0_1px_0_color-mix(in_oklab,var(--shell-foreground)_12%,transparent)]";

/**
 * Landscape navigation rail, laid out like the reference terminal: grip handle,
 * lock, venue logo tile, then one plain icon stack with the active destination
 * shown as an outlined cell, and the eatOS mark plus version pinned at the
 * bottom. Manager Controls, Clock Out and Sign Out live in the pull-down pad.
 */
export function NavRail({ side, onMove, onDragPosition }: {
  side: "left" | "right";
  onMove: (side: "left" | "right") => void;
  onDragPosition: (x: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const drag = useRef<{ startX: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { settings, session } = usePos();

  // Always starts collapsed: expansion is a per-visit choice, never remembered.
  const toggle = useCallback(() => setExpanded((v) => !v), []);

  // Horizontal drag on empty rail space collapses (left) or expands (right).
  // The release is tracked on window so a drag ending outside the rail still counts.
  const onRailPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    const startX = e.clientX;
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointerup", onUp);
      const dx = ev.clientX - startX;
      if (dx <= -40) setExpanded(false);
      else if (dx >= 40) setExpanded(true);
    };
    window.addEventListener("pointerup", onUp);
  }, []);

  const venue = (settings.restaurantName.split("·")[0] ?? "").trim();
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
      data-side={side}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggle();
      }}
      onPointerDown={onRailPointerDown}
      className={cn(
        "my-2 hidden shrink-0 flex-col gap-3.5 rounded-2xl border border-shell-foreground/10 bg-shell pt-2 pb-[calc(0.5rem+var(--sab,0px))] transition-[width] duration-200 motion-reduce:transition-none md:flex",
        side === "right" ? "order-last mr-2" : "ml-2",
        expanded ? "w-48" : "w-[4.25rem]",
      )}
    >
      {/* Click to expand; drag to either screen edge to move the rail. */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Drag navigation to either side; arrow keys move it"
        onClick={() => {
          if (suppressClick.current) { suppressClick.current = false; return; }
          toggle();
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          onMove(event.key === "ArrowLeft" ? "left" : "right");
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          suppressClick.current = false;
          drag.current = { startX: event.clientX, moved: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current) return;
          if (Math.abs(event.clientX - current.startX) > 12) current.moved = true;
          if (current.moved) onDragPosition(event.clientX);
        }}
        onPointerUp={(event) => {
          const current = drag.current;
          drag.current = null;
          onDragPosition(null);
          if (!current?.moved) return;
          suppressClick.current = true;
          if (event.clientX <= 120) onMove("left");
          else if (event.clientX >= window.innerWidth - 120) onMove("right");
        }}
        onPointerCancel={() => {
          suppressClick.current = Boolean(drag.current?.moved);
          drag.current = null;
          onDragPosition(null);
        }}
        aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        aria-expanded={expanded}
        className="mx-auto flex h-7 w-10 touch-none cursor-grab items-center justify-center rounded-md text-shell-foreground/50 transition-colors hover:bg-shell-foreground/10 hover:text-shell-foreground active:cursor-grabbing"
      >
        <span className="grid grid-cols-3 gap-[2px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="size-[3px] rounded-full bg-current" />
          ))}
        </span>
      </Button>


      {/* Venue / revenue center: opens the Dashboard */}
      <div className={cn("flex items-center gap-2 px-2", expanded ? "" : "justify-center")}>
        <Link
          to="/order/menu"
          title={venue}
          aria-label="Dashboard"
          className={cn(
            "grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-shell-foreground/15 ring-1 text-fs-sm font-extrabold uppercase text-shell-foreground transition-colors",
            isActive("/order/menu")
              ? "bg-shell-foreground/25 ring-2 ring-shell-foreground/60"
              : "ring-shell-foreground/20 hover:bg-shell-foreground/25",
          )}
        >
          {venueInitials}
        </Link>
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
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-2"
      >
        <ul
          onClick={(e) => {
            if (e.target === e.currentTarget) toggle();
          }}
          className="flex min-h-full flex-1 flex-col justify-evenly gap-3.5"
        >
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
                <l.icon className="size-8 shrink-0" />
                {expanded ? <span className="min-w-0 flex-1 truncate">{l.label}</span> : null}
              </Link>
            </li>
          ))}

        </ul>
      </div>

      {/* Brand + version */}
      <div className="shrink-0 px-3">
        <Link
          to="/settings"
          aria-label="About this app"
          className="flex flex-col items-center gap-1 rounded-card py-2 transition-colors hover:bg-shell-foreground/10"
        >
          {expanded ? (
            <Wordmark invert className="h-auto w-28" />
          ) : (
            <EMark className="size-5 text-shell-foreground" />
          )}
          <span className="text-center text-[0.5625rem] font-bold leading-tight text-shell-foreground/60">
            {formatVersionLabel(settings.appVersion)}
          </span>
        </Link>
      </div>
    </nav>
  );
}
