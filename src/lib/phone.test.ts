import { describe, expect, it } from "vitest";
import { countryFromName, displayPhone, inferPhoneCountry, phoneSignInError, validatePhone, type PhoneCountry } from "./phone";

const examples: [PhoneCountry, string, string][] = [
  ["US", "(202) 555-0123", "+12025550123"],
  ["CA", "4165550123", "+14165550123"],
  ["GB", "07712 345678", "+447712345678"],
  ["AU", "0412 345 678", "+61412345678"],
  ["IN", "98765 43210", "+919876543210"],
];
describe("country-aware phone validation", () => {
  it.each(examples)("normalizes %s national and international numbers", (country, national, international) => {
    expect(validatePhone(national, country, true)).toMatchObject({ valid: true, phone: international });
    expect(validatePhone(international, country, true)).toMatchObject({ valid: true, phone: international });
    expect(validatePhone(national + "999999999999", country).valid).toBe(false);
    expect(validatePhone("12", country).error).toContain("too short");
    expect(validatePhone(national + "ext123", country).valid).toBe(false);
    expect(validatePhone(national + "999999999999", country).phone).toBe("");
    expect(inferPhoneCountry(international)).toBe(country);
  });
  it("handles international access prefixes without duplicating dialing codes", () => {
    expect(validatePhone("0044 7712 345678", "GB").phone).toBe("+447712345678");
    expect(validatePhone("011 1 202 555 0123", "US").phone).toBe("+12025550123");
    expect(validatePhone("0011 61 412 345678", "AU").phone).toBe("+61412345678");
  });
  it("rejects conflicting and unsupported countries including shared +1 regions", () => {
    expect(validatePhone("+447712345678", "US").error).toContain("matching country");
    expect(validatePhone("+14165550123", "US").valid).toBe(false);
    expect(validatePhone("+12025550123", "CA").valid).toBe(false);
    expect(validatePhone("+971501234567", "US").valid).toBe(false);
  });
  it("allows landlines for restaurant contacts but not distinguishable mobile-only fields", () => {
    expect(validatePhone("02079460958", "GB", true).valid).toBe(false);
    expect(validatePhone("02079460958", "GB", true, false).valid).toBe(true);
    expect(validatePhone("0293744000", "AU", true).valid).toBe(false);
    expect(validatePhone("0293744000", "AU", true, false).valid).toBe(true);
  });
  it("preserves optional empty fields and rejects malformed numbers and invalid patterns", () => {
    expect(validatePhone("", "US")).toMatchObject({ valid: true, phone: "" });
    expect(validatePhone("", "US", true).valid).toBe(false);
    for (const number of ["+1+2025550123", "abc2025550123", "2025550123#1", "0000000000", "2025550123".repeat(10)]) {
      expect(validatePhone(number, "US").valid).toBe(false);
    }
    expect(validatePhone("1234567890", "IN").valid).toBe(false);
    expect(validatePhone("98765432100", "IN").valid).toBe(false);
  });
  it("requires international phone sign-in while leaving demo email behavior unchanged", () => {
    expect(phoneSignInError("demo@example.com")).toBe("");
    expect(phoneSignInError("2025550123")).toContain("dialing code");
    expect(phoneSignInError("+447712345678")).toBe("");
    expect(phoneSignInError("+971501234567")).not.toBe("");
    expect(displayPhone("07712345678", "GB")).toBe("+44 7712 345678");
    expect(countryFromName("India")).toBe("IN");
  });
});