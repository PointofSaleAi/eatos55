import { scheduleDays, type ScheduleDay } from "@/lib/restaurant-schedules";

export type TimedPricingRule = { id: string; name: string; revenueCentre: string; orderingSource: string; startDate: string; endDate: string; archived: boolean; days: ScheduleDay[] };
export const timedPricingDays = [1, 2, 3, 4, 5, 6, 0];
export const newTimedPricingDays = (): ScheduleDay[] => scheduleDays.map(() => ({ enabled: false, start: "00:00", end: "23:59" }));
// Reference dates and day selections only; centres and sources were not supplied.
export const referenceTimedPricing: TimedPricingRule[] = [
  { id: "timed-1", name: "CHEAP SPIRITS", startDate: "2026-06-01", endDate: "2046-05-31", revenueCentre: "", orderingSource: "", archived: false, days: newTimedPricingDays().map(day => ({ ...day, enabled: true })) },
  { id: "timed-2", name: "Pizza Time", startDate: "2026-09-11", endDate: "2029-09-11", revenueCentre: "", orderingSource: "", archived: false, days: newTimedPricingDays().map(day => ({ ...day, enabled: true })) },
  { id: "timed-3", name: "Smoothie evening", startDate: "2026-09-17", endDate: "2026-10-24", revenueCentre: "", orderingSource: "", archived: false, days: newTimedPricingDays().map((day, i) => ({ ...day, enabled: [0, 1, 4, 5].includes(i) })) },
  { id: "timed-4", name: "Test", startDate: "2026-09-23", endDate: "2029-09-24", revenueCentre: "", orderingSource: "", archived: false, days: newTimedPricingDays().map((day, i) => ({ ...day, enabled: i === 4 })) },
  { id: "timed-5", name: "Timed priced", startDate: "2026-09-23", endDate: "2026-09-23", revenueCentre: "", orderingSource: "", archived: false, days: newTimedPricingDays() },
];