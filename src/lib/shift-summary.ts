import { useMemo } from "react";
import { formatMoney } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import type { Ticket } from "@/lib/demo-data";

export type Kpi = {
  id: string;
  label: string;
  value: string;
  /** Percent change against the comparison day, when there is one to show. */
  delta?: number;
};

export type Suggestion = {
  id: string;
  text: string;
  to: string;
};

/** Minutes since a "5:43 PM" style clock-in stamp, wrapping over midnight. */
function minutesSince(stamp: string, now: Date): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(stamp.trim());
  if (!m) return 0;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const suffix = m[3]?.toUpperCase();
  if (suffix === "PM" && h < 12) h += 12;
  if (suffix === "AM" && h === 12) h = 0;
  const start = h * 60 + min;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= start ? current - start : current + 24 * 60 - start;
}

function hoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

const sum = (list: Ticket[], pick: (t: Ticket) => number) =>
  list.reduce((n, t) => n + pick(t), 0);

/**
 * Shift figures for the server dashboard, derived entirely from the tickets and
 * table states already in the store. Nothing here is stored or invented.
 */
export function useShiftSummary() {
  const {
    tickets,
    visibleTickets,
    settings,
    session,
    tableStates,
    tableSince,
    ticketDate,
  } = usePos();

  return useMemo(() => {
    const today = visibleTickets("all");
    const mine = today.filter((t) => t.server === session.name);
    const scope = mine.length ? mine : today;

    // Same tickets, one day earlier: the only honest comparison the store has.
    const prevDay = new Date(`${ticketDate}T12:00:00`);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevKey = prevDay.toISOString().slice(0, 10);
    const prev = tickets.filter((t) => t.date === prevKey);

    const sale = sum(scope, (t) => t.total);
    const tips = sum(scope, (t) => t.tips ?? 0);
    const prevSale = sum(prev, (t) => t.total);
    const prevTips = sum(prev, (t) => t.tips ?? 0);

    const delta = (now: number, before: number) =>
      before > 0 ? Math.round(((now - before) / before) * 1000) / 10 : undefined;

    const count = (status: Ticket["status"]) =>
      scope.filter((t) => t.status === status).length;

    const minutes = minutesSince(settings.clockedInAt, new Date());

    const kpis: Kpi[] = [
      { id: "sale", label: "Total Sale", value: formatMoney(sale), ...(delta(sale, prevSale) !== undefined ? { delta: delta(sale, prevSale)! } : {}) },
      { id: "tip", label: "Total Tip", value: formatMoney(tips), ...(delta(tips, prevTips) !== undefined ? { delta: delta(tips, prevTips)! } : {}) },
      { id: "hours", label: "Total Hours", value: hoursLabel(minutes) },
      { id: "ordering", label: "Ordering", value: String(count("ordering")) },
      { id: "ready", label: "Ready", value: String(count("ready")) },
      { id: "done", label: "Completed", value: String(count("paid")) },
    ];

    // Rule based next-best-action list. One place to swap in a real model later.
    const suggestions: Suggestion[] = [];
    const waiting = scope
      .filter((t) => t.status === "payment")
      .sort((a, b) => b.arrivedMinutesAgo - a.arrivedMinutesAgo)[0];
    if (waiting) {
      suggestions.push({
        id: "collect",
        text: `Collect ${formatMoney(waiting.total)} from ${waiting.label}, waiting ${waiting.arrivedMinutesAgo} min`,
        to: `/tickets/${waiting.id}`,
      });
    }
    const ready = scope.filter((t) => t.status === "ready");
    if (ready.length) {
      suggestions.push({
        id: "run",
        text: `${ready.length} ${ready.length === 1 ? "check is" : "checks are"} ready to run to the table`,
        to: "/tickets",
      });
    }
    const stalled = Object.entries(tableStates)
      .filter(([, s]) => s === "ordering")
      .map(([name]) => ({ name, since: tableSince[name] ?? "" }))
      .sort((a, b) => a.since.localeCompare(b.since))[0];
    if (stalled) {
      suggestions.push({
        id: "table",
        text: `${stalled.name} has been ordering the longest, take the order`,
        to: "/floor",
      });
    }
    const tipRate = sale > 0 ? (tips / sale) * 100 : 0;
    const prevRate = prevSale > 0 ? (prevTips / prevSale) * 100 : 0;
    if (prevRate > 0 && tipRate < prevRate) {
      suggestions.push({
        id: "tip",
        text: `Tips are running at ${tipRate.toFixed(1)}% against ${prevRate.toFixed(1)}% yesterday, offer desserts`,
        to: "/order/menu",
      });
    }

    return { kpis, suggestions, tickets: scope, minutes };
  }, [
    tickets,
    visibleTickets,
    session.name,
    settings.clockedInAt,
    tableStates,
    tableSince,
    ticketDate,
  ]);
}
