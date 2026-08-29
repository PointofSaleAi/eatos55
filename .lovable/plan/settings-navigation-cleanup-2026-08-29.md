# Settings navigation cleanup

Five fixes across the settings area and the top pull-down menu.

## 1. Settings never opens blank

Today `/settings` on tablet/web shows the list on the left and an empty "Choose a topic" pane on the right. Instead, opening Settings from the tab bar, the nav rail, or the pull-down lands directly on General.

- `/settings` redirects to `/settings/general` on wide layouts, so the detail pane always has content.
- On phones the behaviour is unchanged: `/settings` stays the scrollable hub list, since there is no second pane.
- The "Choose a topic" placeholder for settings is removed.

## 2. Sales Summary Report moves under Reports

- New `Reports` row in the first settings group, opening a Reports screen that lists the available reports (starting with Sales Summary Report).
- `Sales Summary Report` is removed from the top level settings list and from the settings sidebar.
- The existing report screen keeps its data and gets Reports as its back target.
- The pull-down `Reports` tile points at the Reports list instead of jumping straight into one report.

## 3. Back arrow only when there is somewhere to go back

The back chevron currently renders unconditionally on sub screens, which produced the odd "Back to Back" tooltip on a top level pane.

- Back chevron only renders when there is real back history, or when the screen sits under a parent screen on phones.
- On wide layouts, a top level settings topic shown next to the sidebar shows no chevron, because the sidebar is the way back.
- Tooltip and aria label read "Back to Settings" style text, never "Back to Back". A plain "Go back" is used when there is no named parent.

## 4. Collapse the settings list to icons

- The settings list pane gets a collapse control: collapsed it becomes a narrow icon-only strip (icons with tooltips), expanded it is the current labelled list.
- Collapsing is triggered by tapping the "Settings" heading in the pane, matching the nav rail pattern where the venue avatar toggles the rail.
- Choice is per visit, not remembered, same as the nav rail.

## 5. Pull-down menu polish

- Remove the underlines under the tile titles.
- Tighten the grid: reduce the large empty area by pulling the tiles up under the top bar, capping title size, and letting the grid rows sit closer together, so on tablet/desktop the nine tiles read as one compact block rather than floating in grey space.
- Darken/solidify the overlay so the page behind does not show through and compete with the menu text.
- Entry check: nine entries stay as Restaurant, Menu, Payment, Workforce, Reports, Advanced, Guestbook, Support, Log out, matching the reference. Reports now goes to the Reports list, Guestbook to the guestbook screen, Advanced stays manager only.

## Technical notes

- `src/routes/settings.index.tsx`: drop the Sales Summary row, add Reports, add wide-layout redirect to General.
- `src/components/pos/split-pane.tsx`: settings sidebar link list updated (Reports replaces Sales Summary Report), settings placeholder removed, collapsible icon-only mode added to the list pane.
- New `src/routes/settings.reports.tsx` listing reports; `src/routes/settings.sales-summary.tsx` keeps its content with Reports as back target.
- `src/components/pos/shell.tsx`: `BackButton`/`SubHeader` gain a "has anywhere to go back" check and correct labels.
- `src/components/pos/settings-pulldown.tsx`: remove underline, compact spacing, opaque overlay, Reports route update.
- No data or business logic changes; tender, payment, and store logic untouched.
