# Merged tables: unmerge, shared name, shared status, live capacity

Four fixes so a merged party behaves like one table everywhere.

## 1. Explicit Unmerge button in both views

- Grid view: the merged card's "MERGED · N SEATS" row gets a dedicated unmerge action next to it, so splitting takes one tap instead of opening the capacity dialog first.
- Layout view: the group readout under the halo gets the same unmerge control alongside the group label and status pill.
- Both ask for a quick confirm ("Split T1 + EW1 + T3 back into 3 tables?") before restoring the members and their own capacities, then show a short confirmation.
- The capacity dialog keeps its Unmerge action too.

## 2. Merged name shown in order and payment views

- When an order is running on a merged table, every place that prints the table name shows the merged label ("T1 + T2") instead of just the first member: the order panel guest line, the guest block, the payment method screen header and footer line, and the split payments header.
- Ticket rows and the ticket detail show the merged label when the ticket's table is part of a live merge, falling back to the plain table number otherwise.

## 3. Status changes apply to every member

- Picking a status from a merged group's status sheet sets that status on all member tables, not just the first one, so leaving the floor screen or unmerging later leaves no member stuck on a stale state.
- The status sheet title uses the merged label, and the confirmation reads "T1 + T2 · Ordered".
- Setting a merged group back to Available clears the dwell timer for every member, matching current single-table behaviour.

## 4. Capacity edits reflect instantly in both views

- Saving a new capacity in the merged dialog updates the grid card count, the layout group readout and the seat dots straight away (no revisit or reload).
- Seat dots for the group are drawn from the edited capacity rather than the sum of the members, so a 25 seat override draws 25 dots across the group.
- The guests keypad cap follows the edited merged capacity.

## Responsive

Verified at phone portrait, tablet portrait/landscape and desktop: the extra unmerge control keeps 44px tap targets, the group readout stays clear of member shapes, and the merged label never truncates out of recognition in the grid card.

## Technical notes

- `src/lib/pos-store.tsx`: add a `tableGroupLabel(name)` helper derived from `tableMerges` for reuse outside the floor screen, and make `setTableState` accept the merged group so it fans out to every member (or add `setGroupState(members, state)` used by the floor screen).
- `src/routes/floor.index.tsx`: status handler resolves the tapped table to its merge and applies state to all members; grid card and capacity dialog gain the confirm-backed unmerge; group seats passed to `GuestsSheet`.
- `src/components/pos/floor-canvas.tsx`: `FloorGroup` gains an `onUnmerge` path; group readout renders the unmerge control; member seat dots use the group capacity when the group overrides it.
- `src/components/pos/order-panel.tsx`, `guest-block.tsx`, `split-payments.tsx`, `src/routes/payment.method.tsx`: swap raw `activeTable` for the group-aware label.
- Ticket views resolve the label through the same helper by matching the ticket's table number to merge members.
- No backend or data model changes; merges stay in the existing persisted local store.
