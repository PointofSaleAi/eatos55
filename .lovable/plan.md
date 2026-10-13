# Rebuild the Rooms page to match the recording

The recording sets the structure. The look stays ours: black and white, pink only for branding, no X in the outside corner, tap outside to close. Every part works on phone, tablet and desktop.

## Top bar
- **Floor picker** on the left (e.g. 2nd Floor, First Floor, Ground Floor, Mews). It opens a list with a check mark next to the current floor and remembers the last floor picked.
- **Section tabs** next to it: **All**, plus that floor's sections (e.g. East Wing, Entrance, Mews Rooms). They scroll sideways if there are many.
- **View switch** on the right with two icons: room cards (the default), or a layout view that shows "Room layout view – coming soon".
- **Staff icon**: opens the Staff List (see below).
- The old "Floor plan" back header is replaced by this bar.

## Room cards
- **Available:** room name, with an "Available" strip along the bottom.
- **Occupied:** room name, guest name, stay dates, open amount and an "Occupied" strip (shown with an icon, not just colour).
- Cards sit in a grid that fills the width and scrolls for big floors. Sample floors include a large one (about 30 numbered rooms) so scrolling is visible.
- Changing occupancy by tapping the status strip still works as it does today.

## Tapping a room
- Opens the same split view as the Tickets page, showing only that room's tickets: the list on the left (or stacked on phones), details on the right, a room filter chip at the top and a **New Order** button.
- New Order starts an order for that room. Firing or charging links the ticket to the room, so it shows up in this view afterwards.
- A room with no tickets shows an empty state: "As new orders are placed, they'll show up here."

## Staff List panel
- Slides in from the right (a full-height sheet on phones). It has a back arrow, a "Staff List" title and a search box.
- Staff are grouped by job (Account Manager, Supervisor, Bartender, Cashier, Manager), each showing their photo or initials.
- It's view only, and tapping outside closes it.

## Technical details
- `src/lib/floor-data.ts`: add `section` to `Room`, add `roomFloors` (floor → sections) and more demo rooms across floors and sections, including a large Mews grid. Existing stay data stays as it is.
- `src/routes/rooms.index.tsx`: rewrite with the floor popover, section tabs, view toggle, staff button and a responsive card grid. Navigates to `/tickets` with `search: { table: room.name }`, reusing the table filter already on the Tickets screen.
- New `src/components/pos/staff-list-sheet.tsx`, built on the shared Sheet, using `employees` from demo data grouped by role. It falls back to initials when there's no photo.
- Check that the Tickets screen filter, New Order and ticket linking work for room names the same way they do for table names, and fix any gaps.
- Keep the route's `head()` metadata. Check with the browser at phone, tablet and desktop sizes.
