# Show Custom Item inside the New Order product area

## What will change
- Tapping **Custom Item** in the fixed three-dot options will close the options panel and replace the product grid with an inline Custom Item workspace.
- Keep the cart visible beside the workspace on desktop and landscape tablet, matching the reference structure while retaining the current eatOS theme.
- Show an item-name field, live price field, and large numeric keypad inside the product area.
- Use an **X** control to close the workspace and restore the same menu, category, subcategory, search, and product-grid state.

## Custom Item behavior
- The keypad enters the price and supports decimal entry, backspace, and `00`.
- The add key adds the named item at the entered price to the existing cart.
- After a successful add, clear the name and price but keep Custom Item open, ready for another entry.
- Prevent adding a zero-price item and preserve the existing default name when no name is entered.
- Keep the cart totals and items updating immediately without navigating away from New Order.

## Responsive behavior
- **Desktop and landscape tablet:** Custom Item occupies only the product-list column; the cart remains visible and usable.
- **Phone and portrait tablet:** Custom Item replaces the product list in the Menu view. The cart remains available through the existing Menu/Order switch.
- Size the fields, keypad, close control, and scrolling so nothing overlaps the cart, bottom actions, tabs, or on-screen keyboard.

## Technical details
- Move the reusable Custom Item fields/keypad into a focused component that can render inside New Order.
- Let `OrderPanel` notify New Order when Custom Item is chosen instead of navigating to the separate page.
- Keep existing direct Custom Item entry points compatible by sending them into the inline New Order state rather than maintaining a second visual flow.
- Preserve the fixed three-dot button and the current order and placement of all other options.

## Verification
- Test opening and closing Custom Item without losing the selected menu/category/subcategory or current order.
- Add several custom items consecutively and confirm names, prices, quantities, totals, and cleared fields.
- Confirm invalid zero-price adds do nothing and decimal/backspace/`00` behave correctly.
- Verify phone, portrait tablet, landscape tablet, and desktop layouts, including cart visibility and the Menu/Order switch.
