# Choosing "Tap to Pay on iPhone" as the reader starts onboarding

Today, picking a reader in Settings > Payment Methods > Reader just saves the choice and returns to Payment Methods. When someone on an iPhone picks "Tap to Pay on iPhone", they should be taken through exactly the same set-up steps they get from the Payments screen.

## Behaviour

- On an iPhone (or with the manager developer switch on):
  - If Tap to Pay is not set up yet, tapping "Tap to Pay on iPhone" in the Reader list saves it as the selected reader and immediately opens the set-up flow (Payments step, card reader sheet, Apple ID, terms, tutorial, ready).
  - Finishing set-up, or backing out, returns to the Reader/Payment Methods screen rather than the Payments settings screen.
  - If Tap to Pay is already set up, the row behaves as it does now: it is selected, ticked, and returns to Payment Methods.
- On iPad, Android, Windows and desktop nothing changes: the row stays greyed out with "Available on iPhone only".
- Staff without manager permission still cannot change the reader; the row does not start set-up for them.
- Same behaviour on phone, tablet and desktop layouts (tablet/desktop only ever see the disabled state unless the developer switch is on).

## Technical notes

- `src/routes/settings.payment-picker.$field.tsx`: in `choose()`, special-case the reader field when the option is `TTP`. Apply the reader value, then if `settings.tapToPayState !== "ready"` navigate to `/tap-to-pay/setup/reader` instead of `/settings/payment-methods`.
- `src/routes/tap-to-pay.setup.$from.tsx`: add `reader` as a recognised `from` value so the exit/back/finish paths route to `/settings/payment-methods` (alongside the existing `checkout` and `settings` cases).
- No store or schema changes; `tapToPayDevOverride` and the existing device guard continue to gate availability.
- Verify at 390x844, 430x932, 768x1024 and 1440x950, plus a typecheck.
