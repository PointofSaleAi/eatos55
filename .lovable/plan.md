# Table Order: open the Tickets screen filtered to the tapped table

## What changes
- Tapping an Ordering / Ordered / Paid table on Table Order no longer opens the small ticket sheet. It opens the real Tickets screen (same list cards, expandable details, "View ticket", and the order detail pane on wide screens), showing only that table's tickets (merged tables include all members).
- A removable filter chip at the top of the list reads "Table T3 ×-style chip" (tap to clear), returning to all tickets.
- A "New Order" button sits beside the chip and starts a new order for that same table.
- If the table has no tickets, current behavior stays (goes straight to New Order).
- Works on phone, tablet and desktop using the existing Tickets layouts.

## Technical details
- Add optional `table` search param to the Tickets list route (validated string); filter tickets by `String(ticket.table)` matching the table or its merge members.
- `floor.index.tsx` `openTable`: navigate to Tickets with `search: { table }` instead of opening `TableTicketsSheet`; remove the sheet usage (delete `table-tickets-sheet.tsx` if unused).
- Filter chip clears the param via `search={(prev) => ({ ...prev, table: undefined })}`; New Order calls `startOrder(table)` then navigates to `/order/new`.
- Preserve the param when moving between the list and ticket detail routes so the filtered list stays on the left pane.
