import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookMarked,
  ChevronRight,
  CircleDollarSign,
  Headset,
  LayoutGrid,
  LogOut,
  Sparkles,
  SlidersHorizontal,
  Users,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { formatMoney } from "@/lib/brand";
import type { Ticket, TicketStatus } from "@/lib/demo-data";
import { floors, formatDwell, tableStateMeta } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { useShiftSummary } from "@/lib/shift-summary";
import { cn } from "@/lib/utils";

/** Settings destinations, one line each, pinned to the right of the dashboard. */
const settingsLinks: {
  title: string;
  icon: typeof LayoutGrid;
  to?: string;
  action?: "sign-out";
  manager?: boolean;
}[] = [
  { title: "Restaurant", icon: LayoutGrid, to: "/settings/general" },
  { title: "Menu", icon: Utensils, to: "/settings/menu" },
  { title: "Payment", icon: CircleDollarSign, to: "/settings/payments" },
  { title: "Workforce", icon: Users, to: "/settings/workforce" },
  { title: "Reports", icon: BarChart3, to: "/settings/reports" },
  { title: "Advanced", icon: SlidersHorizontal, to: "/settings/more", manager: true },
  { title: "Guestbook", icon: BookMarked, to: "/rooms" },
  { title: "Support", icon: Headset, to: "/system/customer-support" },
  { title: "Log out", icon: LogOut, action: "sign-out" },
];

const statusMeta: Record<TicketStatus, { label: string; text: string }> = {
  ordering: { label: "ORDERING", text: "text-accent" },
  preparing: { label: "PREPARING", text: "text-warning" },
  payment: { label: "UNPAID", text: "text-tile-orange" },
  ready: { label: "READY", text: "text-tile-indigo" },
  paid: { label: "PAID", text: "text-success" },
};

const tabs: { id: TicketStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ordering", label: "Ordering" },
  { id: "payment", label: "Unpaid" },
  { id: "ready", label: "Ready" },
  { id: "paid", label: "Paid" },
];

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-fs-2xs font-bold",
        up ? "text-success" : "text-tile-red",
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {Math.abs(value)}%
      <span className="font-medium text-shell-foreground/60">from yesterday</span>
    </span>
  );
}

/**
 * Server dashboard shown when the top bar is pulled down: shift figures,
 * suggested next actions, the server's own tickets and the live floor strip,
 * with the settings shortcuts collapsed into one column on the right.
 */
