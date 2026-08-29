import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bell,
  Headphones,
  RotateCw,
  Timer,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const whatsNew = [
  "Orders & payments bug fixes",
  "Table management bug fixes",
  "OrderOS & device sync fixes",
  "POS UI bug fixes",
];

const iconBtn =
  "grid size-9 tap-safe shrink-0 place-items-center rounded-pill text-shell-foreground transition-colors hover:bg-white/10";

/** Live wall clock, formatted like the design ("08 : 31 AM"). */
function useClock() {
  // Starts null so SSR and the first client render agree (no locale/time skew).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return "";
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, "0");
  const suffix = now.getHours() >= 12 ? "PM" : "AM";
  return `${String(h).padStart(2, "0")} : ${m} ${suffix}`;
}

/** True while the device reports no network. */
function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

/** Switch user + avatar, staff name, divider and the shift role pill. */
export function AccountInfo({ onSwitchUser }: { onSwitchUser?: () => void }) {
  const { session, settings } = usePos();
  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <button
        type="button"
        aria-label="Switch user"
        title="Switch user"
        onClick={onSwitchUser}
        className={cn(iconBtn, "hidden sm:grid")}
      >
        <ArrowLeftRight className="size-5" />
      </button>
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/15 text-[0.625rem] font-extrabold text-shell-foreground">
        {initials}
      </span>
      <p className="min-w-0 truncate text-fs-sm font-extrabold leading-tight text-shell-foreground">
        {session.name}
      </p>
      <span aria-hidden className="mx-1 hidden h-5 w-px shrink-0 bg-white/25 sm:block" />
      <span
        title={`Clocked in at ${settings.clockedInAt}`}
        className="flex min-w-0 shrink items-center gap-1.5 rounded-pill bg-white/12 px-2.5 py-1 text-fs-xs font-bold text-shell-foreground"
      >
        <Timer className="size-4 shrink-0" />
        <span className="truncate">
          {session.role} ({settings.clockedInAt})
        </span>
      </span>

    </div>
  );
}

/** eatOS badge, refresh, support, what's new, network and the live clock. */
export function AccountActions() {
  const { settings } = usePos();
  const navigate = useNavigate();
  const [news, setNews] = useState(false);
  const [seen, setSeen] = useState(false);
  const clock = useClock();
  const online = useOnline();

  return (
    <div className="relative flex shrink-0 items-center justify-end gap-0.5">
      <span
        aria-hidden
        className="hidden size-6 shrink-0 place-items-center rounded-pill bg-accent text-[0.625rem] font-extrabold text-accent-foreground sm:grid"
      >
        e
      </span>
      <button
        type="button"
        aria-label="Refresh tickets"
        title="Refresh"
        onClick={() => toast.success("Tickets refreshed")}
        className={cn(iconBtn, "hidden sm:grid")}
      >
        <RotateCw className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Customer support"
        title="Support"
        onClick={() => navigate({ to: "/system/customer-support" })}
        className={cn(iconBtn, "hidden sm:grid")}
      >
        <Headphones className="size-4" />
      </button>
      <button
        type="button"
        aria-label="What's new"
        title="What's new"
        onClick={() => {
          setNews((n) => !n);
          setSeen(true);
        }}
        className={cn(iconBtn, "relative")}
      >
        <Bell className="size-4" />
        {seen ? null : (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-pill bg-tile-blue" />
        )}
      </button>
      <span
        aria-label={online ? "Online" : "Offline"}
        title={online ? "Online" : "Offline"}
        className="grid size-9 shrink-0 place-items-center text-shell-foreground"
      >
        {online ? <Wifi className="size-4" /> : <WifiOff className="size-4 text-destructive" />}
      </span>
      <p className="shrink-0 pl-1 pr-1 text-fs-sm font-extrabold tabular-nums text-shell-foreground">
        {clock}
      </p>

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
                <p className="text-fs-xs text-muted-foreground">{brand.appName} Point Of Sale Inc.</p>
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
