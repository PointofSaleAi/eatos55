# Auto Close Payment per payment type (EATOS5-5623)

## What changes

On Settings > Payments > Payment Methods (Payment Options), every payment type gets its own
Auto Close Payment toggle sitting to the right of the Enabled toggle, matching the reference
screenshot: two labelled columns ("Enabled", "Auto Close Payment") with an info hint under the
list explaining that the order closes automatically once payment succeeds.

Behaviour:
- Every tender in every group gets an Auto Close toggle, no exceptions.
- Each toggle is independent and stored per tender.
- The Auto Close toggle is greyed out and not interactable while that payment method is
  switched off. Turning the method off leaves the stored Auto Close value untouched, so it
  returns as it was when the method is switched back on.
- Only managers can change either column (same rule as today).
- Current defaults keep today's behaviour: methods that already close automatically stay on,
  everything else starts off.

## Runtime effect

After a successful tender, if Auto Close is on for the method used, the completion screen closes
itself and returns to a new order without waiting for a tap. If it is off, the completion card
stays until the user dismisses it (today's behaviour).

## Column headers on narrow screens

On phone width the two toggles stay on the row but the header labels shorten to "On" and
"Auto Close" so nothing truncates. Rows keep the existing icon, colour and label styling.

## Technical notes

- `src/lib/pos-store.tsx`: add `tenderAutoClose: Record<TenderId, boolean>` to `AppSettings`
  with a `defaultTenderAutoClose` map, merged on load like `tenders` so saved settings from
  older devices fill in missing keys.
- `src/components/pos/settings-rows.tsx`: add a `IconDualToggleRow` (Enabled + secondary toggle,
  secondary accepts `disabled`) plus a small `ColumnHeaders` helper for the two column captions.
- `src/routes/settings.payment-methods.tsx`: render column headers above the first group and swap
  `IconToggleRow` for the dual row across all sections; Cash stays locked on for Enabled but its
  Auto Close toggle is editable.
- `src/components/pos/payment-complete-dialog.tsx` (or the routes that show it): read
  `lastPayment.method`, map the `TenderMethod` to its `TenderId`, and when auto close is on call
  `onDone()` on mount after a short confirmation delay so the success state is still visible.
- No backend or schema work; settings stay device-local in localStorage as today.
