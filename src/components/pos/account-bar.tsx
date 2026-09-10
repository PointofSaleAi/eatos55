import { Link, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import {
  Bell,
  EllipsisVertical,
  Headphones,
  RotateCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const whatsNew = [
  "Orders & payments bug fixes",
  "Table management bug fixes",
  "OrderOS & device sync fixes",
  "POS UI bug fixes",
];

const iconBtn =
  "size-11 shrink-0 rounded-lg text-topbar-foreground hover:bg-muted hover:text-topbar-foreground";

/** Live wall clock, formatted compactly for the phone header. */
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
  return `${String(h).padStart(2, "0")}:${m} ${suffix}`;
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

/** Initials are the single identity control; role and shift time form the status. */
export function AccountInfo({ onSwitchUser }: { onSwitchUser?: () => void }) {
  const { session, settings } = usePos();
  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Switch user"
        title="Switch user"
        onClick={onSwitchUser}
        className="size-11 shrink-0 rounded-full bg-topbar-foreground p-0 text-[0.75rem] font-extrabold text-topbar hover:bg-topbar-foreground/90 hover:text-topbar"
      >
        {initials}
      </Button>
      <div className="min-w-0 leading-none">
        <p className="truncate text-[0.6875rem] font-extrabold uppercase text-topbar-muted">
          {session.role}
        </p>
        <span
          title={`Clocked in at ${settings.clockedInAt}`}
          className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[0.75rem] font-semibold text-topbar-foreground"
        >
          {settings.clockedInAt}
          <span aria-hidden className="size-1.5 rounded-full bg-success" />
        </span>
      </div>
    </div>
  );
}

/** eatOS badge, refresh, support, what's new, network and the live clock. */
export function AccountActions() {
  const { settings } = usePos();
  const navigate = useNavigate();
  const [news, setNews] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const clock = useClock();
  const online = useOnline();

  useEffect(() => {
    if (!moreOpen && !news) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        setNews(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [moreOpen, news]);

  const openNews = () => {
    setNews(true);
    setMoreOpen(false);
    setSeen(true);
  };

  return (
    <div className="relative flex shrink-0 items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Refresh tickets"
        title="Refresh"
        onClick={() => toast.success("Tickets refreshed")}
        className={cn(iconBtn, "hidden md:inline-flex")}
      >
        <RotateCw className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Customer support"
        title="Support"
        onClick={() => navigate({ to: "/system/customer-support" })}
        className={cn(iconBtn, "hidden md:inline-flex")}
      >
        <Headphones className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="What's new"
        title="What's new"
        onClick={() => (news ? setNews(false) : openNews())}
        className={cn(iconBtn, "relative hidden sm:inline-flex")}
      >
        <Bell className="size-4" />
        {seen ? null : (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-pill bg-tile-blue" />
        )}
      </Button>
      <span
        aria-label={online ? "Online" : "Offline"}
        title={online ? "Online" : "Offline"}
        className="grid size-7 shrink-0 place-items-center text-topbar-muted"
      >
        {online ? <Wifi className="size-4" /> : <WifiOff className="size-4 text-destructive" />}
      </span>
      <p className="shrink-0 whitespace-nowrap px-1 text-[0.8125rem] font-extrabold tabular-nums text-topbar-foreground">
        {clock}
      </p>
      <span aria-hidden className="mx-0.5 hidden h-6 w-px bg-topbar-border sm:block" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="More top bar actions"
        aria-expanded={moreOpen}
        onClick={() => setMoreOpen((value) => !value)}
        className={cn(iconBtn, "relative")}
      >
        <EllipsisVertical className="size-5" />
        {!seen ? <span className="absolute right-2 top-2 size-2 rounded-full bg-tile-blue" /> : null}
      </Button>

      {moreOpen ? (
        <>
          <button
            type="button"
            aria-label="Close more actions"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 top-[calc(100%+0.375rem)] z-40 w-56 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
            <Button variant="ghost" className="w-full justify-start" onClick={openNews}>
              <Bell /> What&apos;s new
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start md:hidden"
              onClick={() => {
                setMoreOpen(false);
                toast.success("Tickets refreshed");
              }}
            >
              <RotateCw /> Refresh tickets
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start md:hidden"
              onClick={() => {
                setMoreOpen(false);
                navigate({ to: "/system/customer-support" });
              }}
            >
              <Headphones /> Customer support
            </Button>
          </div>
        </>
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
                  {brand.appName} ver {settings.appVersion}
                </p>
                <p className="text-fs-xs text-muted-foreground">{brand.appName} Point Of Sale Inc.</p>
              </div>
            </div>
            <p className="mt-3 text-fs-xs leading-snug text-muted-foreground">
              We have some exciting new updates to upgrade your restaurant and make operations
              smooth.
            </p>
            <p className="mt-2 text-fs-xs leading-snug text-muted-foreground">
              Here&apos;s what&apos;s new with {brand.appName} Point Of Sale
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
