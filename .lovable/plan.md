# Make the whole app keyboard-aware

Right now only three screens (sign-in, forgot password, create account) shift up when the on-screen keyboard appears. Everything else with a text field can still be covered: ticket search, settings search, menu/order search and guest fields, custom item name, item detail notes and price, the More sheet, contact us and help center.

## What changes

1. Make keyboard awareness global instead of per-screen:
   - The app shell measures the keyboard height once and exposes it as a CSS variable (`--kb-inset`) on the device frame, so any screen can react without extra wiring.
   - Scrollable screen bodies and footers reserve that height, so no field, button or footer hides behind the keyboard.
   - A single shell-level focus listener scrolls whichever field gains focus into view just after the keyboard animation ends.

2. Bottom sheets (item detail / add-ons notes, More sheet, discount sheet) lift above the keyboard rather than being pushed off-screen, and their content stays scrollable while it is open.

3. Bottom tab bar hides while the keyboard is open on phones so it doesn't stack on top of the keyboard and eat vertical space.

4. Remove the now-redundant per-screen wiring from sign-in, forgot password and create account so there is one mechanism, keeping their current behaviour identical.

5. Verify across mobile portrait, mobile landscape, tablet and desktop: no visual change when no keyboard is present, and each field stays visible while typing.

## Screens covered

Sign-in, forgot password, create account, tickets (search), settings hub (search), new order (search/guest fields), custom item, item detail sheet, More/discount sheets, contact us, help center.

## Technical notes

- Keyboard height derived from `window.visualViewport` (`innerHeight - height - offsetTop`), read in an effect only, guarded for SSR; treated as 0 below a small threshold so desktop resizes don't trigger it.
- Exposed as `style={{ "--kb-inset": inset + "px" }}` on the frame; consumers use `pb-[var(--kb-inset)]` style padding utilities, so no colors, fonts or spacing tokens change.
- Focus handling via one `focusin` listener on the frame filtering to input/textarea/contenteditable, then `scrollIntoView({ block: "center" })` on a short timeout.
