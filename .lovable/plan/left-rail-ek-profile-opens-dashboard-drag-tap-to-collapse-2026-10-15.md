# Left rail: EK profile opens Dashboard, drag/tap to collapse

## What changes

1. **Remove Dashboard from the rail list**
   - The "Dashboard" row disappears from the left rail's destination list. The list starts with New Order, then Table Order, Tickets, Rooms, orderOS.

2. **EK profile tile opens the Dashboard**
   - Tapping the circular "EK" tile (with "eatOS Kitchen / Main dining" text when expanded) navigates to the Dashboard (`/order/menu`).
   - While on the Dashboard, the tile shows the same outlined/highlighted style the other rail items use when active.
   - The tile no longer expands/collapses the rail.

3. **Collapse/expand by tap or drag on empty rail space**
   - Tapping empty space inside the rail (outside the profile tile, Lock terminal and destination buttons) still toggles collapse — this already works and stays.
   - New: dragging horizontally on the rail's empty areas collapses (drag left) or expands (drag right), with a small distance threshold so taps aren't misread. The grip dots at the top keep toggling too.

4. **Unchanged**
   - Phone/portrait drawer keeps its Dashboard entry (there is no rail or EK tile there, so Dashboard stays reachable).
   - The header Maya AI shortcut still opens the Dashboard.
   - Expanded rail keeps the white eatOS wordmark at the bottom; collapsed keeps the circular "e".

## Technical notes

- `src/lib/nav-destinations.ts`: drop the Dashboard entry from `railPrimary` (keep it in `navGroups` for the phone drawer).
- `src/components/pos/nav-rail.tsx`: turn the venue/profile tile into a `Link` to `/order/menu` with active-state styling; add pointer-based drag handling on the rail container (ignore drags that start on links/buttons; threshold ~40px); keep the existing empty-space click toggle and grip button.
- Verify on desktop and tablet widths (rail is landscape-only); phone layout is untouched apart from the shared destinations list, which keeps Dashboard.
