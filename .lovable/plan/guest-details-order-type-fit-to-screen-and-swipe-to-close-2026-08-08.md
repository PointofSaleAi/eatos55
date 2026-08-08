# Guest details, order type, fit-to-screen and swipe-to-close

## 1. Guest name + phone are editable

- The "Guest Name / (XXX) XXX-XXXX" block on New Order and Custom Item becomes a tappable control that opens a compact Guest Details sheet: Guest Name, Phone Number, optional Party Size, Save / Clear.
- Guest info is stored on the order in the POS store, so it shows in the header, on the order review screen and on the created ticket.
- Phone field uses a numeric keypad input with (XXX) XXX-XXXX formatting; the sheet is keyboard-aware like the rest of the app.

## 2. Order type selection

- Add an order-type control next to the guest block: Dine In, Take Away, Delivery, Pickup, Online.
- Selected type is stored on the order, shown as a small label under the guest name, and carried into review, payment and the ticket record so ticket filters by order type work.
- Delivery/Take Away reveal the phone field as required (soft prompt, not a hard block) since those orders need contact details.

## 3. Fit to screen — no page scrolling to reach the bottom bar

Cause of the scroll: Custom Item and New Order each stack multiple fixed blocks (header, guest strip, keypad, footer trio, Review Order bar) inside a column that can exceed the viewport, so the whole screen scrolls instead of only the content area.

- Custom Item: lock the screen to the viewport height, keep header + guest strip + amount display + keypad in a non-scrolling column, and merge "Add to order" into a single bottom bar so the keypad shrinks to fit rather than pushing content off-screen. Keypad keys use a min/max height range so 320-tall and 430-tall phones both fit.
- New Order: merge the Review Order bar into the existing bottom trio row (Custom Item / Menu / Server Connected stays, Review Order becomes the primary bar directly above it) so only one footer stack exists and the content grid is the only scroll area.
- Verify on 320x568, 375x667, 393x736 and 430x932 that nothing but the content list scrolls.

## 4. Swipe down to close sheets

- Add drag-to-dismiss to the bottom sheets (item/modifier sheet, More, Discount, Guest Details, Menu): a grab handle at the top, downward drag follows the finger, release past a threshold closes, otherwise it snaps back. Tap-outside and the X keep working.

## Technical notes

- Files: `src/lib/pos-store.tsx` (guest + orderType state and ticket payload), `src/lib/demo-data.ts` (order type list), new `src/components/pos/guest-sheet.tsx`, new drag-to-dismiss wrapper used by `item-sheet.tsx`, `more-sheet.tsx`, `discount-sheet.tsx`, `guest-sheet.tsx`; layout edits in `src/routes/order.new.tsx`, `src/routes/order.custom-item.tsx`, `src/components/pos/numpad.tsx` (GuestHeader becomes interactive), plus review/ticket display of guest + order type.
- Portrait phone only; no landscape/desktop-specific layouts in this pass.
- Verification: Playwright screenshots at the four widths above, including keypad, item sheet drag close, and guest sheet with keyboard open.
