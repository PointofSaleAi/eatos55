# Wave 1 — Brand assets + content parity for the first 6 screens

Two pieces of work: get the eatOS marks into the app under your colour rules, and make the six uploaded screens match their real content exactly while keeping the imported design language.

## 1. Brand assets and colour rules

- Add the **black eatOS wordmark** ("eatos — Restaurants Made Simple") as the in-app logo, used on Sign in, Forgot password, Create an account, and any other brand moment. It renders black on light surfaces and white (inverted) on dark surfaces.
- The **pink icons** (app icon, apple-touch-icon) are used only as app/launcher icons and favicon — never inside page content.
- Favicon + apple-touch icon come from the pink app icon; a square copy lives in `public/` and is wired into the root route head.
- Rule recorded in project memory so future screens never place a pink logo in page content.

## 2. Screen content parity (6 screens)

Design stays as imported (dark shell, warm white surface, Archivo). Only copy, fields, and controls change to match the uploads.

**Sign in** (`/`)
- Black eatOS wordmark, heading "Point of Purchase".
- Fields: "Email Address" placeholder "Enter Email or Phone Number"; "Password" placeholder "Enter Password" with show/hide eye toggle.
- Primary "SIGN IN", then "Forgot Your Password?" link, then outlined "CREATE AN ACCOUNT".
- Version footer line: `Version 5.200.27(+11350)  FL 3.44.2  BD 31.07.26`.

**Forgot password** (`/access/forgot-password`)
- Back chevron, wordmark, "Point of Purchase", "Forgot Password", subtitle "Please select an option to change password".
- Both inputs shown together (not a toggle): "Email Address" → "Enter Your Email", the word "Or", then "Mobile Number" with US flag + `+1` prefix and `(XXX) XXX-XXXX`.
- Button "SEND OTP"; below it "Got your password? **Sign In**".

**Create an account** (`/access/create-account`)
- Single scrolling form with floating-label fields in this exact order: First Name, Last Name, Email Address, Phone Number (flag + `+1`, `(123) 456 7890`), Password (eye toggle), Country (dropdown, default United States), Restaurant Name, Restaurant Type (select).
- Checkbox: "eatOS's **Seller Agreement** and **e-Sign Consent**", then the submit button pinned at the bottom.

**Clock in / device keypad** (`/access/clock-in`) — rebuilt to match screens 01 and 02
- 4 asterisk PIN indicators in a white card.
- Keypad grid: 1-9, then `C` (red), `0`, `ENTER` (dark); next row `Clock Out` (red), `Break` (light), `Clock In` (green).
- Row below: fingerprint button, "Main" (current station), Face ID button.
- Outlined `LOG OUT` button, plus the floating new-ticket action.
- Screen 02 adds a station/order-type strip under LOG OUT: `Main`, `hbjnj`, `Online Ordering` with the selected one highlighted. This renders as one screen with the strip shown when the station picker is opened.
- Rendered as an overlay above the Tickets screen with the bottom tabs (Tickets / Orders / Settings) visible behind, as in the uploads.

**New order menu** (`/order/new`)
- Header: "Guest Name" over "(XXX) XXX-XXXX", search icon, kebab menu, outlined "Custom Item" button.
- Second row: "Barcode" dropdown plus category chips (`B` selected dark, `C`, `A`, `TEST BARCODE`).
- Empty state text "No products found for this category" when a category has no items, with the existing product grid used when it does.
- Bottom tabs remain Tickets / Orders / Settings.

**Bottom navigation**
- Tabs standardised to three: Tickets, Orders, Settings — matching every upload.

## Technical notes

- Assets: pink app icon + black wordmark uploaded through Lovable Assets, referenced by pointer; a real square PNG in `public/` for the favicon.
- No backend work — data stays in `src/lib/demo-data.ts` and `src/lib/pos-store.tsx`; new fields (guest name/phone, restaurant type options, order-type strip, version string) are added there.
- All six screens verified at mobile, tablet, and desktop widths.

When these are done I'll confirm, and you can upload the next 10.
