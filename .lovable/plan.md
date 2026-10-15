# Restructure ticket cards in landscape only

## Layout
Use your latest screenshot as the structure reference, retaining the POS’s existing colours, typography and card styling.

Restructure each landscape ticket summary into four aligned areas:
- **Left badge:** order number above the check number, in a tall compact badge.
- **Guest information:** guest name and table reference on the first line; order-type icon, order type, arrival time and elapsed timer on the second; revenue centre on the third.
- **Middle:** employee name above the payment method or unpaid state.
- **Right:** status above the total, with tips underneath, all right-aligned.

Give every card consistent column positions and compact spacing so the list is easy to scan. Use the ticket’s actual values rather than copying sample names, amounts or `000` from the reference.

## Scope and interactions
- Apply this structure only to the Tickets list in tablet/desktop landscape, including the table-filtered Tickets list.
- Leave phone and portrait ticket cards unchanged.
- Keep existing card expansion, ticket-opening and swipe-to-void behaviour; retain access to the additional expanded information.
- Do not change the page header, navigation, right-side order content, payment logic or orderOS. The screenshot’s extra action buttons are not part of this card-layout change.

## Technical approach
- Add an explicit landscape presentation option to `TicketCard` in `src/components/pos/primitives.tsx`, enabled by `TicketsScreen` only for wide landscape viewports.
- Use a constrained grid with flexible guest information and stable badge, employee and amount columns; adapt spacing to the actual list width, not just the whole screen width.
- Preserve the existing portrait markup and default presentation for other consumers of `TicketCard`.

## Verification
- Check the supplied 1141×742 landscape size, tablet landscape and larger desktop widths, including expanded/collapsed rail widths.
- Confirm names, arrival times, employee/payment and totals do not overlap, and card columns align between tickets.
- Verify opening a ticket, expanding its details and swipe-to-void still work.
- Check phone and portrait tablet layouts remain unchanged and confirm the app has no new errors.