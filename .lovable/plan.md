# Left rail: distribute icon spacing across the full rail height

## Problem
The primary icon list in the left navigation rail is packed at the top with a fixed 14px gap, leaving a large empty area at the bottom of the rail (circled in the user's screenshot). The empty space should be used by spreading the icons evenly down the rail.

## Change
File: `src/components/pos/nav-rail.tsx`

- The scrollable primary-destinations container already flexes to fill the rail (`flex-1`). Make its `<ul>` stretch to the full container height and distribute the destination rows evenly (`h-full` + `justify-evenly`, keeping `flex-col`).
- Keep the existing `gap-3.5` as a minimum spacing floor so the layout stays readable when the list is long or the rail is short (small landscape/tablet heights) — when content would overflow, the list scrolls as it does today.
- No changes to the grip handle, lock, venue tile, brand block, or drag/collapse behavior. The venue tile and brand block stay pinned at top and bottom respectively; only the destination rows spread out.

## Verification
- Desktop (1290x796) and tablet (1024x768), collapsed and expanded: destination rows are evenly spaced and the rail's vertical space is used down to the brand block; no overlap, clipping, or loss of scroll behavior.
- Run the existing typecheck/build check and confirm the build log is clean.

## Scope
Demo UI change only; no data, routing, or behavior changes.
