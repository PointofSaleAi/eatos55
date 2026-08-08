# Wave 2 — 10 screens to exact content parity

Screens 21, 22, 30, 31, 32, 33, 40, 43, 44, 45. Existing imported design language stays; content, copy, controls and layout come from the uploads. All work responsive across mobile, tablet and desktop (device-framed).

## Tickets (30, 31, 32, 33)

Rebuild `tickets.index.tsx` header to match upload 30:
- Title row: "Tickets" with sort and filter icon buttons on the right (no avatar/bell/shield cluster).
- Second row: date stepper — left/right chevrons around a calendar icon and "31 Jul 2026" — plus a square outlined search button on the right.
- Status chips: All, Ordering, Payment Progress, Ready (horizontally scrollable, first chip solid black).
- Ticket rows: left tile with guest count and a table glyph; "Guest  $11.00"; second line "Arrived At: 4:34 PM" followed by status — PREPARING in uppercase amber, Paid in green.
- Round dark floating "new ticket" button above the bottom tabs; bottom tabs Tickets / Orders / Settings unchanged.

Sort (31) becomes an anchored dropdown over the list rather than a full page: Time Late → Early, Time Early → Late, Orders Z → A, Orders A → Z, each with a leading icon; active option gets a green tinted row with green border. Wired to the existing sort state.

Filters (32) becomes a bottom sheet titled "Filters" with four rows — Revenue Center, Employee, Order Type, Payment — each with a rounded grey icon tile, alternating row shading, tapping opens the existing per-facet options.

Search (33) replaces the date row in place: full-width outlined input "Search by order number..." with an X to clear and return to the date row. Chips and list stay visible and filter live.

Existing `/tickets/sort`, `/tickets/filter`, `/tickets/search` routes stay valid and render the same overlays so links keep working.

## Order screen (21, 22)

Custom Item (21) becomes a sheet over the order screen: same guest header (Guest Name, (XXX) XXX-XXXX, search, kebab) with the right button reading "Menu"; an outlined row showing "Item Name" and "$0.00"; keypad 1-9 in three columns with a tall back-arrow key spanning the first two rows, a red "C", "0", and a tall "+" key spanning the lower rows. "+" adds the line and returns to the order screen.

Menu sheet (22): tapping the "Barcode" selector opens a bottom sheet titled "Menu" listing "Barcode" (checkmark when active) and "Open Price Items", with the underlying screen dimmed.

## Order review (40)

Rebuild `order.review.tsx`: back chevron with "Guest" right-aligned, "Order Number 2" beneath, divider, "Arrived At 4:34 PM", then line rows as qty / name / price. Sub Total, Tax, bold Total. Footer: outlined ADD MORE ITEMS and outlined PRINT (printer icon) side by side, then a full-width dark "CHARGE $11.00".

## Payment (43, 44, 45)

- Select Payment Method (43): sheet with title and X close, "Total Due $11.00" panel with the amount in red, then circular icon tiles — Card (selected, dark filled), Cash, Loyalty (disabled/greyed), QR Code — labelled beneath.
- Pay by Cash (44): centred "Pay by Cash" with back chevron, grey amount display, quick tender grid (exact total, $1, $5, $10, $20, $50, $100) with the exact-total tile outlined, then keypad 1-9 / . / 0 / C, full-width dark "CHARGE $11.00".
- Pay by Card (45): same layout without the quick tender grid; charge commits and shows the existing approved/receipt step.

## Technical notes

- New shared pieces in `src/components/pos/`: a `Sheet`-based bottom sheet wrapper, a `DateStepper`, and a reusable `NumPad` supporting the two variants (order-entry with tall back/plus keys, payment with dot/C).
- `src/lib/demo-data.ts` gains the filter facet lists (revenue centers, employees, order types, payment types), sort option labels and the cash tender denominations; ticket status labels updated to PREPARING / Paid / Payment Progress wording.
- Sort keys extend to time-late/time-early/orders-Z-A/orders-A-Z in `pos-store.tsx`; existing filter/search state reused.
- No pink anywhere in content — black, white, greys, plus the amber/green/red status accents from the uploads.

After this wave lands I'll confirm and you can send the next 10, then the final 6.
