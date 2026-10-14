# Fix landscape Create Account and Forgot Password

## Scope
Update the layouts only, using the recording as a structural reference and retaining the app’s existing styling. Keep submission behavior unchanged; do not add Set PIN, Confirmation, OTP, real account creation, or message delivery.

## Confirmed current issue
The shared screen shell limits both pages to a centered 32rem column on wide screens. Create Account remains a single-column form, and Forgot Password does not retain the photo panel used by Sign In.

## Changes

### Create Account
- Use a full-width landscape layout with a compact left area for the eatOS wordmark, back control, and current Create Account section.
- Arrange the form on the right in two columns: First Name / Last Name, Email / Password, Phone / Country, Restaurant Name / Restaurant Type.
- Place the agreement below the fields, followed by Cancel and Create Account actions. Cancel returns to Sign In without creating an account.
- Keep our existing field styling, colors, typography, and password visibility control—not the recording’s visual design.
- Do not display inactive future steps for flows outside this request.

### Forgot Password
- Retain the existing Sign In photo carousel on the left and place the recovery form on the right.
- Keep the back control, wordmark, Point of Sale heading, email/mobile alternatives, Send OTP action, and Sign In link.
- Center the form within the available height when it fits; allow scrolling on shorter windows or when the keyboard is open.
- Keep the current Send OTP behavior unchanged; no verification screen or actual delivery is added.

### All screen sizes
- Use the landscape arrangements on sufficiently wide landscape tablet and desktop windows.
- Keep a single-column form on phones and narrower portrait screens, with all fields and actions reachable.
- Avoid horizontal clipping, excessive empty space, and keyboard-covered inputs. Preserve entered values when the window size or orientation changes.
- Keep these access screens free of the app header and left navigation.

## Technical details
- Adjust the shell’s wide-access wrapper so these routes can own their full-width layouts without changing Sign In or protected screens.
- Reuse the existing carousel, wordmark, layout hooks, keyboard handling, and themed controls. Use reliable back navigation with a Sign In fallback.
- Update only the two account routes and necessary shared presentation support; preserve current sign-in and submission state logic.
- Preserve unique page metadata and complete the required social metadata on the two touched routes.

## Verification
- Check phone 390×844, portrait tablet 768×1024, landscape tablet 1024×768 and 1141×742, and desktop 1440×900.
- Test opening both pages from Sign In, back/cancel navigation, form entry, password visibility, agreement state, submission, and resizing without losing entered values.
- Confirm fields and actions remain visible or scrollable on shorter screens, and Sign In plus in-app layouts remain unchanged.
- Check browser errors and the preview’s build status before completion.