# Settings Search Bar in the Navigation Section

## Goal

On wide screens (tablet landscape / desktop) the Settings page shows the Apple-style
sidebar that lists **General** first. That navigation section currently has no search
bar — the phone/portrait hub has one, but the sidebar does not. Add a search bar at the
top of that sidebar, above the list that starts with General, and make it filter the
navigation destinations live.

## What to build

1. **Search bar in the settings sidebar** (`src/components/pos/split-pane.tsx`, `SettingsNavList`)
   - Render a search field directly below the "Settings" heading row and above the
     destination groups (General, …), inside the sidebar's scroll area.
   - Styling matches the existing hub search bar: rounded-pill, bordered surface,
     Search icon on the left, clear (X) button when text is present. Tappable
     minimum height per the shared control tokens.
   - Filtering: as the user types, keep only destinations whose label matches the
     query (case-insensitive); hide groups that have no matches. Typing nothing shows
     the full list again.
   - When no destination matches, show a small inline "No settings found" empty state
     in the sidebar (reuse the existing muted styling pattern, no modal).
   - Collapsed sidebar (icon-only strip): the search field is hidden while collapsed;
     expanding the list brings it back. No state is remembered between visits, in line
     with the existing collapse behaviour.

2. **Consistency across sizes**
   - Phone/portrait keeps the existing hub search bar untouched (it already sits above
     the navigation list).
   - The change is purely in the sidebar component, so it applies identically on
     tablet landscape and desktop.
   - No changes to data, routing or business logic — destinations still come from
     `settingsGroups` with the manager-only filter applied.

## Technical notes

- New local state (`query`) inside `SettingsNavList`; filtering via `useMemo` over
  `settingsGroups` filtered by label.
- Reuse the Lucide `Search` icon and existing design tokens (border-border,
  bg-muted, t-* type scale); no hardcoded colours.
- No server work; this is presentation-only.

## Verification

- Browser-check on desktop-wide, landscape tablet and phone sizes: search filters
  General/other entries, empty state shows for nonsense queries, collapsed sidebar
  behaves as before, and the phone hub search still works.
