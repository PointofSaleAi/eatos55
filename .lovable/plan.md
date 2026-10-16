# Replace New Order, Table Order and Tickets rail icons with the supplied SVGs

## What changes
- Left navigation icons for **New Order**, **Table Order** and **Tickets** use your attached artwork exactly (shapes untouched).
- Their color follows the same treatment as orderOS and Rooms: same idle grey/white, same hover and same active highlight, in light and dark themes.
- Applies everywhere these icons appear (expanded and collapsed rail, phone/tablet menus) on mobile, tablet and desktop.

## Technical details
- In `src/components/pos/icons/rail-icons.tsx`, replace the traced paths of `NewOrderIcon`, `TableOrderIcon`, `TicketsIcon` with the uploaded paths (viewBox `0 0 46 46`), swapping the hardcoded `#BCBCBD` fill for `currentColor` and keeping `fill-rule`/`clip-rule` where present. Component names and props unchanged, so callers need no edits.
- Verify with Playwright screenshots of the rail (idle, hover, active) next to orderOS/Rooms; confirm build is clean.
