# Landscape Tickets layout

## Scope
Apply all changes only to the landscape Tickets view on tablets and desktop. Phone and portrait layouts, New Order, and orderOS remain unchanged.

## Changes
1. **Remove ticket expansion.** Remove the expandable detail section and the arrow beside the status on landscape ticket cards. Tapping anywhere on a card opens that ticket in the right pane instead of expanding it.
2. **Highlight the selected ticket.** Use the existing grey selected-row styling, never pink. Selection follows the ticket currently open in the right pane, including direct visits and switching between tickets. Keep the existing status colors and swipe-to-void behavior.
3. **Match the full New Order cart structure.** Replace the landscape right pane’s large Order Number heading and separate floating cards with New Order’s compact, top-to-bottom layout:
   - Guest/contact and arrival information at the top.
   - Order-type information in the same horizontal-row placement as New Order.
   - Order/check number, employee, status and applicable room information arranged within the compact header.
   - A dense, independently scrolling receipt-style item list, preserving quantities, modifiers and notes.
   - Existing payment details remain accessible within the body.
   - Subtotal, tax, tips and total anchored above a compact bottom action area.
4. **Preserve ticket behavior.** Keep Add Tip, Print Receipt, Close, Cancel Order, Take Payment and room-specific actions as applicable. Match their placement and shape to New Order without adding New Order’s Save/Fire/Charge behavior or making previously read-only ticket fields editable.

## Technical approach
- Update the landscape branch of `TicketCard` in `src/components/pos/primitives.tsx`; retain the default branch’s expansion behavior and suppress expanded content whenever landscape is active.
- Pass the selected ticket ID from the current route through `TicketsScreen`, rather than using the active order draft as the selection source.
- Add a landscape presentation for `src/routes/tickets.$ticketId.tsx` aligned with `OrderPanel`’s layout and styling. Render from the selected ticket, not the global New Order cart, and keep existing action handlers and calculations.
- Give the right pane enough width for its full header while retaining readable guest, employee and amount columns in the left list.

## Verification
- Check landscape at 1141×742, 1024×768 and desktop sizes, including an expanded left rail.
- Open paid and unpaid tickets, switch between cards, and confirm the selected highlight tracks the visible ticket with no expansion arrow or duplicate details section.
- Confirm long item names, modifiers, totals and bottom actions fit without overlap; verify payment details and tip actions, plus cancel-only dismissal of void/cancel confirmations.
- Confirm phone and portrait ticket layouts retain their current appearance and expansion behavior; rotate between orientations and check that landscape never shows an expanded section.