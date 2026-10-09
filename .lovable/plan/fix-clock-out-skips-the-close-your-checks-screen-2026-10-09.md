# Fix: Clock Out skips the "Close your checks" screen

## Why it happens
There are two PIN pads with a Clock Out button:
- The lock screen PIN pad already checks for your open and unpaid checks, then opens the "Close checks to clock out" screen.
- The PIN pad in the top pull-down (the one you use while working) still clocks you out right away. It never looks for your checks.

## What changes
- The pull-down Clock Out will work like the lock screen one. After you enter your PIN, if you still have checks, the pull-down closes and the "Close checks to clock out" screen opens. If you have none, you're clocked out as before.
- After you charge a check from that screen and payment finishes, you go back to the "Close checks" screen instead of New Order.
- Works the same on phone, tablet and desktop.

## Technical details
- Add one shared helper in `pos-store` that says whether the signed-in server has checks left (`server === session.name && !closed`). Use it in `access.clock-in.tsx` and `clock-pulldown.tsx`.
- `clock-pulldown.tsx` onClockOut: after the PIN check, either close the sheet and `navigate({ to: "/access/clock-out" })` or call `clockOut()`.
- Store a `returnTo` flag when you tap Charge on the clock-out screen. The payment success "next" action reads it and goes back to `/access/clock-out`.
- Verify both entry points with Playwright using the seeded Elizer Cruz checks.
