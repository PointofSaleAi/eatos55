# Table Order: tap a table to see its tickets

## Goal

On the Table Order (floor plan) screen, tapping a table that is Ordering or Ordered opens a sheet listing the tickets created for that table (fired or charged orders), including any already-paid tickets for that table. Tapping a ticket resumes that order; a New Order button starts a fresh order on the table. Available/reserved tables keep today's guest-count flow.

## Current state (verified)

- `src/routes/floor.index.tsx` — `openTable` (line ~276) sends every occupied table straight into `startOrder` + `/order/new`; there is no per-table ticket view.
- `src/lib/demo-data.ts` — seeded tickets carry numeric `table` values (2, 4, 5, 22…) that do not match floor table names (`T1`, `EW104`, `P1`…), so nothing in the demo links a table to its tickets.
- `src/lib/pos-store.tsx` — `commitPayment` (~1582-1700) creates/updates tickets but never stamps the table; `startOrder` sets `activeTable`; close logic already treats `String(ticket.table)` as a floor table name, so string table names will make that existing code finally consistent.

## Changes

### 1. Link tickets to tables (data)

- Change `Ticket.table?: number` to `table?: string` in `src/lib/demo-data.ts` and remap the seeded tickets to real floor table names so several occupied tables (e.g. a T-series table, a bar table, a patio table) each have 1-3 tickets in mixed statuses (ordering, ordered, paid).
- In `commitPayment` (both the update branch and the new-ticket branch), stamp `table: activeTable` when the order belongs to a table; updates preserve an existing table value.
- Add a `fireTicket` store action: Fire on the cart creates (or refreshes, if the resumed ticket already exists) a ticket for the current order with status `preparing`/`ordered` and the table stamped from `activeTable`. `src/components/pos/order-panel.tsx` Fire button calls it instead of the current toast-only stub. Save keeps its current behavior.

### 2. New tickets-for-table sheet

- New `src/components/pos/table-tickets-sheet.tsx` following the existing bottom-sheet conventions (`StatusSheet`/`GuestsSheet` shell: grabber, drag-to-close, outside tap/Escape cancel-only dismissal, no X control, `bg-surface`/`rounded-t-sheet` theming, all three layouts).
  - Header: table name (using `tableGroupLabel` for merged tables), seat count, current state.
  - Ticket rows: status pill, guest label, item count, total, time; rows for open tickets first, paid ones after.
  - Tapping a ticket: `openTicket(id)` + navigate to `/order/new` (resume the order).
  - "New Order" button at the bottom: `startOrder(table)` + navigate to `/order/new`.
  - Empty state ("No tickets yet") plus the New Order button, for occupied tables with no tickets.

### 3. Wire the floor plan

- In `src/routes/floor.index.tsx` `openTable`: for occupied states, look up tickets whose `table` matches the tapped table name (merge-group aware). If any exist, open the sheet instead of jumping to `/order/new`; if none, keep the current `startOrder` + navigate behavior. Available/reserved tables keep the `GuestsSheet` flow. Merging mode is untouched.
- Phone, tablet and desktop layouts all use the same sheet.

## Technical notes

- Matching rule: `String(ticket.table) === tableName` (merge members included via the group's members list).
- Ticket status pill and formatting reuse `statusMeta`/`TicketCard`-style tokens from `src/components/pos/primitives.tsx`; no new colors — semantic tokens only.
- Keyboard/Escape and drag-down dismiss return without committing anything.

## Verification

- Playwright across phone (390px), tablet (900px) and desktop (1280px): tap an Ordering/Ordered table with seeded tickets → sheet lists them with correct totals/status; tap a ticket → order resumes in New Order with the ticket's items; New Order button → fresh order on that table; available/reserved tables still open the guest sheet; no console errors; clean build.
