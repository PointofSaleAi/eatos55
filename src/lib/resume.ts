/**
 * Device-local "resume where you left off" memory.
 *
 * Keyed by the PIN entered at the gate, so two people sharing a terminal each
 * get their own last screen and their own order in progress. Nothing leaves the
 * device: this is plain localStorage, no backend.
 */

const KEY = "eatos.pos.resume";

/** Everything needed to put the order in progress back on screen. */
export type ResumeOrder = {
  cart: unknown[];
  guest: unknown;
  orderType: string;
  orderNotes: string;
  arrivedAt: string;
  activeTicketId: string | null;
  activeTable: string | null;
  floor: string;
  noTax: boolean;
  comped: boolean;
  serviceCharge: number;
  orderDiscountPercent: number;
  partialPayments: unknown[];
  mode: string;
};

export type ResumeEntry = { path: string; order: ResumeOrder | null; savedAt: number };

type ResumeMap = Record<string, ResumeEntry>;

/** Screens that must never be resumed into (gates and terminal states). */
const excluded = [
  "/",
  "/access/clock-in",
  "/access/manager-pin",
  "/access/select-station",
  "/access/create-account",
  "/access/forgot-password",
  "/payment/success",
];

export function isResumablePath(path: string) {
  const p = path.replace(/\/+$/, "") || "/";
  return !excluded.includes(p);
}

/** A PIN-less unlock (biometrics, no PIN yet) still gets one shared slot. */
export function resumeKey(pin?: string | null) {
  return pin && pin.length ? `pin:${pin}` : "device";
}

function readAll(): ResumeMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ResumeMap) : {};
  } catch {
    return {};
  }
}

export function readResume(key: string): ResumeEntry | null {
  return readAll()[key] ?? null;
}

export function writeResume(key: string, entry: ResumeEntry) {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    all[key] = entry;
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore unwritable storage */
  }
}

export function clearResume(key: string) {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    delete all[key];
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore unwritable storage */
  }
}
