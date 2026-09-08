# Tap to Pay: proper turn-off (offboarding) flow

## What I found first

Nothing was deleted. Searching the whole project for turn-off logic shows only a single red "Turn off on this iPhone" button in two places, and it has always jumped straight back to "Not set up" with no confirmation and no dedicated screens. There is no earlier version of offboarding screens in the current code, and no step in my recent work removed one.

## What to build

A real turn-off journey, reachable from both existing buttons:

1. Confirm sheet (full-screen, Apple style, same look as the Terms sheet)
   - Title: "Turn off Tap to Pay on iPhone?"
   - Plain explanation: this iPhone will stop accepting contactless payments, the linked Apple ID stays linked, past payments are unaffected, and it can be set up again any time.
   - Actions at the bottom: "Turn Off" (red) and "Cancel".
2. Turning off progress state (short, matches the existing "Setting up..." screen).
3. "Tap to Pay is turned off" confirmation, centered, with a large status icon and a "Done" button plus a "Set Up Again" action.
4. If turning off cannot complete, a "Couldn't turn off" state with "Try again" and "Cancel", mirroring the existing "Setup didn't finish" screen.

After turning off, the settings page returns to its "Not set up" state, the payment screen stops offering Tap to Pay as a tender, and the accepted terms date is kept so re-setup skips the terms sheet.

## Technical notes

- New route `src/routes/tap-to-pay.turn-off.tsx` holding the confirm/progress/done/failed states, reusing existing status-icon and button styling.
- Add a `TapToPayTurnOffSheet` next to `TapToPayTermsSheet` in `src/components/pos/tap-to-pay.tsx` if the confirm step stays a sheet.
- Both current buttons (`settings.tap-to-pay.tsx` line ~86 and `tap-to-pay.setup.$from.tsx` line ~465) navigate to the new flow instead of calling `updateSettings` directly.
- `tapToPayState` in `src/lib/pos-store.tsx` gains a `turningOff` value; terms acceptance timestamp is preserved.
- Verify at 1440x950, 1181x713, 1024x768 and 390x844, then typecheck and build.
