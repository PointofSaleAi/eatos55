/**
 * Cash-register style amount entry: the field always represents cents and
 * digits fill from the right, so typing 9 → $0.09, 99 → $0.99, 999 → $9.99.
 * A "00" key appends two digits for fast whole-dollar amounts (9 + 00 = $9.00).
 * State is a plain digit string; the dollar amount is digits / 100.
 */

/** Max 7 digits ≈ $99,999.99. */
export const MONEY_DIGITS_MAX = 7;

/** Append a key ("0"–"9" or "00") to the cents digit string. */
export function pushMoneyDigit(current: string, key: string): string {
  const next = `${current}${key}`.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return next.slice(0, MONEY_DIGITS_MAX);
}

/** Remove the last entered digit. */
export function popMoneyDigit(current: string): string {
  return current.slice(0, -1);
}

/** Dollar value of a cents digit string ("" → 0). */
export function moneyDigitsToAmount(digits: string): number {
  return Number(digits || "0") / 100;
}

/** Convert a dollar amount back into a cents digit string (for pre-fills). */
export function amountToMoneyDigits(amount: number): string {
  const cents = Math.round(amount * 100);
  return cents > 0 ? String(cents) : "";
}
