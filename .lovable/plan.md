# Product options popup: lock its size for real

## Why it still moves
The last fix only reserved space for the option tiles. Other parts of the popup still appear and disappear:
- The line above ADD showing your picks ("Bread · Baguette" / "Select Bread") only shows once something is picked or required, so tapping an option makes the popup taller.
- The Add-Ons search bar only shows on the Add-Ons tab, so switching Item / Add-Ons changes the height.
- The group chips row hides while searching add-ons.
- The page arrows row shows only for groups with more than 8 options.

## What changes
- When a product opens, the popup takes the height it needs for its biggest group, with the search bar and the picks line counted in, and keeps that height until it closes.
- The picks line above ADD always keeps its space (empty when nothing is picked), so tapping options never moves anything.
- On the Item tab, the space for the Add-Ons search bar is kept (empty) when the product has add-ons, so switching tabs doesn't resize.
- The group chips row and page-arrows row keep their space while searching or on small groups.
- Backup lock: the popup measures itself and never gets shorter while open; it resets for the next product.
- Still capped to the screen height; if a group doesn't fit, its tiles scroll inside.
- Phone, tablet and desktop; light and dark.

## Technical details
- `src/components/pos/item-sheet.tsx`:
  - Footer summary `<p>`: always render with fixed `min-h` line height; content empty (non-breaking space) when nothing to show.
  - Add-Ons search row: when `addOns.length && itemGroups.length`, render on both tabs; on Item tab render it `invisible` + `aria-hidden` + inert.
  - Group chips row: render while searching too, `invisible` instead of removed.
  - Keep existing `reservedRows` grid min-height and `min-h-10` header row.
  - Ratchet: `ref` on SheetContent; `useLayoutEffect` (+ ResizeObserver) records max `offsetHeight` and applies it as `minHeight` style (merged with `dragStyle`); reset when `item` changes or the sheet closes; skip while in Product Information view.
- Verify with Playwright at 1334x796, 1024x768, 390x844: open Caprice Sandwich, tap each group chip, select/deselect options, switch Item/Add-Ons, type in add-on search; assert the dialog bounding-box height is identical at every step.
