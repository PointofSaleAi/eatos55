# Fix: order number not showing on Fire / Charge

## Root cause (confirmed in code)

- The cart header shows `Order# --` because it only looks up a number from an existing ticket (`activeTicketId`). A brand-new order has no ticket yet, so nothing shows until Fire.
- The payment screens don't use the real ticket number at all — they guess `tickets.length + 1`. For a fired or resumed check that guess is wrong (it shows the *next* number, not the check's number), and for a brand-new order it's only a coincidence when it matches.
- When a brand-new order is charged, the ticket is created but never linked back to the screen, so the number never appears before the cart resets.

## Fix

1. **One shared order-number rule** in the store: if the order already has a ticket (fired, resumed, or saved), use that ticket's number; otherwise reserve the next number (`tickets.length + 1`) so it shows from the moment items are added.
2. **Cart header** (`order-panel.tsx`): show the shared number instead of `--` for new orders.
3. **Payment screens** (`payment-bill.tsx`, `payment.method.tsx`): use the shared number instead of the `tickets.length + 1` guess, so a fired/resumed check shows its real number.
4. **Charge on a new order** (`commitPayment`): the created ticket keeps the same reserved number, so the number shown on the payment screen matches the ticket that gets created.

## Result

- New order: number appears as soon as items are added.
- Fire: same number stays on the created ticket.
- Charge: payment screen and receipt show the same number as the ticket.
- No change to existing ticket numbers or the Tickets page.

## Technical details

- Add a derived `currentOrderNumber` (or selector) in `src/lib/pos-store.tsx`: `activeTicketId ? tickets.find(...)?.number : tickets.length + 1`.
- Replace local `tickets.length + 1` computations in `src/components/pos/payment-bill.tsx` (:36) and `src/routes/payment.method.tsx` (:137) with the shared value.
- Replace `orderNumber ?? "--"` in `src/components/pos/order-panel.tsx` (:388, :463) with the shared value.
- `commitPayment` and `fireTicket` already assign `number: tickets.length + 1` on creation, which matches the reserved preview — no renumbering needed.
- Verify on phone, tablet and desktop: add items (number shows), Fire (same number on ticket), Charge (same number on payment screen and receipt).
