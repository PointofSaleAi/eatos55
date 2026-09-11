# Make the bill editable before payment

Right now the bill screen is read-only: the guest name, order type, quantities and totals can only be changed by going back to the order. This makes the check editable in place, on phone, tablet and desktop.

## What changes on the bill

1. Guest line becomes tappable. Tapping the name (or the small chevron next to it) opens the existing guest details sheet, where the name, phone and order type are edited. Saving updates the bill instantly.
2. Order type shown top-right becomes a tappable chip that opens the same service-type row already used on the order screen (Dine-In, Takeout, Delivery and the rest), regardless of the manager's placement setting, so the type can always be corrected at payment time.
3. Each item line gets small plus and minus controls beside the quantity. Reducing to zero removes the line. Totals, tax and Amount Due recalculate immediately; the Continue to Payment action disables itself if the check empties.
4. A slim action row above the item list with two buttons: Discount and Notes.
   - Discount opens the existing discount picker (Comp Meal 100%, Employee Shift 50%, Police and Fire 20%); the applied discount shows as a removable line in the totals.
   - Notes opens a compact field for the order note, same behaviour as the order screen.
5. Editing is blocked once a partial payment exists on the check, to avoid a total that drops below what has already been taken. In that case the controls are hidden and a short line explains why.

## Layout

- Phone portrait: controls sit inside the receipt card, quantity steppers are full-size touch targets, action row is one line.
- Tablet and desktop: same controls inside the left bill pane; nothing about the two-pane composition changes.
- Verified at 393, 430, 768, 1024 and 1440 wide.

## Technical notes

- `src/components/pos/payment-bill.tsx` gains local sheet state and reuses `GuestSheet`, `DiscountSheet`, `OrderTypeStrip` and store actions `changeQty`, `setOrderType`, `setOrderDiscountPercent`, `setOrderNotes`.
- No store or pricing logic changes; totals already derive from `cart`.
- `src/routes/payment.bill.tsx` keeps its header but the header total reads from the same recomputed `due`; the Continue button stays disabled on an empty cart.
- Edit controls are suppressed when `partialPayments.length > 0`.
