import { parsePhoneNumberFromString, validatePhoneNumberLength, type CountryCode } from "libphonenumber-js/max";
import { z } from "zod";

export const phoneCountries = [
  { code: "US", name: "United States", dial: "+1", example: "(202) 555-0123" },
  { code: "CA", name: "Canada", dial: "+1", example: "(416) 555-0123" },
  { code: "GB", name: "United Kingdom", dial: "+44", example: "07700 900123" },
  { code: "AU", name: "Australia", dial: "+61", example: "0412 345 678" },
  { code: "IN", name: "India", dial: "+91", example: "98765 43210" },
] as const;
export type PhoneCountry = (typeof phoneCountries)[number]["code"];
export const phoneCountrySchema = z.enum(["US", "CA", "GB", "AU", "IN"]);
export const phoneCountry = (country: PhoneCountry) => phoneCountries.find((item) => item.code === country) ?? phoneCountries[0];
export function countryFromName(name: string): PhoneCountry {
  return phoneCountries.find((item) => item.name === name)?.code ?? "US";
}
export function inferPhoneCountry(value: string, saved?: PhoneCountry): PhoneCountry {
  if (saved && phoneCountrySchema.safeParse(saved).success) return saved;
  const parsed = parsePhoneNumberFromString(value);
  return phoneCountrySchema.safeParse(parsed?.country).success ? parsed?.country as PhoneCountry : "US";
}
// Only normalize permitted punctuation, never turn letters/extensions into digits.
function internationalInput(value: string, country: PhoneCountry) {
  const compact = value.replace(/[\s().-]/g, "");
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if ((country === "US" || country === "CA") && compact.startsWith("011")) return `+${compact.slice(3)}`;
  if (country === "AU" && compact.startsWith("0011")) return `+${compact.slice(4)}`;
  return compact;
}
export const phoneSchema = z.object({
  value: z.string().trim().max(64, "Phone number is too long."),
  country: phoneCountrySchema,
  required: z.boolean().default(false),
  mobile: z.boolean().default(true),
}).superRefine(({ value, country, required, mobile }, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message });
  if (!value) { if (required) fail("Enter a mobile number."); return; }
  if (!/^[+\d\s().-]+$/.test(value)) { fail("Use digits, spaces, parentheses or hyphens only; extensions are not supported."); return; }
  const input = internationalInput(value, country);
  if (!/^\+?\d+$/.test(input)) { fail("Enter one dialing code at the beginning of the number."); return; }
  const parsed = parsePhoneNumberFromString(input, { defaultCountry: country, extract: false });
  const info = phoneCountry(country);
  if (input.startsWith("+") && parsed?.countryCallingCode !== info.dial.slice(1)) {
    fail(`This dialing code does not match ${info.name}. Select the matching country.`); return;
  }
  const length = validatePhoneNumberLength(input, country);
  if (length === "TOO_SHORT") { fail(`This number is too short for ${info.name}.`); return; }
  if (length === "TOO_LONG") { fail(`This number is too long for ${info.name}.`); return; }
  if (!parsed?.isValid() || (parsed.country && parsed.country !== country)) {
    fail(`Enter a valid ${mobile ? "mobile " : "phone "}number for ${info.name}.`); return;
  }
  const type = parsed.getType();
  if (mobile && type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE") {
    fail(`Enter a mobile number for ${info.name}, not a landline or service number.`);
  }
}).transform(({ value, country }) => ({
  country,
  phone: value ? parsePhoneNumberFromString(internationalInput(value, country), { defaultCountry: country, extract: false })?.number ?? "" : "",
}));

export function validatePhone(value: string, country: PhoneCountry, required = false, mobile = true) {
  const result = phoneSchema.safeParse({ value, country, required, mobile });
  return result.success
    ? { valid: true as const, phone: result.data.phone, error: "" }
    : { valid: false as const, phone: "", error: result.error.issues[0]?.message ?? "Enter a valid phone number." };
}
export function displayPhone(value: string, country?: PhoneCountry) {
  if (!value) return "";
  return parsePhoneNumberFromString(value, { defaultCountry: country ?? inferPhoneCountry(value), extract: false })?.formatInternational() ?? value;
}
export function phoneSignInError(value: string) {
  if (value.includes("@")) return ""; // Existing demo email behavior is unchanged.
  if (!value.trim().startsWith("+")) return "Enter your phone number with its international dialing code, such as +1 or +44.";
  const parsed = parsePhoneNumberFromString(value, { extract: false });
  if (!phoneCountrySchema.safeParse(parsed?.country).success) return "Choose a number from United States, Canada, United Kingdom, Australia or India.";
  return validatePhone(value, inferPhoneCountry(value), true).error;
}