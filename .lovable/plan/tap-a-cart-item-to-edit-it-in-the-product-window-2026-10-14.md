# Tap a cart item to edit it in the product window

Following the recording's behaviour only (our current look stays the same).

## What you'll see
- Tapping an item row in the cart opens the same product window used when adding from the menu.
- The window opens already filled in with that line's quantity, price (including any approved price change), modifiers, add-ons, notes and discount.
- The bottom button reads **Update** instead of Add. Tapping it replaces that cart line with your changes (for example quantity 1 to 2 updates the line total right away). It never adds a second copy.
- Tapping outside, Escape, swipe-down or Back closes the window without changing the line.
- The cart's own + / − quantity buttons, swipe actions and notes keep working as they do now; tapping them does not open the window.
- Custom items and gift-card lines don't have a menu product, so tapping them does nothing new.
- Works the same on phone, tablet and desktop, including the phone Order view.

## Technical details
- `pos-store.tsx`: add `updateLine(id, opts)` that rewrites an existing line (qty, price, modifiers, notes, discount) using the same pricing as `addItem`.
- `item-sheet.tsx`: accept an optional `editLine`; when present, seed state from it in the open effect, label the footer "Update", and call `updateLine` instead of `addItem`.
- `order-panel.tsx`: make each cart row's name area a button that reports the line to New Order (`onEditLine`), with `stopPropagation` on qty/remove controls.
- `order.new.tsx`: hold `editingLine` state and pass the matching menu item plus line to `ItemSheet`.
- Verify at 390x844, 768x1024, 1141x742 and 1440x900: add an item, tap it in the cart, change quantity/modifier, Update, then confirm one line with new totals; dismissing leaves the line unchanged.
