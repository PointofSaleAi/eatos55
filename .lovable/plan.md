# Make sign out real and finish the dead-end screens

I reproduced both problems in the running app, so here is what is actually wrong.

## What I found

**Sign out does clear the session — but nothing enforces it.** Tapping Sign Out (Settings or the drawer) empties the stored session and sends you to the login screen, yet every in-app screen is still reachable while signed out. Your open preview is proof: the stored session says `signedIn: false`, and the Tickets screen is still showing. Hit back, refresh, or tap a tab and you are straight back inside the app — so it looks like sign out did nothing.

**Settings is connected, but several destinations are empty.** Every row on `/settings` and in the burger drawer navigates correctly (I clicked through all of them plus all 39 screens; none 404s and none throws). The problem is what you land on:

- Workforce, Network and Hardware are a single sentence of placeholder text — a tap that "goes nowhere".
- Hardware > Integrations renders the same placeholder as Hardware itself.
- 19 rows across Settings, Control Center, Support, Contact Us, Help Center, Manager Controls and the account bar still only pop a toast instead of opening a screen.

So: nothing is broken in the wiring; the tree has holes at the leaves, and there is no session gate.

## 1. Session gate so sign out actually signs you out

- Add a gate around all in-app screens: no signed-in session redirects to the login screen, signed-in but not clocked in redirects to Clock In. Applies to Tickets, Floor, Rooms, Board, Orders, Order, Payment, Settings and System.
- Sign Out clears the persisted session, then replaces history rather than pushing, so the back gesture cannot walk back into the app.
- Clock Out drops the shift only and lands on Clock In (it should not require signing in again).
- Switch User keeps its current behaviour but routes through the same gate.

## 2. Fill every dead end in the Settings tree

- Workforce, Network, Hardware and Hardware > Integrations get real grouped content in the same style as General and Payments (rows, values on the right, captions), matching what those screens show in the original app.
- The 19 toast-only rows split into two kinds:
  - Navigation rows (a place to go: report views, category lists, partner lists, support articles) become real drill-down screens with grouped content and an explanatory empty state where there is genuinely nothing yet.
  - Genuine one-shot commands (print test receipt, open cash drawer, restart app, run diagnostics, send logs) stay commands, but confirm before doing anything destructive and report the result inline rather than a bare toast.
- Any row that cannot lead anywhere meaningful is removed rather than left as a tap that does nothing.

## 3. Full link sweep

Walk every screen and every row after the changes, on phone portrait, tablet and desktop, and confirm: no placeholder-only screens, no toast-only navigation rows, every back chevron returns to the correct parent, and no screen is reachable while signed out.

## Technical notes

- Gate lives in the app shell / a `beforeLoad` guard shared by the in-app route subtrees, reading the existing `session` from `src/lib/pos-store.tsx`; sign-out already exists and is not being changed, only enforced.
- New leaf screens reuse `SubHeader`, `GroupCard`, `IconNavRow`, `IconValueRow` and `settingsDetails` topics; new topics are added to `src/lib/settings-details.ts` so no screen can 404.
- No backend or business-logic changes.
