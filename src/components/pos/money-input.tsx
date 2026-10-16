import type { InputHTMLAttributes } from "react";
import { MONEY_DIGITS_MAX, amountToMoneyDigits, moneyDigitsToAmount } from "@/lib/money-entry";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string | number;
  onChange: (value: string) => void;
};

/**
 * Cash-register style typed amount: digits fill from the last decimal
 * (9 → 0.09, 99 → 0.99, 999 → 9.99) and backspace drops the last digit.
 * Emits a two-decimal string ("" when cleared) so existing stores stay compatible.
 */
export function MoneyInput({ value, onChange, placeholder = "0.00", onFocus, ...rest }: Props) {
  const digits = amountToMoneyDigits(Number(value) || 0);
  const shown = digits ? moneyDigitsToAmount(digits).toFixed(2) : "";
  const pinEnd = (el: HTMLInputElement) => requestAnimationFrame(() => { const n = el.value.length; el.setSelectionRange(n, n); });
  return <input {...rest} type="text" inputMode="numeric" autoComplete="off" placeholder={placeholder} value={shown}
    onFocus={(e) => { pinEnd(e.currentTarget); onFocus?.(e); }}
    onClick={(e) => pinEnd(e.currentTarget)}
    onChange={(e) => {
      const next = e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, MONEY_DIGITS_MAX);
      onChange(next ? moneyDigitsToAmount(next).toFixed(2) : "");
      pinEnd(e.target);
    }} />;
}
