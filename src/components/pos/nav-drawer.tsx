import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Grid2x2,
  Headset,
  LayoutGrid,
  LogOut,
  Receipt,
  ShieldCheck,
  Settings as SettingsIcon,
  Sofa,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { cn } from "@/lib/utils";

type NavLink = { to: string; label: string; icon: LucideIcon };

/**
 * Top-level destinations only. Deeper screens are reached by drilling in from
 * their own section (Settings has its own tree), so this list never scrolls.
 */
const groups: { title: string; links: NavLink[] }[] = [
  {
    title: "Ordering",
    links: [
      { to: "/order/new", label: "New Order", icon: ClipboardList },
      { to: "/order/menu", label: "Menus", icon: Utensils },
    ],
  },
  {
    title: "Service",
    links: [
      { to: "/floor", label: "Floor Plan", icon: Sofa },
      { to: "/rooms", label: "Rooms", icon: Grid2x2 },
      { to: "/tickets", label: "Tickets", icon: Receipt },
      { to: "/board", label: "Order Status Board", icon: LayoutGrid },
    ],
  },
  {
    title: "Money",
    links: [
      { to: "/payment/method", label: "Payments", icon: CreditCard },
      { to: "/settings/sales-summary", label: "Sales Summary", icon: FileText },
    ],
  },
  {
    title: "App",
    links: [
      { to: "/settings", label: "Settings", icon: SettingsIcon },
      { to: "/system/customer-support", label: "Support", icon: Headset },
    ],
  },
];

/** App map, opened from the burger button in any screen header. */
export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clockOut, signOut } = usePos();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useBackDismiss(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:absolute">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 animate-in fade-in duration-150 motion-reduce:animate-none"
      />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[20rem] flex-col bg-surface shadow-2xl animate-in slide-in-from-left duration-200 ease-out motion-reduce:animate-none">
        <div className="flex shrink-0 justify-end px-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="grid size-11 tap-safe place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          {groups.map((g) => (
            <div key={g.title} className="pb-1">
              <p className="px-2 pb-0.5 pt-2 t-section text-muted-foreground">{g.title}</p>
              <ul>
                {g.links.map((l) => {
                  const active = pathname === l.to;
                  return (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        onClick={onClose}
                        className={cn(
                          "flex min-h-ctl-sm items-center gap-3 rounded-row px-2 py-1.5 tap-safe t-row transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <l.icon
                          className={cn("size-5 shrink-0", active ? "" : "text-accent")}
                          strokeWidth={2}
                        />
                        <span className="min-w-0 flex-1 truncate">{l.label}</span>
                        <ChevronRight
                          className={cn(
                            "size-4 shrink-0",
                            active ? "opacity-70" : "text-muted-foreground",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-1.5 border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Link
            to="/tickets/manager-controls"
            onClick={onClose}
            className="flex min-h-ctl-sm tap-safe items-center gap-2 rounded-row border border-border px-3 t-row text-foreground transition-colors hover:bg-muted"
          >
            <ShieldCheck className="size-4" />
            Manager Controls
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose();
              clockOut();
            }}
            className="flex min-h-ctl-sm tap-safe w-full items-center gap-2 rounded-row border border-border px-3 t-row text-foreground transition-colors hover:bg-muted"
          >
            <Clock className="size-4" />
            Clock Out
          </button>
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: "Sign out?",
                message: "You will need to sign in again to use this device.",
                confirmLabel: "Sign Out",
                destructive: true,
              });
              if (!ok) return;
              onClose();
              signOut();
              navigate({ to: "/", replace: true });
            }}
            className="flex min-h-ctl-sm tap-safe w-full items-center gap-2 rounded-row border border-border px-3 t-row text-destructive transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
