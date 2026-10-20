# Keep the product options popup a fixed size

## Goal
When a product opens its options popup, the popup's size is set once from the largest option group (Item tab groups and Add-Ons). Switching between groups or tabs no longer makes it grow or shrink.

## What changes
- On open, count the options in every group (both tabs) and take the largest.
- The options grid reserves enough rows for that largest group, based on the current column count (2 on phone, 3 on tablet, 4 on desktop).
- Smaller groups keep the same popup size; their tiles keep their normal height and sit at the top, with empty space below (no stretching).
- The height is still capped by the screen (current max height); if the largest group doesn't fit, the grid scrolls inside the popup instead of resizing it.
- Add-Ons search results use the same reserved height, so typing doesn't resize the popup either.
- Works on phone, tablet and desktop, light and dark.

## Technical details
- `src/components/pos/item-sheet.tsx`: compute `maxOptions = max(options.length)` across `itemGroups` and `addOns` with `useMemo` keyed on the item; derive columns from existing layout hooks (matchMedia via useSyncExternalStore); set the grid `min-height` to `rows * tileHeight + gaps` and remove `auto-rows-fr` stretching so tiles keep a consistent height; give the popup content a fixed height (`h-[min(78dvh,42rem)]`-style clamp to the computed size) rather than content-driven height; grid area `overflow-y-auto`.
- Verify with Playwright at 1334x796, 1024x768, 390x844: open Caprice Sandwich, switch each group and the Add-Ons tab, assert the dialog's bounding box height stays identical.
