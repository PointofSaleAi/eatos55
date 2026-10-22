# Landscape search for New Order and Tickets

## Problem
Tapping search in landscape (tablet/desktop) opens the phone-style search bar pinned along the whole bottom of the screen. It covers the order/ticket panel on the right, leaves a blank band, and on Tickets the scope chips (All, Order No, Transaction, Guest, Employee) get cut off.

## What changes
- **Phone (portrait):** unchanged — search stays docked at the bottom above the keyboard.
- **Landscape / tablet / desktop:** search opens **inline at the top of the left list area**, in place of the header row:
  - **New Order:** the category tabs row (burger, BRUNCH, BAR…, search, three dots) is replaced by a search field + Cancel, the same height as that row. Subcategories and products below stay visible and filter live. The order summary panel on the right is never covered.
  - **Tickets:** the "Tickets" title row is replaced by the search field + Cancel; the scope chips sit directly under it on one row that scrolls sideways if needed (none clipped), replacing the status tabs while searching. The ticket detail panel stays visible.
- Field keeps the voice mic, clear (x) and Cancel; Escape/Cancel closes and restores the normal header. Sizes follow the existing control heights so it matches the rest of the toolbar.
- Works the same when the order panel is dragged to the other side.

## Technical details
- `SearchDock` gets an `inline` mode: when the layout is not phone (existing layout hook in `src/lib/device.ts`), it renders in place instead of portalling into `#pos-dock-root`; `above` renders as a scrollable chip row below the field.
- `order.new.tsx` and `tickets-screen.tsx` render the inline dock inside their left column header when searching, hiding the normal header row; phone path unchanged.
- Settings search untouched.
- Verify at 1026x742 (user's view), 1528x796, 834x1112 and 390x844.
