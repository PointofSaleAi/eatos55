# Payment screens: no blank page, more tenders, tighter keypad

## Problems

1. `/payment/method` renders only a bottom sheet, so the screen behind it is an empty dark page — there is nothing showing what is being paid for.
2. Only four tenders (Card, Cash, Loyalty, QR) exist; real handheld has more.
3. Pay by Cash wastes vertical space: a large gap sits between the denomination row and a keypad that never grows, so keys stay small.

## Changes

### 1. Payment method screen shows the order
Turn `/payment/method` into a real screen instead of a floating sheet on nothing:

- Header with back chevron and title `Payment`.
- Summary panel: order number, guest name / order type, item lines (name, qty, line total), then Subtotal, Tax, Total due, and Balance remaining when a partial payment already exists.
- Tender grid sits in a docked panel at the bottom of the same screen, keeping the current circular-icon look and copy `Select Payment Method` / `Total due $X`.
- Back chevron returns to order review; no more dead blank canvas.

### 2. More payment methods
Tender list becomes a scrollable grid (4 per row, wraps):

Card, Cash, Loyalty, QR Code, Gift Card, Split Payment, House Account, Other (external / manual entry).

- Card and Cash keep their existing dedicated screens.
- Gift Card and House Account go to the cash-style amount screen with their own title and no denomination row.
- Split Payment opens an amount screen pre-filled with half the balance, and after committing it returns to this screen with the remaining balance shown.
- Loyalty, QR Code and Other keep light-weight confirmation behaviour (scan / display prompt) as today.

### 3. Pay by Cash layout
- Denomination buttons become a 3x2 grid of taller pill buttons (larger tap target, bigger label) directly under the amount readout.
- The keypad becomes the flexible element: it takes all remaining height so keys grow instead of leaving a dead band, with the same 4-row 3-column layout as the screenshot.
- Amount readout stays compact at the top; whole screen fits the viewport with no internal scroll on a 320px-wide phone.
- Same treatment applied to Pay by Card and the new gift-card / house-account amount screens so all tender keypads match.

### 4. Responsive
Verified at mobile portrait (320 / 393 / 430), tablet and desktop widths: keypad grows within the device frame, tender grid wraps, order summary scrolls independently.

## Technical notes

- `src/routes/payment.method.tsx`: replace `Sheet` with a full-screen flex column reusing the review-line markup; add tender config list with route targets.
- Extract the shared amount+keypad screen into `src/components/pos/tender-screen.tsx` (props: title, due, showDenominations, onCommit) and use it from `payment.cash.tsx`, `payment.card.tsx`, and a new `payment.tender.$kind.tsx` for gift card / house account / split.
- `src/components/pos/numpad.tsx`: `plain` variant becomes `grid min-h-0 flex-1 auto-rows-fr` so keys fill available height; keep existing `order` variant untouched.
- Balance tracking uses existing `commitPayment` in `src/lib/pos-store.tsx`, plus a `paid` accumulator so split payments can report remaining due. No schema or backend changes.
