# Tap to Pay on iPhone: the screens Apple is asking for

Apple's rejection is about missing screens and wrong wording, not about the payment integration. This plan adds every screen the review letter and the attached spec ask for, so the iOS team can record the six required videos against a build that already matches, word for word.

Scope: phone and tablet views of this app. Tap to Pay itself only runs on a supported iPhone, so on tablet the same screens are reachable but state plainly that payments are taken on a supported iPhone, with no button that leads nowhere. That keeps requirement 5.3 honest (the button is never greyed out on iPhone) without pretending a tablet can tap a card.

## 1. Awareness and turning it on (requirements 3.1 to 3.7)

- Full screen welcome shown once, automatically, the first time an eligible venue opens the app: Apple lockup area, headline "Accept payments right on this iPhone", three short benefit lines, "Set Up Tap to Pay on iPhone", and "Not now".
- Last step of new venue setup: a card above the Skip link with "One last thing" and the same Set Up button.
- Home nudge card that returns if the welcome screen was dismissed, and disappears for good once a device is ready.
- A permanent row in Settings > Payments: "Tap to Pay on iPhone / Use this iPhone as your card reader", with a status pill. Present in every state, including once it is ready.
- A ready state page for that row showing the device name, when terms were accepted, and links into the education screens.
- An "not available on this device" version of the row for unsupported hardware, which also switches the welcome screen and nudge off.

## 2. Setup flow (3.5, 4.1)

One flow entered from all five places above and from checkout:

1. Passcode check, with a short screen if the device has no passcode.
2. Apple's own Terms and Conditions sheet (represented here as the system step, never redrawn).
3. Progress screen with visible ticked steps, because Apple wants progress on video.
4. "Tap to Pay on iPhone is ready", which hands straight into the education screens with no extra tap.
5. A failure screen that says what happened and offers another way to take payment, never a dead end mid ticket.

## 3. Merchant education (4.1 to 4.5)

Two education steps, one for contactless cards and one for Apple Pay and digital wallets, presented immediately after setup succeeds. In the real iOS build these are Apple's own system screens (ProximityReaderDiscovery), so this app renders them as clearly marked Apple-supplied placeholders with the correct titles, and never hand-drawn artwork or reworded copy. Reachable afterwards from two permanent places: Settings > Payments > Tap to Pay on iPhone, and Help.

## 4. Checkout (5.1 to 5.3, 3.7)

- On the payment screen, "Tap to Pay on iPhone" becomes the first, full width option above everything else, always visible without scrolling, with the correct contactless wave icon.
- Exact label, always. No amount, no "Charge", no status text appended, never dimmed or moved based on whether it has been set up.
- If it is not set up, the button holds the ticket, runs the setup flow with the amount still on screen, then returns to the same ticket.
- Approved screen names the method in full as Tap to Pay on iPhone on the receipt lines.

## 5. Recording guide inside the app

A short page under Help listing the six clips Apple asked for, which screens each one passes through, and the requirement numbers each covers, so whoever films it has the shot list on the device.

## Wording rules applied everywhere

Always the full name "Tap to Pay on iPhone", never "Tap to Pay" or any short form, in buttons, receipts, help text and status lines. Every enable button reads "Set Up Tap to Pay on iPhone".

## Technical notes

- New routes: `settings.tap-to-pay.tsx` (status and education entry), `tap-to-pay.setup.tsx` (passcode, terms, progress, ready, failure as steps in one route), `tap-to-pay.education.$step.tsx`, `system.tap-to-pay-recording.tsx`, plus an awareness screen surfaced over the home route on first eligible launch.
- Store additions in `src/lib/pos-store.tsx`: `tapToPay: { deviceState: "notSetUp" | "configuring" | "ready" | "needsAttention" | "ineligible", awarenessShownAt, dismissedAt, termsAcceptedAt, setupSource }`, persisted with existing settings. Note for the iOS team: these must live server side per merchant in production so a reinstall cannot erase the proof for 3.3.
- `src/routes/payment.method.tsx`: promote the Tap to Pay tile out of the grid into a fixed first row, unaffected by the tender enable/disable settings and by the fit solver.
- Settings > Payments and the Help hub each gain a row; the existing Card Reader flow is untouched.
- Apple-supplied artwork and the system sheets are rendered as labelled dashed placeholders, since real toolkit assets arrive with the entitlement.
- Verify at 390x844, 430x932, 768x1024, 1024x768 and 1440x950, with the checkout button above the fold at the smallest size.
