# Add the missing live-app screens and global navigation

I logged into the staging app (pos.eatos.net) in mobile portrait as Elston Dsouza and walked the whole left navigation rail. Our build is missing the app's home screen and three whole sections, and there is no way to reach the menu or move between sections. Styling stays exactly as it is now — this is added structure and data only.

## What the live app has that we don't

From the rail, top to bottom:

1. **New Order** — guest name / phone header, `MENU` and `ORDER` tabs, empty-menu state ("No Active Menu"), footer bar with `Custom Item`, `Menu`, `Server Connected`.
2. **Floor plan (home)** — `GROUND FLOOR` picker, chips `All / Available / Ordering / Ordered / Reserved`, two-up table cards drawn as table+chairs with a status strip (`AVAILABLE` green, `ORDERING` pink) and an elapsed badge (e.g. `23H`). Tables seen: test, T1, EW1, T3, T4, 4, T6, T7.
3. **Rooms** — room cards: `Room 2` Available, `Mahmoud Shaaban / saof ali $0.00` Occupied, `Ocean` Available, `Francis Room / Francis Obera $2500.00` Occupied.
4. **Tickets** — already built; live version adds an `Order Summary` side panel with `Amount Due $0.00` and a "Let's create an order" empty state, plus filter tabs `All / Open / Closed / Paid / Unpaid / Ordering`, search, refresh and a date picker.
5. **Order status board** — `DINE IN / ONLINE` toggle, date picker, clock, and sortable columns `New Order`, `Preparing`, `Ready`, `Out For Delivery`, `Completed`.

## What I'll build

- **Global navigation** so every section is reachable: Home (floor plan), New Order, Tickets, Board, Settings. Rooms reached from a Tables / Rooms switch on the home screen. Same visual language as the current tab bar; works on mobile, tablet and desktop.
- **Home / floor plan route** with floor picker, status chips that actually filter, table cards, and tapping a table opens or resumes that table's order.
- **Rooms route** with the four room cards above; tapping an available room starts an order against it.
- **Order status board route** with the channel toggle and the five columns, populated from existing tickets by status, each column sortable.
- **Tickets screen additions**: the missing `Unpaid` and `Ordering` filter tabs and the Order Summary panel with Amount Due.
- **New Order menu access**: the `MENU` / `ORDER` tab pair and the footer `Custom Item` / `Menu` / `Server Connected` bar, so the menu is reachable from the order screen the way it is live.

## Technical notes

- New data in `src/lib/demo-data.ts`: `floors`, `floorTables` + `TableState`, `rooms`, `boardChannels`, `boardColumns`.
- New routes: `src/routes/floor.index.tsx`, `src/routes/rooms.index.tsx`, `src/routes/board.index.tsx`; `/` keeps the login screen.
- `src/lib/pos-store.tsx` gains table/room assignment on a ticket (`tableName`) plus selected floor state, so a table shows Ordering once an order is open on it.
- `BottomTabs` in `src/components/pos/shell.tsx` extends to the five destinations; new table/room cards go in `src/components/pos/primitives.tsx` to reuse the existing Card styling.
- Verified across mobile, tablet and desktop viewports before finishing.
