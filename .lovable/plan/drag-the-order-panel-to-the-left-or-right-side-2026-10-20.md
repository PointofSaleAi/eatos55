# Drag the order panel to the left or right side

## What changes
- On New Order (tablet and desktop, landscape), the order panel gets the same six-dot grip at its top as the left navigation.
- Drag the grip toward either screen edge: dashed drop zones appear on both sides, the target lights up, and releasing there moves the panel to that side. Releasing elsewhere cancels.
- Arrow keys on the grip also move it (keyboard friendly).
- When the panel is on the left, the menu/products move to the right; the order options rail and panel border flip accordingly.
- The chosen side is kept while moving between screens in the visit, like the navigation (not remembered after reload).
- The navigation rail and order panel can sit on the same side; the panel always stays next to the products area, never between the rail and the screen edge.
- Phone and portrait layouts are unchanged (the order panel is a full-screen sheet there, so there is nothing to drag).

## Technical notes
- Extract the grip's pointer/keyboard logic from `nav-rail.tsx` into a shared `useEdgeDrag({ onMove, onDragPosition })` hook plus a `DragGrip` component; NavRail reuses it (no behavior change).
- `order.new.tsx`: own `panelSide` in a shared context (pinnedContext) so it survives navigation; render `DragGrip` at the top of the wide `<aside>`, apply `order-first border-r` instead of `border-l` when left, and render the same drop-zone overlays while dragging.
- Verify with Playwright at 1334x796 and 1024x768 (drag both ways, cancel, arrow keys, rail on either side) and 390x844 (no grip shown); record the rule in `src/components/pos/AGENTS.md`.
