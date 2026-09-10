# Phone payment flow: bill first, then payment options

## What is wrong today

On a phone the bill and the payment options are crammed onto one screen, so the bill is boxed into a third of the screen, the method list is clipped mid-way and the big action button sits over the bottom tabs. The original design used two steps on a phone.

## New behaviour on phones (portrait and landscape)

Step 1 — Bill: the check fills the screen and scrolls normally: order number, order type, guest, totals, tax, discounts, part payments and every line item. One action at the bottom: "Continue to payment".

Step 2 — Payment options: its own page with a back arrow to the bill, a slim header showing Total Due, the grouped payment options with room to breathe, and the charge action pinned above the bottom tabs. Choosing a method opens the same amount pad, sheets and dialogs as now.

Tablet and desktop keep the current side-by-side view: bill on the left, methods on the right, unchanged.

## Tap to Pay visibility

- Tap to Pay on iPhone becomes a normal switch in Settings > Payment Methods, on by default. When it is switched off it disappears from the payment page completely, exactly like every other tender.
- When it is on, it only appears on an iPhone (or with the hidden manager developer switch). On iPad, Android, Windows and desktop the row is removed entirely instead of showing a greyed "Available on iPhone only" line, so no space is wasted.
- No Android/Google tap to pay is added. Google's contactless acceptance needs no separate onboarding of its own, so nothing extra is provided.

## Technical notes

- New route `src/routes/payment.bill.tsx` for step 1 (phone only): reuses the receipt block from `payment.method.tsx`, extracted into `src/components/pos/payment-bill.tsx` so both the phone step and the tablet/desktop left pane render identical markup.
- `src/routes/order.new.tsx` charge action and any other entry into payments keep pointing at `/payment/method`; `payment.method.tsx` decides by layout: on narrow screens it redirects to `/payment/bill` unless arrived with `?methods=1` (validated search), which the Continue button sets. `useWideLayout()` from `src/components/pos/shell.tsx` drives the choice, after hydration so SSR stays stable.
- Phone step 2: drop the `max-h-[38dvh]` receipt column, render only the methods pane full height, keep the existing ResizeObserver fit solver so tiles size to the real pane; back arrow returns to `/payment/bill`.
- Add `"tap-to-pay"` to `TenderId` and `defaultTenders` (true) in `src/lib/pos-store.tsx`, list it in the Payment Methods rows (`src/components/pos/settings-rows.tsx` / `settings.payment-methods.tsx`) with its auto-close chip like the others.
- In `payment.method.tsx`, render the Tap to Pay button only when `settings.tenders["tap-to-pay"] && ttpDevice.available`; delete the disabled fallback row and the now-unused `TTP_DEVICE_NOTE` import.
- No changes to tender logic, split checks, Tap to Pay setup/tutorial screens, or the reader picker.
- Verify with a typecheck and screenshots at 393x713 and 430x932 (phone), 768x1024 and 1024x768 (tablet), 1440x950 (desktop), with the tender both on and off.
