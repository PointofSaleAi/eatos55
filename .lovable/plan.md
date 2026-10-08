# Quick add from the "+" icon on product cards

On the New Order screen, the "+" badge on a product card becomes its own button that always adds the product straight to the cart, even when the product has options.

## Behaviour

- Tapping "+" on any in-stock product card adds one unit to the cart immediately, with the usual confirmation message and haptic. No popup.
- Tapping the rest of the card keeps today's behaviour: products with choices (modifiers, add-ons, open price) open the options sheet; plain products add directly.
- Long-press on the card still opens the options sheet, so notes, quantity and discounts stay reachable.
- Out-of-stock cards keep their current disabled behaviour on both the card and the "+".

## Technical notes

- `src/routes/order.new.tsx`: turn the "+" badge into a real nested button with `onClick` calling `addItem(item.id, { qty: 1 })` plus toast and haptic, `stopPropagation` so the card handler doesn't also fire, and its own aria-label ("Quick add …").
- No changes to `itemNeedsSheet`, the item sheet, or the cart store.
- Verified on phone, tablet and desktop: "+" quick-adds every product, card tap still opens the sheet where choices exist, cart count and totals update.
