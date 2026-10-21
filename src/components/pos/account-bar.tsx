import { Link, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { formatVersionLabel } from "@/lib/demo-data";
import {
  ArrowLeftRight,
  Timer,
  Bell,
  Headphones,
  RotateCw,
  Wifi,
  WifiOff,
  MoreHorizontal,
} from "lucide-react";
import localHostAsset from "@/assets/local-host.png.asset.json";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useDeviceOnline } from "@/lib/device";
import { AiMark } from "@/components/pos/dashboard/eatos-ai-chat";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavDrawer } from "@/lib/nav-drawer-context";
import { usePos } from "@/lib/pos-store";
import { ProfileCard } from "@/components/pos/profile-card";

import { cn } from "@/lib/utils";

const whatsNew = [
  "Orders & payments bug fixes",
  "Table management bug fixes",
  "OrderOS & device sync fixes",
  "POS UI bug fixes",
];

const iconBtn =
  "size-11 shrink-0 rounded-lg text-topbar-foreground hover:bg-topbar-foreground/15 hover:text-topbar-foreground focus-visible:bg-topbar-foreground/15";

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

/** Shared connectivity check: same-origin probe, not just navigator.onLine. */
function useOnline() {
  return useDeviceOnline();
}

/** Initials open the app navigation; role and shift time form the status. */
export function AccountInfo() {
  const { session, settings } = usePos();
  const drawer = useNavDrawer();
  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  const hour = new Date().getHours();
  const service = hour < 11 ? "Breakfast Service" : hour < 16 ? "Lunch Service" : "Dinner Service";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Switch user"
        title="Switch user"
        onClick={() => window.dispatchEvent(new CustomEvent("pos:switch-user"))}
        className="inline-flex size-9 shrink-0 text-topbar-foreground hover:bg-topbar-foreground/15 hover:text-topbar-foreground focus-visible:bg-topbar-foreground/15"
      >
        <ArrowLeftRight className="size-4" />
      </Button>
      <div className="flex min-w-0 items-center gap-2 rounded-pill bg-topbar-foreground/10 py-1 pl-1 pr-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          title="Navigation"
          onClick={() => drawer?.open()}
          className="size-9 shrink-0 rounded-full bg-topbar-foreground/15 p-0 text-[0.75rem] font-extrabold text-topbar-foreground hover:bg-topbar-foreground/25 hover:text-topbar-foreground"
        >
          {initials}
        </Button>
        <ProfileCard>
          <button
            type="button"
            aria-label="Open profile"
            className="flex min-w-0 items-center gap-2 rounded-pill px-1 py-1 hover:bg-topbar-foreground/15"
          >
            <span className="hidden truncate text-[0.875rem] font-bold text-topbar-foreground lg:inline">
              {session.name.split(" ")[0]}
            </span>
            <span className="whitespace-nowrap text-[0.6875rem] font-extrabold uppercase text-topbar-muted">
              {session.role}
            </span>
            <span aria-hidden className="hidden h-5 w-px bg-topbar-border md:block" />
            <span
              title={session.clockedIn ? `Clocked in at ${settings.clockedInAt}` : "Not clocked in"}
              className="hidden items-center gap-1.5 whitespace-nowrap text-[0.8125rem] font-semibold text-topbar-foreground md:flex"
            >
              <Timer className="size-4" />
              {session.clockedIn ? `${service} (${settings.clockedInAt})` : "Not clocked in"}
            </span>
          </button>
        </ProfileCard>
      </div>
    </div>
  );
}

/** eatOS badge, refresh, support, what's new, network and the live clock. */
export function AccountActions() {
  const { settings } = usePos();
  const navigate = useNavigate();
  const [news, setNews] = useState(false);
  const [more, setMore] = useState(false);
  const [seen, setSeen] = useState(false);
  const clock = useClock();
  const online = useOnline();

  useEffect(() => {
    if (!news) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNews(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [news]);

  const openNews = () => {
    setNews(true);
    setSeen(true);
  };

  return (
    <div className="relative flex shrink-0 items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Maya AI"
        title="Maya AI"
        onClick={() => window.dispatchEvent(new CustomEvent("pos:open-dashboard"))}
        className={cn(iconBtn, "hidden md:inline-flex")}
      >
        <AiMark className="size-7 rounded-full" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Local Host"
        title="Local Host"
        onClick={() => navigate({ to: "/settings/detail/$topic", params: { topic: "servers" } })}
        className={cn(iconBtn, "hidden md:inline-flex")}
      >
        <img src={localHostAsset.url} alt="" className="size-5 object-contain" />
      </Button>
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
        className={cn(iconBtn, "relative hidden md:inline-flex")}
      >
        <Bell className="size-4" />
        {seen ? null : (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-pill bg-tile-blue" />
        )}
      </Button>
      <Popover open={more} onOpenChange={setMore}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="More actions"
            title="More"
            className={cn(iconBtn, "relative md:hidden")}
          >
            <MoreHorizontal className="size-5" />
            {seen ? null : (
              <span className="absolute right-1 top-1 size-2 rounded-pill bg-tile-blue" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom" className="w-52 p-1">
          {[
            { label: "Maya AI", icon: <AiMark className="size-5 rounded-full" />, run: () => window.dispatchEvent(new CustomEvent("pos:open-dashboard")) },
            { label: "Local Host", icon: <img src={localHostAsset.url} alt="" className="size-4 object-contain invert dark:invert-0" />, run: () => navigate({ to: "/settings/detail/$topic", params: { topic: "servers" } }) },
            { label: "Refresh", icon: <RotateCw className="size-4" />, run: () => toast.success("Tickets refreshed") },
            { label: "Support", icon: <Headphones className="size-4" />, run: () => navigate({ to: "/system/customer-support" }) },
            { label: "What's New", icon: <Bell className="size-4" />, run: openNews, dot: !seen },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setMore(false);
                item.run();
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-fs-sm font-semibold text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <span className="grid size-5 place-items-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.dot ? <span className="size-2 rounded-pill bg-tile-blue" /> : null}
            </button>
          ))}
        </PopoverContent>
      </Popover>
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
                  {brand.appName} ver {formatVersionLabel(settings.appVersion)}
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
