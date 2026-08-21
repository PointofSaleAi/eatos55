# Floor Plan: Tidy Up, Matching Counts, Status and Seated Guests

## 1. Tidy Up button (arrange everything in an orderly fashion)

Add "Tidy up" to the editor toolbar next to Reset. It keeps every object but snaps the plan into a neat arrangement:

- Zones stay where they are, fixtures (bar, counter, wall, door) keep their place, bar chairs stay attached to the counter they belong to.
- Tables and booths are laid out on an even grid inside the free canvas area, ordered by section then name, with equal gaps and clear aisles.
- Everything snaps to the grid and rotation is straightened to 0 for tables.
- Confirmation step first, and nothing persists until SAVE, so Cancel still discards it.

## 2. Why the counts differ, and the fix

Right now the editor chip counts every object on the floor while the list only counts the ones in the selected section, and the two use different rules for what a chair is. That is why the editor reads Tables 22 / Chairs 71 while the list total differs.

Fix: one shared counting helper used by all three places (grid list, layout view, editor chip):

- Tables = tables and booths. Bar chairs are counted as seats, never as tables.
- Chairs = sum of the seat counts of tables, booths and bar chairs.
- The same section filter (All / B1 / B2) applies everywhere, so switching section changes both numbers consistently.
- A counts chip appears in the floor header for grid and layout view too, so the number is visible in every view.

## 3. Changing table status in the layout (design) view

Today status can only be changed on a table in layout view by right clicking, which is invisible and impossible on a touch screen. Changes:

- Tap a table: opens the order or the guest count, as now.
- Long press a table (and right click on desktop): opens the status sheet.
- A small colour dot on each table shape is itself a tap target that opens the status sheet directly, so there is a visible one-tap path on phone and tablet.
- The status sheet is the same one the grid view uses, so both views always agree.

## 4. Seeing how many guests are seated (inspired by OpenTable, not copied)

- Each table on the layout canvas gets a compact seated pill, for example "3/6", plus a timer chip when a party has been sitting for a while.
- Seat dots fill in for occupied seats and stay hollow for free seats, so occupancy reads at a glance from the shape alone.
- The floor header gains a live summary strip: Guests seated, Tables occupied, Free tables, and Free seats for the selected floor and section.
- Entering the guest count when a table is opened updates the seated number, the pill, the filled seat dots and the header summary immediately.

## Behaviour rules

- Works with no vertical scrolling on phone portrait, tablet portrait and landscape, and desktop.
- Grid, layout and editor read the same objects and the same counting helper, so they can never disagree.
- No em dashes in any copy.

## Technical notes

- `src/lib/floor-data.ts`: add `floorCounts(objects, section)` returning `{ tables, chairs, seated, occupied, freeTables, freeSeats }`, and `tidyLayout(objects)` for the arrange pass.
- `src/components/pos/floor-editor.tsx`: add the Tidy up toolbar item, route counts through `floorCounts`.
- `src/components/pos/floor-canvas.tsx`: extend `Seats` with a `filled` prop for occupied seats, add the seated pill, timer chip, status dot button and long-press handler.
- `src/routes/floor.index.tsx`: header counts chip and summary strip from `floorCounts`, pass `section` through, add the tidy confirm dialog, keep seated values live from the store rather than the seed rows.
- `src/lib/pos-store.tsx`: keep the guest count per table so seated numbers persist across views (extend the existing `tableSince` style state).
