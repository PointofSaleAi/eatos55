import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, ShieldCheck, X } from "lucide-react";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { cn } from "@/lib/utils";

type NavLink = { to: string; label: string };

const groups: { title: string; links: NavLink[] }[] = [
  {
    title: "Ordering",
    links: [
      { to: "/order/new", label: "New Order" },
      { to: "/order/review", label: "Order Review" },
      { to: "/order/custom-item", label: "Custom Item" },
      { to: "/order/menu", label: "Menus" },
    ],
  },
  {
    title: "Service",
    links: [
      { to: "/floor", label: "Floor Plan" },
      { to: "/rooms", label: "Rooms" },
      { to: "/tickets", label: "Tickets" },
      { to: "/board", label: "Order Status Board" },
    ],
  },
  {
    title: "Money",
    links: [
      { to: "/payment/method", label: "Payments" },
      { to: "/settings/sales-summary", label: "Sales Summary" },
      { to: "/orders", label: "Shift Summary" },
    ],
  },
  {
    title: "Settings",
    links: [
      { to: "/settings", label: "All Settings" },
      { to: "/settings/general", label: "General" },
      { to: "/settings/control-center", label: "Control Center" },
      { to: "/settings/menu", label: "Menu" },
      { to: "/settings/payments", label: "Payments" },
      { to: "/settings/workforce", label: "Workforce" },
      { to: "/settings/network", label: "Network" },
      { to: "/settings/hardware", label: "Hardware" },
      { to: "/settings/notifications", label: "Notifications" },
      { to: "/settings/more", label: "More" },
    ],
  },
  {
    title: "System",
    links: [
      { to: "/system/customer-support", label: "Customer Support" },
      { to: "/system/contact-us", label: "Contact Us" },
      { to: "/system/help-center", label: "Help Center" },
      { to: "/system/integrations", label: "Integrations" },
      { to: "/tickets/whats-new", label: "What's New" },
    ],
  },
];

/** Full app map, opened from the burger button in any screen header. */
export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clockOut } = usePos();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useBackDismiss(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:absolute">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col bg-surface shadow-2xl">
        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-4 py-3">
          <p className="truncate text-lg font-extrabold text-foreground">Navigation</p>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {groups.map((g) => (
            <div key={g.title} className="pb-2">
              <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {g.title}
              </p>
              <ul>
                {g.links.map((l) => {
                  const active = pathname === l.to;
                  return (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        onClick={onClose}
                        className={cn(
                          "flex min-h-[40px] items-center rounded-xl px-2 text-[13px] font-bold transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <span className="min-w-0 truncate">{l.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-border p-3">
          <Link
            to="/tickets/manager-controls"
            onClick={onClose}
            className="flex min-h-[42px] items-center gap-2 rounded-xl border border-border px-3 text-[13px] font-bold text-foreground transition-colors hover:bg-muted"
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
            className="flex min-h-[42px] w-full items-center gap-2 rounded-xl border border-border px-3 text-[13px] font-bold text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" />
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}
