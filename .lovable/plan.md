# Tighten clock panel spacing

## Update
- Reduce the oversized vertical margins between the date, live time, weather, and city/state in the full clock-in panel.
- Keep the four details grouped as one compact, readable block while preserving the existing type sizes, icons, colors, and PIN keypad layout.
- Use responsive spacing so the grouping remains balanced on phones, tablets, desktop, and landscape screens.

## Verification
- Open the clock panel at phone, tablet, and desktop sizes.
- Confirm the date, time, weather, and location have consistent compact spacing without overlaps or clipping.
- Confirm the keypad and clock actions remain unchanged.

## Technical details
- Scope the adjustment to the full `ClockPanel` gate layout in `src/components/pos/clock-panel.tsx`.
- Replace the repeated viewport-height margins with a smaller responsive vertical rhythm; leave compact clock-panel variants unchanged.
