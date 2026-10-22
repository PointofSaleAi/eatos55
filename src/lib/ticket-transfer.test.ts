import { test } from "node:test";
import { strict as assert } from "node:assert";
import { initialTickets, type Ticket } from "./demo-data";
import { canTransfer, moveLines } from "./ticket-transfer";

const base = initialTickets[0]!;
const mk = (p: Partial<Ticket>): Ticket => ({ ...base, ...p }) as Ticket;

test("only preparing, ordering and payment tickets can transfer", () => {
  assert.equal(canTransfer(mk({ status: "preparing" })), true);
  assert.equal(canTransfer(mk({ status: "ordering" })), true);
  assert.equal(canTransfer(mk({ status: "payment" })), true);
  assert.equal(canTransfer(mk({ status: "paid" })), false);
  assert.equal(canTransfer(mk({ status: "ready" })), false);
});

test("moving products recalculates both totals", () => {
  const src = mk({ id: "a", lines: [{ id: "1", name: "A", price: 4.5, qty: 1 }, { id: "2", name: "B", price: 3, qty: 2 }] });
  const dst = mk({ id: "b", lines: [{ id: "3", name: "C", price: 10, qty: 1 }] });
  const r = moveLines(src, dst, ["2"]);
  assert.equal(r.source.total, 4.5);
  assert.equal(r.target.total, 16);
  assert.equal(r.source.cancelled, false);
});

test("source is cancelled when every product leaves", () => {
  const r = moveLines(mk({ id: "a", lines: [{ id: "1", name: "A", price: 4.5, qty: 1 }] }), mk({ id: "b", lines: [] }), ["1"]);
  assert.equal(r.source.cancelled, true);
  assert.equal(r.source.total, 0);
});
