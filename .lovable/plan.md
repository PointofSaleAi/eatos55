# Replace the New Order, Table Order and Tickets rail icons with the published app's icons

## Feasibility (verified against the published URL)

- The published app at https://eatos46.lovable.app does not serve icon image files — every rail icon is drawn in code as inline SVG. So there is nothing to download as a file; instead the exact SVG shapes the published rail renders are extracted and rebuilt here as components. This reproduces the icons pixel-for-pixel.
- The published bundle confirms its rail uses custom SVG components (the orderOS icon is one, `viewBox 0 0 48 40`), so DOM extraction is the reliable source.

## Change

1. Extract the icons from the published app with Playwright:
   - Sign in with the demo account, complete clock-in, expand the left rail.
   - Save each rail link's `<svg>` markup (viewBox + paths) for New Order, Table Order and Tickets. The other icons (Rooms, orderOS, Lock, Dashboard tile) stay untouched.
2. Recreate the three icons as small React components in `src/components/pos/icons/rail-icons.tsx`, using the extracted `viewBox` and `d` path data, `fill/stroke = currentColor`, and the same `className` handling as the existing `OrderOSIcon` so sizing/colouring behaves identically.
3. Point the three entries in `railPrimary` in `src/lib/nav-destinations.ts` (`/order/new` → New Order icon, `/floor` → Table Order icon, `/tickets` → Tickets icon) at the new components. The phone drawer keeps its own entries; only the left rail changes, as requested.

## Verification

- Build passes; no typecheck errors.
- Playwright on the preview at 1141x742: expanded rail shows the three new icons in the correct spots, active/inactive states and hover colours unchanged.
- Side-by-side screenshot against the published app's rail to confirm the shapes match.
- Collapsed rail still shows the icons centred; no other destinations change.
