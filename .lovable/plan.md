# Rename "Menu" to "Dashboard" and remove the Dashboard left-nav entry

## Current state (verified)

- The landscape left rail (`src/lib/nav-destinations.ts` → `railPrimary`) has two entries that both lead to the same shift-dashboard content:
  - "Dashboard" → `/dashboard`
  - "Menu" (four-square icon) → `/order/menu`, which now renders the dashboard (`ShiftDashboard`)
- The phone navigation drawer (`navGroups`) also lists "Dashboard" → `/dashboard` under Overview and "Menus" → `/order/menu` under Ordering.
- The header down-chevron (clock pull-down) navigates to `/dashboard`; `/dashboard` is in the pre-warmed screen list.
- `/order/menu` is linked from `src/lib/shift-summary.ts` and shows header title "Menu".

## Changes

1. **Left rail** (`src/lib/nav-destinations.ts` → `railPrimary`)
   - Remove the separate `{ to: "/dashboard", label: "Dashboard", icon: Gauge }` entry.
   - Rename the four-square "Menu" entry to "Dashboard" (keeps the four-square icon and `/order/menu` target, since the user identifies this item by its icon).

2. **Phone drawer** (`navGroups`)
   - Remove the Overview group's "Dashboard" link (the group becomes empty, so it goes away).
   - Rename the Ordering group's "Menus" link to "Dashboard" with the Gauge icon.

3. **Route consolidation** (`src/routes/order.menu.tsx`, `src/routes/dashboard.index.tsx`)
   - `/order/menu` becomes the single Dashboard page: update its header title to "Dashboard" and its head() title/description to say Dashboard (content stays the same).
   - Convert `/dashboard` into a redirect to `/order/menu` so the header chevron, pre-warm list, and any old links keep working without duplicating the page.

4. **Roadmap/memory**: no new preferences to store; update `roadmap.md` if an entry exists for this item.

## Result

One "Dashboard" entry in the left rail (the four-square item), no duplicate Dashboard entry, and the header chevron still lands on the dashboard.
