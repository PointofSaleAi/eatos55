import { Link, useCanGoBack, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ClipboardList,
  Columns3,
  LayoutGrid,
  Plus,
  Settings,
  type LucideIcon,
} from "lucide-react";


import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ClockPullDown } from "@/components/pos/clock-pulldown";
import { ConfirmProvider } from "@/components/pos/confirm-sheet";
import { LiveRegionProvider } from "@/components/pos/live-region";
import { NavDrawer } from "@/components/pos/nav-drawer";
import { NavRail } from "@/components/pos/nav-rail";
import { SplitPane, isSettingsTopLevel, useSectionPane } from "@/components/pos/split-pane";
import { useLayoutMode } from "@/hooks/use-layout-mode";
import { OfflineBanner } from "@/components/pos/offline-banner";
import { useAppearance } from "@/hooks/use-appearance";
import { useGlobalKeyboardAware } from "@/hooks/use-keyboard-inset";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export { useNavDrawer } from "@/lib/nav-drawer-context";


/** Pre-login screens: no app chrome (drawer, tabs, clock pulldown). */
const publicPaths = ["/", "/access/create-account", "/access/forgot-password"];

/** True when the current route is an in-app screen that gets full navigation. */
export function useAppChrome() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const p = pathname.replace(/\/+$/, "") || "/";
  return !publicPaths.includes(p);
}

/**
 * Enforces the session: signing out or clocking out must actually leave the app,
 * and no in-app screen stays reachable (or reloadable) without a session.
 */
function useSessionGate() {
  const router = useRouter();
  const { session, sessionReady, saveResume } = usePos();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const path = pathname.replace(/\/+$/, "") || "/";
  const isAccess = path === "/" || path.startsWith("/access");

  // Remember where this person is, so their next PIN unlock lands right back here.
  useEffect(() => {
    if (!sessionReady || !session.signedIn || !session.clockedIn) return;
    saveResume(path);
  }, [saveResume, path, sessionReady, session.signedIn, session.clockedIn]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!session.signedIn && !isAccess) {
      router.navigate({ to: "/", replace: true });
      return;
    }
    if (session.signedIn && !session.clockedIn && !isAccess) {
      router.navigate({ to: "/access/clock-in", replace: true });
    }
  }, [router, isAccess, sessionReady, session.signedIn, session.clockedIn]);
}

/** Landscape body: list pane beside the routed screen when the section has one. */
function LandscapeContent({ children }: { children: ReactNode }) {
  const pane = useSectionPane();
  if (!pane) return <>{children}</>;
  return (
    <SplitPane list={pane.list} listClassName={pane.listClassName}>
      {pane.replaceChildren ?? children}
    </SplitPane>
  );
}

const WideContext = createContext(false);

/** True when the landscape tablet/web layout is active. */
export function useWideLayout() {
  return useContext(WideContext);
}

