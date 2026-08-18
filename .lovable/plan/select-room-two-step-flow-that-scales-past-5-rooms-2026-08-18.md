# Select Room: two-step flow that scales past 5 rooms

Today the dialog shows a single horizontal strip of room cards with a room auto-picked, and the booking details, allowances and credit panel always visible below. With more than 5 rooms the strip just keeps scrolling sideways, so rooms fall off screen and the details compete for the same height budget.

## New behaviour

Step 1: Pick a room
- The dialog opens with no room pre-selected.
- Rooms render as a wrapping grid that fills the available space (2 columns on phone, 3 on tablet, 4 on wide), sized so any number of rooms is reachable.
- Search by room number or guest name plus the existing floor pills filter the grid live.
- When the filtered set exceeds what fits, the grid pages with compact "Prev / Next  ·  page X of Y" controls instead of a scrollbar, matching how the item sheet pages.
- Rooms without a booking or with insufficient credit stay visible but disabled, with the reason on the card.
- Empty state when a search or floor filter matches nothing.

Step 2: Room detail and charge
- Tapping a room replaces the grid with the detail view: guest header, booking facts, allowances, meal entitlements, credit panel, and the "Post charge to room NNN" action.
- A back control (chevron plus the room number) returns to the grid keeping the current search and floor filter.
- The header title reflects the step: "Select Room" then "Room NNN".

Both steps keep the current no-scroll rule: the dialog stays capped at the viewport height, content shrinks and the entitlement chips collapse on short viewports.

## Technical notes

- Single file: `src/components/pos/room-charge-dialog.tsx`.
- Add local state `step: "pick" | "detail"`, `pickedId: string | null` (starts null), and `page` reset on search/floor change.
- Page size derived from the responsive column count with a fixed row count so the grid never overflows; no `overflow-y-auto` anywhere in the dialog.
- Reuse existing tokens and components (pill filters, `rounded-card`, `text-fs-*`, `BackButton` style chevron); no new colors or fonts.
- Verify with Playwright at 1440x950, 1155x713, 1024x768, 834x1112 and 393x852 with a seeded room list larger than 5 (temporary test data only, no app data changes) to confirm zero vertical scrollers on both steps.
