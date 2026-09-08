# Restrict Tap to Pay to iPhone only

Tap to Pay on iPhone must only be usable on iPhone. It should not appear as an active option on iPad, Android tablets, Windows machines or the desktop/landscape tablet layouts. iPhones held in landscape still count as iPhone.

## What changes for people using the app

- On an iPhone: everything works exactly as it does today, in both portrait and landscape.
- On an iPad, Android device, Windows machine or desktop browser:
  - In Payments settings, the "Tap to Pay on iPhone" row stays visible but greyed out and not tappable, with a short note: "Available on iPhone only".
  - In the reader picker, "Tap to Pay on iPhone" is likewise greyed with the same note and cannot be selected. If it was previously the saved reader, it shows as saved but cannot be re-chosen.
  - On the payment screen, the Tap to Pay tender button is greyed with the same note and does not start the flow.
  - The setup, tutorial, activation, turn-off and payment Tap to Pay screens cannot be opened directly; anyone landing on those addresses is sent back to Payments settings.
- A hidden developer switch in Advanced settings ("Allow Tap to Pay on this device") turns the restriction off so the flow can be reviewed and recorded from the preview on a computer. It is off by default and only a manager can change it.

## Technical notes

- New `src/lib/device.ts`: `isIPhoneDevice()` using user agent plus touch checks (iPhone/iPod true; iPad, including desktop-mode iPad reporting Macintosh with touch, false), and a `useTapToPayAvailable()` hook returning `{ available, reason }` that ORs in the developer override. Detection runs after hydration (`useEffect`/`useHydrated`) so SSR output stays stable.
- Override flag stored in the existing settings object in `src/lib/pos-store.tsx` as `settings.tapToPayDevOverride` (default `false`), surfaced as a switch on the Advanced settings screen behind the manager permission check already used there.
- Gate consumers: `src/routes/settings.payments.tsx` and `src/components/pos/settings-rows.tsx` (row disabled + note), `src/routes/settings.payment-picker.$field.tsx` (reader entry disabled), `src/routes/payment.method.tsx` (tender button disabled), `src/routes/settings.tap-to-pay.tsx`.
- Route guards via `beforeLoad`/effect redirect to `/settings/payments` in `tap-to-pay.welcome.tsx`, `tap-to-pay.setup.$from.tsx`, `tap-to-pay.education.$step.tsx`, `tap-to-pay.activate.tsx`, `tap-to-pay.turn-off.tsx`, `payment.tap-to-pay.tsx`. Because detection is client-side, guards run in an effect after hydration rather than in a loader.
- Disabled styling uses existing tokens (`text-muted-foreground`, `opacity-60`, `pointer-events-none`) with `aria-disabled` for accessibility; no hardcoded colours.
- Verify with `bunx tsgo --noEmit`, a clean build, and screenshots at 390x844 (phone, iPhone UA), 844x390 (iPhone landscape UA), 1024x768 (iPad UA) and 1440x950 desktop, plus the developer switch on and off.
