# Replace rail icons with the ones from pointofsale6.lovable.app

## What I found

The linked app (https://pointofsale6.lovable.app) uses custom white PNG artwork for its sidebar icons, not drawn icons. I extracted the exact files and confirmed which screen each opens:

- **New Order** (`/orders`) — receipt with a plus sign
- **Table Order** (`/tableorder`) — round table seen from above
- **Tickets** (`/tickets`) — dollar bills

## Change

1. Save the three extracted PNGs into the project at `src/assets/icons/` (`new-order.png`, `table-order.png`, `tickets.png`).
2. In `src/lib/nav-destinations.ts`, replace the three `railPrimary` icons (currently the drawn `NewOrderIcon`, `TableOrderIcon`, `TicketsIcon` components) with small components that render these images at the same size as the other rail icons.
3. The artwork is white-on-transparent. The rail is dark in both themes today; if any light surface shows these icons, apply a CSS invert so they stay visible.
4. Remove the now-unused drawn icon components from `src/components/pos/icons/rail-icons.tsx` (keep the file if other icons still use it).
5. Scope: left rail only — the phone menu keeps its current icons unless you want these there too.

## Verify

- Phone (390×844), tablet portrait/landscape, desktop: rail shows the three new icons in the correct spots, active/hover states unchanged, collapsed rail still centred.
- Side-by-side screenshot against the linked app's sidebar to confirm the shapes match.
- Build/typecheck clean.
