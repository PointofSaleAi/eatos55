# Match the replaced rail icons' colors to the existing rail theme

## Problem
New Order, Table Order and Tickets on the left rail are PNG images extracted from the reference app. They are rendered as plain `<img>` tags, so their baked-in near-white color never changes. Every other rail icon — Lucide icons and the orderOS mark — is drawn with `currentColor`, so it dims to 60% when idle, brightens on hover, and shows full brightness with the outlined active cell. The three image icons ignore all of that and always look the same.

## Plan
Re-render the three PNGs as CSS **masks** instead of `<img>` tags. The mask keeps the exact artwork shapes 1:1 from the reference app, while the visible color comes from `background-color: currentColor` — the same mechanism the other icons use. The icons will then automatically:

- dim to the 60% rail color when idle,
- brighten on hover,
- show full color inside the active destination's outlined cell,
- follow any theme change of the rail's foreground color.

1. `src/components/pos/icons/rail-icons.tsx`
   - Replace the `RailImage` img wrapper with a `span` that uses the PNG as `mask-image` (with `mask-size: contain`, no-repeat, centered) and `background-color: currentColor`, including the WebKit mask prefix for Safari.
   - Keep `aria-hidden` and the same exported icon components, so no other file changes.
2. No changes needed in `nav-rail.tsx` or `nav-destinations.ts` — they already pass the text-color classes that `currentColor` will now pick up.

## Verification
- Build/typecheck passes.
- Playwright on the expanded rail: idle icons sit at the dimmed rail color; hovering one brightens it; tapping a destination fills its cell and shows the icon at full brightness — identical to Table Order/orderOS behavior.
- Checked on tablet (landscape) and desktop.