export function ShiftDashboard({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { canManageSettings, signOut, floor, setFloor, tableStates, tableSince, settings } =
    usePos();
  const { kpis, suggestions, tickets } = useShiftSummary();
  const [tab, setTab] = useState<TicketStatus | "all">("all");

  const go = (to: string) => {
    onClose();
    navigate({ to });
  };

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

  const rows: Ticket[] = tab === "all" ? tickets : tickets.filter((t) => t.status === tab);

  const floorEntries = Object.entries(tableStates);
  const now = new Date();
  const dwell = (since: string | undefined) => {
    if (!since) return null;
    const started = new Date(since);
    if (Number.isNaN(started.getTime())) return null;
    return formatDwell((now.getTime() - started.getTime()) / 60000);
  };

  return (
    <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="flex min-w-0 flex-col gap-3">
        {/* Shift figures */}
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k) => (
            <li
              key={k.id}
              className="rounded-card border border-shell-foreground/15 bg-shell-foreground/5 px-3 py-2"
            >
              <p className="truncate text-fs-2xs font-bold uppercase tracking-wide text-shell-foreground/60">
                {k.label}
              </p>
              <p className="truncate text-fs-lg font-extrabold text-shell-foreground">{k.value}</p>
              {k.delta === undefined ? null : <Delta value={k.delta} />}
            </li>
          ))}
        </ul>

        {/* Suggested next actions */}
        {suggestions.length ? (
          <div className="rounded-card border border-shell-foreground/15 bg-shell-foreground/5 p-2">
            <p className="mb-1 flex items-center gap-1.5 px-1 text-fs-2xs font-bold uppercase tracking-wide text-shell-foreground/60">
              <Sparkles className="size-3.5 shrink-0 text-accent" aria-hidden />
              Suggested next
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(s.to)}
                    className="flex items-center gap-1 rounded-pill border border-shell-foreground/20 px-3 py-1.5 text-left text-fs-xs font-semibold text-shell-foreground transition-colors hover:bg-shell-foreground/10"
                  >
                    {s.text}
                    <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* My tickets */}
        <div className="flex min-h-0 flex-col rounded-card border border-shell-foreground/15 bg-shell-foreground/5 p-2">
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {tabs.map((t) => {
              const n = t.id === "all" ? tickets.length : tickets.filter((x) => x.status === t.id).length;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "rounded-pill px-3 py-1 text-fs-xs font-bold transition-colors",
                      tab === t.id
                        ? "bg-shell-foreground text-shell"
                        : "text-shell-foreground/70 hover:bg-shell-foreground/10",
                    )}
                  >
                    {t.label} {n}
                  </button>
                </li>
              );
            })}
          </ul>
          <ul className="no-scrollbar max-h-[15rem] min-h-0 space-y-1 overflow-y-auto">
            {rows.length === 0 ? (
              <li className="px-2 py-3 text-fs-xs text-shell-foreground/60">
                No tickets in this view.
              </li>
            ) : (
              rows.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => go(`/tickets/${t.id}`)}
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-row px-2 py-2 text-left transition-colors hover:bg-shell-foreground/10"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-row border border-shell-foreground/20 text-fs-xs font-extrabold text-shell-foreground">
                      {t.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-fs-sm font-bold text-shell-foreground">
                        {t.label}
                        {t.table ? ` · Table ${t.table}` : ""}
                      </span>
                      <span className="block truncate text-fs-2xs text-shell-foreground/60">
                        {t.seats} guests, {t.arrivedAt} · {t.server}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-fs-sm font-extrabold text-shell-foreground">
                        {formatMoney(t.total)}
                      </span>
                      <span
                        className={cn(
                          "block text-fs-2xs font-bold",
                          statusMeta[t.status].text,
                        )}
                      >
                        {statusMeta[t.status].label}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Floor strip */}
        <div className="rounded-card border border-shell-foreground/15 bg-shell-foreground/5 p-2">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {floors.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFloor(f)}
                className={cn(
                  "rounded-pill px-3 py-1 text-fs-xs font-bold transition-colors",
                  floor === f
                    ? "bg-shell-foreground text-shell"
                    : "text-shell-foreground/70 hover:bg-shell-foreground/10",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <ul className="no-scrollbar flex max-h-[9rem] flex-wrap gap-1.5 overflow-y-auto">
            {floorEntries.map(([name, state]) => {
              const meta = tableStateMeta[state];
              const time = dwell(tableSince[name]);
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => go("/floor")}
                    className="min-w-[5.5rem] rounded-card border border-shell-foreground/20 px-2 py-1.5 text-left transition-colors hover:bg-shell-foreground/10"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-fs-xs font-extrabold text-shell-foreground">
                        {name}
                      </span>
                      {time ? (
                        <span className="shrink-0 text-fs-2xs text-shell-foreground/60">{time}</span>
                      ) : null}
                    </span>
                    <span className={cn("mt-0.5 block truncate text-fs-2xs font-bold", meta.text)}>
                      {meta.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Settings, one line per destination */}
      <div className="min-w-0 rounded-card border border-shell-foreground/15 bg-shell-foreground/5 p-2">
        <p className="px-2 pb-1 text-fs-2xs font-bold uppercase tracking-wide text-shell-foreground/60">
          Settings
        </p>
        <ul>
          {settingsLinks.map((l) => {
            const locked = Boolean(l.manager) && !canManageSettings;
            return (
              <li key={l.title}>
                <button
                  type="button"
                  disabled={locked}
                  aria-disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (l.action === "sign-out") {
                      void signOutFlow();
                      return;
                    }
                    if (l.to) go(l.to);
                  }}
                  className={cn(
                    "flex min-h-tap w-full items-center gap-2 rounded-row px-2 text-left text-fs-sm font-semibold text-shell-foreground transition-colors",
                    locked ? "cursor-not-allowed opacity-40" : "hover:bg-shell-foreground/10",
                  )}
                >
                  <l.icon className="size-4 shrink-0 opacity-80" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{l.title}</span>
                  <ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
        <p className="px-2 pt-2 text-fs-2xs text-shell-foreground/50">
          Clocked in at {settings.clockedInAt}
        </p>
      </div>
    </div>
  );
}
