# Payment Methods setup, UK tenders, and left navigation cleanup

## 1. Payment Methods settings gets a proper setup order

Restructure `/settings/payment-methods` so it reads top to bottom as a setup flow:

1. **Payment Provider** picker (dropdown): Adyen or Stripe. Stored in settings, shown as the active provider elsewhere.
2. **Card Reader** block: reader model dropdown (Adyen S1F2 / S1E2 / AMS1, Stripe BBPOS WisePOS E / S700, or "Tap to Pay on device"), connection type (Bluetooth, LAN, Cloud), pair/test action, and connection status. Reader options change with the selected provider.
3. **Payment Methods** toggles: the existing grouped tender list, unchanged in style.

Provider and reader values persist with the rest of settings, and the payment screen keeps only enabled tenders (already the behaviour).

## 2. UK payment types we are missing

Current list: Cash, Manual Card, Manual CC, External CC, Split Check, Account, House, Gift Card, Loyalty, In-kind, Room Charge, Uber Eats, Doordash, Grubhub.

Missing for a UK venue, to be added as toggleable tenders in the right groups:

Card and wallets
- Card present (Chip and PIN) via the reader
- Contactless / Tap to Pay
- Apple Pay
- Google Pay
- Amex (accept toggle, some UK venues exclude it)

Remote and alternative
- Pay by Link (email or SMS)
- QR / Scan to Pay
- Open Banking bank transfer (Pay by Bank)
- BACS / bank transfer
- PayPal
- Klarna (buy now, pay later)

Cash-like and vouchers
- Cheque
- Voucher (paper or digital)
- Staff / comp charge
- Charity donation round-up (optional, off by default)

Delivery partners (UK)
- Deliveroo
- Just Eat
- Doordash and Uber Eats already present; Grubhub is US only, so it will be hidden unless the venue region is US.

Currency handling stays GBP based on the existing currency setting; no new pricing logic.

## 3. Left settings pane whitespace

The settings list pane currently stretches to the full split width, so rows are very wide and the right side of each row is empty. Fix: cap the list pane width (about 22rem to 24rem), keep rows compact, and let the detail pane take the remaining space. Bottom of the pane scrolls naturally with no forced filler.

## 4. Left navigation behaviour

- Remove the expand/collapse chevron button from the rail.
- Rail starts **collapsed** every session (no remembered expanded state).
- Toggle by tapping the venue avatar / logo at the top of the rail, or by tapping empty space in the rail (not on a destination row).
- Expanded state does not persist between reloads; collapsed is always the default.

## Technical notes

- `src/routes/settings.payment-methods.tsx`: add provider select and card reader block above the tender groups.
- `src/lib/pos-store.tsx`: extend `AppSettings` with `paymentProvider`, `cardReaderModel`, `cardReaderConnection`, `cardReaderStatus`; extend `TenderId`, `TENDER_LABELS`, and `defaultTenders` with the new UK tenders (new remote/alternative tenders default off, card present and contactless default on).
- `src/routes/payment.method.tsx`: no structural change needed; the fit-to-pane grid already sizes to the enabled set, and the new tenders slot into existing groups.
- `src/components/pos/nav-rail.tsx`: drop the toggle button and the `pos:rail-expanded` localStorage read/write, make the avatar and the rail background click targets that toggle expansion.
- `src/components/pos/shell.tsx` (`SplitPane`): constrain the list pane width.
