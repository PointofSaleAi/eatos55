# Fit the order type pill on the Payment screen

The "TAKE AWAY" pill next to "Order #2" stretches across the whole right half of the bill card, leaving a long empty grey bar. It should only be as wide as its text and arrow.

## What changes
- The pill shrinks to fit its label (e.g. "TAKE AWAY >", "DINE-IN >") and sits at the right edge of the row, lined up with the amounts below.
- Tapping it still opens the order type row as today; nothing else on the bill changes.
- Same on phone (bill step), tablet and desktop.

## Technical notes
- `src/components/pos/payment-bill.tsx`: the pill button sits in a `grid-cols-[minmax(0,1fr)_auto]` cell and is stretched by default grid alignment. Add `justify-self-end w-fit` (and `whitespace-nowrap`) to the button; apply `justify-self-end` to the read-only `<p>` variant too.
- Verify at 1141x742, 834x1112 and 390x844.
