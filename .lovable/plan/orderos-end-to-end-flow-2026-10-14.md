# orderOS end-to-end flow

The recording is the reference for behaviour. Styling stays in our existing black-and-white eatOS look, so no Grubhub-style colours. Tapping a ticket stays inside orderOS and never opens the Tickets page.

## Board (Online channel)
- Columns: New Order, Preparing, Ready, Out for Delivery, Completed, each with a count badge and a sort toggle.
- Card: type (Delivery / Pick Up / Curbside), a text label for the source (Grubhub, Uber Eats, DoorDash; the logos are not used), guest name, order #, item count, ordered/arrived time and a live timer. The status strip changes by column (Preparing countdown, Ready, Out for Delivery, Completed).
- New Order cards show Cancel and Accept. The timer turns from neutral to warning to urgent the longer an order waits, using theme tokens.
- Tapping a New Order card expands it in place. It shows total due, items with modifiers (removed modifiers struck through), a "Ready at" time stepper (‹ 10:31 AM ›), Connect Printer, Cancel / Report and Accept Order.

## Order detail (any other column)
- Tapping a card turns the board into a split view. The tapped column stays as a list on the left (selected card highlighted, others dimmed). The detail on the right shows the guest name, phone, address, order summary, the "Add utensils" toggle, item notes, the payment summary (Sub Total, Discount, Delivery Fee, Service Charge, Tax, Tip, Total Due), Order Number / Ready At tiles and a Connect Printer row.
- Primary action depends on status:
  - Preparing: Make Order Ready
  - Ready (Pick Up): Ready for Pick Up
  - Ready (Delivery): Out for Delivery
  - Out for Delivery: Mark Delivered
  - Scheduled: Active Order
- Each action moves the order to the next column with a confirmation notice. Closing the detail, or tapping outside it, goes back to the full board.
- Full detail for a new order offers Confirm Order, Cancel Order and Report An Issue.

## Report an Issue
- A list of items you can tap. Each item expands to Temporary Unavailable / Permanent Unavailable.
- The Adjust button turns on only once an item is marked. Back returns to the order. Adjust updates the order and shows a notice.

## Cancel
- Cancel asks for confirmation with a reason. The order moves to a Cancelled list, where items are struck through and the header shows REFUNDED.

## Header controls
- Scheduled (calendar with badge): a full-width list of scheduled orders (order #, arrival time, guest, scheduled time, Curbside, item count, source). Tapping one opens its detail with a "Scheduled At" tile and Active Order, which moves it to New Order.
- Cancelled (circle-x): opens the Cancelled list.
- Prep Time: a stepper that changes the default prep time (for example "+ Prep Time 10:00 MIN").
- Auto Accept Order toggle: new orders go straight to Preparing.
- Pause Order toggle: stops new incoming orders, with a paused banner.
- A live clock in the center.

## Dine In channel
- Columns: New Order, Preparing, Completed, Cancelled.
- Cards show PAID / UNPAID / REFUNDED, plus Cancel / Accept on new orders.
- The same tap-to-detail flow, and none of it routes to Tickets.

## Responsive
- Desktop / landscape tablet: five columns, plus the split detail view.
- Portrait tablet: columns scroll sideways, and the detail opens as a full-height panel.
- Phone: one column at a time with status tabs. Detail and Report open full screen. Back always returns to the board.

## Technical details
- New `src/lib/orderos-store.tsx` (shared context through pinnedContext) holds online/dine-in orders, status transitions, prep time, auto-accept, pause, scheduled and cancelled orders. Mock data goes in `src/lib/orderos-data.ts`, with varied orders across every column.
- `src/routes/board.index.tsx` is rebuilt using components in `src/components/pos/orderos/` (board, card, expanded card, detail panel, report issue, scheduled list, cancelled list).
- All dismissals are cancel-only, with no outside-corner X. This is demo state only: printers and refunds are not real.
- `AGENTS.md` gets a rule that orderOS owns its own order lifecycle and never routes to Tickets. `roadmap.md` gets this task.
