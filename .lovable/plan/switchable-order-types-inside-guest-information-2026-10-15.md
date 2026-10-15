# Switchable order types inside Guest Information

## Goal
The Guest Information sheet currently shows the selected order type as a read-only badge. The user wants to see all order types there and switch without leaving the sheet.

## Recommended approach
Replace the static badge in the sheet header with a horizontal row of tappable order-type chips — the same icon + label style already used in the cart's order-type row, so it looks and behaves consistently with the rest of the app.

```text
Guest Information
[🍽 Dine In] [🛍 Takeout] [🚗 Delivery] [📦 Pickup] ...   ← one row, horizontally scrollable
```

- All order types visible in one scrollable row directly under the "Guest Information" title, each with its icon and label.
- The selected type is highlighted (same selected style as the cart order-type row); tapping another chip switches the type instantly.
- Switching updates the sheet live: required-field markers and the validation message (e.g. "Delivery orders need address before saving") follow the newly selected type.
- On save, the chosen type is applied to the order exactly as if it had been picked in the cart.
- Works on phone, tablet and desktop: the row scrolls horizontally on narrow screens, no wrap.

## Why this over alternatives
- A dropdown hides the options behind a tap and doesn't match the app's existing order-type UI.
- A separate "change type" screen adds a step; the chip row keeps everything on one screen.

## Technical details
- Edit `src/components/pos/guest-sheet.tsx` only: replace the header badge (lines ~156-168) with a chip row built from `serviceOrderTypeLabels` / `orderTypeIcons`, calling the existing local `setType` state.
- No changes to cart, store, or validation logic — the sheet already tracks `type` locally and applies it on save.
