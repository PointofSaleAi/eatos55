# Equal spacing on the left nav rail (Dashboard → Order Status)

## Current state (verified)

- `src/components/pos/nav-rail.tsx` lays the primary destinations in a `<ul class="space-y-1">` — a 4px gap between each icon tile.
- Playwright measurement of the rendered rail confirms: Lock terminal → Dashboard gap is 60px (extra padding from the venue block above), and the six primary tiles (Dashboard, New Order, Floor Plan, Tickets, Rooms, Order Status) sit only 4px apart — much tighter than the reference screenshot, which shows generous, even spacing between tiles.

## Change

In `src/components/pos/nav-rail.tsx` only (no other files touched):

1. Replace `space-y-1` on the primary destinations `<ul>` with a uniform vertical gap of `gap-4` (16px) — matching the visual rhythm of the attached reference screenshot.
2. Equalize the gap above the first tile: change the container's `pt-3` so the space between the venue tile and Dashboard equals the inter-tile gap (container padding + gap = `gap-4`).

All six tiles keep their existing 56px height, so equal gap = equal center-to-center rhythm. The active tile's border/outline does not change its footprint (border-box sizing), so spacing stays even in every state.

## Verification

- Playwright at 1141x742 (current preview viewport), 1280x900 and a small 800px-wide desktop window: re-measure the gaps and confirm every inter-tile gap from Dashboard through Order Status is identical, and the rail still fits without overflow or scrolling.
- Check both collapsed and expanded rail states, and one active and one inactive destination, to confirm spacing holds.
- Confirm the empty space below Order Status (before the pinned eatOS mark) still toggles the rail when tapped.
