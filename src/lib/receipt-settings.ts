import { useSyncExternalStore } from "react";

/** Demo-only receipt design preferences per channel; never changes real printing. */
export type ReceiptType = "kot" | "payment" | "receipt" | "email" | "sms";
export type ReceiptDesign = "classic" | "compact" | "guest" | "bistro";
export type ReceiptPrefs = { design: ReceiptDesign; logo: boolean; fontStyle: "thermal" | "clean"; fontSize: "S" | "M" | "L" };

export const RECEIPT_TYPES: { id: ReceiptType; title: string; description: string }[] = [
  { id: "kot", title: "KOT", description: "Kitchen order ticket layout (emulator preview). Default is Classic Thermal (today's layout)." },
  { id: "payment", title: "Payment Receipt", description: "Layout after a successful payment print. Default is Classic Thermal (today's layout)." },
  { id: "receipt", title: "Receipt", description: "Guest bill / receipt layout. Default is Classic Thermal (today's layout)." },
  { id: "email", title: "Email Receipt", description: "Preference for emailed receipts (text body when available). Uses Guest/Receipt design for text body when a shared text path exists; HTML templates are unchanged this release. Default is Classic Thermal (today's layout)." },
  { id: "sms", title: "SMS Receipt", description: "Preference for SMS receipts (text body when available). Uses Guest/Receipt design for text body when a shared text path exists; HTML templates are unchanged this release. Default is Classic Thermal (today's layout)." },
];

export const RECEIPT_DESIGNS: { id: ReceiptDesign; label: string; note: string }[] = [
  { id: "classic", label: "Classic Thermal", note: "Today's full Star layout (default)." },
  { id: "compact", label: "Compact Service", note: "Shorter header; fewer lines." },
  { id: "guest", label: "Guest Table", note: "Order/table up front; guest-friendly." },
  { id: "bistro", label: "Modern Bistro", note: "Cleaner spacers; emphasize totals." },
];

const DEFAULT: ReceiptPrefs = { design: "classic", logo: true, fontStyle: "thermal", fontSize: "M" };
const KEY = "eatos.pos.receipt-settings";
type All = Record<ReceiptType, ReceiptPrefs>;
const SERVER = Object.fromEntries(RECEIPT_TYPES.map((t) => [t.id, DEFAULT])) as All;
let cache: All | null = null;
const listeners = new Set<() => void>();

function read(): All {
  if (cache) return cache;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<All>;
    cache = Object.fromEntries(RECEIPT_TYPES.map((t) => [t.id, { ...DEFAULT, ...saved[t.id] }])) as All;
  } catch { cache = SERVER; }
  return cache;
}

export function useReceiptSettings() {
  const all = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SERVER);
  const update = (type: ReceiptType, patch: Partial<ReceiptPrefs>) => {
    cache = { ...read(), [type]: { ...read()[type], ...patch } };
    try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
    listeners.forEach((l) => l());
  };
  return { all, update };
}
