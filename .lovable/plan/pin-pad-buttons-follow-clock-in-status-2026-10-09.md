# PIN pad buttons follow clock-in status

## Behavior
- **Not clocked in:** Clock Out and Break are always disabled. Clock In and ENTER turn on once 4 PIN digits are typed, same as now.
- **Clocked in:** Clock In is always disabled. Clock Out, Break and ENTER turn on once 4 digits are typed.
  - ENTER brings you back to the screen you opened the PIN pad from (when you open it from the top-bar pull-down it closes and you stay where you were; on the lock screen it goes to that last screen, or to New Order if there isn't one).
- **On break:** Break is disabled while you're already on break. Starting a break saves an "on break" status. Clocking out clears both statuses.
- Applies on phone, tablet and desktop, on both the lock-screen PIN pad and the top-bar pull-down PIN pad.

## Technical details
- `pin-pad.tsx`: add `clockedIn?: boolean` and `onBreak` state props; per-key disabled = `!pinReady || statusBlocks`.
- `pos-store.tsx`: add `session.onBreak`, plus `startBreak()`; `clockOut` resets `clockedIn` and `onBreak`; `clockIn` resets `onBreak`.
- `access.clock-in.tsx` and `clock-pulldown.tsx`: pass `session.clockedIn` / `session.onBreak`, wire Break to `startBreak`. Lock screen ENTER uses the saved last route (falls back to `/order/new`).
- Verify with Playwright in both states at 390, 768 and 1141 widths.

## Question
Should ENTER while on break also end the break, or does the employee need a separate step for that?
