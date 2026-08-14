import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Clock, LogOut, PanelLeftClose, PanelLeftOpen, Plus, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Wordmark } from "@/components/pos/brand";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { navGroups } from "@/lib/nav-destinations";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const KEY = "pos:rail-expanded";

/**
 * Landscape navigation rail: icon rail by default, expands into a labelled
 * sidebar with the same grouped destinations as the phone drawer.
 */
export function NavRail() {
  const [expanded, setExpanded] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { startOrder, clockOut, signOut } = usePos();

  useEffect(() => {
    setExpanded(window.localStorage.getItem(KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setExpanded((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return (
    <nav
      aria-label="Main"
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-surface pt-[calc(0.75rem+var(--sat,0px))] pb-[calc(0.75rem+var(--sab,0px))] transition-[width] duration-200 md:flex",
        expanded ? "w-64" : "w-[5.25rem]",
      )}
    >
      <div className={cn("flex items-center px-3", expanded ? "justify-between" : "justify-center")}>
        {expanded ? <Wordmark className="h-5 w-auto" /> : null}
        <button
          type="button"
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          title={expanded ? "Collapse navigation" : "Expand navigation"}
          onClick={toggle}
          className="grid size-11 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {expanded ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
        </button>
      </div>

      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => {
            haptic("medium");
            startOrder();
            router.navigate({ to: "/order/new" });
          }}
          aria-label="New order"
          title="New order"
          className={cn(
            "flex min-h-ctl-lg w-full items-center gap-3 rounded-pill bg-primary px-3 font-extrabold text-primary-foreground transition-transform active:scale-[0.98]",
            expanded ? "justify-start" : "justify-center",
          )}
        >
          <Plus className="size-5 shrink-0" />
          {expanded ? <span className="truncate text-fs-sm uppercase">New order</span> : null}
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pt-3">
        {navGroups.map((g) => (
          <div key={g.title} className="pb-2">
            {expanded ? (
              <p className="px-2 pb-1 pt-2 t-section text-muted-foreground">{g.title}</p>
            ) : (
              <div className="mx-auto my-2 h-px w-6 bg-border" />
            )}
            <ul className="space-y-0.5">
              {g.links.map((l) => {
                const active = pathname === l.to || pathname.startsWith(`${l.to}/`);
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      preload="intent"
                      title={l.label}
                      aria-label={l.label}
                      className={cn(
                        "flex min-h-tap items-center gap-3 rounded-row px-2 py-2 t-row transition-colors",
                        expanded ? "justify-start" : "justify-center",
                        active
                          ? "bg-accent/15 text-accent"
                          : "text-foreground hover:bg-muted focus-visible:bg-muted",
                      )}
                    >
                      <l.icon className={cn("size-5 shrink-0", active ? "" : "text-accent")} />
                      {expanded ? <span className="min-w-0 flex-1 truncate">{l.label}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-border px-3 pt-3">
        <Link
          to="/tickets/manager-controls"
          title="Manager Controls"
          aria-label="Manager Controls"
          className={cn(
            "flex min-h-tap items-center gap-2 rounded-row px-2 t-row text-foreground transition-colors hover:bg-muted",
            expanded ? "" : "justify-center",
          )}
        >
          <ShieldCheck className="size-5 shrink-0" />
          {expanded ? <span className="truncate">Manager Controls</span> : null}
        </Link>
        <button
          type="button"
          onClick={clockOut}
          title="Clock Out"
          aria-label="Clock Out"
          className={cn(
            "flex min-h-tap w-full items-center gap-2 rounded-row px-2 t-row text-foreground transition-colors hover:bg-muted",
            expanded ? "" : "justify-center",
          )}
        >
          <Clock className="size-5 shrink-0" />
          {expanded ? <span className="truncate">Clock Out</span> : null}
        </button>
        <button
          type="button"
          title="Sign Out"
          aria-label="Sign Out"
          onClick={() => {
            void (async () => {
              const ok = await confirm({
                title: "Sign out?",
                message: "You will need to sign in again to use this device.",
                confirmLabel: "Sign Out",
                destructive: true,
              });
              if (!ok) return;
              signOut();
              navigate({ to: "/", replace: true });
            })();
          }}
          className={cn(
            "flex min-h-tap w-full items-center gap-2 rounded-row px-2 t-row text-destructive transition-colors hover:bg-muted",
            expanded ? "" : "justify-center",
          )}
        >
          <LogOut className="size-5 shrink-0" />
          {expanded ? <span className="truncate">Sign Out</span> : null}
        </button>
      </div>
    </nav>
  );
}
