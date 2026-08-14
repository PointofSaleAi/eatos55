# Fix double close buttons, kill scrolls, bigger keypad, order panel parity

## 1. One close button, not two

Every dialog and sheet currently shows two "x" marks: the shadcn `DialogContent` / `SheetContent` primitives render their own built-in close button, and our custom headers add a second one. Fix at the source:

- Add an opt-out on the primitives (`hideClose`) and use it wherever a custom header already provides a close control, or remove the custom one and keep the built-in.
- Sweep every popup that has a header close: room charge, reference tender (Uber Eats / Doordash / Grubhub / loyalty / in-kind), item sheet, more sheet, discount, guest, guests, tip, status, split sheets, PIN, confirm.
- Result: exactly one close affordance per popup, 44px tap target, same position on phone, tablet and desktop.

## 2. Minimise scrolling

- Room Charge dialog: it currently scrolls its whole body inside `max-h-88vh`. Rework into a fixed layout: search + floor filter row, booking strip, room strip (horizontal scroll only, as in the real system), then the stay facts as a compact 2-column grid that shrinks with viewport (smaller label/value type, tighter cards, entitlements as inline chips). Only the room strip scrolls; on short viewports the facts grid drops to a denser step instead of scrolling.
- Reference tender popup: content sized to fit; keypad shares the remaining space, no body scroll.
- Verify no page-level scroll on the order screen, payment method, tender screens at 320, 393, 768, 1024, 1280 and in landscape.

## 3. Bigger digits on House Account and all tender keypads

- Raise keypad digit type and key height: digits move to the display scale (`--fs-2xl`+) with a larger fluid clamp on wide screens, keys fill the available column height as in the screenshot (large white rounded keys, 3 columns, `.` `0` `delete` bottom row).
- The amount readout above ("$8,888.00", "Due ... / Change ...") gets the largest step so it reads across a tablet.
- Same treatment applies to cash, gift, house, split and other tender screens so they stay consistent.

## 4. Drop the separate review page

The right-hand order panel already shows everything the review page did, so review becomes redundant.

- `/order/new` right panel footer gets three actions: `Save`, `Fire`, `Charge $X.XX` (Charge is primary and full-emphasis, Fire secondary/warm, Save quiet).
- Save keeps the order open as a ticket, Fire sends it to the kitchen, Charge goes to `/payment/method`.
- On phone portrait (no side panel), the same three actions live in the bottom action bar; the cart opens as the existing panel/sheet rather than a separate route.
- `/order/review` stops being linked; the route redirects to `/order/new` so old links and back navigation stay safe.

## 5. Order panel parity with the real system

From the screenshots, the panel needs:

- Header: guest name, phone, `ARRIVED AT h:mm PM`, and the round icon row: discount (%), seat/split move, no-tax, course (C), currency/price override.
- Segmented `DINE-IN / TAKEOUT / DELIVERY` with the correct icons.
- Meta row: `ORDER# --` on the left, staff name upper-cased on the right.
- `Order Notes` field with a notes icon.
- Line items in `1 ea  Item Name  $21.00` form, quantity stepper on hover/tap, modifiers listed under the line.
- Totals block: `Sub Total`, `Tax`, `Total`.
- Footer: `FIRE` + `CHARGE $X.XX` (plus `Save`).

Menu grid keeps the existing behaviour: category rows, stock badges, out-of-stock and open-price markers, `+` tile action.

## Technical notes

- Presentation-only pass plus the two navigation changes (review route redirect, new Save/Fire actions wired to existing store methods). No pricing or tax logic changes.
- `hideClose` prop added to `src/components/ui/dialog.tsx` and `src/components/ui/sheet.tsx`; all POS popups updated.
- Keypad sizing goes through `src/styles.css` tokens (`--key-h`, a new display step) so every tender screen scales together.
- Order panel work lands in `src/routes/order.new.tsx` and the guest/header blocks; `src/routes/order.review.tsx` becomes a redirect.
- Verified with screenshots at 320, 393, 768, 1024 and 1280 wide, portrait and landscape.
