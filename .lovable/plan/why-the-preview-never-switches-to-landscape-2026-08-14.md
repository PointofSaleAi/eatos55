# Why the preview never switches to landscape

The screenshots show the sign-in screen ("/"). That screen is on the pre-login list, so the shell treats it as "no app chrome", and the landscape layout is gated on app chrome being present:

- `landscape = wide && appChrome`
- `appChrome` is false for `/`, `/access/create-account`, `/access/forgot-password`

So at any width, the login screen renders the fixed 420px framed phone card, centred on a dark backdrop — exactly what the screenshots show. The wide layout only appears after you sign in (Tickets, Floor, Settings, Order).

A second contributor: the "Handheld preview" toggle stores its choice in localStorage (`pos:layout-mode`). If it was ever set to `framed`, in-app screens also stay in the phone frame until it is switched back to "Full layout". That toggle is also hidden on pre-login screens, so there is no way to tell or change it from the login page.

## Fix

1. Make the access screens adaptive too: at 768px and up, drop the phone frame on `/`, `/access/*` and let the sign-in / clock-in / PIN content sit in a centred max-width column on the full-bleed background (same visual language, no artificial device bezel). Keep the current framed look below 768px.
2. Show the layout mode toggle on pre-login screens as well, so "Handheld preview" vs "Full layout" is visible and reversible from the first screen.
3. Make "Full layout" the default when nothing is stored, and ignore a stale `framed` value if the viewport is wide and the user has not toggled during this session — no silent phone-frame lock-in.
4. Verify at 1194x834 (tablet landscape), 1440x900 (web) and 390x844 (phone) that: login is full-width centred on wide, framed on phone; and after sign-in the nav rail + two-pane screens appear without needing a manual toggle.

## Technical notes

- `src/components/pos/shell.tsx`: split the `landscape` condition so wide access screens get the full-bleed container without the nav rail / tabs; move the mode toggle out of the `appChrome` guard.
- `src/hooks/use-layout-mode.ts`: keep `adaptive` as the default and only honour a stored `framed` value.
- No data or business logic changes; presentation only.
