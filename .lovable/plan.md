# Tap "+" to add, modifier popup only when needed, no em dashes, no scrolling

## 1. What "+" does

Today every menu tile (and its "+" badge) opens the item sheet, even for a plain
item like Sparkling Water that has nothing to choose.

New behaviour, same on phone, tablet and desktop:

- Tapping "+" (or the tile) adds the item straight to the order cart when the
  item has no modifier or add-on choices to make: no required group, no add-ons,
  and a fixed price. A short toast plus haptic confirms it.
- The modifier / add-on sheet opens only when there is something to decide:
  the item has add-ons, has modifier groups attached to it, has a required
  group, or is an open-price item that needs a price entered.
- Out-of-stock tiles keep their current disabled behaviour.
- A long-press (or the tile's price row) still opens the sheet for items that
  were added directly, so notes, quantity and discounts stay reachable.

Modifier groups become per-item instead of a single global list, so
"nothing to choose" is a real state: drinks get no groups, sandwiches get
Bread / Course / Temperature / Preparation / Allergy as today.

## 2. No scrolling in the item sheet

The sheet currently scrolls, and the ADD button pushed the option grid into a
scroll area.

- The sheet sizes itself to the space available: header, price/quantity, notes,
  ITEM / ADD-ONS toggle and footer are fixed; the option grid takes whatever
  height remains.
- Options fit by adapting rather than scrolling: the grid switches between 2, 3
  and 4 columns based on available width, and option row height and text step
  down a notch when a group has many options.
- If a group is genuinely too long to fit at the smallest comfortable size
  (e.g. a 20-option list on a small phone), it paginates with a compact
  "1 / 2" pager instead of a scrollbar.
- Same pass over the discount sheet and the More sheet so all three fit
  without scrolling on 320px, 393px, tablet and desktop.

## 3. Em dashes removed

No em dash anywhere in the product. All 127 occurrences across 63 files
(page titles, descriptions, labels, helper copy) are rewritten with a colon,
comma, slash or a plain hyphen, whichever reads best. Existing "·" separators
in UI chrome stay as they are.

## Technical notes

- `src/lib/demo-data.ts`: `MenuItem` gains `modifierGroupNames?: string[]` and
  `addOnGroupNames?: string[]`; a helper `itemNeedsSheet(item)` centralises the
  "must open the sheet" test.
- `src/routes/order.new.tsx`: tile handler calls `addItem` directly or sets
  `sheetItem`; "+" becomes a real nested button with its own label.
- `src/components/pos/item-sheet.tsx`: drop `overflow-y-auto`, use a flex column
  with `min-h-0` option region, density classes driven by option count, and the
  pager when needed.
- `src/components/pos/discount-sheet.tsx`, `more-sheet.tsx`: same no-scroll
  sizing.
- Verified at 320, 393, 768, 1024 and 1440 px, portrait and landscape, with a
  check that no sheet element reports `scrollHeight > clientHeight`.
