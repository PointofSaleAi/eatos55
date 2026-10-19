export type GuestVisit = {
  date: string;
  time: string;
  description?: string | undefined;
  party?: number | undefined;
  table?: string | undefined;
  floor?: string | undefined;
};

export function isFutureVisit(date: string, time: string, now = Date.now()) {
  const scheduled = new Date(`${date}T${time}`).getTime();
  return Number.isFinite(scheduled) && scheduled > now;
}