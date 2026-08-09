# Richer tickets, tips, top filter icons, and the original PIN pad

## 1. Ticket rows show the real data

Today a row shows only seats, label, arrival time, total and status. The live app shows much more, so the row becomes a two-line data grid (same card styling, no new visual language):

- Line 1: order number badge with the table icon, status (colour-coded: Paid green, Ordering, Payment Progress, Ready, Preparing), guest name, **Timer** (live m:ss since arrival), **Check**, **Total**, **Tips**.
- Line 2: `Order No 1`, date, `Arrived At 3:18 PM`, employee name, **Revenue Center**, **Payment Type**.
- Phone: the labelled cells wrap into two compact columns; tablet/desktop: single row of labelled columns exactly like the wide screenshot. Nothing scrolls sideways on 320px.

Ticket data gains the missing fields: `checkNumber`, `tips`, `revenueCenter`, `paymentType`, `orderNumber` (already `number`), plus a live timer derived from arrival. Demo tickets get realistic values; paid tickets created at checkout record their payment type and tips.

## 2. Top icons for the extra functionality

The header keeps Sort and Filters, and adds the icon row from the live app, each opening the matching filter facet directly instead of going through the Filters sheet:

- Revenue Center, Calendar (date picker), Employee, Order Type, Check/Receipt, Payment.
- Active facets show a small count dot; tapping an active icon clears that facet.
- On phone the row sits under the title and scrolls only if needed; on tablet/desktop it sits inline with the title next to Search.

## 3. Ticket detail parity + Add Tip

The ticket detail screen is rebuilt to match the uploaded screens:

- Header: back chevron, `Order Number 1`, guest name and role on the right.
- `Arrived At …`, then item lines with quantity as `1.0`, item name, price, and modifiers listed underneath in blue (`- 16oz`).
- Sub Total / Tax / Total block.
- Payment card: timestamp + amount, `Paid` with an expand chevron that opens the transactions table (Transaction no. / Method / Amount) — collapsed and expanded states both supported.
- Footer: full-width **ADD TIP**, then a print button beside **CLOSE**.
- **ADD TIP** opens a tip sheet: percentage presets from the existing tip settings, custom amount via the keypad, No tip. The tip is saved on the ticket, shown in the Tips column, added to the ticket total and to the transactions row.

## 4. PIN pad rebuilt like the original

Both the pull-down clock pad and the Enter PIN sheet switch to the live app's keypad:

- Edge-to-edge key grid with hairline dividers, tall keys, light-grey gradient faces, large numerals.
- Row 4: red `C`, `0`, dark `ENTER`.
- Row 5: red `Clock Out`, white `Break`, green `Clock In`.
- Row 6: fingerprint, revenue center (`Main`), Face ID.
- Full-width outlined `LOG OUT` bar at the bottom.
- Masked entry strip with four large asterisks above the grid.
- Keys size to the viewport so 320–430 tall phones fit without scrolling; on tablet/desktop the pad is centred at a max width.

## Technical notes

- `src/lib/demo-data.ts`: extend `Ticket` (`checkNumber`, `tips`, `revenueCenter`, `paymentType`, `payments: {no, method, amount, at}[]`) and update the seeded tickets.
- `src/lib/pos-store.tsx`: `commitPayment` records `paymentType`/`payments`; new `addTip(ticketId, amount)`.
- `src/components/pos/primitives.tsx`: `TicketCard` becomes the responsive data grid with a live timer hook.
- `src/components/pos/tickets-screen.tsx`: facet icon row wired to `filters`, calendar popover for `ticketDate`.
- New `src/components/pos/tip-sheet.tsx`; rewrite `src/routes/tickets.$ticketId.tsx`.
- New shared `src/components/pos/pin-pad.tsx` used by `clock-pulldown.tsx` and `pin-sheet.tsx`.
- Verify at 320, 393, 430, 834 and 1280 widths.
