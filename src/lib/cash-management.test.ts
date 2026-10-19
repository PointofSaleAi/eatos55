import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { applyCashAction, estimatedCash, type CashState } from "./cash-management";

const employee = { id: "e1", name: "Account Manager" };
const empty = (): CashState => ({ previousClose: 0, openingTill: 0, tillOpen: false, logs: [], tips: {} });
const open = () => applyCashAction(empty(), { kind: "open", amount: 100, name: employee.name });
describe("demo cash drawer flow", () => {
  test("opening till records cash and cannot be adjusted until closing", () => {
    const s = open();
    assert.equal(s.openingTill, 100);
    assert.equal(estimatedCash(s), 100);
    assert.equal(s.logs[0]?.reason, "Open Till");
    assert.throws(() => applyCashAction(s, { kind: "open", amount: 200, name: employee.name }), /Close the drawer/);
  });
  test("zero opening cash can start the till", () => {
    assert.equal(applyCashAction(empty(), { kind: "open", amount: 0, name: employee.name }).tillOpen, true);
  });
  test("pay in adds cash and records employee, reason and notes", () => {
    const s = applyCashAction(open(), { kind: "in", amount: 25, employee, reason: "Other", note: "Change delivery" });
    assert.equal(estimatedCash(s), 125);
    assert.equal(s.logs[0]?.name, employee.name);
    assert.equal(s.logs[0]?.note, "Change delivery");
    assert.equal(s.logs[0]?.payIn, 25);
    assert.notEqual(s.logs[0]?.id, s.logs[1]?.id);
  });
  test("pay out subtracts cash and cannot exceed the drawer balance", () => {
    const s = applyCashAction(open(), { kind: "out", amount: 20, employee, reason: "Cash Out", note: "" });
    assert.equal(estimatedCash(s), 80);
    assert.equal(s.logs[0]?.payOut, 20);
    assert.throws(() => applyCashAction(s, { kind: "out", amount: 81, employee, reason: "Cash Out", note: "" }), /more than/);
  });
  test("employee tips follow pay in and pay out", () => {
    let s = applyCashAction(open(), { kind: "in", amount: 10, employee, reason: "Tips", note: "" });
    assert.equal(s.tips.e1, 10);
    s = applyCashAction(s, { kind: "out", amount: 4, employee, reason: "Tips", note: "" });
    assert.equal(s.tips.e1, 6);
  });
  test("Other requires notes and incomplete selection records nothing", () => {
    const s = open();
    assert.throws(() => applyCashAction(s, { kind: "in", amount: 10, employee, reason: "Other", note: " " }), /note/);
    assert.throws(() => applyCashAction(s, { kind: "in", amount: 10, employee: { id: "", name: "" }, reason: "Tips", note: "" }), /employee/);
    assert.equal(s.logs.length, 1);
  });
  test("closing resets cash, retains the closing balance and blocks pay out until reopening", () => {
    let s = applyCashAction(open(), { kind: "out", amount: 20, employee, reason: "Cash Out", note: "" });
    s = applyCashAction(s, { kind: "close", name: employee.name });
    assert.equal(s.previousClose, 80);
    assert.equal(s.openingTill, 0);
    assert.equal(estimatedCash(s), 0);
    assert.equal(s.logs[0]?.payOut, 80);
    assert.equal(s.logs[0]?.reason, "Close Drawer");
    assert.throws(() => applyCashAction(s, { kind: "out", amount: 1, employee, reason: "Tips", note: "" }), /Open the till/);
    assert.equal(applyCashAction(s, { kind: "open", amount: 50, name: employee.name }).openingTill, 50);
  });
  test("cash movements remain counted across midnight", () => {
    let s = applyCashAction(empty(), { kind: "open", amount: 100, name: employee.name }, new Date("2026-10-18T23:50:00"));
    s = applyCashAction(s, { kind: "in", amount: 25, employee, reason: "Change Order", note: "" }, new Date("2026-10-19T09:00:00"));
    assert.equal(estimatedCash(s), 125);
  });
});