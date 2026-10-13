# Ordering / Ordered tables always open their tickets

## Why it still goes to New Order
The earlier fix only opens the Tickets screen when the table already has a saved ticket. Tables marked Ordering or Ordered with no fired/charged ticket yet (for example a table set by status, or one where an order was started but not fired) fall back to New Order.

## Change
- Tapping any Ordering or Ordered table always opens the Tickets screen filtered to that table (merged tables include all members).
- If the table has no tickets yet, the list shows a "No tickets for Table X yet" empty state with the existing New Order button beside the table chip, so staff choose to start an order rather than being sent there automatically.
- The table filter ignores the day/tab scoping so every open check for that table shows, paid ones after open ones.
- Available / Reserved tables keep the guest-count flow. Works on phone, tablet and desktop.

## Technical details
- `src/routes/floor.index.tsx` `openTable`: remove the `tableTickets(...).length > 0` condition and the `startOrder` + `/order/new` fallback for occupied states.
- `src/components/pos/tickets-screen.tsx`: when `table` param is set, filter from all tickets (not the date-scoped `baseList`) and render a table-specific empty state.
- Verify with Playwright at 390, 1073 and 1280 widths: tables with and without tickets.
