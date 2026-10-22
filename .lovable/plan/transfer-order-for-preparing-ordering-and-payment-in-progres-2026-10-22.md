# Transfer Order for Preparing, Ordering and Payment in Progress tickets

Based on the recording: a transfer arrow on each eligible ticket card opens a flow that moves selected products to another check, a new order, or a table — or moves the whole check to a different table.

## Where it appears
- A small transfer arrow at the right edge of every ticket card (and in the ticket detail options) for **Being Prepared, Ordering and Payment in Progress** tickets only. Paid, Ready, Closed and Cancelled tickets don't show it.
- The existing employee "Transfer Check" (change owner) stays as it is, renamed **Transfer Owner** so the two don't get mixed up.

## Flow (matching the video)

```text
Tap transfer arrow
  └─ Table ticket?  -> "Confirm Transfer" choice: [Table (all products)] [Select Product]
       Table          -> Transfer Table picker (floor dropdown, All tab, table tiles with seats
                          and status) -> Confirm -> "Table Transferred: Order moved from B4 to LG3" [OK]
  └─ Select Product (or non-table ticket) -> Transfer Check
       - source ticket card at top
       - Select Products list (qty, name, price), tap to select (green outline), Select All / Unselect All
       - Only fired products are listed; if none: "Only fired products can be transferred"
       - [Transfer to order]  [Transfer to table]
       - Nothing selected -> toast "Please select at least one product to transfer"

  Transfer to order -> Select Target Check
       - tabs: All n / Ordering n / Ordered n / Preparing n
       - "+ Transfer to New Order" row, then eligible tickets (not the source)
       - [Back] [Confirm Transfer]
     -> Transfer Products review: From card, "N products transferring" chips + amount, arrow, To card
       - [Cancel] [Confirm Transfer]
     -> "Products Transferred: From Order #3 to Order #5 on Table LG1 · 1x Brioche ..." [OK]

  Transfer to table -> Select Table picker (floor dropdown, table tiles)
       - table with an open check: products join that check
       - available table: a new order is created on that table
     -> toast "Products transferred successfully"
```

## What changes after a transfer
- Products move from the source to the target; both totals recalculate.
- Each affected ticket card gets a dark banner on top: "Transferred 4 product(s) from Order 2 (Cafe)" / "Transferred 4 product(s) to Order 3 · Table B4 (Cafe)".
- The ticket detail shows the same note above its items; the source lists the moved products struck through (greyed) under "Transferred N product(s) to Order …".
- If every product leaves the source, it becomes **Cancelled** with $0.00.
- Transfer to New Order creates a new ticket (next order number, same guest/server, status Being Prepared) and selects it.
- Table transfer updates the ticket's table and the floor table statuses (old table freed, new one occupied).
- A ticket owned by another server shows "You are not the owner of this ticket. This ticket is transferred to another employee" when its actions are used (as in the video).

## Layout
- Dialogs centered on tablet/desktop (as in the video); bottom sheets on phone. Table pickers fill the screen on all sizes. Tapping outside closes without transferring; no outside-corner X.

## Technical details
- `src/lib/demo-data.ts`: add `transferNotes?: { dir: "from" | "to"; count: number; order: number; table?: string; lines?: {name; price; qty}[] }[]` to `Ticket`.
- `src/lib/pos-store.tsx`: new actions `transferProducts(sourceId, lineIds, target: { ticketId } | { newOrder: true } | { tableId })` and `transferTable(ticketId, tableId)`; reuse `nextTicketNumber()`; source with no lines -> cancelled; update floor table occupancy.
- New `src/lib/ticket-transfer.ts` with pure helpers (eligible statuses, eligible targets, fired-only lines, move lines) + `ticket-transfer.test.ts` covering: only preparing/ordering/payment eligible, totals after move, empty source becomes cancelled, new-order numbering.
- New `src/components/pos/transfer-order/` dialogs: confirm choice, product select, target check, review, table picker, result; table picker reuses floor data.
- `src/components/pos/tickets-screen.tsx` card: transfer arrow + transfer banner; `src/routes/tickets.$ticketId.tsx`: entry point, banner and struck-through moved lines; rename existing owner dialog label.
- Verify in browser at phone, tablet and desktop: products to existing check, to new order, to table, whole-table transfer.
