import type { CartLine, Ticket } from "@/lib/demo-data";

/** Ticket statuses that can move products or tables to another check. */
export const TRANSFERABLE_STATUSES = ["preparing", "ordering", "payment"] as const;

export type TransferNote = {
  dir: "from" | "to";
  count: number;
  order: number;
  table?: string | undefined;
  revenueCenter?: string | undefined;
  lines?: { name: string; price: number; qty: number }[];
};

export function canTransfer(t: Ticket): boolean {
  if (t.closed || t.cancelled || t.roomCharge) return false;
  return (TRANSFERABLE_STATUSES as readonly string[]).includes(t.status);
}

/** Checks that can receive products from `source`. */
export function transferTargets(tickets: Ticket[], sourceId: string): Ticket[] {
  return tickets.filter((t) => t.id !== sourceId && canTransfer(t));
}

const round = (n: number) => Math.round(n * 100) / 100;
export const linesTotal = (lines: CartLine[]) => round(lines.reduce((s, l) => s + l.price * l.qty, 0));

/** Order label used in banners, e.g. "Order 3 · Table B4 (Cafe)". */
export function noteText(n: TransferNote): string {
  const where = `Order ${n.order}${n.table ? ` · Table ${n.table}` : ""}${n.revenueCenter ? ` (${n.revenueCenter})` : ""}`;
  return `Transferred ${n.count} product(s) ${n.dir} ${where}`;
}

/**
 * Pure move of the chosen lines from source to target. The source becomes
 * cancelled when nothing is left on it; both totals follow their lines.
 */
export function moveLines(source: Ticket, target: Ticket, lineIds: string[]): { source: Ticket; target: Ticket } {
  const moving = source.lines.filter((l) => lineIds.includes(l.id));
  const rest = source.lines.filter((l) => !lineIds.includes(l.id));
  const movedLines = moving.map((l) => ({ name: l.name, price: l.price, qty: l.qty }));
  const nextSource: Ticket = {
    ...source,
    lines: rest,
    total: linesTotal(rest),
    cancelled: rest.length === 0 || !!source.cancelled,
    transferNotes: [
      { dir: "to", count: moving.length, order: target.orderNo ?? target.number, table: target.table, revenueCenter: target.revenueCenter, lines: movedLines },
      ...(source.transferNotes ?? []),
    ],
  };
  const merged = [...target.lines, ...moving.map((l) => ({ ...l, id: `${l.id}-t${target.number}` }))];
  const nextTarget: Ticket = {
    ...target,
    lines: merged,
    total: linesTotal(merged),
    transferNotes: [
      { dir: "from", count: moving.length, order: source.orderNo ?? source.number, table: source.table, revenueCenter: source.revenueCenter },
      ...(target.transferNotes ?? []),
    ],
  };
  return { source: nextSource, target: nextTarget };
}
