# Narrow the expanded left nav rail

## Current state (measured in the live preview)

- `src/components/pos/nav-rail.tsx` sets the expanded rail to `w-60` (240px).
- Measured with the rail expanded at 1141x742: the longest label, "Lock terminal", needs only 96px of text; "New Order" 87px, "Table Order" 84px, "Rooms"/"Tickets"/"orderOS" under 61px. Adding the icon, gaps and paddings, the widest row fits in about 166px.
- The version line at the bottom ("5.200.27 (+11350) / 3.44.2 / 13.10.26") needs about 151px.
- So the 240px rail leaves roughly 70px of dead space on the right of every row — the empty band the screenshot shows.

## Change

In `src/components/pos/nav-rail.tsx` only:

- Change the expanded width from `w-60` (240px) to `w-48` (192px). That comfortably fits the widest label (166px) and the version line (151px) with a small buffer, removing the dead space while labels keep a natural length.
- No change to the collapsed width (`w-[4.25rem]`), the icons, spacing rhythm, drag/tap-to-toggle behaviour, or any other screen.

## Verification

- Playwright at 1141x742, 1280x900 and a narrow 800px desktop window: expand the rail and confirm no label is truncated ("Lock terminal", "Table Order" fully visible), the version line stays on its line(s) without clipping, and the rail looks balanced with no large empty band.
- Confirm the collapsed rail, the drag-left/right expand gesture, and empty-space tap-to-toggle still work after the width change.
- Confirm the main content area simply gains the freed width (New Order keeps its 24rem cart minimum; nothing wraps).
