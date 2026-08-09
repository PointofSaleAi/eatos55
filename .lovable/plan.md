# Tap a table's status to change it

Right now the whole table tile starts an order, and the coloured status strip (AVAILABLE, ORDERING, ORDERED, RESERVED) is only a label. Make the status itself tappable so staff can set a table's state without placing an order.

## Behaviour

- The coloured status strip becomes its own button inside each table tile on the Floor Plan.
  - Tapping the top area (table number) still starts an order as today.
  - Tapping the status strip opens a status sheet instead.
- Status sheet: bottom sheet titled with the table name, showing radio-style rows for Available, Ordering, Ordered, Reserved, each with its colour dot and label, current one checked.
  - Selecting a status applies it immediately, closes the sheet, shows a short confirmation, and the tile + the status filter tabs update.
  - Closes on backdrop tap, swipe down, and the X — same as other sheets.
- Chosen statuses persist on the device like other table state, so a table stays Reserved after navigating away.
- Setting a table back to Available clears its "since" timer; setting Ordering/Ordered starts it from now.
- Rooms screen gets the same treatment on its Occupied/Available strip.

## Access

- Any signed-in user can change a status (no manager PIN), consistent with starting an order.

## Technical notes

- `src/lib/pos-store.tsx`: widen `tableStates` from `Record<string, "ordering">` to `Record<string, TableState>` and add `setTableState(name, state)`; keep it in the existing persisted state.
- New `src/components/pos/table-status-sheet.tsx` built from the existing sheet primitives (drag-close + X), matching `discount-sheet.tsx` row styling.
- `src/routes/floor.index.tsx`: split the tile into two buttons (nested buttons are invalid, so the strip is a sibling, not a child), wire the sheet, keep the status-tab filtering working off the new state.
- `src/routes/rooms.index.tsx`: same sheet for the room's occupied/available strip.
- Status labels keep an icon alongside colour so state never relies on colour alone; tap targets stay at least 44px.
- Verified at 320, 393, 768 and desktop widths, portrait and landscape.
