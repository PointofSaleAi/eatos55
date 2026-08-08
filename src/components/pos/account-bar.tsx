import { Bell, RotateCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const whatsNew = [
  "Orders & payments bug fixes",
  "Table management bug fixes",
  "OrderOS & device sync fixes",
  "POS UI bug fixes",
];

/**
 * Screens 63 / 65 — collapsible account top bar with the "what's new" popover.
 * Collapsed by default; the handle expands it on every screen size.
 */
export function AccountBar() {
  const { session, settings } = usePos();
  const [news, setNews] = useState(false);

  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="relative z-20 shrink-0 bg-background px-3 pt-2">
      {true ? (

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-sm font-extrabold text-foreground">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold leading-tight text-foreground">
              {session.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session.role} ({settings.clockedInAt})
            </p>
          </div>
          <button
            type="button"
            aria-label="What's new"
            onClick={() => setNews((n) => !n)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-secondary"
          >
            <Bell className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Refresh tickets"
            onClick={() => toast.success("Tickets refreshed")}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-secondary"
          >
            <RotateCw className="size-4" />
          </button>
        </div>
      ) : null}


      {news ? (
        <>
          <button
            type="button"
            aria-label="Close what's new"
            onClick={() => setNews(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div
            className={cn(
              "absolute left-3 right-3 top-[calc(100%+6px)] z-40 rounded-2xl border border-border bg-surface p-4",
              "shadow-[0_18px_60px_-12px_rgba(0,0,0,0.45)]",
            )}
          >
            <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-accent">what&apos;s new</p>
            <div className="mt-3 flex items-start gap-3">
              <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-muted text-sm font-extrabold text-foreground">
                e
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-foreground">
                  eatOS ver {settings.appVersion}
                </p>
                <p className="text-xs text-muted-foreground">eatOS Point Of Sale Inc.</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-snug text-muted-foreground">
              We have some exciting new updates to upgrade your restaurant and make operations
              smooth.
            </p>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">
              Here&apos;s what&apos;s new with eatOS Point Of Sale
            </p>
            <ul className="mt-1 space-y-1 pl-3">
              {whatsNew.map((n) => (
                <li key={n} className="text-xs leading-snug text-foreground">
                  · {n}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => toast.info("Full release notes opened")}
              className="mt-3 w-full text-center text-sm font-extrabold text-accent"
            >
              See more
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
