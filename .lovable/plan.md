# Floor plan redesigned: grid view, spatial layout view, staff list

The reference screens show a much richer floor screen than we have: a floor picker plus section tabs, two view modes (card grid and a spatial layout), seat occupancy counts, a ten-state status list, a staff list panel and a quick guest-count pad. Our design language stays exactly as it is; only the structure and data points grow.

## 1. Header

One row, left to right:
- Floor picker (`GROUND FLOOR` with a caret) as it is today, with an active underline.
- Section tabs `ALL`, `B2`, `B1` as underlined text tabs, replacing the current pill row of statuses. Status is no longer a filter row; it lives on the cards and in the status sheet.
- Right cluster: a two-option segmented view switch (grid icon / layout icon) and a staff-list icon button.

Compact widths: floor picker and tabs share one scrollable row, view switch and staff button stay pinned.

## 2. Grid view (default)

Uniform cards, five to seven per row on desktop, three on tablet portrait, two on phone:
- `Table T1` name on top, wrapping to two lines for long names.
- Seat occupancy line with a chair icon: `4 / 4` (seated / capacity).
- Full-width status strip at the bottom, colour-coded by state.
- Tap the card body: available or reserved opens the guest-count pad, occupied resumes the order.
- Tap the status strip: opens the Table Status sheet.

## 3. Layout view (new)

A bordered floor canvas showing tables at their real positions:
- Round tables drawn as circles with seat dots around the rim, square tables as squares with seat dots on the corners; joined tables connected by a link line.
- Table name inside, status label in small caps underneath, ring colour by state.
- Positions come from new `x` / `y` / `shape` fields in the table data, scaled to the canvas so nothing overlaps or clips at any size.
- Same tap behaviour as the grid.

## 4. Table Status sheet

Expanded from four states to the full reference list, each with its colour dot and a tick on the current one: Available, Ordering, Ordered, Reserved, Seated, Running Late, 1st Course, 2nd Course, 3rd Course, Dessert, Partially Seated. Fits without scrolling on tablet and desktop; phone gets a two-column list.

## 5. Guest count pad

Replaces the current stepper sheet with the reference popup: `Table #EW1` title, a single large number, and a compact keypad plus a confirm action, capped at the table capacity.

## 6. Staff list panel

Right-side panel opened from the header person icon:
- Back arrow, `Staff List` title, search field.
- Staff grouped by role (Supervisor, Barista, Waiter, Server, Delivery Staff, Line Cook, Kitchen Manager), each row an avatar or initials plus name, long names truncated.
- Picking a staff member assigns them as the server for the next order and closes the panel.
- Desktop and tablet landscape: side panel. Tablet portrait and phone: full-height sheet.

## Responsive

Verified at 1440x950, 1155x713, 1024x768, 834x1112 and 393x852: no horizontal scroll, layout canvas scales rather than scrolls, grid reflows, and the staff panel never covers the nav rail on desktop.

## Technical notes

- `src/lib/floor-data.ts`: extend `TableState` to the eleven states with colour meta, add `section` (`B1`/`B2`), `seated`, `shape` and `x`/`y` to `FloorTable`, add a `staff` list grouped by role.
- `src/routes/floor.index.tsx`: header rebuilt (floor picker, section tabs, view switch, staff button), grid view extracted to a component, new layout view component, view mode kept in local state.
- New `src/components/pos/floor-canvas.tsx` for the spatial view and `src/components/pos/staff-panel.tsx` for the staff list.
- `src/components/pos/status-sheet.tsx` reused with the longer option list; `guests-sheet.tsx` reworked to the keypad design using the existing numpad primitive.
- Presentation and demo data only: no pricing, payment or store logic changes beyond storing the picked server name.
