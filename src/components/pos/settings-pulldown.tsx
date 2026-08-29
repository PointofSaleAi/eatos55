import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookMarked,
  CircleDollarSign,
  Headset,
  LayoutGrid,
  LogOut,
  SlidersHorizontal,
  Users,
  Utensils,
} from "lucide-react";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

type Entry = {
  title: string;
  copy: string;
  icon: typeof LayoutGrid;
  to?: string;
  /** Only Log out; runs instead of navigating. */
  action?: "sign-out";
  /** Managers only, dimmed for everyone else (matches the real POS). */
  manager?: boolean;
};

/** Copy is taken verbatim from the production POS pull-down. */
const entries: Entry[] = [
  {
    title: "Restaurant",
    copy: "View and manage your restaurant & owner information.",
    icon: LayoutGrid,
    to: "/settings/general",
  },
  {
    title: "Menu",
    copy: "View and manage your restaurant menu, categories, default modifiers, modifiers, add-ons, products, group.",
    icon: Utensils,
    to: "/settings/menu",
  },
  {
    title: "Payment",
    copy: "View and manage your accepted payment types, taxes, discounts, gratuity, service charge, card reader, card management, reports.",
    icon: CircleDollarSign,
    to: "/settings/payments",
  },
  {
    title: "Workforce",
    copy: "View and manage your team and their schedules.",
    icon: Users,
    to: "/settings/workforce",
  },
  {
    title: "Reports",
    copy: "View your daily performance data.",
    icon: BarChart3,
    to: "/settings/reports",
  },
  {
    title: "Advanced",
    copy: "View and manage your advanced point of sale features.",
    icon: SlidersHorizontal,
    to: "/settings/more",
    manager: true,
  },
  {
    title: "Guestbook",
    copy: "View and manage your guestbook, view guest CLT, & order history.",
    icon: BookMarked,
    to: "/rooms",
  },
  {
    title: "Support",
    copy: "View support personnel information.",
    icon: Headset,
    to: "/system/customer-support",
  },
  {
    title: "Log out",
    copy: "Logging out will restart the application.",
    icon: LogOut,
    action: "sign-out",
  },
];

/**
 * The settings map that pulls down from the dark top bar: large headings with
 * a short description, three columns on tablet and web.
 */
export function SettingsPullDown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { canManageSettings, signOut } = usePos();

  useBackDismiss(open, onClose);

  if (!open) return null;

  const signOutFlow = async () => {
    const ok = await confirm({
      title: "Log out?",
      message: "Logging out will restart the application.",
      confirmLabel: "Log Out",
      destructive: true,
    });
    if (!ok) return;
    onClose();
    signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-shell pb-[clamp(0.75rem,3dvh,1.5rem)] pt-3 no-scrollbar">
      <div className="mx-auto grid w-full max-w-[72rem] grid-cols-1 gap-x-[clamp(0.75rem,2vw,2rem)] gap-y-2 px-[clamp(0.75rem,2vw,1.5rem)] sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => {
          const locked = Boolean(e.manager) && !canManageSettings;
          return (
            <button
              key={e.title}
              type="button"
              disabled={locked}
              aria-disabled={locked}
              onClick={() => {
                if (locked) return;
                if (e.action === "sign-out") {
                  void signOutFlow();
                  return;
                }
                onClose();
                if (e.to) navigate({ to: e.to });
              }}
              className={cn(
                "group rounded-row border-l-2 py-2 pl-3 pr-2 text-left transition-colors",
                locked
                  ? "cursor-not-allowed border-shell-foreground/15 opacity-40"
                  : "border-shell-foreground/30 hover:border-shell-foreground hover:bg-shell-foreground/10",
              )}
            >
              <span className="flex items-center gap-2 text-shell-foreground">
                <e.icon className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                <span className="text-[clamp(1.0625rem,1.7vw,1.375rem)] font-extrabold leading-none tracking-tight">
                  {e.title}
                </span>
              </span>
              <span className="mt-1 block text-[clamp(0.6875rem,0.95vw,0.8125rem)] font-medium leading-snug text-shell-foreground/70">
                {e.copy}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
