# Clock Out overlay covers the whole screen

## Why it happens
The Clock Out screen is drawn inside the main content area, next to the header and left navigation. So its dark background only fills that area, and the header and nav stay bright and clickable.

## Fix
- Make the Clock Out dark background and its window sit above everything on screen, header and left nav included, from edge to edge.
- Keep the outside X button in the top-right corner of the window, as it is now.
- While Clock Out is open, nothing behind it can be tapped. The header and nav are still visible, just dimmed.
- Works the same on phone, tablet and desktop, including the phone frame view.

## Technical details
- `src/routes/access.clock-out.tsx`: change the root wrapper from `relative flex-1` to `fixed inset-0 z-[60]` (above the header and rail z-index). Do the same for the faded PIN-pad backdrop and the `bg-gate-overlay/80` dim layer, which already use absolute positioning inside that wrapper. If DeviceFrame's phone frame uses a transform, `fixed` will be scoped to the frame, which is what we want there.
- Check the header and rail z-index values so the overlay sits above them.
- Verify with Playwright at 390, 834 and 1141 px widths: header and rail are dimmed, the dialog stays centered, and no console errors.
