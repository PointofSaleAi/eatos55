# Resume where you left off after PIN entry

Goal: entering your PIN returns you to the exact screen you were on last time, with your in-progress order intact. Device-local for now (no backend), remembered per PIN.

## Behaviour

1. While signed in and clocked in, the app quietly records the current screen (route path, including things like a specific ticket or settings sub-page).
2. The record is stored per staff PIN, so two people sharing a terminal each get their own last screen.
3. On successful PIN entry (Enter, Clock In, or biometric) the app navigates to that saved screen instead of always going to Tickets. No saved screen yet, or the screen no longer exists, falls back to Tickets.
4. The open order (cart items, guest name/phone, order type, notes, discounts) is saved alongside and restored, so returning to an ordering screen shows the same order.
5. Screens that must never be resumed into are skipped: Sign in, Clock In, Manager PIN, payment success. If the last screen was one of those, the fallback is Tickets.
6. Clocking out or signing out keeps the saved position (that is the point); it is cleared only when an order is completed/charged, which resets the cart naturally.

Works identically on phone, tablet and desktop, portrait and landscape.

## Technical notes

- `src/lib/pos-store.tsx`: add a `resume` slice persisted to `localStorage` under `eatos.pos.resume` as a map of `pin -> { path, order, savedAt }`. Reuse the existing hydrate-then-persist pattern used for session/settings/floor so SSR is unaffected.
- Track the PIN used at unlock in the session (the PIN entered on the gate), so resume state can be keyed by it; store only the PIN key needed for lookup, no new credentials handling.
- Recording the path: a small effect in `src/components/pos/shell.tsx` (where `useRouterState` and the session gate already live) writes the current pathname when `session.signedIn && session.clockedIn` and the path is not in the excluded list.
- Restoring: `src/routes/access.clock-in.tsx` currently hard-navigates to `/tickets` in the Enter / Clock In / biometric handlers. Replace with a `resumeTarget(pin)` lookup from the store that returns the saved path or `/tickets`, and restore the saved order into the cart before navigating.
- Guard against stale paths: validate the saved path against the router's match before navigating; on no match, go to `/tickets`.
- No design or layout changes; no new dependencies.

## Later (optional)

Making this follow a user across devices requires Lovable Cloud so the resume state lives server-side per staff member. Easy to layer on top of the same store slice when wanted.
