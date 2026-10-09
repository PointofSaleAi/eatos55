# Restructure the New Order cart

## Goal
Reorganize the cart to follow the attached reference’s visual hierarchy while preserving the current eatOS theme, content, controls, and behavior.

## Changes
- Keep the editable guest name, mobile number, arrived time, primary actions, and fixed three-dot button at the top.
- Group the order type, order number, and server into one compact order-information row below the actions.
- Place order notes in its own full-width row immediately beneath the order information.
- Give the cart items a clearly defined central area that owns the remaining height and remains the only scrolling section.
- Keep quantity editing, modifiers, item notes, prices, empty-cart messaging, and all existing item interactions unchanged.
- Reorganize the totals into a compact footer summary above the existing Save, Fire, and Charge controls without changing calculations or actions.
- Preserve the docked right-side options rail on landscape-wide screens and the sliding panel on phone and portrait layouts.

## Responsive behavior
- Desktop and landscape tablet: retain the menu/cart split, including the cart narrowing when the options rail opens.
- Portrait tablet and phone: use the same cart hierarchy within the Order view, with rows adapting to the available width without clipping.
- Keep the cart header and footer fixed while the item list scrolls independently at every supported size.

## Technical details
- Restructure only the cart layout in `OrderPanel`; do not replace current fields, labels, state, calculations, or event handlers.
- Use the existing semantic theme tokens and shared controls; the screenshots are structural references, not styling references.
- Keep stable grid and flex constraints for guest details, order metadata, totals, and footer actions.

## Validation
- Verify guest editing, order-type selection, notes, quantity changes, Save, Fire, Charge, and every three-dot option still work.
- Test empty, single-item, multi-item, long-name, modifier, discount, tax-exempt, and comped states.
- Check phone, portrait tablet, landscape tablet, and desktop for clipping, overlap, unintended page scrolling, or hidden controls.