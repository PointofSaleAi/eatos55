import { useSyncExternalStore } from "react";

/** Demo-only signed-in employee profile; security values are never used for authentication. */
export type ProfileSettings = {
  first: string; middle: string; last: string; dob: string; email: string; phoneCountry: string; phone: string;
  address1: string; address2: string; city: string; state: string; postcode: string; country: string;
  photo: string; twoFactor: boolean; twoFactorSms: boolean; twoFactorApp: boolean; smsPhone: string;
};
const SEED: ProfileSettings = {
  first: "", middle: "", last: "", dob: "", email: "", phoneCountry: "United States", phone: "",
  address1: "", address2: "", city: "", state: "", postcode: "", country: "",
  photo: "", twoFactor: false, twoFactorSms: false, twoFactorApp: false, smsPhone: "",
};
export const formatAddress = (p: ProfileSettings) => [p.address1, p.address2, p.city, p.state, p.postcode, p.country].map((s) => s.trim()).filter(Boolean).join(", ");

const KEY = "eatos.pos.profile-settings";
let cache: ProfileSettings | null = null;
const listeners = new Set<() => void>();
function read() {
  if (cache) return cache;
  try { const raw = localStorage.getItem(KEY); cache = raw ? { ...SEED, ...JSON.parse(raw) } : SEED; } catch { cache = SEED; }
  return cache!;
}
export function useProfileSettings() {
  const profile = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => SEED);
  return {
    profile,
    patch(q: Partial<ProfileSettings>) {
      cache = { ...read(), ...q };
      try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
      listeners.forEach((l) => l());
    },
  };
}
