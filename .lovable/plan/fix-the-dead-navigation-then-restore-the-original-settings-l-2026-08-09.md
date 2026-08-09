# Fix the dead navigation, then restore the original settings look

## What I found (reproduced in the running app)

I signed in, clocked in and tapped every row in the burger drawer. **Every one of them stays on `/tickets`** — New Order, Menus, Floor Plan, Rooms, Order Status Board, Payments, Sales Summary. No errors in the console; the tap is simply undone.

The cause is the back-gesture handler shared by the drawer and the sheets. While an overlay is open it pushes a throwaway history entry so the Android/browser back gesture closes the overlay instead of leaving the screen. When you tap a row, the overlay closes first, that handler unwinds its own entry with a `history.back()`, and the back cancels the navigation the row just started. So it looks like nothing is connected, when in fact the destinations are all fine — the link is being cancelled a fraction of a second later.

The same handler is used by the More sheet, the item sheet and the guest sheet, so any tap in those that navigates has the same problem.

## 1. Make overlay dismissal stop eating navigation

- The overlay closes immediately on tap, and the throwaway history entry is only unwound when the overlay closed *without* a navigation — so a row tap navigates and stays navigated.
- Back gesture behaviour is unchanged: back still closes an open drawer or sheet rather than leaving the screen, and closing by backdrop tap, X or swipe-down still leaves no stray history entry.
- Applied once in the shared handler so the drawer and all four sheets are fixed together, not patched per component.

## 2. Restore the original imported settings design

The settings rows were flattened during an earlier pass: the coloured icon tiles were replaced with a single flat accent glyph, and the group/row rhythm was tightened. Restore the imported prototype look:

- Coloured rounded icon tiles are back, one colour per row as in the imported screens (green General, violet Control Center, orange Menu, indigo Payments, purple Workforce, sky Network, red Support, and so on) — the `color` value each row already declares starts painting again.
- Original card, group-label and caption rhythm: inset rounded cards on the page background, spacing and row height as the prototype had them, values right-aligned, chevrons only where the row drills in.
- Same treatment across the whole tree, not just the hub: General, Control Center, Menu, Payments, Workforce, Network, Hardware, Notifications, Sales Summary, the `detail/$topic` screens and the Support/Contact/Help screens.
- Hierarchy and destinations are untouched — this is a styling restore, not a re-structure.

## 3. Full link sweep

After both changes, walk every row on every hub and sub-screen at phone portrait, tablet and desktop and confirm each tap actually lands on its destination, the back chevron returns to the right parent, and no console errors.

## Technical notes

- `src/hooks/use-back-dismiss.ts`: gate the cleanup `history.back()` so it never fires when the close came from a navigating tap; drawer/sheets pass through unchanged.
- `src/components/pos/settings-rows.tsx`: reinstate the coloured `IconTile` for every `TileColor`, restore `GroupCard` / `GroupLabel` / `Caption` / row metrics to the imported values.
- No store or business-logic changes.
