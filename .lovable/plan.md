# Lock the Clock In screen behind an opaque PIN gate

The Clock In screen currently renders as a normal in-app page: it shows the "Tickets" title and "MAIN" label, the left navigation rail, and a second, plainer keypad. It should be a full, opaque gate where nothing is reachable until a 4-digit PIN is entered.

## What changes

1. Opaque full-screen gate
   - `/access/clock-in` no longer renders app chrome: no left nav rail, no bottom tab pill, no navigation drawer, no "Tickets" heading and no "MAIN" revenue-center label.
   - The screen paints a solid opaque background over the whole viewport, matching the original design (no transparency, nothing of the app showing through).
   - The dark top bar with the pull-down handle stays, exactly as in the reference, so the user can still see who is clocked in.

2. Use the original numeric pad
   - Replace the local keypad markup in `src/routes/access.clock-in.tsx` with the shared `PinPad` component (`src/components/pos/pin-pad.tsx`): masked 4-star display, raised gradient keys, red `C`, dark `ENTER`, the red Clock Out / Break / green Clock In row, fingerprint + revenue-center + Face ID row, and the outlined `LOG OUT` bar.
   - Keep the date / time / weather / location panel beside the pad in landscape, stacked above it in portrait.

3. PIN is required for every action
   - ENTER, Clock In, Clock Out and Break all require 4 digits; otherwise show "Enter your 4-digit PIN" and stay put.
   - Biometric keys stay as sign-in shortcuts (Touch ID / Face ID), matching current behaviour.
   - Log Out signs out and returns to the sign-in screen.
   - Remove the floating "new ticket" shortcut and the order-type picker from this screen, since nothing should be actionable before the PIN. Revenue center shows as the read-only middle key, as in the design.

4. Responsive parity
   - Desktop and tablet landscape: two columns (clock panel left, pad right), sized to the viewport with no scrolling.
   - Tablet portrait and phone: single column, compact clock strip above the pad, pad fills remaining height, no scrolling.

## Technical notes

- `src/components/pos/shell.tsx`: treat `/access/clock-in` as a chrome-free gate (same handling as the sign-in route) so the rail, tabs and drawer do not mount; the session gate that redirects unclocked sessions here stays unchanged.
- `src/routes/access.clock-in.tsx`: drop the fake Tickets header, order-type strip and ticket shortcut; compose `ClockPanel` + `PinPad` inside an opaque full-height container.
- No store or business-logic changes beyond wiring the existing `clockIn` / `clockOut` / `signOut` actions to the shared pad.