/**
 * Device frame.
 * Phone (<768px): full-bleed single pane with floating tab bar.
 * Landscape tablet/web (>=768px): fills the viewport with a nav rail and, where
 * a section has one, a list pane beside the routed screen.
 * The handheld frame is chosen by viewport width only, with no manual toggle.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const navCtx = useMemo(() => ({ open: () => setNavOpen(true) }), []);
  const appChrome = useAppChrome();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const path = pathname.replace(/\/+$/, "") || "/";
  const isSignIn = path === "/";
  // Clock In is an opaque gate: top bar only, no rail / tabs / drawer.
  const clockGate = path === "/access/clock-in";
  const { wide } = useLayoutMode();
  useSessionGate();
  useGlobalKeyboardAware();
  // Follows the system light/dark appearance unless overridden in Settings.
  useAppearance();

  const landscape = wide && appChrome;
  // Pre-login screens have no rail/tabs but still drop the phone frame on wide
  // viewports so the preview matches the tablet/web layout.
  const wideAccess = wide && !appChrome;
  const fullBleed = landscape || wideAccess;


  return (
    <div
      className={cn(
        "h-[100dvh] overflow-hidden bg-shell",
        fullBleed
          ? "bg-background"
          : "md:flex md:h-auto md:min-h-[100dvh] md:items-center md:justify-center md:overflow-visible md:p-8",
      )}
    >
      <div
        className={cn(
          "relative flex h-full max-h-[100dvh] w-full flex-col overflow-hidden bg-background",
          !fullBleed &&
            "md:h-[860px] md:max-h-none md:w-[420px] md:rounded-[2.75rem] md:border-[10px] md:border-shell md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] lg:h-[880px] lg:w-[440px]",
        )}
      >
        <WideContext.Provider value={landscape}>
          <NavDrawerContext.Provider value={navCtx}>
            <LiveRegionProvider>
              <ConfirmProvider>
                {/* Full-width dark top bar spans the rail in landscape, per design. */}
                {appChrome ? <ClockPullDown /> : null}
                <div className="relative flex min-h-0 min-w-0 flex-1">
                  {landscape ? <NavRail /> : null}
                  <div
                    className="relative flex min-h-0 min-w-0 flex-1 flex-col pt-[var(--sat,0px)]"
                    style={{
                      ["--tabs-h" as string]:
                        appChrome && !landscape && !clockGate ? "4rem" : "0px",
                    }}
                  >
                    <OfflineBanner />
                    {clockGate ? (
                      children
                    ) : landscape ? (
                      <LandscapeContent>{children}</LandscapeContent>
                    ) : wideAccess ? (
                      isSignIn ? (
                        children
                      ) : (
                        <div className="mx-auto flex min-h-0 w-full max-w-[32rem] flex-1 flex-col">
                          {children}
                        </div>
                      )
                    ) : (
                      children
                    )}

                    {appChrome && !landscape && !clockGate ? <BottomTabs /> : null}
                    {appChrome && !landscape && !clockGate ? (
                      <NavDrawer open={navOpen} onClose={closeNav} />
                    ) : null}
                    {/* Portal host for keyboard-docked UI (search bar). */}
                    <div id="pos-dock-root" className="pointer-events-none absolute inset-0 z-40" />
                  </div>
                </div>

              </ConfirmProvider>
            </LiveRegionProvider>
          </NavDrawerContext.Provider>
        </WideContext.Provider>
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
  backLabel,
  backTo,
  right,
}: {
  title: string;
  backLabel?: string | undefined;
  backTo?: string | undefined;
  right?: ReactNode;
}) {
  const canGoBack = useCanGoBack();
  const wide = useWideLayout();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // No chevron when the sidebar already exposes this screen, or when there is
  // genuinely nowhere to go back to.
  const sidebarReachable = wide && isSettingsTopLevel(pathname);
  const showBack = !sidebarReachable && (canGoBack || Boolean(backTo));

  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <BackButton
              fallbackTo={backTo}
              label={backLabel ? `Back to ${backLabel}` : "Go back"}
            />
          ) : wide ? null : (
            <MenuButton className="-ml-1" />
          )}
          <div className="min-w-0">
            <h1 className="truncate t-title text-foreground">{title}</h1>
          </div>
        </div>
        {right ? <div className="flex shrink-0 items-center gap-1">{right}</div> : null}
      </div>
    </div>
  );
}


export function ScreenBody({
  children,
  className,
  hug,
}: {
  children: ReactNode;
  className?: string;
  /**
   * Set on screens that render their own `ScreenFooter`: the footer already
   * reserves room for the floating tab bar, so the body must not do it again
   * (double reservation makes short pages scroll for no reason).
   */
  hug?: boolean;
}) {
  return (
    <div
      className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4", className)}
      // Inline so a route-level `py-*`/`pb-*` cannot merge away the space that
      // keeps the last row clear of the floating tab bar and the keyboard.
      style={{
        paddingBottom: hug
          ? "calc(1rem + var(--kb-inset, 0px))"
          : "calc(1rem + var(--kb-inset, 0px) + var(--tabs-h, 0px))",
      }}
    >
      {children}
    </div>
  );
}


export function ScreenFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(1.25rem+var(--kb-inset,0px)+var(--sab,0px)+var(--tabs-h,0px))] pt-3">
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
    ? { label: "Charge order", icon: Check, run: () => router.navigate({ to: "/payment/method" }) }
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

