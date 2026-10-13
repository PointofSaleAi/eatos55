# Rename Floor Plan / Order Status and add the orderOS icon

## Current state (verified)

- `src/lib/nav-destinations.ts` defines both the landscape rail and the phone drawer: `railPrimary` has "Floor Plan" (Sofa icon) and "Order Status" (Columns3 icon); `navGroups` has "Floor Plan" and "Order Status Board".
- The icon slot is typed `icon: LucideIcon` and rendered as `<l.icon className="size-6 shrink-0" />` in `nav-rail.tsx` and `nav-drawer.tsx`.
- Visible "Order Status" text also exists in `src/routes/board.index.tsx` (h1 + head title/og:title); "Floor Plan" appears in `floor.index.tsx` head metadata and in help copy in `src/lib/help-content.ts`.
- The uploaded icon (`OrderOS_white_3.svg`) is a 48x40 mark currently filled with a fixed gray (#BCBCBD).

## Change

1. New icon component `src/components/pos/icons/orderos-icon.tsx` built from the uploaded SVG paths, with `fill="currentColor"` so it inherits exactly the same color treatment as the other rail icons (dim when inactive, full-strength when active) on phone, tablet and desktop.
2. `src/lib/nav-destinations.ts`:
   - Widen `NavLink.icon` to `React.ComponentType<{ className?: string }>` (Lucide icons already satisfy this) so the custom icon can sit beside Lucide ones.
   - `railPrimary`: "Floor Plan" → "Table Order" (keep the Sofa icon); "Order Status" → "orderOS" with the new icon.
   - `navGroups`: same two renames ("Order Status Board" → "orderOS").
3. `src/routes/board.index.tsx`: h1 and head/og:title read "orderOS - {brand} Point of Sale".
4. `src/routes/floor.index.tsx`: head/og:title read "Table Order - {brand} Point of Sale".
5. `src/lib/help-content.ts`: update the three help sentences that reference "Floor Plan" / "Order Status Board" to the new names.

Route paths (/floor, /board), icons for other entries, and the phone tab bar's short "Home"/"Board" labels stay untouched.

## Verification

- Playwright: sign in, enter PIN, check the rail shows "Table Order" and "orderOS" with the new mark; click each destination; check the phone drawer (narrow viewport) shows the same labels and icon; screenshot both states.
- Confirm the orderOS icon renders in the dim inactive color and brightens on the active destination like the other icons.
- Build log clean.
