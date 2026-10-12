# Gift Cards — Add Funds & Pay by Gift Card

## My understanding of the two recorded flows

### Flow 1 — Add money to a gift card (Purchase / Add Funds)
1. A **Gift Card modal** opens with three tabs: **Purchase | Add Funds | Check Balance**, and a note: *"Adding funds to any card will activate it."*
2. Staff enters the **gift card number** (16-digit, e.g. 60488798989446715) and types an **amount** on the numeric keypad.
3. The modal shows the card's **Available Balance** (e.g. $606.45) once the card is recognized.
4. Tapping **CHARGE** adds a line item to the cart: **"GIFT CARD - 6715"** (last 4 digits) at the entered amount (e.g. $500.00), marked No Tax.
5. Staff then pays for that order through the **normal payment screen** (Cash / Card / etc.) — the customer is buying the gift card balance.
6. After payment completes, the cart clears and the card balance is loaded/activated.

### Flow 2 — Pay using gift card balance
1. On the **payment screen**, a **Gift Card** tender appears (in the reference it sits under a "Rewards" group).
2. Tapping it opens a **"Payment By Gift Card"** modal: card number field (with a scan/swipe icon), amount field pre-filled with the total due, numeric keypad, and **Available Balance** lookup.
3. **CHARGE stays disabled** until a valid card number is entered and its balance is known.
4. Charging deducts from the card balance and completes (or partially pays) the check.

## What I will build (our UI & theme, recordings are reference only)

1. **Gift Card modal** (opened from the cart's three-dots panel, replacing the current inert "Gift Card" action):
   - Tabs: Purchase / Add Funds / Check Balance.
   - Card number entry, amount keypad, available-balance display.
   - CHARGE adds a `Gift Card - XXXX` no-tax line item to the cart; the order is then paid via the existing payment flow.
   - Check Balance tab shows balance only, no charge.
2. **Gift Card tender on the payment screen**:
   - New "Gift Card" payment method (visible when enabled in payment settings).
   - Opens the Payment By Gift Card modal: card number, pre-filled due amount (editable), balance lookup, CHARGE disabled until a known card with sufficient balance.
   - On success, completes the payment through the existing success flow; partial balance leaves a remaining due.
3. **Demo gift card data**: a small set of demo card numbers with balances (e.g. the 6048... numbers from the recording) stored in demo data; adding funds / paying updates the balance for the session.
4. Responsive behavior on phone, tablet, and desktop; shared modal close control stays consistent with the app.

## Open questions
1. Should the Gift Card tender appear for all order types, or only certain ones?
2. If the card balance is less than the amount due, should it apply the partial balance and ask for a second tender (split), or block the charge?

## Technical notes
- New `src/components/pos/gift-card-dialog.tsx` (tabs + keypad, reusing the existing keypad styles); new `gift-card-payment-dialog.tsx` on the payment route.
- Demo cards in `src/lib/demo-data.ts`; balances tracked in the POS store so both flows stay in sync.
- Gift card line item is a no-tax cart line named `Gift Card - <last4>`.
- Verified with Playwright at phone / tablet / desktop widths.
