# New Order menu hierarchy and layout toggle

## Goal
Add the reference-style three-level menu hierarchy directly before the New Order category chips, without changing ordering, cart, search, or item-selection behavior.

## Changes
- Correct the hierarchy to match the screenshots:
  - Menu dropdown: realistic US restaurant menus such as Main Menu, Happy Hour, and Weekend Specials.
  - Categories: Bar Menu, Brunch, and Dinner.
  - Subcategories: the existing groups under each category, such as Brunch Sandwiches, Brunch Beverages, Brunchy Drinks, and Brunch Coffee.
- Keep the menu control collapsed to the menu-with-right-arrow icon initially. Tapping it expands an inline selector containing the horizontal/vertical toggle and active menu dropdown.
- Selecting a menu updates the available category chips and selects that menu's first available category and subcategory.
- Keep Bar Menu, Brunch, and Dinner as the prominent category chips beside the menu control, never as dropdown options.
- Add two icon controls for how the menu hierarchy is displayed:
  - Horizontal: categories and subcategories use compact horizontal scrolling rows.
  - Vertical: categories remain across the top while subcategories wrap into a multi-row grid above the products, as shown in the reference.
- Clearly indicate the selected menu, category, subcategory, and active layout icon, with accessible labels, keyboard focus, and 44px touch targets.
- Close the expanded selector or dropdown when the user selects an option, taps elsewhere, or presses Escape where appropriate.

## Responsive behavior
- Tablet and desktop will follow the attached landscape reference: menu control first, category chips continuing across the top, and subcategories directly below.
- Phones will use the same controls in a compact reflowing row, preserving room for Menu/Order, search, and More without horizontal overflow.
- The item grid and order panel remain unchanged; only the menu/category header is reorganized.

## Technical details
- Reshape the existing demo menu data into menu → category → subcategory relationships while keeping the existing products and their current subcategory assignments.
- Use the existing dropdown component and Lucide icons, with project color, spacing, and typography tokens.
- Keep the selected layout within the New Order screen for this presentation change; no merchant settings, prices, cart data, or payment behavior are altered.

## Verification
- Verify menu switching, category switching, subcategory filtering, and both layouts at phone, tablet, and desktop widths.
- Confirm the hierarchy reads correctly in every state, item selection still adds or opens modifiers correctly, and the cart remains visible in wide layouts.
- Confirm no clipping, overlap, or unintended page scrolling in either layout mode.
