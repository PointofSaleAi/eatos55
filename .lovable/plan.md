# Parity with pos.eatos.net (portrait handheld)

I logged into the staging app in portrait, unlocked with the PIN pad, and walked every rail destination. Here is what the live app has that our build is still missing, and what I will add — styling stays exactly as it is today.

## What the live app does

- Navigation is a slim dark **icon rail down the left edge** on every screen (not bottom tabs). Top of the rail is the venue/revenue-center avatar; the icons in order are New Order, Floor Plan, Rooms, Tickets, Order Status; the bottom shows the eatOS mark with the version label.
- The **chevron handle at the top centre** pulls down a full clock/PIN overlay from anywhere in the app: 4 PIN dots, keypad with C / 0 / ENTER, then red **Clock Out**, light **Break**, green **Clock In**, then fingerprint, the revenue-center name ("Test Revenue Center") and face-ID buttons, with **LOG OUT** underneath.
- Floor plan header is the floor name as a dropdown (Ground Floor, M1) with All / Available / Ordering / Ordered / Reserved chips, and an empty state reading "No Tables Found".
- New Order has MENU / ORDER tabs and a **three-item footer**: Custom Item, Menu (highlighted), Server Connected (wifi). Empty menu shows "No Active Menu".
- Tickets has tabs All, Open, Closed, Paid, Unpaid, Ordering, a search field plus refresh and calendar icons, a right-hand **Order Summary** panel with "Amount Due" and, when empty, "Let's create an order" plus a "No Tickets Found" state.
- Order Status board has a DINE IN / ONLINE pill toggle, a calendar and clear button, live clock, and columns New, Preparing, Ready, Out For Delivery, Completed each with its own sort control.

## What I will build

1. **Left navigation rail** — new component used on every screen: collapsed icon strip that expands to show labels, venue avatar at top, eatOS + version at the bottom linking to Settings. Bottom tabs stay on phones so nothing regresses; the rail works on phone, tablet and desktop.
2. **Pull-down clock overlay** — extend the existing top account handle so it opens the staging clock pad: PIN dots, keypad with C/0/ENTER, Clock Out / Break / Clock In, fingerprint + revenue center + face ID row, and Log Out. Clock actions update session state and confirm with a toast; Log Out returns to the login screen.
3. **New Order footer trio** — Custom Item (opens the custom item keypad), Menu (opens the menu sheet), Server Connected status, shown above the review/charge bar.
4. **Copy and state parity** — empty states worded as in staging ("No Tables Found", "No Active Menu", "No Tickets Found", "Let's create an order"), tickets tabs extended with Open and Closed, and the board header gains the calendar/clear controls next to the live clock.

## Technical notes

- New `src/components/pos/nav-rail.tsx`, rendered inside `DeviceFrame` in `src/components/pos/shell.tsx` so every route gets it without touching each route file.
- `src/components/pos/account-bar.tsx` gains the clock-pad overlay, reusing `numpad.tsx` keys and the existing session/settings fields in `src/lib/pos-store.tsx` (adds `clockState` for in/out/break).
- Tabs and empty-state copy edits in `src/components/pos/tickets-screen.tsx`, `src/routes/floor.index.tsx`, `src/routes/order.new.tsx`, `src/routes/board.index.tsx`.
- All layout added with existing tokens and responsive classes; verified at phone, tablet and desktop widths.
