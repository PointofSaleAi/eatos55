import { Link } from "@tanstack/react-router";
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

/** Initials chip + name / role / clock-in time, sized for the thin top band. */
export function AccountInfo() {
  const { session, settings } = usePos();
  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="flex min-w-0 items-center gap-2 pl-1">
      <span className="grid size-7 shrink-0 place-items-center rounded-row bg-muted text-[0.625rem] font-extrabold text-foreground">
        {initials}
      </span>
      <p className="min-w-0 truncate text-fs-xs font-extrabold leading-tight text-foreground">
        {session.name}
        <span className="hidden font-semibold text-muted-foreground xs:inline">
          {" "}
          · {session.role} ({settings.clockedInAt})
        </span>
      </p>
    </div>
  );
}

/** What's-new bell + refresh, right side of the thin top band. */
export function AccountActions() {
  const { settings } = usePos();
  const [news, setNews] = useState(false);

  return (
    <div className="relative flex shrink-0 items-center justify-end">
      <button
        type="button"
        aria-label="What's new"
        onClick={() => setNews((n) => !n)}
        className="grid size-9 tap-safe shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
      >
        <Bell className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Refresh tickets"
        onClick={() => toast.success("Tickets refreshed")}
        className="grid size-9 tap-safe shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
      >
        <RotateCw className="size-4" />
      </button>

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
              "absolute right-0 top-[calc(100%+6px)] z-40 w-[min(20rem,calc(100vw-1.5rem))] rounded-card border border-border bg-surface p-4",
              "shadow-[0_18px_60px_-12px_rgba(0,0,0,0.45)]",
            )}
          >
            <p className="text-center text-fs-xs font-bold uppercase tracking-[0.14em] text-accent">
              what&apos;s new
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span className="mt-1 grid size-8 tap-safe shrink-0 place-items-center rounded-row bg-muted text-fs-sm font-extrabold text-foreground">
                e
              </span>
              <div className="min-w-0">
                <p className="text-fs-sm font-extrabold text-foreground">
                  eatOS ver {settings.appVersion}
                </p>
                <p className="text-fs-xs text-muted-foreground">eatOS Point Of Sale Inc.</p>
              </div>
            </div>
            <p className="mt-3 text-fs-xs leading-snug text-muted-foreground">
              We have some exciting new updates to upgrade your restaurant and make operations
              smooth.
            </p>
            <p className="mt-2 text-fs-xs leading-snug text-muted-foreground">
              Here&apos;s what&apos;s new with eatOS Point Of Sale
            </p>
            <ul className="mt-1 space-y-1 pl-3">
              {whatsNew.map((n) => (
                <li key={n} className="text-fs-xs leading-snug text-foreground">
                  · {n}
                </li>
              ))}
            </ul>
            <Link
              to="/tickets/whats-new"
              onClick={() => setNews(false)}
              className="mt-3 flex min-h-tap w-full items-center justify-center text-fs-sm font-extrabold text-accent"
            >
              See more
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
