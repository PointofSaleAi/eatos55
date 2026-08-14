# Redesign: Payment Method, Room Charge, Split Payments

Answering the question first, then a build plan. Rooms should indeed be its own popup rather than a panel that pushes the payment grid off-screen. Nothing here changes pricing or business logic, only presentation and the room-charge flow.

## How I'd redesign the three screens

### 1. Payment Method
Today it is a stacked list with a 4-across icon strip pinned to the bottom, and the order recap scrolls above it. The live app treats it as a two-pane surface: receipt on the left, tender grid on the right, one big primary action at the bottom.

Redesign:
- Two-pane on tablet/desktop: left = receipt card (order number, order type, ordered-at time, ticket no., seat no., zig-zag torn edge, totals, line items), right = tender grid.
- Tender grid becomes labelled tiles with icon + name (not tiny circles): Cash, External CC, Split Check, Room Charge, Manual Card, Manual CC, Account, Gift Card, Loyalty, In-kind, plus brand tiles (Uber Eats, Doordash, Grubhub, Blizzful).
- A `Total Due` header line at the top, amount in the accent colour.
- Selected tile gets a clear selected ring; the bottom action reads the tender ("Charge $15.36", "Print Bill" for room charge).
- Mobile portrait: single column, receipt collapses to a summary row that expands, tender tiles as a 2-up grid, action stays pinned above the tab bar.

### 2. Room Charge as its own popup
- Picking `Room Charge` opens a dedicated dialog (sheet on phone, centred dialog on tablet/desktop) instead of injecting a "Select Room" section into the page.
- Contents: search by room number or guest name, an "All floors" filter, a booking strip (booking no., stay dates, remaining credit) for the selected room, and a horizontally scrolling row of room cards (room name/number + guest name).
- Selecting a room reveals the stay detail block currently squeezed into the receipt: Room type, bed type, max adults/children, occupancy, stay period, credit limit / used, meal entitlements checklist, food allowance per day, alcohol allowed, and free-text entitlements.
- Confirm action is `Charge to room`, which returns to the payment screen with Room Charge applied; `Print Bill` stays the bottom action on the payment screen.
- Disabled state: rooms with no credit left or no active booking are dimmed and non-selectable with a reason line.

### 3. Split Payments
- Header row of three mode tiles with icons: Standard Check, Split Evenly, Split Custom, plus a minus/count/plus stepper on the right (up to 10).
- Child checks render as receipt cards in a wrapping grid, each with a torn top edge, a large ghost number watermark, a remove (x) badge, and Total / Sub Total / Tax / Service Charge / Discount rows above the item lines with fractional quantities (`1/8 ea`).
- Left column keeps the parent check: check number, guests, arrived-at, table, totals and item list with per-check assignment chips (custom mode).
- Footer: discount, void, print icons on the left, save and PAY on the right.
- Phone: mode tiles become a segmented control, child checks a single-column swipeable stack, footer collapses to icon row + PAY.

## Technical notes

- New `src/components/pos/room-charge-dialog.tsx`, built on the existing sheet/dialog primitives so it is a sheet under 768px and a centred dialog above.
- Room stay data (booking no., dates, credit limit/used, room+bed type, occupancy, entitlements, allowances) added to `rooms` in `src/lib/floor-data.ts`.
- `src/routes/payment.method.tsx` reworked into receipt pane + tender grid using `SplitPane`; tender list extended with the live tender set and brand tiles.
- `src/routes/payment.split.tsx` restyled to receipt cards (torn edge + watermark) reusing the existing breakdown maths; no changes to split calculation.
- Room Charge state (selected room, booking) added to `src/lib/pos-store.tsx` alongside the existing tender state.
- Room Charge tile only shown when the room-service module is on, matching the Floor Plan rule.
- Verified at 320, 393, 768 and desktop widths, portrait and landscape.

## On the next 14 screenshots

Send them in and I will map each screen's content before building, same as the earlier waves. I will hold implementation of the above until you confirm, so the redesign and the new screens land consistently.
