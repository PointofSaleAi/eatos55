# Order header order, split check layout, and paying splits one by one

## 1. Order screen header order

Today the menu pills (Bar Menu, Brunch, Dinner) sit in the top row and the MENU / ORDER switch sits below them.

Change to:

```text
[ MENU | ORDER ]              search  more
[ BAR MENU ] [ BRUNCH ] [ DINNER ]
[ BRUNCH SANDWICHES ] [ BRUNCH BEVERAGES ] ...
[ item tiles ]
```

- MENU / ORDER moves up into the top row, sharing that row with the search and more icons (so no vertical space is added).
- The menu pills move down, directly above the category row, so a menu and its categories read as one group.
- On tablet and desktop, where there is no MENU / ORDER switch, the menu pills stay in the top row as they are now.

## 2. Split Payments alignment on phones

On a phone the child check cards are cramped: the big ghost number sits behind the totals and the item text runs into the amounts.

- Move the ghost number watermark so it never sits behind the totals or item lines on narrow widths (top corner, lighter).
- Give each child card the same tight spacing as the bill: check label, dashed rule, totals rows, dashed rule, item lines with the share label, name and price on one row that truncates instead of overlapping.
- Move the round X remove badge inside the card's top row so it stops overlapping the card above it.
- Keep one card per row on phones, two on tablets, three or four on desktop.

## 3. Paying split checks one by one

Right now Split Payments is display only: PAY returns to the payment screen with the whole check still due, and after one payment the confirmation offers New Order.

Add a split queue:

- When PAY is confirmed in Split Payments, the child checks (label plus amount) are saved on the order as a sequence, with the first unpaid one active.
- The payment screen shows which check is being paid ("Check 6 a of 4") and charges that check's amount, not the whole order. A short list of the checks lets staff pick a different one to take next.
- Each paid check is recorded against the order, so the remaining balance drops as checks clear.
- The confirmation card after each check shows "Next check: Check 6 b" as the main action, and only shows New Order once every check is paid. Closing the screen keeps the remaining checks so staff can come back later and finish the sequence.
- Tip and receipt prompts behave as they do now, once per check.

## Technical notes

- `src/routes/order.new.tsx`: reorder the header blocks only; no change to the grid or tiles.
- `src/components/pos/split-payments.tsx`: child card layout and watermark placement; on confirm, write the computed breakdown to the store instead of only calling `onProceed`.
- `src/lib/pos-store.tsx`: new persisted `splitChecks` state (`{ id, label, total, paidAt }[]`) plus actions to set, clear and mark paid; `commitPayment` records the active check's amount as a partial payment and advances the active check.
- `src/routes/payment.method.tsx`: derive the amount due from the active split check when a split exists, show the check selector strip, and keep existing tender flows untouched.
- `src/components/pos/payment-complete-dialog.tsx`: primary action becomes Next check while unpaid checks remain, New Order otherwise.
- Verify at 393, 768, 1024 and 1440 wide.
