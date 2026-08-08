import { Bell, ChevronDown, ChevronUp, RotateCw } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);
  const [news, setNews] = useState(false);

  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="relative z-30 shrink-0 bg-background px-3 pt-2">
      {expanded ? (
        <div className="flex items-center gap-3 rounded-2xl bg-muted-foreground/60 px-3 py-2">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-base font-bold text-foreground">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold leading-tight text-surface">
              {session.name}
            </p>
            <p className="truncate text-sm font-semibold text-surface/80">
              {session.role} ({settings.clockedInAt})
            </p>
          </div>
          <button
            type="button"
            aria-label="What's new"
            onClick={() => setNews((n) => !n)}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface/25 text-surface"
          >
            <Bell className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Refresh tickets"
            onClick={() => toast.success("Tickets refreshed")}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface/25 text-surface"
          >
            <RotateCw className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Collapse account bar"
            onClick={() => {
              setNews(false);
              setExpanded(false);
            }}
            className="grid size-10 shrink-0 place-items-center rounded-full text-surface"
          >
            <ChevronUp className="size-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Expand account bar"
          onClick={() => setExpanded(true)}
          className="mx-auto flex h-6 w-32 items-center justify-center rounded-b-xl bg-muted-foreground/60 text-surface"
        >
          <ChevronDown className="size-5" />
        </button>
      )}

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
              "absolute left-3 right-3 top-[calc(100%+6px)] z-40 rounded-2xl bg-surface p-4",
              "shadow-[0_18px_60px_-12px_rgba(0,0,0,0.45)]",
            )}
          >
            <p className="text-center text-lg font-extrabold text-destructive">what&apos;s new</p>
            <div className="mt-3 flex items-start gap-3">
              <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-accent text-base font-extrabold text-surface">
                e
              </span>
              <div className="min-w-0">
                <p className="text-base font-extrabold text-foreground">
                  eatOS ver {settings.appVersion}
                </p>
                <p className="text-base text-foreground">eatOS Point Of Sale Inc.</p>
              </div>
            </div>
            <p className="mt-3 text-base leading-snug text-foreground">
              We have some exciting new updates to upgrade your restaurant and make operations
              smooth.
            </p>
            <p className="mt-2 text-base leading-snug text-foreground">
              Here&apos;s what&apos;s new with eatOS Point Of Sale
            </p>
            <ul className="mt-1 space-y-1 pl-3">
              {whatsNew.map((n) => (
                <li key={n} className="text-base leading-snug text-foreground">
                  · {n}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => toast.info("Full release notes opened")}
              className="mt-3 w-full text-center text-base font-extrabold text-foreground"
            >
              See more
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
