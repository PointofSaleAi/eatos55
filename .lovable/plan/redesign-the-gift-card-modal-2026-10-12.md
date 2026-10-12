# Redesign the Gift Card modal

## What changes

**1. Remove the Purchase / Add Funds / Check Balance tabs — one unified flow**
- No tab selection at all. The modal has a single flow: enter card number → enter amount → Charge.
- The modal adapts automatically to the card number entered:
  - Known card → shows its available balance; charging tops it up ("Funds added").
  - New card → treated as a purchase/activation; the note "Adding funds to any card will activate it" stays.
  - Balance is shown live as soon as a recognized number is entered, so "Check Balance" happens naturally without a separate mode.

**2. One shared number pad for both fields**
- A single NumPad serves the card-number field and the amount field.
- Tapping a field makes it the active target (clearly highlighted — pink accent ring); keypad digits go to the active field.
- Card number field: digits only, up to 19 digits, no decimal key. Amount field: digits + decimal.
- The decimal key is disabled while the card-number field is active.
- Default active field on open: card number. After 8+ digits are entered, focus hint moves to amount (amount field pulses/highlights), but the user can tap either field at any time.

**3. Horizontal two-column layout (wide screens)**
- Left column: card number field (with scan icon), amount field, live available-balance readout, and the Charge button.
- Right column: the shared number pad, full height.
- Uses the extra width instead of stacking; modal sized wider (around 46rem) and shorter so nothing scrolls.
- Narrow/phone screens keep the bottom-sheet form: fields stacked, number pad below, drag-to-close grabber — same single-flow behavior.

## Behavior kept unchanged
- Charging adds the no-tax "Gift Card - XXXX" line to the cart and updates the card balance; success toast unchanged.
- Unknown card numbers are allowed (new card activation); the balance row shows "New card" instead of "—".
- Shared outside-the-corner close control stays as-is.
- Works on phone, tablet, and desktop.

## Technical notes
- Rework `src/components/pos/gift-card-dialog.tsx` only: drop the `Tab` state and tab bar, add an `activeField: "card" | "amount"` state, route NumPad `onDigit`/`onBackspace` to the active field's setter, and restructure the wide layout into two columns (fields left, pad right).
- The payment-screen "Payment By Gift Card" dialog (`gift-card-payment-dialog.tsx`) gets the same shared-pad treatment for consistency: card number and amount share one pad, active field highlighted.
- No store, data, or route changes.
