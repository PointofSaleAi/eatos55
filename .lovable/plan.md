# Put the second word of each option label on its own line

## What happens now

In the docked right-hand options rail, labels such as "Transfer Check", "Service Charge", "Add Guest", "Gift Card", "Sell Voucher", "Create Deposit" and "Reopen Check" sit on one cramped line under their icon, while "Redeem Deposit" happens to break onto two lines. The result is uneven, and the long labels crowd the edge of the rail.

## What will change

Every two-word option label in the rail will always show its first word on line one and its second word on line two, centered under the icon — matching the second screenshot you attached. Single-word labels stay on one line. Nothing else moves: icons, order, colours, the rail width, and the tap actions all stay exactly as they are.

The phone and portrait version of the options list (the sliding panel with icons on the left) keeps its current one-line labels, because that layout has room and reads better that way.

## Technical details

- Only file touched: `src/components/pos/more-sheet.tsx`.
- The docked rail currently renders `row.label` as a single text run inside one span (line 148), so a break only occurs when the text physically cannot fit. Instead, the label will be split at its first space into a first word and a remainder, and each part rendered as its own block line (`block` spans inside the existing label span), so the break is forced rather than width-dependent.
- Labels with no space (none today) render as a single line; a hypothetical three-word label keeps word one on line one and the rest on line two, wrapping if needed rather than overflowing.
- The existing `title` attribute, `sr-only` heading, icon, value badge (e.g. service charge amount) and row height `min-h-[4.75rem]` are unchanged — two label lines plus the icon still fit inside the current row height.
- The non-docked `SheetContent` list branch (phone/portrait) is untouched.
- Responsive: the docked rail only appears on landscape-wide screens, so the change is verified there; phone and tablet portrait are confirmed unaffected.

## Verification

- Playwright on landscape 1180x820 and desktop 1440x1000: sign in, open New Order, tap the three-dot button, and screenshot the rail — confirm each two-word label occupies two lines, all text sits inside the rail bounds with no clipping, and the hovered/selected states still look correct.
- Playwright on phone 390x844 and tablet 834x1112: open the options panel and confirm it still shows the current one-line labels with no errors.
- Confirm the build log is clean.
