import { describe, expect, it } from "vitest";
import { initialTickets, type Ticket } from "@/lib/demo-data";
import { canTransfer, moveLines } from "@/lib/ticket-transfer";

const base = initialTickets.find((t) => t.lines.length >= 2)!;
const mk = (p: Partial<Ticket>): Ticket => ({ ...base, ...p });

describe("ticket transfer", () => {
  it("allows only preparing, ordering and payment tickets", () => {
    expect(canTransfer(mk({ status: "preparing" }))).toBe(true);
    expect(canTransfer(mk({ status: "ordering" }))).toBe(true);
    expect(canTransfer(mk({ status: "payment" }))).toBe(true);
    expect(canTransfer(mk({ status: "paid" }))).toBe(false);
    expect(canTransfer(mk({ status: "ready" }))).toBe(false);
  });
  it("moves lines and recalculates both totals", () => {
    const src = mk({ id: "a", lines: [{ id: "1", name: "A", price: 4.5, qty: 1 }, { id: "2", name: "B", price: 3, qty: 2 }] });
    const dst = mk({ id: "b", number: 9, lines: [{ id: "3", name: "C", price: 10, qty: 1 }] });
    const r = moveLines(src, dst, ["2"]);
    expect(r.source.total).toBe(4.5);
    expect(r.target.total).toBe(16);
    expect(r.source.cancelled).toBeFalsy();
  });
  it("cancels the source when every product leaves", () => {
    const src = mk({ id: "a", lines: [{ id: "1", name: "A", price: 4.5, qty: 1 }] });
    const r = moveLines(src, mk({ id: "b", lines: [] }), ["1"]);
    expect(r.source.cancelled).toBe(true);
    expect(r.source.total).toBe(0);
  });
});
