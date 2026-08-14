# Why payment types look missing, and finishing the tender experience

Two confirmed reasons, then the work to complete the flow.

## What I found in the code

1. **Room Charge is hidden by a setting.** The Room Charge tile is only rendered when the room-service module is on (`settings.roomService`), and that flag defaults to **off**. Nothing is broken - the tile is simply switched off until Room service is enabled in Settings > General.
2. **The screen bounces when the check is empty.** `/payment/method` immediately redirects to the order screen with an "Add items to the order before tendering" toast whenever the cart has no lines. Opening payment directly (as in the current preview) shows the order screen, which reads as "the whole experience is missing".
3. **Several tenders are stubs.** Uber Eats, Doordash, Grubhub, Loyalty and In-kind only fire a toast today. The reference screenshots show real reference-number popups for the delivery brands.

## What I'll do

**Make the tenders discoverable**
- Show Room Charge always, but when room service is off, present it as unavailable with a one-tap route into Settings > General to switch it on, instead of hiding the tile entirely.
- Group the grid into labelled sections: Standard (Cash, Manual Card, Manual CC, External CC), House accounts (Account, House, Gift Card, Loyalty, In-kind), Lodging (Room Charge), Delivery partners (Uber Eats, Doordash, Grubhub), plus Split Check as its own action.

**Stop the dead-end redirect**
- Replace the auto-redirect with a proper empty state on the payment screen: the receipt panel shows "Nothing to tender yet" and a "Back to order" button, tiles stay visible but disabled. No more silent bounce, and the screen can be reviewed directly.

**Finish the delivery and reference tenders**
- One shared reference-number dialog for Uber Eats, Doordash and Grubhub, matching the screenshots: brand name, reference/order number field, numeric entry, Cancel and Charge. On confirm, the payment is recorded against that brand and the flow lands on the success screen.
- Loyalty and In-kind get real sheets: loyalty card/phone lookup, and in-kind reason with manager PIN, consistent with the rest of the app.

**Room charge polish**
- The Room Charge dialog keeps its search, floor filter, booking strip and stay facts; the selected room stays reflected on the receipt and in the primary action label.

All of this works at phone, tablet and desktop widths: the two-pane split on wide screens, single column with the sticky action bar on phones, dialogs become bottom sheets on small widths.

## Technical notes

- `src/routes/payment.method.tsx`: drop the `useEffect` redirect in favour of an empty state; restructure `tenders` into grouped sections; Room Charge rendered disabled with a Settings link when `settings.roomService` is false.
- New `src/components/pos/reference-tender-dialog.tsx` for the three delivery brands (brand label, reference field, numeric pad, confirm) reusing the existing dialog/sheet primitives.
- New loyalty and in-kind sheets built on the existing sheet primitives; in-kind reuses the manager PIN sheet.
- Payments recorded through the existing store payment path so `paidSoFar`, ticket status and the success screen stay correct.
- Verified at 393, 768 and 1280 widths with items in the cart and with an empty cart.
