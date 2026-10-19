import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Inbox, Mic, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { TicketsScreen } from "@/components/pos/tickets-screen";
import { cn } from "@/lib/utils";
import { isSettingsDestinationVisible, settingsGroups } from "@/lib/settings-destinations";
import { usePos } from "@/lib/pos-store";
import { useProfileSettings } from "@/lib/profile-settings";
import { useVoiceSearch } from "@/lib/voice-search";
import { useLandscapeWide } from "@/hooks/use-layout-mode";

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

/** Top level settings destinations reachable straight from the sidebar. */
const settingsTopLevel = new Set([...settingsGroups.flat().map((l) => l.to), "/settings/profile"]);

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
  const { canManageSettings, session, settings } = usePos();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useProfileSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const { listening, start: startVoice } = useVoiceSearch(setQuery);
  const q = query.trim().toLowerCase();
  const visibleGroups = useMemo(
    () =>
      settingsGroups.map((group) =>
        group
          .filter((l) => isSettingsDestinationVisible(l, session, canManageSettings))
          .filter((l) => !q || l.label.toLowerCase().includes(q)),
      ),
    [canManageSettings, session.role, session.clockedIn, q],
  );
  const anyMatches = visibleGroups.some((g) => g.length > 0);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      if (!v) setQuery("");
      return !v;
    });
  };

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
          onClick={toggleCollapsed}
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
      {!collapsed ? (
        <div className="shrink-0 border-b border-border px-3 pb-3 pt-3 lg:px-4">
          <label className="flex min-h-ctl-md items-center gap-2 rounded-pill border border-border bg-muted px-3">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              inputMode="search"
              autoComplete="off"
              placeholder="Search"
              aria-label="Search settings"
              className="min-h-tap min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={startVoice}
              aria-label="Search settings by voice"
              aria-pressed={listening}
              className={cn(
                "grid size-7 tap-safe shrink-0 place-items-center rounded-pill transition-colors",
                listening
                  ? "animate-pulse text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Mic className="size-4" />
            </button>
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="grid size-7 tap-safe shrink-0 place-items-center rounded-pill text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
        </div>
      ) : null}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-2 lg:p-3">
        {!collapsed ? (
          <Link to="/settings/profile" preload="intent" aria-label="Open profile"
            className={cn("mb-3 block overflow-hidden rounded-row border border-border bg-background transition-colors hover:bg-muted", pathname === "/settings/profile" && "bg-muted")}>
            <div className="flex items-center gap-3 px-3 py-3">
              {profile.photo ? <img src={profile.photo} alt="" className="size-11 shrink-0 rounded-pill object-cover" /> :
              <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-muted text-fs-sm font-extrabold text-foreground">
                {session.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>}
              <div className="min-w-0 flex-1">
                <p className="truncate text-fs-base font-extrabold text-foreground">{session.name}</p>
                <p className="truncate text-fs-xs text-muted-foreground">{session.role}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="border-t border-border px-3 py-2.5">
              <p className="text-fs-xs text-muted-foreground">
                {session.clockedIn ? `Clocked in at ${settings.clockedInAt}` : "Not Clocked-In"}
              </p>
            </div>
          </Link>
        ) : null}
        {anyMatches ? (
          visibleGroups.map((group, i) =>
            group.length === 0 ? null : (
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
            ),
          )
        ) : q ? (
          <div className="px-4 py-10 text-center">
            <p className="t-row font-bold text-foreground">No settings found</p>
            <p className="pt-1 text-fs-xs text-muted-foreground">Try a different search term.</p>
          </div>
        ) : null}
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
  const landscape = useLandscapeWide();

  if (p === "/tickets" || p.startsWith("/tickets/")) {
    // The list pane keeps its own scroll; detail routes render on the right.
    return {
      list: <TicketsScreen pane />,
      ...(landscape ? { listClassName: "w-[60%] max-w-[calc(100%-24rem)] lg:w-[60%]" } : {}),
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
  // Guestbook hides the settings nav and owns the whole panel with its own
  // two-pane layout (guest list left, guest details right).
  if (p === "/settings/guestbook") {
    return null;
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
