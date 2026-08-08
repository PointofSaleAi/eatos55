# Navigation drawer, item availability badges, richer modifiers

Three fixes: a global way to reach any section from any screen, stock/price indicators on menu items, and a fuller modifier experience on the item sheet.

## 1. Global navigation you can always reach

Today the only navigation is the 5-tab bottom bar (Home, Order, Tickets, Board, Settings), and it is covered whenever a bottom sheet (item, more, guest) is open — so from the ordering screen there is no visible way back to settings or other pages.

- Add a burger (menu) button to every screen header, left of the title/guest block.
- Tapping it opens a slide-in navigation drawer listing every area of the app, grouped:
  - Ordering: New Order, Order Review, Custom Item, Menus
  - Service: Floor Plan, Rooms, Tickets, Order Status Board
  - Money: Payments, Sales Summary, Shift Summary
  - Settings: General, Control Center, Menu, Payments, Workforce, Network, Hardware, Notifications, More
  - System: Customer Support, Contact Us, Help Center, Integrations, What's New
  - Footer: Manager Controls (PIN), Clock out
- Current page is highlighted; drawer closes on selection, on backdrop tap, and on swipe.
- Keep the bottom tabs as the quick 5-tab bar; the drawer is the full map.
- Every sheet (item, more, guest, discount, PIN) keeps its close X and swipe-down, and the ordering screen gets a back chevron so the item sheet is never a dead end.
- Drawer is width-capped on phones, and on tablet/desktop landscape it renders as a wider panel.

## 2. Item availability and price indicators

Menu items currently show only name and price. Add per-item state shown on the menu tile and carried into the item sheet:

- Stock count badge: `5` when tracked, and a low-stock style (e.g. `- 5` red/amber) when at or below the low threshold.
- Out of stock: badge plus dimmed tile, add button disabled, tap shows "Out of stock" (manager override via PIN offered).
- Open price: badge indicating price is entered at order time; tapping the item opens the price keypad first, with no default price.
- Weighted/each variants keep current behaviour.
- Demo data gets these fields on a realistic subset of items so all four states are visible in the menu grid.

## 3. Richer modifiers

- Add modifier groups beyond Bread/Sides: Course (Appetizer, Main, Dessert, Hold), Temperature (Rare, Medium Rare, Medium, Well Done), Preparation (No Onion, Extra Sauce, Sauce on Side, Well Toasted), Allergy (Gluten Free, Dairy Free, Nut Allergy), Add-Ons.
- Group chips row scrolls horizontally when it overflows; option list scrolls vertically inside the sheet with pinned header and footer, so the sheet never grows past its height cap.
- Options support single-select (Temperature, Course) vs multi-select (Preparation, Allergy, Add-Ons), required-group indication, and priced options that add to the line total.
- Selected modifiers stay visible as a compact summary above the ADD button and are written onto the cart line.

## Technical notes

- New `src/components/pos/nav-drawer.tsx` rendered from `DeviceFrame` in `src/components/pos/shell.tsx`, with open state in the shell so any header burger can trigger it; a `MenuButton` export is added alongside the existing `BackButton` and used by `ScreenHeader`/`SubHeader` and the ordering header.
- `MenuItem` in `src/lib/demo-data.ts` gains `stock?`, `lowStockAt?`, `outOfStock?`, `openPrice?`; `modifierGroups` gains the new groups with `select: "single" | "multi"` and `required?`.
- `src/components/pos/item-sheet.tsx` handles single vs multi select, open-price entry via the existing numpad, scrollable chips row, and the selection summary.
- `src/routes/order.new.tsx` renders the badges and disabled/open-price tile behaviour.
- All three changes verified at 320, 393, 768 and desktop widths in portrait and landscape, with no page-level scrolling.
