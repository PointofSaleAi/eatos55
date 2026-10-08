# Restore original category & subcategory chip styling on New Order

## Problem
During the menu-selection work, the category and subcategory chips on `/order/new` were restyled: they became outline-bordered buttons (`variant="outline"`, `rounded-card`) with new colors (`bg-surface` inactive, primary/accent borders) and a different font size (`text-fs-xs`). The user wants the earlier look back exactly. The earlier attached references were for understanding only, not UI reference.

## Earlier design (from git history, commit a53e4d5) vs current
- Category chips (Bar Menu / Brunch / Dinner):
  - Earlier: plain filled pill, `h-9 rounded-pill px-3 text-[0.6875rem] font-extrabold uppercase leading-[1.05] tracking-tight`; active `bg-primary text-primary-foreground`, inactive `bg-muted text-muted-foreground hover:bg-secondary`. No border.
  - Current: outline `Button`, `rounded-card px-4 text-fs-xs`, primary border + fill when active, `bg-surface` when inactive.
- Subcategory chips (Brunch Sandwiches, etc.):
  - Earlier: plain filled tile, `h-10 rounded-card px-2 text-[0.625rem] font-extrabold uppercase leading-[1.1] tracking-tight`; active `bg-accent text-accent-foreground`, inactive `bg-muted text-muted-foreground hover:bg-secondary`. No border.
  - Current: outline `Button`, `text-fs-xs`, accent border when active, `bg-surface text-muted-foreground` when inactive.

## Changes (src/routes/order.new.tsx only)
1. Category chips (`categoryButtons`): switch from outline `Button` back to the original plain button markup and classes: `h-9 rounded-pill px-3 text-[0.6875rem] font-extrabold uppercase leading-[1.05] tracking-tight`, active `bg-primary text-primary-foreground` (with `hover:bg-primary/90` preserved for pointer users), inactive `bg-muted text-muted-foreground hover:bg-secondary`.
2. Subcategory chips: switch back to the original plain button classes: `h-10 rounded-card px-2 text-[0.625rem] font-extrabold uppercase leading-[1.1] tracking-tight`, active `bg-accent text-accent-foreground` (with `hover:bg-accent/90`), inactive `bg-muted text-muted-foreground hover:bg-secondary`. Keep the two-line `line-clamp-2` label and the horizontal `min-w-[7.25rem]` variant.
3. Keep all newer functionality untouched: menu dropdown, single layout-toggle icon, vertical grid vs horizontal scroll, category/subcategory hierarchy, phone Menu/Order switch.
4. The menu-dropdown trigger button keeps its current form (it is part of the requested dropdown feature), but drops nothing from chip styling.

## Verification
- Typecheck (`bunx tsgo --noEmit`) and check the build log.
- Playwright at phone (390px), tablet (1024px) and desktop (1440px): confirm pill-shaped filled category chips, filled subcategory tiles, correct font sizes, active/inactive colors, both layout-toggle modes, no overflow.
