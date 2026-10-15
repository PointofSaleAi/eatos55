# After-Close ticket flow (Close → Completed → Refund)

Based on the recording: closing a paid ticket keeps it in the list as Completed; the paid payment row can then be swiped to reveal Refund, which asks for a reason and turns the ticket into Refunded.

## Flow
1. **Close** (paid ticket): toast "Order closed successfully"; ticket stays selected/open (no jump back to the list), card status reads **Completed**, timer stops. Cart shows totals plus a **PAID** payment row (date/time, Cash Payment, amount). Close button is replaced by Print only (and Add Tip hidden).
2. **Swipe left on the PAID row** (or tap it) reveals a destructive **Refund** button, matching the existing swipe-to-archive pattern.
3. **Select a Reason Code** dialog: QSA, Food Cold, Prepared Incorrectly, Long Wait, Out of Stock, Other. Single-select radios; Other reveals an "Enter the reason" field. **Done** disabled until a reason (and text for Other) is set. Tapping outside cancels without refunding (no corner X, per our rule).
4. **Done**: ticket becomes **Refunded** (card label in destructive red, timer 00:00). Every item shows struck-through in red with "└ REFUND · {reason}" beneath. Payments list shows **REFUNDED** (original, struck label) and a new **REFUND** row (date/time, reason, −$amount). Toast: "Refund recorded" + demo printer notice. Refund cannot be repeated.
5. Status chips/filters: Completed counts under Paid; Refunded appears under Paid with its own label; card colours use our grey/semantic tokens (green accent → our success token, red → destructive). Works on phone, portrait tablet and landscape.

Demo only — no real money moves or prints.

## Technical
- `demo-data.ts`: add `"completed" | "refunded"` handling (or `closedAt`, `refund: {reason, at, amount}` on Ticket); `pos-store` gets `closeTicket(id)` and `refundTicket(id, reason)`.
- `tickets.$ticketId.tsx`: Close calls closeTicket and stays; new payment-row component with swipe reveal; new `RefundReasonDialog` (shared Dialog); refunded item styling in both landscape and portrait branches.
- `primitives.tsx` TicketCard + `tickets-screen.tsx` status labels/chip counts.
- Record rule in `src/components/pos/AGENTS.md`; roadmap entry.
