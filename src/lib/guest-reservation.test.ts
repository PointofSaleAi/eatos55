import { describe, expect, test } from "bun:test";
import { isFutureVisit } from "./guest-reservation";

describe("future guest reservations", () => {
  test("accepts a future date and time", () => {
    expect(isFutureVisit("2026-10-20", "19:00", new Date("2026-10-19T09:00").getTime())).toBe(true);
  });
  test("does not book an immediate or past visit", () => {
    const now = new Date("2026-10-19T09:00").getTime();
    expect(isFutureVisit("2026-10-19", "09:00", now)).toBe(false);
    expect(isFutureVisit("2026-10-18", "19:00", now)).toBe(false);
    expect(isFutureVisit("", "", now)).toBe(false);
  });
});