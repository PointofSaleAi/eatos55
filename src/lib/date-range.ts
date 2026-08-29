/** Date-period helpers for the tickets screen (single day, week, month, custom). */

import { brand } from "@/lib/brand";

const LOCALE = brand.locale;

export type RangePreset =
  | "today"
  | "yesterday"
  | "day"
  | "week"
  | "last7"
  | "month"
  | "lastMonth"
  | "custom";

export type TicketRange = { start: string; end: string; preset: RangePreset };

export const iso = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseIso = (s: string) => new Date(`${s}T12:00:00`);

const addDays = (s: string, n: number) => {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

const startOfWeek = (s: string) => {
  const d = parseIso(s);
  d.setDate(d.getDate() - d.getDay());
  return iso(d);
};

const startOfMonth = (s: string) => {
  const d = parseIso(s);
  d.setDate(1);
  return iso(d);
};

const endOfMonth = (s: string) => {
  const d = parseIso(s);
  d.setMonth(d.getMonth() + 1, 0);
  return iso(d);
};

/** Build a range for a preset, anchored on `anchor` (an ISO day). */
export function rangeForPreset(preset: RangePreset, anchor: string): TicketRange {
  switch (preset) {
    case "today":
    case "day":
      return { start: anchor, end: anchor, preset };
    case "yesterday": {
      const d = addDays(anchor, -1);
      return { start: d, end: d, preset };
    }
    case "week": {
      const start = startOfWeek(anchor);
      return { start, end: addDays(start, 6), preset };
    }
    case "last7":
      return { start: addDays(anchor, -6), end: anchor, preset };
    case "month":
      return { start: startOfMonth(anchor), end: endOfMonth(anchor), preset };
    case "lastMonth": {
      const d = parseIso(anchor);
      d.setMonth(d.getMonth() - 1, 15);
      const key = iso(d);
      return { start: startOfMonth(key), end: endOfMonth(key), preset };
    }
    default:
      return { start: anchor, end: anchor, preset: "custom" };
  }
}

/** Shift a range forward/backward by its own size (day, week or month). */
export function shiftRange(range: TicketRange, dir: number): TicketRange {
  if (range.preset === "month" || range.preset === "lastMonth") {
    const d = parseIso(range.start);
    d.setMonth(d.getMonth() + dir, 15);
    const key = iso(d);
    return { start: startOfMonth(key), end: endOfMonth(key), preset: "month" };
  }
  const days =
    Math.round(
      (parseIso(range.end).getTime() - parseIso(range.start).getTime()) / 86_400_000,
    ) + 1;
  const start = addDays(range.start, dir * days);
  return {
    start,
    end: addDays(start, days - 1),
    preset: days === 1 ? "day" : range.preset === "today" ? "day" : range.preset,
  };
}

const short = (s: string) =>
  parseIso(s).toLocaleDateString(LOCALE, { day: "2-digit", month: "short" });
const long = (s: string) =>
  parseIso(s).toLocaleDateString(LOCALE, { day: "2-digit", month: "short", year: "numeric" });

/** Human label for the period pill. */
export function rangeLabel(range: TicketRange, today: string): string {
  if (range.start === range.end) {
    if (range.start === today) return "Today";
    if (range.start === addDays(today, -1)) return "Yesterday";
    return long(range.start);
  }
  if (range.preset === "month" || range.preset === "lastMonth") {
    return parseIso(range.start).toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
  }
  const sameYear = parseIso(range.start).getFullYear() === parseIso(range.end).getFullYear();
  return `${sameYear ? short(range.start) : long(range.start)} – ${long(range.end)}`;
}

export const presetOptions: { id: RangePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "This week" },
  { id: "last7", label: "Last 7 days" },
  { id: "month", label: "This month" },
  { id: "lastMonth", label: "Last month" },
];

export function inRange(day: string, range: TicketRange) {
  return day >= range.start && day <= range.end;
}
