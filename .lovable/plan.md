# Fix the empty scroll, add order cancel, unhide payment icons, build the real Split Check

## 1. No more dead scroll space on the ticket screen

The ticket detail page stretches its body to fill the screen, so a short order (one item, one payment) leaves a large empty grey band that still scrolls. The body will hug its content instead: cards stack from the top, and scrolling only kicks in when the content genuinely exceeds the screen. Same treatment for the other short detail screens so nothing scrolls for no reason.

## 2. Cancelling an order is now possible from the order itself

Today an order can only be voided by swiping a row in the Tickets list — there is nothing on the open order or the ticket detail.

- Ticket detail gets a destructive "Cancel order" action (in the footer for unpaid tickets, alongside Print).
- The open order screens (New Order / Review) get "Cancel order" in the 3-dot menu, which clears the cart and returns to Tickets.
- Both ask for confirmation first ("Cancel order 10243? This cannot be undone") using the existing confirm sheet, and manager-level actions keep the existing PIN gate.
- Paid tickets keep Close/Refund behaviour and do not offer cancel.

## 3. Payment method icons are no longer cut off

The payment tender grid is laid out without allowing for the floating bottom tab pill, so the second row of icons (Gift Card, Split, House, Other) sits behind it. The payment, tender and success screens will use the shared screen layout that already reserves room for the tabs and the keyboard, so all eight tenders are fully visible and tappable at 320, 393, 430, tablet and desktop widths.

## 4. Split Check rebuilt to the uploaded design

"Split" currently just opens a plain amount keypad. It becomes a proper Split Check screen:

- Header: back chevron, "Split Check" title, discount (%) and print icons on the right.
- Three modes as a scrollable segmented row: STANDARD, SPLIT EVENLY, CUSTOM.
- SPLIT EVENLY / CUSTOM show a "Number of Checks" stepper (dark pill, minus / count / plus).
- Item list with quantity, name, modifier lines and price.
- Totals block (Sub Total, Tax, Total) followed by one card per check: receipt icon, "Check - 5 a", item count and Total Amount.
- CUSTOM: tapping an item opens a "Split With" sheet listing the checks with checkboxes and a SAVE button; amounts recalculate per check.
- Footer: save icon, card-brand button, and PAY (disabled until the split is valid, as in Standard).
- Discount icon opens the existing discount list sheet (radio rows with amount/percent).
- Print icon opens a sheet with "Print parent Orders" / "Print child orders" pills and a Print button.

## Technical notes

- `src/routes/tickets.$ticketId.tsx`, `src/components/pos/shell.tsx`: give `ScreenBody` a content-hugging variant so short pages don't create scroll; keep `--tabs-h` / `--kb-inset` padding.
- `src/routes/payment.method.tsx`, `src/components/pos/tender-screen.tsx`, `src/routes/payment.success.tsx`: swap hand-rolled flex shells for `ScreenHeader`/`ScreenBody`/`ScreenFooter` so tab height is reserved.
- New `src/routes/payment.split.tsx` plus `src/components/pos/split-*.tsx` (mode tabs, check card, split-with sheet, print sheet); `/payment/method` Split now routes here instead of `/payment/tender/split`.
- Split state (mode, check count, per-item assignment) lives in local component state and commits through the existing `addPartialPayment` / `commitPayment` store actions — no data-model change beyond the split assignment map.
- Cancel uses existing `setTicketStatus` / void path and `ConfirmProvider`.
- Verify on mobile portrait, tablet and desktop widths.
