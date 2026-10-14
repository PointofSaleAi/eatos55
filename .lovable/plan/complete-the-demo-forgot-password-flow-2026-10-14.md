# Complete the demo Forgot Password flow

## Confirmed issue
Send OTP currently displays a success message and immediately navigates to Sign In. It does not send a code or show verification and password-reset steps. The previous update intentionally changed layouts only.

## Demo recovery flow
1. **Enter email:** Validate the email before continuing. Keep the mobile-number alternative, validating it when selected; when both are entered, make the delivery choice explicit.
2. **Verify code:** Replace the recovery form in the same screen with four code fields, the selected email or mobile number, a five-minute countdown, and Resend Code. Support typing, pasting, backspace, and editing the destination via Back. Use a clearly labelled demo code, `1234`; do not claim a real email or SMS was sent. Reject incorrect or expired codes with an inline error. Resending restarts the timer.
3. **Set new password:** After successful verification, show New Password and Confirm Password with visibility controls. Require at least eight characters and matching values.
4. **Completion:** Show a demo completion confirmation, then offer Return to Sign In. Explain that no real account password was changed.

## Layout and navigation
- Keep the landscape photo panel and our current styling through every step.
- Keep phone and portrait-tablet screens single-column, with scrollable content and keyboard-aware fields.
- Preserve entered contact details when stepping back; returning to Sign In or refreshing clears the temporary recovery flow.
- Keep all steps inside the existing Forgot Password page, without opening another modal or showing app navigation.

## Technical details
- Implement local UI step state in the Forgot Password screen, with a focused reusable code-entry control only if needed.
- Preserve the existing Sign In demo and all other account behavior. No Cloud connection, real authentication, email/SMS delivery, or persistent password storage.
- Keep the page’s app-specific metadata and use existing themed form and button controls.

## Verification
- Exercise email and mobile recovery, missing/invalid contact details, incorrect and expired codes, resend, back navigation, password mismatch, and successful demo completion.
- Check phone, portrait tablet, landscape tablet, and desktop, including short windows and keyboard-aware scrolling.
- Confirm Send OTP no longer redirects immediately to Sign In, the photo panel remains throughout the landscape flow, and the preview reports no build or browser errors.