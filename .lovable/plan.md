# Floor Plan: editable layout + fixing the oversized popups

## 1. Editable floor layout (new)

Add an **Edit** button in the floor header (next to Grid/Layout, visible only in Layout view, and only for roles with permission).

Edit mode turns the spatial canvas into a builder:

- **Move**: drag any table to a new position; it snaps to a light grid so plans stay tidy.
- **Add**: an "Add object" row lets staff drop a Round table, Square table, Bar, Counter, Booth, Wall/Divider, Door, or Plant onto the canvas.
- **Configure**: tapping an object in edit mode opens a small panel for name, seat count, shape, section (B1/B2) and Delete.
- **Templates**: a "Use template" option loads a starter arrangement (Cafe, Dining room, Bar and lounge, Patio) that can then be edited. Applying a template asks for confirmation because it replaces the current floor layout.
- **Save / Cancel**: Save writes the layout for that floor; Cancel restores the previous one. Layouts persist per floor on the device, so a reload keeps the setup.

Non-table objects (bar, wall, door) are decor: they are not tappable for orders in normal view and show no status.

## 2. Table status popup is too large

- Reduce row height and type size so the 11 states fit the sheet at typical heights, with no scrollbar on tablet/desktop and at most a short scroll on small phones.
- Open the sheet already scrolled to the currently selected state, so the active state is visible immediately instead of starting at the top.
- Keep the title as `T4 status` and cap the sheet width so it does not stretch across wide screens.

## 3. Guest-count keypad is too big

- Tighten the keypad: shorter keys, smaller gaps, capped sheet width, so the whole popup takes roughly half the height it does today.
- Prefill the count with the table's seat capacity so a single tap on START ORDER works, and keep `Table #T8` plus `Seats 8` context.

## 4. Grid cards cut the table names

Table names such as `EW112` currently collapse to `EW...`.

- Widen the name area inside the shape and allow the label to shrink (auto-fitting type) instead of truncating, so short and medium names always render in full.
- Only very long names truncate, and those show the full name in a tooltip/aria label.
- Card grid gets slightly wider minimum columns so seat counts and timers never collide.

## 5. Floor picker font sizes

The `GROUND FLOOR` heading and the dropdown items (`Ground Floor`, `First Floor`, `Patio`) currently read at similar weight/size.

- Dropdown items become normal-weight, smaller body text with the active floor marked by a check, matching the reference.
- The heading keeps its large uppercase treatment.

## Technical notes

- `src/lib/floor-data.ts`: extend the object model with `kind` (`table` | `bar` | `counter` | `booth` | `wall` | `door` | `plant`), keep `x`/`y`/`shape`/`seats`, and add width/height for bars and walls. Add template presets.
- `src/lib/pos-store.tsx`: add a per-floor `layouts` map with save/reset actions, persisted to `localStorage` alongside existing POS state.
- New `src/components/pos/floor-editor.tsx` (pointer-event drag with grid snap, palette, object inspector) used by `FloorCanvas` when `editing` is true; `floor-canvas.tsx` renders both modes.
- `src/components/pos/status-sheet.tsx`: compact rows plus scroll-into-view for the active option.
- `src/components/pos/guests-sheet.tsx`: compact keypad, prefilled count.
- `src/routes/floor.index.tsx`: Edit button, template menu, dropdown typography.
- All five changes verified at phone portrait, tablet portrait, tablet landscape and desktop widths with no unintended scrolling.
