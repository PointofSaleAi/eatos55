# Room Charge: New Design for Select Room and the Room Bill

Two screens only: the room picker with the stay and credit review, and the printed bill that the guest signs. Everything else in the payment flow stays as it is.

## 1. Select Room, rebuilt

- One clear header row: title on the left, floor filter pills on the right, close button pinned to the corner. On phones the pills drop to their own line so nothing crowds or overlaps.
- Search sits directly under the header, full width, with a live result count.
- Rooms show as a tidy card grid that always fits the screen, paged with arrows rather than scrolled. Each card reads: room number badge, room type, guest name, credit left. Rooms without enough credit stay visible but dimmed with a plain "Low credit" or "No booking" mark.
- Picking a room opens the review side rather than replacing it on tablet and desktop: rooms on the left, the selected stay on the right, so staff can compare rooms without going back and forth. On phones it stays a two step flow with a back arrow.
- Stay review is reorganised into three tidy blocks: booking facts, allowances, and one dark credit card showing available credit, limit, used bar, transaction total and due today. Long values truncate with a tooltip instead of pushing other text out of place.
- Footer holds two actions: "Print bill for signature" then "Post charge to room". Posting stays locked until the bill has been printed.
- No overlapping text at any size: the review area is a fixed height region with its own internal fit rules, so the footer can never collide with the credit card or the allowance tiles (the bug visible in the screenshots).

## 2. Room Bill, receipt-style paper

- Opens as a centred paper sheet: narrow column, soft paper edge, subtle top and bottom tear, mono type for figures so columns line up like a real printed ticket.
- Header block: venue name, room and room number, guest, stay period, order number, date and time.
- Items block: every line item with quantity and amount, right aligned in a fixed money column. When the list is longer than the sheet, the items area gets its own quiet inner scroll while the header and totals stay pinned, so nothing is ever cut mid line as in the screenshot.
- Totals block: sub total, tax, tip, total due, with total due given the strongest weight.
- Signature block: a ruled signature line, printed name, and a small "Charge to room" line so the paper reads as an authorisation slip.
- Footer actions: Print, and Close. Printing marks the bill as printed and returns to Select Room with the post action unlocked.
- Sheet scales to the viewport: full width paper on phones, fixed comfortable width on tablet and desktop, never taller than the screen.

## Rules

- Works with no page scrolling on phone portrait, tablet portrait and landscape, and desktop.
- Existing design tokens and fonts only, no new colours invented.
- No em dashes in any copy.

## Technical notes

- `src/components/pos/room-charge-dialog.tsx`: restructure into `RoomPicker`, `StayReview` and footer sections inside one flex column. Replace the current `lg:grid-cols-12` block with a side by side picker plus review at `lg:`, keeping the paged grid from `useGridShape`. Drop the `@media(max-height:...)` hide hacks in favour of a single fit region.
- New `src/components/pos/room-bill-sheet.tsx`: receipt paper component driven by the active order lines and totals from `pos-store`, plus the picked `Room` and its `stay`. Uses `Dialog` on wide viewports and `Sheet` on phones, matching the existing pattern.
- `src/components/pos/room-charge-dialog.tsx` owns the printed state and renders the bill sheet; `payment.method.tsx` keeps its current `onCharge` contract, so no changes to payment logic.
- No data model or store changes required.
