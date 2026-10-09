# PIN entry: keep accepting any 4-digit PIN

## Answer to your question

Yes — entering any 4 digits and tapping Enter is the intended behavior today. There is no "correct" PIN stored anywhere yet, so every 4-digit PIN unlocks the app.

## What changes

Nothing right now. The lock screen keeps accepting any 4-digit PIN, on both the lock screen and the top-bar pull-down pad.

## Later: PINs from the admin dashboard

When the admin dashboard manages employees, each employee gets a PIN there. At that point the lock screen changes to:

- Look up the signed-in/selected employee's PIN.
- Enter only unlocks when the typed PIN matches; a wrong PIN shows "Incorrect PIN", clears the pad and stays on the lock screen.
- Clock Out, Break, Clock In and the top-bar pull-down use the same check.

## Technical notes (for when that lands)

- `src/lib/pos-store.tsx` already has `session.pin` (currently unused, `null`) — the admin-dashboard PIN would flow into it.
- The unlock check lives in `src/routes/access.clock-in.tsx` (`withPin` / `unlock`); validation goes there and in `src/components/pos/clock-pulldown.tsx` for the pull-down pad.
- No other screens are affected.
