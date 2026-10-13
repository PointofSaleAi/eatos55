# Show the order number only after Fire or Charge

## Why "25" keeps showing
It isn't hard-coded. The demo already has 24 saved tickets, and every new order currently *previews* the next number (24 + 1 = 25) as soon as it opens. So every fresh order shows 25 until something is fired or paid.

## What will change
- **New order (nothing fired yet):** the cart header shows `Order# --` instead of a number.
- **After Fire:** the ticket gets its real number, and the cart header shows it (e.g. `Order# 25`). Firing again keeps the same number.
- **Charge on an unfired order:** the payment screens show the bill without an order/ticket number; the number is assigned when payment completes and appears on the receipt/success screen and in Tickets.
- **Resumed or already-fired checks:** keep showing their existing number everywhere (cart, payment, room charge).
- Cancel Order / starting a new order goes back to `Order# --`.
- Applies the same on phone, tablet and desktop.

## Technical details
- `src/lib/pos-store.tsx`: make `currentOrderNumber` `number | null` — the active ticket's `number` when an active ticket exists, otherwise `null`. Replace `tickets.length + 1` in `fireTicket` / `commitPayment` (and the other creation path) with a shared `nextTicketNumber()` = highest existing ticket number + 1, so numbers never collide.
- `src/components/pos/order-panel.tsx`: header renders `Order# --` when null.
- `src/components/pos/payment-bill.tsx`, `src/routes/payment.method.tsx`, `src/routes/payment.bill.tsx`: use `currentOrderNumber`; omit "Order #" / "Ticket No." text when null (drop the old `tickets.length + 1` in `payment.bill.tsx`).
- `src/components/pos/room-charge-dialog.tsx` / `room-bill-sheet.tsx`: accept a nullable number and hide the Order fact when null.
- Verify in the browser: new order shows `--`, Fire assigns 25, Charge on an unfired order assigns the number on completion, next new order shows `--` and then gets 26.
