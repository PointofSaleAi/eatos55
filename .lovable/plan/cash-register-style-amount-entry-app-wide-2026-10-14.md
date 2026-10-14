# Cash-register style amount entry app-wide

## What will change
- Every amount-entry field starts empty at **$0.00** and fills from the last digit: tapping 9 → $0.09, 9 again → $0.99, again → $9.99, and so on.
- A **00** key lets you enter whole amounts fast: tap 9 then 00 → $9.00.
- Backspace removes the last digit (e.g. $9.99 → $0.99), and the decimal-point key is no longer needed on amount pads (it stays disabled/hidden on amount fields).
- Applied everywhere an amount is typed:
  - Cash / card / other tender amounts on the payment screens (including the note-counter cash panel — counting notes still fills the amount directly)
  - Gift Card amount (both the add-money window and the pay-with-gift-card window)
  - Tips (Add Tip sheet and the Clock Out inline tip pad)
  - Price Override "New Price"
  - Custom Item price
  - Discount and Service Charge fixed-amount entry
  - Split payment amounts
- Not changed: PIN entry, gift-card card number, reference numbers, guest counts — those are not money and keep normal left-to-right typing.

## Technical details
- Add a shared cents-based entry helper (digit string of cents → amount = cents / 100) so every surface behaves identically; each surface keeps its own styling and layout.
- Add a "00" key to the plain `NumPad` bottom row (`.` / `0` / `00` / backspace arrangement) and use it on amount pads; the order-variant pad already has 00.
- Update each consumer's `onDigit`/backspace handlers to the cents model, with a sensible max (e.g. 7 digits ≈ $99,999.99).
- Placeholder/displays show $0.00 when nothing is entered; validation (charge disabled at $0.00, override must differ from original price, etc.) is preserved.

## Verification
- On each surface: type 9-9-9 and confirm $0.09 → $0.99 → $9.99; type 9 then 00 and confirm $9.00; backspace steps back one digit.
- Confirm Charge/Apply/Add buttons stay disabled at $0.00 and enable with the right amounts.
- Check phone, tablet and desktop layouts — no shifted or overlapping keys.
- Check preview build errors after the changes.
