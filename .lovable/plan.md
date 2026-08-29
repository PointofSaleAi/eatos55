# Left navigation redesign to match the reference rail

The rail becomes a slim dark column with a single icon stack, matching the uploaded reference. Presentation only, no route or store logic changes.

## Layout, top to bottom

1. Grip dots (six dots) as a small handle at the very top: taps toggle expand/collapse, replacing the current avatar-only toggle.
2. Lock icon: locks the terminal (routes to the existing PIN gate / clock-in screen).
3. Venue logo tile: rounded square with the venue image, initials as fallback (currently a round accent circle).
4. Icon stack, each icon centred, no group titles or dividers. Active item is shown as a white rounded outlined cell, not a filled accent tint:
   - Menu / New Order grid
   - New Order ticket
   - Floor Plan
   - Tickets
   - Gift cards / loyalty
   - Reservations (calendar)
   - Order Status board
   - Settings
   - AI assistant (sparkle) opening the shift dashboard pull-down
5. eatOS "e" mark near the bottom, linking to Settings.
6. Two-line version label at the very bottom, small: `Ver 5.200.27` / `FL 3.44.2`.

## Styling

- Rail background is a dark surface in both light and dark themes, matching the top bar, with rounded outer corners and no right border.
- Icons are light, muted at rest, full strength when active. Active cell: 2px rounded outline, transparent fill.
- Collapsed width tightens to about 4.25rem; expanded still shows labels next to each icon.
- Rail stays collapsed by default and toggles from the grip dots, the logo tile, or empty space in the rail.

## Responsive

- Rail only renders on landscape/wide layouts as today; phones keep the drawer.
- Icon stack scrolls internally when height is short so the brand and version stay pinned at the bottom.
- Verified at 1440x950, 1155x713, 1024x768 and 834x1112 with no new scrollbars.

## Technical notes

- `src/components/pos/nav-rail.tsx`: restructure to grip / lock / logo / icon stack / brand / version, add the dark surface classes and outlined active state.
- `src/lib/nav-destinations.ts`: extend `railPrimary` with gift card, reservations and AI entries so drawer and rail stay in sync; reuse existing routes only.
- Reuse `Wordmark`/mark from `src/components/pos/brand.tsx` for the "e" mark; no new assets.
- Any destination without an existing route is left out rather than linking nowhere.
