# Fix: "PIN accepted" but Enter doesn't let you in

## Cause
When you're not clocked in, Enter signs you in but doesn't clock you in. The app's screen guard only allows people who are clocked in onto New Order, so it sends you straight back to the PIN screen.

## Fix
- Let a signed-in person reach the app screens even when they haven't clocked in. Enter will open New Order whether or not you're on shift.
- Clock In stays its own separate step (job type, summary, mood). Clock Out and Break stay disabled while you're off shift, as they are now.
- Signed-out people still get sent to the sign-in screen.
- Enter while clocked in keeps working the same way.

## Technical details
- `src/components/pos/shell.tsx` `useSessionGate`: remove the `signedIn && !clockedIn → /access/clock-in` redirect, and the `!clockedIn` part of the pending-redirect return value. Keep the signed-out redirect.
- Loosen the resume-path save and main-screen preload so they need only `signedIn`.
- Check other `clockedIn`-only guards (Clock Out ticket logic stays unchanged).
- Verify with Playwright on phone, tablet, landscape and desktop: off shift → enter PIN → Enter → New Order stays open after reload. Clock In flow still works.
