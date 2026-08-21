# Floor Editor: Compact Toolbar, Reset, and Matching Counts

## What changes

1. One tidy toolbar instead of a long pill strip
   - The palette row becomes a single compact toolbar: three dropdown menus, "Add seating", "Add fixture", "Add zone", each listing its items with the resulting default size and seat count.
   - Toolbar also holds: Template menu (moved in from the header), Reset, and a live count chip.
   - Toolbar never scrolls sideways: on phone it wraps into two rows of icon-plus-label buttons, on tablet and desktop it sits on one row.

2. Reset button
   - "Reset" restores the floor to its saved layout (what was there before this edit session). Long-press or a secondary item in the menu offers "Reset to default layout" which restores the original seeded tables for that floor.
   - Confirmation step before resetting so a full arrangement is never lost by accident.

3. Counts match the table list
   - A chip in the toolbar shows "Tables 22 - Chairs 96" for the floor being edited, using the same numbers the grid list shows.
   - Seat dots drawn around each table on the canvas equal that table's seat count, and the seats stepper is the single source of that number, so the layout, the canvas and the grid list can never disagree.
   - Newly added tables default to the seat count of the kind (Table 4, Booth 4, Bar Chair 1) and are counted immediately.
   - Editing seats in the inspector updates the chip live.

## Behaviour rules

- Grid view and layout view read the same objects, so any table added, renamed or resized in the editor appears in the list with identical name and seat count.
- Reset only affects the current floor, and only after SAVE is pressed does anything persist.
- Works with no vertical scrolling on phone portrait, tablet portrait and landscape, and desktop.
- No em dashes in any copy.

## Technical notes

- `src/components/pos/floor-editor.tsx`: replace `paletteGroups` pill row with a toolbar built from `DropdownMenu` (three grouped menus), plus Reset button and counts chip. Accept new props `onReset`, `onResetDefault`, and an optional `toolbarExtra` slot so the route can inject the Template menu.
- Seat dots: render `seats` dots around table/booth shapes in the editor canvas, matching `FloorCanvas`, driven by the same `o.seats` value.
- Counts: derive `tables` and `chairs` from the draft objects (`seatingKinds`), so the chip matches `floor.index.tsx` list totals.
- `src/routes/floor.index.tsx`: move the Template dropdown into the editor toolbar slot, pass `onReset` (re-clone `getFloorLayout(floor)`) and `onResetDefault` (`defaultFloorLayout(floor)`), and reuse the existing confirm dialog pattern for the reset prompt.
- No store or data model changes required.
