export const scheduleDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export type ScheduleDay = { enabled: boolean; start: string; end: string };
export type RestaurantSchedule = { id: string; name: string; startDate: string; endDate: string; archived: boolean; days: ScheduleDay[] };
export const emptyScheduleDays = (): ScheduleDay[] => scheduleDays.map(() => ({ enabled: false, start: "", end: "" }));
// Reference entries have no supplied daily times; leave those unset rather than inventing them.
export const referenceSchedules: RestaurantSchedule[] = [
  { id: "schedule-1", name: "Dinner Time Service", startDate: "2025-06-24", endDate: "2029-01-29", archived: false, days: emptyScheduleDays().map((day, i) => ({ ...day, enabled: i !== 3 })) },
  { id: "schedule-2", name: "francis test", startDate: "2026-09-12", endDate: "2026-10-12", archived: false, days: emptyScheduleDays().map((day, i) => ({ ...day, enabled: i === 0 || i === 6 })) },
  { id: "schedule-3", name: "Pick Up", startDate: "2025-07-25", endDate: "2026-07-31", archived: false, days: emptyScheduleDays() },
  { id: "schedule-4", name: "Warrens Pub", startDate: "2025-04-15", endDate: "2033-12-31", archived: false, days: emptyScheduleDays().map((day, i) => ({ ...day, enabled: i >= 1 && i <= 5 })) },
];