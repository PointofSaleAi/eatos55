# New Order menu selector and category layout toggle

## Goal
Add the reference-style menu control directly before the New Order category chips, without changing ordering, cart, search, or item-selection behavior.

## Changes
- Replace the separate Bar Menu, Brunch, and Dinner button row with one compact menu-and-arrow control beside the category chips.
- Keep the control collapsed to an icon initially. Tapping it expands an inline selector showing the active menu name and layout controls.
- Open a dropdown from the active menu name listing the existing menus: Bar Menu, Brunch, and Dinner. Selecting one updates the active menu, selects its first category, refreshes the products, and closes the dropdown.
- Add two icon controls for category layout:
  - Horizontal: one scrollable row of category chips.
  - Vertical: a wrapped/grid category layout that shows all categories above the products.
- Clearly indicate the selected menu, selected category, and active layout icon, with accessible labels, keyboard focus, and 44px touch targets.
- Close the expanded selector or dropdown when the user selects an option, taps elsewhere, or presses Escape where appropriate.

## Responsive behavior
- Tablet and desktop will follow the attached landscape reference: selector first, category chips continuing across the same header area.
- Phones will use the same controls in a compact reflowing row, preserving room for Menu/Order, search, and More without horizontal overflow.
- The item grid and order panel remain unchanged; only the menu/category header is reorganized.

## Technical details
- Use the existing `menus` data and current active-menu/category state in the New Order page.
- Use the existing dropdown component and Lucide icons, with project color, spacing, and typography tokens.
- Keep layout preference within the New Order screen for this presentation change; no business data or settings are altered.

## Verification
- Verify menu switching and both category layouts at phone, tablet, and desktop widths.
- Confirm category selection still filters products, item selection still adds or opens modifiers correctly, and the cart remains visible in wide layouts.
- Confirm no clipping, overlap, or unintended page scrolling in either layout mode.
