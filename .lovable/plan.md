# Cash-register style amount entry everywhere

Every typed dollar amount fills from the last decimal digit, the same as the keypads and gift-card screens already do: typing 9 → $0.09, 99 → $0.99, 999 → $9.99. Backspace removes the last digit. Works on phone, tablet and desktop.

## Fields to update
- Settings > Menu > Modifiers — option prices and the "Add Option" price
- Settings > Payments > Service Charge — value when type is Amount
- Settings > Payments > Discounts — value when type is Amount
- Settings > Payments > Taxes — Amount field when the tax is a fixed amount
- New Order product modal — inline open-price edit

Percentage values (e.g. 8.25%) keep normal decimal typing, since they aren't money. Keypad-based screens (payments, tips, gift cards, custom item, price override, cash till) already work this way and stay unchanged.

## Technical details
- Add a shared `MoneyInput` in `src/components/pos/money-input.tsx` built on `src/lib/money-entry.ts` (`pushMoneyDigit`, `popMoneyDigit`, `moneyDigitsToAmount`, `amountToMoneyDigits`): keeps a cents digit string, handles typing/paste/backspace via `onBeforeInput`/`onKeyDown`, caret pinned to the end, `inputMode="numeric"`, displays formatted `0.00`, emits the amount as a string with 2 decimals so existing stores stay compatible.
- Replace the raw inputs in `modifier-settings.tsx`, `service-charge-settings.tsx`, `discount-settings.tsx`, `tax-settings.tsx` (amount mode only) and `item-sheet.tsx` with `MoneyInput`.
- Record the rule in `AGENTS.md`: typed dollar amounts use `MoneyInput`.
