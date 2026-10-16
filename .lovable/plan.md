# Consistent table column alignment (app-wide)

Rule for every table: first column left-aligned, middle columns centered, last column right-aligned — for both header labels and row values, on phone, tablet and desktop.

## Tables to update
- Settings > Menu > Categories list (Name left; Parent, Position centered; Course right)
- Settings > Menu > Menus list (Menu Name left; Status, Start Date centered; End Date right)
- Menu editor day schedule (Days left; Start Time centered; End Time + copy button right)
- Cash Management cash log (Time left; middle columns centered; last column right)
- Cash Management employee tips (Name left; middle centered; last right)
- Shift Summary totals (Type left; Quantity, Amount centered; Tip right) — already correct, verify only
- Shared table component: add the same default (first left, middle center, last right) so future tables follow it

On phones where Categories collapses to stacked rows, there is no table, so it stays as is.

## Technical details
- Add a shared `tableAlign` helper/classes (e.g. `[&_th]:text-center [&_td]:text-center [&_th:first-child]:text-left ... [&_th:last-child]:text-right`) in `src/components/ui/table.tsx` and apply to raw `<table>` usages in menu-settings and cash-management.
- Grid-based tables (Categories, Menus) get `text-center`/`justify-self-center` on middle cells and `text-right`/`justify-self-end` on the last data column (chevron column stays last).
- Verify with Playwright screenshots at phone, tablet and desktop.
