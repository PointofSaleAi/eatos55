# Compact the table status sheet

## Problem

The `B1 status` bottom sheet is too tall and scrolls. The user wants it smaller, with larger labels, and no scroll.

## Changes

1. Remove the scroll container
   - Drop `max-h-[min(60dvh,26rem)]` and `overflow-y-auto` from `StatusSheet`.
   - Let the sheet height be driven only by its rows so the whole popup fits without scrolling.

2. Larger, readable labels
   - Bump status row text from `text-fs-xs` to `text-fs-base` (or `text-fs-lg` on desktop) while keeping `font-bold`.
   - Keep the leading colour dot and checkmark at a proportional size so the row stays balanced.

3. Tighter vertical spacing
   - Reduce row vertical padding from `py-2` to `py-1.5` or `py-1` so 12 rows still fit comfortably on a phone.
   - Keep `min-h-tap` so every row stays a 44px tap target.

4. Keep existing behaviour
   - Preserve the auto-scroll-to-active status on open.
   - Preserve swipe-down / grabber / backdrop close.
   - Preserve the alternating muted/surface row backgrounds.

5. Verification
   - Screenshot the sheet at 320, 393, 768, 1024 and 1280 wide, portrait and landscape.
   - Confirm no vertical scrollbar, all 12 statuses visible, and the title "B1 status" still readable.

## Scope

Only `src/components/pos/status-sheet.tsx` changes. No data model, store, routing or floor-plan logic changes.
