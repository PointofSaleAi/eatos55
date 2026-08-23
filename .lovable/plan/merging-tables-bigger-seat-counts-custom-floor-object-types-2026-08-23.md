# Merging tables, bigger seat counts, custom floor object types

Three related changes to the floor plan area.

## 1. Merge tables for big parties

New "Merge" mode on the floor screen (both grid and layout views):

- Tap MERGE in the floor header to enter selection mode, tap two or more tables, then confirm.
- Merged tables become one entity: a single card/shape group labelled from the members (for example "T1 + T2"), one status, one dwell timer, one guest count.
- Capacity defaults to the sum of the members' seats, and is editable: a seats stepper on the merged table lets a manager set the real number that fits (for example two four tops pushed together seat 6, not 8).
- Table status sheet for a merged table gains "Unmerge", which restores the original tables and their own capacities.
- Merge groups persist with the rest of the floor state, so any device with the same PIN sees them.
- Guest count entry (the guests keypad) is capped by the merged capacity, not the single table capacity.

## 2. Seat counts up to 25, and dots that keep drawing

- Seats stepper max goes from 20 to 25 (both the editor inspector and the guests keypad).
- Seat dots currently stop at 8 because the drawing helper hard caps the ring at 8 dots. It will draw all seats: one ring up to 10, and a second inner ring beyond that, so a 25 seat table shows 25 dots without overlapping.
- Grid and layout views keep the "seated / capacity" readout, which stays exact regardless of dot count.

## 3. Add new types under SEATING, FIXTURES, ZONES

Each toolbar menu gets an "Add new type" entry at the bottom, opening a small form:

- Name, category (seating, fixture or zone), default seats, shape (round or square), and default width/depth for fixtures and zones.
- Saved custom types appear in that menu permanently for the venue and can be renamed or deleted from the same menu.
- Custom types behave exactly like built-ins on the canvas: drag, rotate, resize, rename, label, section, and they count towards tables/chairs only when the category is seating.

## Technical notes

- `src/lib/floor-data.ts`: add `mergedInto` / merge group type plus helpers (`mergedCapacity`, `mergeTables`, `unmergeTable`); change `FloorObjectKind` to a union of built-in kinds plus a `custom:<id>` string form; add `CustomFloorKind` type and make `isDecor`, `isZone`, `hasFootprint`, `floorCounts` resolve meta through a lookup that includes custom kinds.
- `src/lib/pos-store.tsx`: persist `floorMerges` and `customFloorKinds` alongside `floorTemplates`, with add/update/remove actions.
- `src/components/pos/floor-canvas.tsx`: rewrite `Seats` to support up to 25 dots in two rings; render merged groups as one connected shape.
- `src/components/pos/floor-editor.tsx`: "Add new type" menu items, the new type dialog, seats max 25, custom kind support in the inspector.
- `src/routes/floor.index.tsx`: merge mode toggle, multi-select state, merged cards in grid view, merged totals in the counts chip.
- `src/components/pos/status-sheet.tsx` and `guests-sheet.tsx`: unmerge action and capacity aware guest limit.

No backend or business logic changes; all state stays in the existing persisted local store. Layout verified on phone portrait, tablet and desktop.
