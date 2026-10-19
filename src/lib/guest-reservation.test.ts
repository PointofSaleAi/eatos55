import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { isFutureVisit } from "./guest-reservation";

describe("future guest reservations", () => {
  test("accepts a future date and time", () => {
    assert.equal(isFutureVisit("2026-10-20", "19:00", new Date("2026-10-19T09:00").getTime()), true);
  });
  test("does not book an immediate or past visit", () => {
    const now = new Date("2026-10-19T09:00").getTime();
    assert.equal(isFutureVisit("2026-10-19", "09:00", now), false);
    assert.equal(isFutureVisit("2026-10-18", "19:00", now), false);
    assert.equal(isFutureVisit("", "", now), false);
  });
});