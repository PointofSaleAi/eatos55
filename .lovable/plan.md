# Match New Order, Table Order and Tickets icon color to Rooms and orderOS

## What you'll see
On the left navigation, New Order, Table Order and Tickets will look the same grey when idle, the same white on hover and when selected, as Rooms and orderOS. The shapes stay exactly as you sent them.

## Why they look different today
All five icons already use the same color setting. Your three icons are drawn with very thin filled lines inside a lot of empty space, so at this small size the edges blur and the grey reads lighter and dimmer than the bolder Rooms and orderOS lines.

## Steps
1. Measure the actual on-screen brightness of all five icons (idle, hover, selected) to confirm the gap.
2. Fix it without changing the drawings:
   - Trim the empty space around each of your three icons so they render at the same visual size as Rooms/orderOS.
   - Add a hair-thin outline in the same color along the existing edges so the lines render as solid as the others (shape unchanged).
3. Re-measure until the three icons match Rooms/orderOS within a small tolerance in all three states.
4. Check on phone menu, portrait/landscape tablet and desktop, collapsed and expanded rail.

## Technical details
- File: `src/components/pos/icons/rail-icons.tsx` only. Tighten each `viewBox` to the path bounds and add `stroke="currentColor"` with a small `strokeWidth` (~0.6–1 in 46-unit space) and `strokeLinejoin="round"`.
- Verification: Playwright element screenshots of each rail button, average lit-pixel luminance compared against Rooms/orderOS.
- No change to nav-rail color classes.
