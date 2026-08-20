# Match the reference placement: top bar, menu header, left rail

Our design language stays exactly as it is (tokens, type, pink accent, rounded cards). Only the *placement and order of data* changes to match the original screenshots.

## 1. Top bar

Current: switch-user, initials square, name, divider, role pill (role only), then badge / refresh / support / bell / wifi / clock.

Reference order, left to right:
- switch-user arrows
- round staff avatar (photo, initials as fallback)
- staff name, bold
- thin divider
- role pill containing stopwatch icon, role, and the clock-in time in brackets: `Prop Cook (04:57 AM)`
- flexible gap
- purple eatOS "e" badge, refresh, support headset, bell with unread dot, wifi, live clock `01 : 15 PM`
- pull-down handle centred and hanging from the bar

Change: put the clock-in time back into the role pill (it is currently only a tooltip), use a round avatar, and keep the rest of the order as-is.

## 2. Ordering screen header (New Order)

Reference layout, top to bottom:
1. Row 1: a boxed menu-list button on the far left (opens the navigation drawer), then the **menu group pills** (DINNER, BAR, BAKERY / BARISTA, DESSERTS, BRUNCH) laid out inline and wrapping onto a second line, with search and the 3-dot menu pinned to the right of that row. The current single "Menu" title plus the menu dropdown select is replaced by these pills.
2. Row 2: the **category buttons** as a wrapped multi-row grid (DINNER BEVERAGES, DINNER COCKTAILS, ... DINNER COURSE), not a one-line horizontally scrolling chip strip. Active category is highlighted.
3. Then the item tiles grid, unchanged.

Custom item stays reachable from the 3-dot menu so the right cluster is search + more, as in the reference.

## 3. Order panel (right side)

Reference order, which we mostly have but with a different arrangement:
- Guest Name, phone, `ARRIVED AT ...` on the left; the round icon cluster (discount, guests, receipt, no-tax, C, cash) on the right of that block
- order type segmented control with icons: DINE-IN / TAKEOUT / DELIVERY
- `ORDER# 43` on the left and the server name on the right
- Order Notes field
- item lines with modifiers indented underneath
- Sub Total, Tax, Total
- footer: small save icon button, then FIRE, then CHARGE as the widest button

Change: keep the guest block/icon cluster order, and make the footer save-icon + FIRE + CHARGE proportions match the reference.

## 4. Left navigation rail

Reference rail, top to bottom: venue/revenue-center round avatar, then a plain icon stack with the active item shown as a light filled cell (new order, floor plan, service bell/rooms, tickets, order status board), then the eatOS mark, then the two-line version label at the very bottom. No collapse toggle at the top, no "+" pill, no Manager Controls / Clock Out / Sign Out rows in the rail.

Change:
- venue avatar becomes the top item
- the "+" new order pill becomes the first icon in the stack (new order), matching the reference
- group titles and dividers are dropped in collapsed state; labels still appear when the rail is expanded
- eatOS mark plus version label move to the bottom, mark links to Settings
- Manager Controls, Clock Out and Sign Out move into the navigation drawer / pull-down pad, where they already exist
- the expand/collapse control moves to the first cell under the avatar so it does not sit above the brand

## Responsive

- Desktop and tablet landscape: rail plus the wrapped pill rows exactly as above.
- Tablet portrait: rail stays, menu group pills and category buttons wrap to more rows, order panel drops below the grid only if width is under the two-pane threshold.
- Phone portrait: rail is replaced by the drawer button, menu groups become a compact wrapping row, categories wrap in two rows, Menu/Order tab switch stays.
- No new scrollbars at 1440x950, 1155x713, 1024x768, 834x1112 and 393x852.

## Technical notes

- `src/components/pos/account-bar.tsx`: role pill text becomes `role (clockedInAt)`, avatar becomes round with photo support.
- `src/routes/order.new.tsx`: replace the `select` menu picker with a wrapping pill row, replace the scrolling chip strip with a wrapping category grid, move Custom Item into `MoreSheet`.
- `src/components/pos/order-panel.tsx`: footer button proportions and row order only.
- `src/components/pos/nav-rail.tsx`: reorder to avatar / icon stack / brand + version; move Manager Controls, Clock Out, Sign Out to `nav-drawer.tsx`.
- Presentation only: no store, pricing, or payment logic changes.
