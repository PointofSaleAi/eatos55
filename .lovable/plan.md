# Redesign the payment completion experience

Replace the current "Payment Successful" list-of-rows page with a single focused
confirmation overlay that matches the reference screens: change amount as the hero,
a compact tender summary, three receipt-type tiles, and one primary action.

## What the user sees

1. As soon as the check clears, a centered white confirmation card appears over the
   payment screen (payment method and receipt stay visible, dimmed behind it).
2. Card content, top to bottom:
   - Hero line: `$160.06 Change` with a close X in the top right.
   - Divider, then `Total Amount` label, the paid total in oversized type, and
     `+$0.00 Tip` beside it.
   - Three quiet summary lines: `Amount Tendered: $165.00`,
     `Notes tendered: 1 x $100, 1 x $50, 1 x $10, 1 x $5` (cash only, omitted for
     card/other tenders), `Change due: $160.06`.
   - Three equal receipt tiles: EMAIL, SMS, PRINT RECEIPT. Selecting one highlights it
     with a green outline and tinted fill.
3. Prompt row `Please select receipt type` below the tiles.
   - Nothing selected: only `New Order`.
   - EMAIL selected: email field prefilled from the guest, `SEND` + `New Order`.
   - SMS selected: country pill (+1) plus phone field prefilled from the guest,
     `SEND` + `New Order`.
   - PRINT selected: `PRINT RECEIPT` + `New Order`.
4. `SEND` / `PRINT RECEIPT` confirm with a toast and keep the card open so a second
   receipt type can still be chosen. `New Order` and X close the card, clear the
   order and return to a fresh order screen.

No scrolling at any size: the card caps its height, the hero and tender type scale
fluidly, and on phone portrait the three tiles stay in one row with smaller icons
while the action buttons stack full width.

## Technical notes

- New component `src/components/pos/payment-complete-dialog.tsx` built on the existing
  dialog primitive with `hideClose` and a custom X, reusing existing tokens (no new
  colors except a success tint token added to `src/styles.css` if missing).
- `src/routes/payment.method.tsx`: instead of `navigate({ to: "/payment/success" })`
  in `takeAmount`, `finish`, and the split-payment completion, set local state that
  opens the dialog. Payment commit logic stays unchanged.
- `LastPayment` in `src/lib/pos-store.tsx` gains optional `tip` and `notes` (the
  denomination counts) so the summary lines can render real values; `commitPayment`
  accepts them through its existing `opts` argument, and `src/components/pos/amount-entry.tsx`
  passes the counted notes through when confirming cash.
- `src/routes/payment.success.tsx` stays as a route for direct/refresh access but is
  rebuilt to render the same component full screen, so both entry paths look identical.
- Copy uses no em dashes.

## Verification

Headless checks at 1440, 1155, 834 and 393 widths: cash payment with notes, card
payment without notes, each receipt type selected, and confirmation that the card
never scrolls and no label truncates.
