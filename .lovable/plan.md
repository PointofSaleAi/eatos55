# Apple-style navigation and Settings drill-down

Two problems today: the drawer is one long scrolling list with a "Navigation" heading and every Settings sub-page flattened into it, and there is no Sign Out. Apple's model is the opposite — a short list of destinations, then you drill in, one level at a time, with a back chevron that names the parent.

## 1. Drawer becomes a short destination list

- Drop the "Navigation" title bar. The drawer opens straight onto the list with just a close affordance, the way iOS sheets do.
- Only top-level destinations, grouped, no sub-pages: Ordering (New Order, Menus, Custom Item), Service (Floor Plan, Rooms, Tickets, Order Status Board), Money (Payments, Sales Summary, Shift Summary), then a single **Settings** row and a single **Support** row. No scrolling on a 375x667 phone.
- Each row keeps its icon in the same accent style already used by settings rows, current destination marked as selected.
- Footer actions: Manager Controls, Clock Out, and **Sign Out** (calls the existing `signOut`, returns to the login screen). Sign Out uses the destructive confirm sheet already in the project; Clock Out does not.

## 2. Settings behaves like iOS Settings

- `/settings` is the only entry point to the settings tree: large title, search, user card, grouped rows, drill in from there. Nothing in the tree is duplicated in the drawer.
- Every screen in the tree uses one consistent header: back chevron labelled with the parent screen ("General", "Hardware", …), centred title, no redundant "Back" text.
- Rows always drill to a real screen. Audit and fix every row across `/settings` and all sub-screens so none is a toast or a dead tap:
  - group header + grouped card + footer caption pattern, matching the sub-screen content already defined in `settings-details.ts`
  - value-on-the-right rows for current selections, checkmark pick lists for choices (Language, Currency, Tax Alias), toggles inline
  - genuinely empty screens get an explanatory empty state, not a blank page
- Add the missing depth so the tree matches the original app's structure: Notifications, Sales Summary, Customer Support and Contact Us all reachable from `/settings` rather than only from the drawer.

## 3. Design language

Apple's *structure* — grouped inset lists, drill-down hierarchy, back chevron naming the parent, right-aligned values, single-column rows at ≥44px — applied through this project's existing tokens, type scale and accent colour. No Apple iconography, no system blue, no copied wording or artwork; it should read as a well-built iOS-native app, not as a clone of the Settings app.

Mobile portrait, tablet and desktop all verified.

## Technical notes

- `src/components/pos/nav-drawer.tsx`: new grouped structure, header removed, Sign Out added via `usePos().signOut` + `useConfirm`.
- `src/routes/settings.*.tsx`: header contract pass, `topic` wiring for any remaining toast-only rows, new rows for Notifications / Sales Summary / Support paths.
- `src/lib/settings-details.ts`: add detail content for any topic newly linked so no screen 404s.
- No store/business-logic changes beyond wiring the existing `signOut`.

## Open question

I can't re-verify the live `pos.eatos.net` tree in this pass without a session; the settings hierarchy will follow the uploaded screens plus what's already captured in the project. If you want an exact row-by-row diff against staging, say so and I'll log in and audit it first.
