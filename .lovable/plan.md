# Slimmer tickets header, collapsed ticket cards

## 1. Reclaim the top of the screen

Right now the header stacks five separate bands (account bar, title, date + search, facet icons, status chips, Amount Due) which eats over half the viewport before the first ticket. It becomes two compact bands:

- **Band 1 (title row):** burger, `Tickets`, then the date stepper collapses into a single compact date chip (`31 Jul 2026` with the calendar icon, still tappable for the picker, chevrons kept as small 32px hit areas), plus search, sort and filter as 36px icon buttons on the right.
- **Band 2 (chips row):** the status chips stay as the one scrollable row, with `Amount Due` moved inline to the right of that row instead of taking its own bordered band.
- **Facet icons** move behind the existing filter button: they no longer occupy a permanent row. A single filter icon shows a count dot when any facet is active; the Filters sheet keeps all facets, and the sync/my-tickets toggles move into that sheet's top row. Nothing loses functionality.
- Vertical padding drops from `py-3` bands to a tighter rhythm; tap targets stay >=44px via padded hit areas even where the visual icon is smaller.

Net effect on a 393x728 phone: first ticket visible near the top instead of below the fold.

## 2. Tickets collapsed by default

`TicketCard` gets a collapsed and an expanded state:

- **Collapsed (default):** one line — table badge + number, guest name, live timer, total, status. Fixed compact height, no data grid.
- **Tap the row** to expand in place, revealing the full labelled grid (Check, Tips, Order No, Arrived At, Date, Employee, Revenue Center, Order Type, Payment Type) with a chevron that rotates.
- **Opening the ticket detail** moves to an explicit affordance so tapping no longer navigates by accident: the chevron/row toggles, and a `View` chevron button on the right of the expanded card (plus tapping the order badge) navigates to `/tickets/$ticketId`.
- Expansion state is per-card local state, so the list starts fully collapsed on every visit. Swipe-to-void keeps working.

## 3. Responsive

- Phone: collapsed row is a single line with truncation at 320px; expanded grid is 2 columns.
- Tablet/desktop widths: same collapsed row, expanded grid promotes to 4/6 columns via the existing container queries.

## Technical notes

- `src/components/pos/primitives.tsx`: `TicketCard` becomes a collapsible card (local `open` state, `aria-expanded`, chevron), collapsed summary line + existing `Cell` grid behind the toggle.
- `src/components/pos/tickets-screen.tsx`: merge the title/date/search rows, drop the standalone facet icon row, move sync + my-tickets into the Filters sheet, inline `Amount Due` with the chips row, add an active-filter dot on the filter button.
- Verify at 320, 393, 430, 834, 1280.
