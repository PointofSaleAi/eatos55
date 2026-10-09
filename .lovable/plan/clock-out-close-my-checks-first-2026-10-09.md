# Clock Out: close my checks first

## What changes
After entering a PIN and tapping **Clock Out**, if the signed-in server still has checks assigned to them, a full "Close your checks" screen opens instead of clocking out right away. Clock out only finishes once both lists are empty. With no checks, Clock Out works as today.

## Screen layout (our theme, all devices)
- Header: back arrow, title "Close checks to clock out", count of remaining checks.
- Two tabs: **Unpaid** (status not paid: ordering, preparing, ready, payment) and **Open** (paid but not closed — waiting for tip / close).
- Each row: checkbox, order #, guest/table, time, total, and a status chip (replaced by the tip amount once a tip is added).
- Sticky action bar at the bottom changes with selection.
- Phone: single column, action bar above bottom nav. Tablet/desktop: centered list with max width, same action bar.
- Disabled **Clock Out** button at the bottom becomes active once nothing is left.

## Unpaid tab actions
- 1 selected: **Charge** and **Transfer**.
  - Charge opens that ticket in the payment screen; after payment it returns here and the check moves to Open.
  - Transfer opens a popover listing other employees; picking one reassigns the check(s) and removes them from my list.
- 2+ selected: **Transfer** only.

## Open tab actions
- 1 selected, no tip: **Add Tip** and **Close Check**. Add Tip opens an inline number pad under the row; Add saves the tip, the row shows the tip amount in place of the status.
- 1 selected with tip: **Close Check** only.
- 2+ selected: **Close Check** only.
- Close Check marks checks closed and removes them from the list.

## Technical details
- Store (`pos-store.tsx`): add `closed?: boolean` and `server` reassignment on tickets; actions `transferTickets(ids, employee)`, `addTicketTip(id, amount)`, `closeTickets(ids)`; selector for my unpaid / open checks by `session.name`.
- Demo employee list added to `demo-data.ts` for the transfer popover.
- New route `src/routes/access.clock-out.tsx` with its own head(); `access.clock-in.tsx` onClockOut navigates there when checks remain, otherwise calls `clockOut`.
- Reuse `NumPad` (plain variant) for inline tip entry, shared Popover for transfer, existing payment route via `openTicket` + `/payment/method` with a return flag back to clock-out.
- Seed demo tickets so the current server has a couple of unpaid and open checks to test.
