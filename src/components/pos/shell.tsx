import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  Menu as MenuIcon,
  ClipboardList,
  Columns3,
  LayoutGrid,
  Plus,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ClockPullDown } from "@/components/pos/clock-pulldown";
import { ConfirmProvider } from "@/components/pos/confirm-sheet";
import { LiveRegionProvider } from "@/components/pos/live-region";
import { NavDrawer } from "@/components/pos/nav-drawer";
import { OfflineBanner } from "@/components/pos/offline-banner";
import { useAppearance } from "@/hooks/use-appearance";
import { useGlobalKeyboardAware } from "@/hooks/use-keyboard-inset";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const NavDrawerContext = createContext<{ open: () => void } | null>(null);

/** Opens the global navigation drawer from any header. */
export function useNavDrawer() {
  return useContext(NavDrawerContext);
}

/** Burger button that opens the full app navigation drawer. */
export function MenuButton({ className }: { className?: string }) {
  const drawer = useNavDrawer();
  const appChrome = useAppChrome();
  if (!drawer || !appChrome) return null;
  return (
    <button
      type="button"
      aria-label="Open navigation"
      title="Navigation"
      onClick={drawer.open}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      <MenuIcon className="size-6" />
    </button>
  );
}

/** Pre-login screens: no app chrome (drawer, tabs, clock pulldown). */
const publicPaths = ["/", "/access/create-account", "/access/forgot-password"];

/** True when the current route is an in-app screen that gets full navigation. */
export function useAppChrome() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const p = pathname.replace(/\/+$/, "") || "/";
  return !publicPaths.includes(p);
}

/** Device frame: full-bleed on phones, framed handheld on tablet/desktop. */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const appChrome = useAppChrome();
  useGlobalKeyboardAware();
  // Follows the system light/dark appearance unless overridden in Settings.
  useAppearance();

  return (
    <div className="h-[100dvh] overflow-hidden bg-shell md:flex md:h-auto md:min-h-[100dvh] md:items-center md:justify-center md:overflow-visible md:p-8">
      <div
        className={cn(
          "relative flex h-full max-h-[100dvh] w-full overflow-hidden bg-background",
          "md:h-[860px] md:max-h-none md:w-[420px] md:rounded-[2.75rem] md:border-[10px] md:border-shell md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]",
          "lg:h-[880px] lg:w-[440px]",
        )}
      >
        <NavDrawerContext.Provider value={{ open: () => setNavOpen(true) }}>
          <LiveRegionProvider>
            <ConfirmProvider>
              <div
                className="relative flex min-h-0 min-w-0 flex-1 flex-col pt-[var(--sat,0px)]"
                style={{ ["--tabs-h" as string]: appChrome ? "56px" : "0px" }}
              >
                {appChrome ? <ClockPullDown /> : null}
                <OfflineBanner />
                {children}
                {appChrome ? <BottomTabs /> : null}
                {appChrome ? (
                  <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
                ) : null}
                {/* Portal host for keyboard-docked UI (search bar). */}
                <div id="pos-dock-root" className="pointer-events-none absolute inset-0 z-40" />
              </div>
            </ConfirmProvider>
          </LiveRegionProvider>
        </NavDrawerContext.Provider>
      </div>
    </div>
  );
}

/** Back chevron that falls back to a parent route when there is no history. */
export function BackButton({
  fallbackTo,
  label = "Go back",
}: {
  fallbackTo?: string | undefined;
  label?: string | undefined;
}) {
  const router = useRouter();
  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
      return;
    }
    router.navigate({ to: fallbackTo ?? "/floor" });
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="-ml-1 grid size-11 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
    >
      <ChevronLeft className="size-5" />
    </button>
  );
}

export function ScreenHeader({
  title,
  back,
  backTo,
  right,
}: {
  title: string;
  /** Accepted for API compatibility; no longer rendered above the title. */
  eyebrow?: string;
  back?: boolean;
  backTo?: string | undefined;
  right?: ReactNode;
}) {
  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {back ? <BackButton fallbackTo={backTo} /> : <MenuButton className="-ml-1" />}
          <div className="min-w-0">
            <h1 className="truncate t-title text-foreground">{title}</h1>
          </div>
        </div>
        {right ? <div className="flex shrink-0 items-center gap-1">{right}</div> : null}
      </div>
    </div>
  );
}

/** Sub screen header: back chevron + labelled title, original design styling. */
export function SubHeader({
  title,
  backLabel = "Back",
  backTo,
  right,
}: {
  title: string;
  backLabel?: string | undefined;
  backTo?: string | undefined;
  right?: ReactNode;
}) {
  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <BackButton
            fallbackTo={backTo}
            label={backLabel ? `Back to ${backLabel}` : "Go back"}
          />
          <MenuButton className="-ml-2" />
          <div className="min-w-0">
            <h1 className="truncate t-title text-foreground">{title}</h1>
          </div>
        </div>
        {right ? <div className="flex shrink-0 items-center gap-1">{right}</div> : null}
      </div>
    </div>
  );
}


export function ScreenBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[calc(1rem+var(--kb-inset,0px))]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ScreenFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(1.25rem+var(--kb-inset,0px)+var(--sab,0px))] pt-3">
      {children}
    </div>
  );
}

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/floor", label: "Home", icon: LayoutGrid },
  { to: "/tickets", label: "Tickets", icon: ClipboardList },
  { to: "/board", label: "Board", icon: Columns3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

/**
 * Floating tab pill plus a separate primary action button.
 * The pill carries the four browse destinations; the round button carries the
 * single most common action for the current context (start / review an order).
 */
export function BottomTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { startOrder } = usePos();
  const router = useRouter();
  const onOrderFlow = pathname.startsWith("/order");

  const action = onOrderFlow
    ? { label: "Review order", icon: Check, run: () => router.navigate({ to: "/order/review" }) }
    : {
        label: "New order",
        icon: Plus,
        run: () => {
          startOrder();
          router.navigate({ to: "/order/new" });
        },
      };
  const ActionIcon = action.icon;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-center gap-2 px-3 pb-[calc(0.5rem+var(--sab,0px))] [html[data-kb=open]_&]:hidden">
      <nav
        aria-label="Main"
        className="pointer-events-auto min-w-0 flex-1 rounded-pill border border-border bg-surface/90 p-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        <ul className="grid grid-cols-4">
          {tabs.map(({ to, label, icon: Icon }) => (
            <li key={to} className="min-w-0">
              <Link
                to={to}
                preload="intent"
                onClick={() => haptic("light")}
                className="group flex min-h-tap min-w-0 flex-col items-center justify-center gap-0.5 rounded-pill px-1 py-1.5 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent/15 data-[status=active]:text-accent"
              >
                <Icon className="size-5 shrink-0" />
                <span className="t-badge max-w-full truncate group-data-[status=active]:inline max-[360px]:hidden max-[360px]:group-data-[status=active]:inline">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button
        type="button"
        aria-label={action.label}
        title={action.label}
        onClick={() => {
          haptic("medium");
          action.run();
        }}
        className="pointer-events-auto grid size-14 shrink-0 place-items-center rounded-pill bg-primary text-primary-foreground shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] transition-transform active:scale-95 motion-reduce:transition-none"
      >
        <ActionIcon className="size-6" />
      </button>
    </div>
  );
}

