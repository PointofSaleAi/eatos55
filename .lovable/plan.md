# Complete the recorded demo signup flow

## Why only one step appears
The current Create Account action immediately signs into the demo and opens Clock In. Set PIN, Confirmation and OTP were excluded from the earlier landscape-only update.

## Scope
Add the four-step signup flow shown in the recording, using our existing UI and matching the demo approach approved for Forgot Password. No real account registration, email/SMS delivery, or employee PIN authentication is added.

## Flow
1. **Create Account:** Keep the current fields and agreement. Validate required fields, email, phone and password before continuing. Continue to Set PIN instead of signing in immediately.
2. **Set PIN:** Show four empty/filled PIN indicators and our calculator-order keypad. Require four digits, with clear and backspace controls. Continue to Confirmation without signing in.
3. **Confirmation:** Show the entered email and mobile number and let the user select which one to verify. Provide Back and Send actions. Back preserves account details and the entered PIN.
4. **OTP:** Show four-digit code entry, the selected destination, a five-minute expiry timer, and Resend. Clearly identify `1234` as the demo code and state that no message is sent. Support typing, pasting and backspace; show incorrect/expired-code errors. Resend clears the code and restarts the timer.
5. **Finish:** Only after successful demo verification, show completion and enter the existing signed-in demo Clock In screen. Make clear that no real account was created and the chosen PIN does not change existing demo employee-PIN behavior.

## Layout and navigation
- Landscape: retain the branded left area and display Create Account, Set PIN, Confirmation and OTP with active, upcoming and completed states. Replace only the right-hand content as steps advance.
- Phone and portrait tablet: show a compact progress indicator above the current step, with scrollable, keyboard-aware content.
- Use our current colors, typography, buttons, fields and PIN indicators—not the recording’s visual design.
- Back moves to the preceding step without losing account details. Cancel exits to Sign In; refreshing clears the temporary signup draft.
- Keep the flow inside Create Account, without app header/navigation or stacked modals.

## Technical details
- Replace immediate sign-in with route-local signup step state and gated completion. Keep passwords and the setup PIN transient; do not persist them or connect Cloud.
- Reuse existing keypad and code-entry controls where compatible; preserve calculator ordering and existing empty/filled PIN styling.
- Keep the existing demo Sign In and Forgot Password behavior unchanged, along with app-specific page metadata.

## Verification
- Exercise every step, validation, back/cancel, destination selection, wrong/expired code, resend, and successful completion.
- Confirm the demo remains signed out until verification succeeds and then reaches Clock In.
- Check phone, portrait tablet, landscape tablet and desktop, including short windows and resizing while retaining entered details.
- Check preview build status and browser errors, and regression-test Sign In and Forgot Password.