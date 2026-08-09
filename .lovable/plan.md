# Cleaner date picker + real ticket search

## What's wrong today
The tickets header only lets you step one day at a time or pick a single day from a calendar, and search only matches order/ticket numbers. There is no way to look at a week, a month, or a custom range, and no way to search by guest, employee, order type or transaction.

## What to build

### 1. Date range control (replaces the single-day stepper)
One pill in the header showing the active period (e.g. "Today", "This week", "1–31 Aug 2026"). Tapping it opens a sheet with:
- Quick presets: Today, Yesterday, This week, Last 7 days, This month, Last month, Custom range.
- Custom range: a range calendar (two-tap start/end) with Apply / Clear.
- Prev / next chevrons stay, and step by the active period size (day / week / month).

Selected period is shown as a small pill under the title with a clear (x) when it isn't "Today".

### 2. Smarter search
Search dock gains scoped matching plus a scope chip row (All, Order No, Transaction, Guest, Employee, Order type):
- Order No / check number / ticket number (partial match, up to 5 digits)
- Transaction / payment reference
- Guest name, guest email, phone
- Employee (server) name
- Order type (Dine In, Take Away, Delivery, Drive Thru, Bar)

Results show a "N results in <period>" line, plus a "Search all dates" toggle so a number found outside the current period isn't hidden. Recent searches are remembered for the session.

### 3. Header clean-up
Collapse the current three bands into two: title + actions on row one; period pill + facet icons on row two, in one horizontally scrolling strip. Active filters/period render as removable chips so state is obvious at a glance. Same layout scales for tablet and desktop (facets inline, no scroll strip).

## Technical notes
- `src/lib/pos-store.tsx`: replace `ticketDate` with `ticketRange { start, end, preset }` (keeping a `ticketDate` getter for existing callers such as new-order creation), extend `shiftTicketDate` to shift by preset size, add `searchScope` state, and broaden the `visibleTickets` search predicate to cover orderNo, checkNumber, payment reference, server, guest name/email, and order type.
- `src/components/pos/tickets-screen.tsx`: new `DateRangeSheet` component (shadcn Calendar in `mode="range"`, `pointer-events-auto`), preset list, period pill, chip row, restructured header.
- `src/components/pos/search-dock.tsx`: add optional scope chips and a result-count slot; keeps keyboard-aware anchoring.
- `src/lib/demo-data.ts`: add a payment/transaction reference and guest name to demo tickets so search by transaction and guest returns real results.
- No backend changes; all data stays in the existing demo store.
