# Make every left-rail icon render in one identical color path

## Problem
Measured on the live rail: all five icons receive the same idle color (shell-foreground at 60%), but the three icons rendered from PNG artwork (New Order, Table Order, Tickets — via CSS mask) render dimmer (~153/255) while the icons drawn as inline SVG (Rooms bell, orderOS, Lock) render brighter (~212/255). The browser blends translucent SVG paint differently than masked image layers, so the bell visibly stands out next to the image-based icons at idle.

Decision (user-confirmed): unify on the SVG look — slightly brighter idle tone, crisp at any size.

## Plan
Convert the three PNG artworks into real vector SVG components traced 1:1 from the existing artwork, drawn with `fill: currentColor` exactly like the orderOS mark. All five rail icons then go through the identical SVG paint path, so idle, hover and active colors match pixel-for-pixel.

1. **Trace the artwork** (in `/tmp`, not the repo):
   - For each of `new-order.png`, `table-order.png`, `tickets.png`, binarize the alpha channel and trace it to a smooth vector path with potrace (via `nix run nixpkgs#potrace`); fall back to contour tracing if potrace is unavailable.
   - Check each traced path renders as the same glyph before using it.
2. **`src/components/pos/icons/rail-icons.tsx`**
   - Replace the mask-based `RailIcon` span with three SVG components (NewOrderIcon, TableOrderIcon, TicketsIcon), each `fill="currentColor"`, viewBox 0 0 100 100, keeping the exported names unchanged so `nav-destinations.ts` needs no edits.
3. **Cleanup** — delete the three PNGs from `src/assets/icons/` once the SVGs are in place (they are no longer referenced).
4. Update the icon note in `src/components/pos/AGENTS.md` to say rail icons are SVG `currentColor` components, not images or masks.

## Verification
- Build/typecheck passes.
- Playwright pixel check on the live rail: idle New Order, Table Order and Tickets now measure the same brightness as the Rooms bell and orderOS (within anti-aliasing tolerance); hover brightens; the active destination shows the outlined cell at full color.
- Expanded rail still shows labels correctly; phone menu unaffected (it uses its own Lucide icons).
