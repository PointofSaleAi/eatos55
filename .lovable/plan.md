# Floor Layout Editor: Rotation, Labels and More Objects

## What you will be able to do

1. Rotate anything
   - Select a table, bar, counter, wall, door, plant or zone and a rotation control appears in the inspector: quick 90 degree turn button plus a fine dial (15 degree steps, 0 to 345).
   - Rotate by dragging a small handle on the corner of the selected object on the canvas.

2. Text stays readable and correct
   - The label rotates with the object only until it would read upside down; past 90 degrees it flips so text is always right side up.
   - Labels auto-fit: font size shrinks with the object footprint instead of getting cut off, and long names wrap to two lines inside bars, counters and zones.
   - Width/depth changes reflow the label immediately.

3. Rename and edit text inline
   - Double tap any object on the canvas to edit its name in place (in addition to the inspector name field).
   - Name limit raised to 24 characters, with an optional short "display label" for tight shapes.

4. New object types in the palette
   - Zones: Kitchen, Private Dining Room, Patio, Lounge (large labelled areas you place and size).
   - Seating: Bar Chair (single stool, snaps along a bar edge), plus existing Table and Booth.
   - Fixtures: Bar, Counter, Wall, Door, Plant (unchanged).

5. Guest capacity on tables
   - Seats stepper stays, and the canvas shows seat dots equal to capacity for tables, booths and bar chairs.
   - Zones and fixtures have no seat count except Bar Chair (1, editable).

6. Templates you can save
   - "Template" menu keeps the starter presets (Cafe, Dining room, Bar and lounge, Patio) and adds "Save current layout as template".
   - Saved templates are named by you, listed under "My templates", can be applied to any floor, renamed, and deleted. They persist on the device alongside saved floor layouts.

## Behaviour rules

- Zones render behind tables and fixtures so tables stay tappable.
- Rotation, size and names are saved with the floor layout on SAVE and discarded on cancel.
- Everything works with no vertical scrolling on phone portrait, tablet portrait/landscape and desktop: the inspector collapses into a compact two-row control strip on narrow widths and a single row on wide ones.
- Only roles with settings permission see the Edit button (unchanged).

## Technical notes

- `src/lib/floor-data.ts`: add `rotation?: number` and optional `label?` to `FloorObject`; add kinds `zone-kitchen`, `zone-private-dining`, `zone-patio`, `zone-lounge`, `bar-chair`; extend `floorObjectKindMeta` with default footprint and seat defaults; add `zoneKinds` and `isZone()`; add `SavedTemplate` type and helper to build objects from a saved layout.
- `src/components/pos/floor-canvas.tsx`: `DecorShape` applies `rotate(var)` on the wrapper and counter-rotates the label when the angle would invert text; zone rendering with dashed fill and low z-index; label auto-fit via clamp sizing driven by `w`/`h`.
- `src/components/pos/floor-editor.tsx`: rotation handle (pointer drag computing angle from object centre), rotation stepper in inspector, inline rename on double tap, palette grouped into Seating / Fixtures / Zones with horizontal scroll pills, bar-chair snapping to nearest bar/counter edge.
- `src/lib/pos-store.tsx`: add `floorTemplates: SavedTemplate[]` with `saveFloorTemplate`, `deleteFloorTemplate`, `renameFloorTemplate`, persisted in the existing `eatos.pos.floor` localStorage record.
- `src/routes/floor.index.tsx`: Template dropdown shows presets plus My templates plus "Save current as template" (prompts for a name via a small dialog, not `window.prompt`).
- No em dashes anywhere in new copy.
