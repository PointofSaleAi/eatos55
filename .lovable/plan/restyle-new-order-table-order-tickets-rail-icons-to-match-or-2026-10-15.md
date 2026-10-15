# Restyle New Order, Table Order, Tickets rail icons to match orderOS & Rooms

## Goal
The three replaced rail icons (New Order, Table Order, Tickets) currently render as dense, trace-based filled outline artwork extracted from the reference app. Beside them, Rooms (Lucide ConciergeBell) and orderOS (custom bold mark) look clean and consistent. Restyle the trio in that same visual language while keeping each icon's recognizable shape.

## What changes

Replace the traced-path implementations in `src/components/pos/icons/rail-icons.tsx` with hand-drawn Lucide-style stroke icons:

- **New OrderIcon** — receipt with a wavy bottom edge, two text lines, and a plus sign (the reference shape, redrawn with clean strokes).
- **TableOrderIcon** — round table seen from above: outer ring, center circle, and four place-setting nubs at N/E/S/W (the reference shape, simplified to the Lucide stroke weight).
- **TicketsIcon** — two overlapping banknotes with a dollar coin/center on the front bill.

All three drawn in the same specification as Lucide icons (the family Rooms uses):

```text
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
```

- Keep the exported names `NewOrderIcon`, `TableOrderIcon`, `TicketsIcon` and their `className` prop, so `src/lib/nav-destinations.ts` (rail entries) needs no changes.
- Delete the unused traced path data; the file keeps the same header comment style, updated to describe the stroke style.

## What stays the same
- Rooms (ConciergeBell) and the orderOS mark are untouched.
- The phone menu keeps its existing Lucide icons.
- Rail sizing (size-6), dim/hover/active color behavior, spacing and widths are untouched — the icons already paint via currentColor, so restyling only changes the glyph shapes.
- Collapsed/expanded rail behavior, drag gestures, and everything outside the icon file.

## Technical details
- Single file edit: `src/components/pos/icons/rail-icons.tsx`.
- After the edit: Playwright check on the live rail at desktop size — compare the three icons idle, hover, and active against Rooms/orderOS; confirm they read clearly at the collapsed rail size and no build errors appear.

## Risk
The redrawn glyphs are new artwork; if a shape reads poorly at 24px, adjust stroke detail (fewer interior lines) in the same file rather than reverting to the traced paths.
