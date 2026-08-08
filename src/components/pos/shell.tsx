import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  ClipboardList,
  Columns3,
  LayoutGrid,
  PlusCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { ReactNode } from "react";
import { ClockPullDown } from "@/components/pos/clock-pulldown";
import { useGlobalKeyboardAware } from "@/hooks/use-keyboard-inset";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/** Device frame: full-bleed on phones, framed handheld on tablet/desktop. */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const { session } = usePos();
  useGlobalKeyboardAware();

  return (
    <div className="h-[100dvh] overflow-hidden bg-shell md:flex md:h-auto md:min-h-[100dvh] md:items-center md:justify-center md:overflow-visible md:p-8">
      <div
        className={cn(
          "relative flex h-full max-h-[100dvh] w-full overflow-hidden bg-background",
          "md:h-[860px] md:max-h-none md:w-[420px] md:rounded-[2.75rem] md:border-[10px] md:border-shell md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]",
          "lg:h-[880px] lg:w-[440px]",
        )}
      >
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {session.signedIn ? <ClockPullDown /> : null}
          {children}
          {session.signedIn ? <BottomTabs /> : null}
        </div>
      </div>
    </div>
  );
}

/** Back chevron that falls back to a parent route when there is no history. */
export function BackButton({
  fallbackTo,
  label = "Go back",
}: {
  fallbackTo?: string;
  label?: string;
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
      className="-ml-1 grid size-11 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
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
  backTo?: string;
  right?: ReactNode;
}) {
  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {back ? <BackButton fallbackTo={backTo} /> : null}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold text-foreground">{title}</h1>
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
  backLabel?: string;
  backTo?: string;
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
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold text-foreground">{title}</h1>
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
    <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(1.25rem+var(--kb-inset,0px))] pt-3">
      {children}
    </div>
  );
}

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/floor", label: "Home", icon: LayoutGrid },
  { to: "/order/new", label: "Order", icon: PlusCircle },
  { to: "/tickets", label: "Tickets", icon: ClipboardList },
  { to: "/board", label: "Board", icon: Columns3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomTabs() {
  return (
    <nav className="shrink-0 border-t border-border bg-surface [html[data-kb=open]_&]:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors data-[status=active]:text-accent"
            >
              <span className="absolute inset-x-6 top-0 h-[3px] rounded-full bg-transparent group-data-[status=active]:bg-accent" />
              <Icon className="size-5" />
              <span className="text-[11px] font-semibold">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
