# Floor plan fixes: Rooms pill, status strips, guest count

Four things from the screenshot and question.

## 1. "Rooms" pill alignment

The pill's label sits high and the pill is taller than the floor title row. Fix it to match the other pill controls: centred text, single fixed control height, same font size and radius as the status tabs, and vertically centred against the "GROUND FLOOR" title on every width (320 / 393 / tablet / desktop).

## 2. Rooms only when enabled

Rooms is a hotel/room-service module, so it should not always be visible.

- Add a "Room service" switch in Settings (General, under the service-type group) — editable by Manager/Supervisor, read-only for others, persisted on the device like other settings.
- Default: off.
- When off: the Rooms pill is hidden on the Floor Plan and the `/rooms` screen redirects back to the floor plan.
- When on: pill shows and Rooms works as today.

## 3. No down arrow on the status strip

Remove the chevron from the status strips on both the Floor Plan tiles and the Rooms tiles. The strip stays fully tappable, keeps its colour + label, and keeps its accessible label ("Change status for T1, currently AVAILABLE") plus the icon that carries state without relying on colour. Tap feedback stays (press state), so touch users still get the affordance.

## 4. Choosing how many guests are seated

Today tapping a table jumps straight into the order and party size is only editable later in the guest sheet.

- Tapping a table opens a short "Guests" step first: a stepper (and quick 1–8 chips) prefilled with the table's seat count, plus a Start order button.
- The chosen count flows into the order's guest details, so the ticket and the tile's seat line reflect the actual number seated.
- Tables already ordering/ordered skip the step and open the existing order directly.
- The count remains editable later from the guest sheet on the order screen.

## Technical notes

- `src/routes/floor.index.tsx`: header pill classes (`min-h-ctl-sm`, centred flex, matching text size); drop the chevron; new guests sheet before `startOrder(t.name)` + `navigate({ to: "/order/new" })`.
- `src/routes/rooms.index.tsx`: drop the chevron; redirect when the module is off.
- New guests step built on the existing sheet primitives (drag-close + X), reusing the party-size stepper pattern from `guest-sheet.tsx`.
- `src/lib/pos-store.tsx`: add a persisted `roomServiceEnabled` flag (default false) with a setter; `startOrder(table, partySize?)` seeds `guest.partySize`.
- Settings switch added through the existing role-gated settings rows so permissions and persistence behave like the rest.
- Tap targets stay at least 44px; verified at 320, 393, 768 and desktop widths.
