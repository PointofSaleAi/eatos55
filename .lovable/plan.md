# One order type row, not three

## What is happening

The order type row (Dine-In, Takeout, Delivery and the rest) is currently drawn in three separate places:

1. The order panel, under the guest block.
2. The Guest Information sheet, pinned above its title. Because the sheet floats over the order panel, both rows are on screen at the same time, one just above the other, as in the screenshots.
3. The bill on the charge screen, but only when the Order Type setting is set to Charge screen or Both, so this one is not part of the duplication.

The result is two rows stacked on top of each other whenever the guest sheet opens, and they can even show different scroll positions of the same list, which reads as if there were several rows.

## The fix

- Keep exactly one picker: the row in the order area (and the charge screen when the setting asks for it).
- The Guest Information sheet stops repeating the row. Its header instead shows the selected type once, as an icon plus label next to the "Guest Information" title, so staff still see which type they are filling in.
- The sheet still adapts its fields to the type as it does today; the type is chosen in the order area before the sheet opens, and changing the type reopens the sheet with the right fields.
- If a type is picked while the sheet is open, the header label updates in place, no second row appears.

## Sizes

Phone portrait, tablet portrait, tablet landscape and desktop all show one row only. Checked at 390x844, 768x1024, 1024x768 and 1440x950, with the guest sheet open and closed.

## Technical notes

- `src/components/pos/guest-sheet.tsx`: remove the inline strip block (lines around 154-180) plus its now-unused `stripRef`, `serviceOrderTypes`, `serviceOrderTypeLabels` imports; render the current type as a compact icon+label chip inside `SheetHeader`, driven by existing `type` state. Keep `orderTypeIcons` exported since `order-type-strip.tsx` imports it.
- `src/components/pos/order-panel.tsx` and `src/components/pos/payment-bill.tsx` keep the shared `OrderTypeStrip` and their existing `orderTypePlacement` gating; no logic change.
- No changes to cart, totals, tender flow or routing.
