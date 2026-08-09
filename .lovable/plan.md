# Temporarily bypass Sign in and PIN screens

Goal: another AI (or reviewer) can open the app and land straight on the working screens, without hitting Sign in or Clock In / PIN.

## What changes

1. Home route (`/`) redirects straight into the app instead of showing the Sign in form.
   - `src/routes/index.tsx`: add a `beforeLoad` that redirects to `/tickets`.
   - The Sign in UI stays in the file (unused), so restoring it later is a one-line revert.
2. Clock In / PIN route (`/access/clock-in`) redirects to `/tickets` as well, so nothing in the app can drop the reviewer onto a keypad.
3. Manager PIN route (`/access/manager-pin`) auto-approves: it immediately unlocks manager mode and continues to the requested destination instead of asking for 4 digits.
4. Session starts pre-authenticated so guarded UI (nav, tickets, order actions) renders: in `src/lib/pos-store.tsx` the initial session defaults to `signedIn: true, clockedIn: true`. Persisted-session loading stays as is.
5. Leave `/access/forgot-password` and `/access/create-account` reachable by URL, just not in the way.

## Notes

- This is a demo/prototype bypass only — no real auth exists in the app today, so nothing security-related is being disabled.
- Reverting is contained: remove the three redirect/auto-approve blocks and set the session defaults back to `false`.
- No visual/design changes anywhere; works the same on mobile, tablet and desktop.
