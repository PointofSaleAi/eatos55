# Merged tables read as one group in both views

Right now a merge folds into a single table: the grid shows one card, and the layout view draws one shape at the first member's spot while the other members disappear from the plan. That loses the picture of which physical tables were pushed together.

## Layout view

- Draw every member of a merge at its own position again, so the plan matches the room.
- Wrap the members in one group: a shared outline (a rounded halo around the members' bounding area) plus connector lines between the member shapes, so it reads as one pushed-together party.
- One set of readouts per group, not per table: the merged label (for example `T1 + EW1 + T3`), one seated/capacity number, one dwell time, and one status pill placed at the centre of the group. Individual members keep their shape and seat dots but drop their own label and status pill.
- Tapping any member of the group opens the group order; tapping the group status pill opens the status sheet with the unmerge and capacity actions, exactly like the grid card.
- Merge mode is unchanged: members are individually tappable and highlighted while picking.

## Grid view

- Keep the single merged card, and make the membership explicit: the card shows the merged label on top and a small member line (`T1 · EW1 · T3`) under it, with the existing `MERGED · N SEATS` row for capacity and unmerge.

## Responsive

Verified at phone portrait, tablet portrait/landscape and desktop: the group halo scales with the canvas, the centre label never overlaps a member shape, and the grid card fits both the label and member line without truncation.

## Technical notes

- `src/components/pos/floor-canvas.tsx`: accept an optional `groups` prop (merged label, member names, shared state, seated, capacity, dwell). Compute each group's bounding box from member `x`/`y`, render a halo plus connector lines behind the member shapes, and render one central label/status button per group. Member tables rendered inside a group skip their own label and status pill.
- `src/routes/floor.index.tsx`: stop collapsing merges out of the layout data. Keep the current folded list for the grid, and pass the full member list plus a derived `groups` array to `FloorCanvas`. Tap handlers map a member name back to its merge before opening the order or status sheet.
- Grid card gets the member line; no store, data model or business logic changes.
