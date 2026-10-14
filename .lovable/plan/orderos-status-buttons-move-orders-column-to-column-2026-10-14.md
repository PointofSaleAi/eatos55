# orderOS status buttons: move orders column to column

## What you'll get
- **Accept** on a New Order card, or **Accept Order** on an expanded card, moves the order to **Preparing**. It shows a notice and starts the prep countdown.
- Opening an order shows one main button for its current status. Tapping it moves the order to the next column:
  - Preparing: **Make Order Ready**, which moves it to Ready
  - Ready (Delivery): **Out for Delivery**, which moves it to Out for Delivery
  - Ready (Pick Up / Curbside): **Ready for Pick Up**, which moves it to Completed
  - Out for Delivery: **Mark Delivered**, which moves it to Completed
  - Completed: no button, just a "Completed" label
- After each tap, the order detail stays open on the same order and shows its new status. The left list switches to the new column with the order highlighted, so you can keep tapping through to Completed. Closing the detail or tapping outside it goes back to the board.
- **Dine In**: there is no Ready column, so Preparing shows **Mark Served**, which moves the order straight to Completed. Right now dine-in orders vanish into a hidden Ready state.
- **Phone**: the status tab follows the order to its new column.

## Technical details
- `orderos-store.tsx` `advance`: dine-in preparing goes to completed; online orders keep preparing → ready → delivery/completed.
- `orderos-board.tsx`: update `actionLabel` (dine-in preparing = "Mark Served"; completed/cancelled = null). `doAdvance` keeps `selected` instead of calling `close()`, and sets `phoneCol` to the new status. `doAccept` from the detail does the same. The detail renders the action only when a label exists.
- Check the full flow with Playwright on phone, tablet and desktop, for both online and dine-in.
