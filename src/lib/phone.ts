/**
 * Country-aware phone number entry and validation.
 * Supported countries match the signup country list in demo-data.
 */

export type PhoneCountry = {
  /** Display name, matches `countries` in demo-data. */
  name: string;
  flag: string;
  dial: string;
  /** Allowed national digit counts. */
  lengths: number[];
  /** Grouping sizes applied left to right; last group repeats the remainder. */
  groups: number[];
  placeholder: string;
  /** Separator between groups. */
  sep: string;
};

export const phoneCountries: PhoneCountry[] = [
  { name: "United States", flag: "🇺🇸", dial: "+1", lengths: [10], groups: [3, 3, 4], placeholder: "(123) 456-7890", sep: " " },
  { name: "Canada", flag: "🇨🇦", dial: "+1", lengths: [10], groups: [3, 3, 4], placeholder: "(123) 456-7890", sep: " " },
  { name: "United Kingdom", flag: "🇬🇧", dial: "+44", lengths: [10], groups: [4, 3, 3], placeholder: "7123 456 789", sep: " " },
  { name: "Australia", flag: "🇦🇺", dial: "+61", lengths: [9], groups: [3, 3, 3], placeholder: "412 345 678", sep: " " },
  { name: "India", flag: "🇮🇳", dial: "+91", lengths: [10], groups: [5, 5], placeholder: "98765 43210", sep: " " },
];

export const defaultPhoneCountry = phoneCountries[0]!;

export function phoneCountryByName(name: string | undefined): PhoneCountry {
  return phoneCountries.find((c) => c.name === name) ?? defaultPhoneCountry;
}

/** Max digits the country accepts — use to cap input while typing. */
export function maxPhoneDigits(country: PhoneCountry): number {
  return Math.max(...country.lengths);
}

/** Format raw input as a national number while typing, capped at the country's max length. */
export function formatPhoneFor(country: PhoneCountry, raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, maxPhoneDigits(country));
  if (country.name === "United States" || country.name === "Canada") {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  const parts: string[] = [];
  let rest = d;
  for (const size of country.groups) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  if (rest) parts.push(rest);
  return parts.join(country.sep);
}

/** True when the entered digits form a valid number for the country. */
export function isValidPhoneFor(country: PhoneCountry, raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  return country.lengths.includes(d.length);
}

/** Country-specific validation error message. */
export function phoneErrorFor(country: PhoneCountry): string {
  const counts = country.lengths.join(" or ");
  return `Enter a valid ${counts}-digit ${country.name} mobile number.`;
}
