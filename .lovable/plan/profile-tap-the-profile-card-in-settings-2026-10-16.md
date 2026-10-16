# Profile (tap the profile card in Settings)

Make the profile card at the top of the Settings left nav (and the Settings home on phone) open a new **Profile** screen that follows the recording.

## Profile
- Large round avatar with a small pencil badge and the full name + role underneath (e.g. "Francist dsasad Obera", "Manager").
- Tapping the avatar opens Take Photo / Choose from Library (same photo picker as Products). The chosen photo shows in the avatar and the profile card.
- Rows: **Personal Information**, **Security**, **Job Type** (shows the current role once clocked in, e.g. "Chef").
- **LOG OUT** button: asks to confirm, then signs out to the login screen like the existing sign-out.

## Personal Information
- First Name, Middle Name, Last Name (inline editing; changing them updates the name everywhere).
- Date of Birth: opens our wheel date picker (month / day / year).
- Email and Phone Number (phone uses our five supported countries and validation).
- ADDRESS row showing the full address; tapping opens an address search field with a clear button and a location button, plus Address 1, Address 2, City, State, PostCode (optional), Country (optional). It stays in sync with the summary line.
- "See how your data is managed..." link opens our Privacy Policy viewer inside the app.

## Security
- **PASSWORD**: Current, New, Confirm (masked). Hint: "Your password must be at least 8 characters long, an uppercase letter and a lowercase letter." Missing fields show a "Please fill all fields" notice with OK; mismatches/invalid show a notice; success shows a toast. Demo only — never stored or used to sign in.
- **TWO FACTOR AUTHENTICATION**: master switch. When on, shows **Mobile Number** and **Authenticator App** switches.
  - Mobile Number on → "Phone Number" sheet: country (+1 United States default), phone input, **Send OTP** → enter a 6-digit code → turns on. No real SMS is sent (we say so).
  - Authenticator App on → "Authenticator App" sheet with a QR code, the setup code (e.g. EV2FE4CCLQDBGFAR) and **Next** → enter a 6-digit code → turns on.
  - Hint: "Enable two factor authentication to add an extra layer of security to your account."
  - Closing a sheet by tapping outside leaves the switch off.
- **PIN SETTINGS**: Change Pin (••••) → current / new / confirm PIN on our calculator-style keypad; demo only, never changes real sign-in.

## Job Type
- Opens the existing clock-in role chooser: "Good Evening, {name}! Are you sure you want to clock in?" with role tiles (Busser, Chef, Cook, Cashier, Dishwasher), today's date/time and **CLOCK IN**. Clocking in sets the role shown on Job Type and the profile card shows "Clocked in at ...". If already clocked in, it shows the current role.

## Devices
Tablet and desktop: opens in the right pane with the left nav visible and the card highlighted. Phone: full screen with Back to Settings.

## Technical details
- New route `src/routes/settings.profile.tsx` (with head), sub-views for personal info / security handled in-page with SubHeader `onBack`.
- Make the profile card in `split-pane.tsx` and `settings.index.tsx` a Link to `/settings/profile`, with active styling.
- New `src/lib/profile-settings.ts` (localStorage `eatos.pos.profile-settings`) for name parts, DOB, contact, address, photo, 2FA flags; name changes update the session name.
- Reuse PhotoDialog pattern, phone-country helpers, wheel date picker, LegalDocViewer, PinPad, and the clock-in RoleStep / clock-in action.
- QR code drawn from a local generator (`qrcode` package) for the demo secret.
- Add an AGENTS.md rule: profile security settings are demo-only and never used for authentication.
