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
    to: "/settings/sales-summary",
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
    <div className="absolute inset-0 z-30 overflow-y-auto bg-gate-overlay pb-[clamp(1rem,4dvh,2.5rem)] pt-[4.5rem] no-scrollbar">
      <div className="mx-auto grid w-full max-w-[80rem] grid-cols-1 gap-x-[clamp(1rem,3vw,3rem)] gap-y-[clamp(1.25rem,3dvh,2.5rem)] px-[clamp(0.75rem,3vw,2.5rem)] sm:grid-cols-2 lg:grid-cols-3">
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
                "group border-l-2 pl-3 text-left transition-opacity sm:pl-4",
                locked
                  ? "cursor-not-allowed border-white/15 opacity-40"
                  : "border-white/30 hover:opacity-80",
              )}
            >
              <span className="flex items-center gap-2 text-white">
                <e.icon className="size-6 shrink-0" strokeWidth={2} aria-hidden />
                <span className="border-b-2 border-white/70 pb-0.5 text-[clamp(1.25rem,2.6vw,2rem)] font-extrabold leading-none tracking-tight">
                  {e.title}
                </span>
              </span>
              <span className="mt-2 block max-w-[26rem] text-[clamp(0.75rem,1.1vw,0.9375rem)] font-medium leading-snug text-white/80">
                {e.copy}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
