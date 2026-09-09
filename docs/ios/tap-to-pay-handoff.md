# Tap to Pay on iPhone: iOS build handoff

This is the complete set of Tap to Pay on iPhone screens in the web prototype, with instructions for the iOS team. Screenshots are in `docs/ios/screens/`, captured on an iPhone viewport (390x844).

The prototype is a **reference for layout, copy and order of screens only**. Every place the prototype fakes a result, iOS must call the real Apple or Adyen API instead.

---

## A. Ownership key

| Tag | Meaning |
| --- | --- |
| `OURS` | We design and build it in SwiftUI. Copy and layout come from the prototype. |
| `APPLE` | Apple's own system UI (`ProximityReader` / `PassKit`). Present the system API and let iOS draw it. Never redraw, never reword, never screenshot-and-rebuild. |
| `ADYEN` | Driven by the Adyen iOS POS SDK (reader discovery, session setup, tap capture, result). Our chrome may wrap it, but the payment states come from SDK callbacks. |

---

## B. Screen inventory

| # | Screen | Screenshot | Owner | iOS implementation | Entry / exit |
| --- | --- | --- | --- | --- | --- |
| 1 | Awareness / welcome, "Accept payments right on this iPhone" | `01-welcome.png` | OURS | Shown once on first eligible launch. Persist "shown" server side per merchant. | Enter: first launch. Exit: Set Up -> screen 5a, or "Not now" -> home. |
| 2 | Home nudge card | (component, see `01-welcome.png` copy) | OURS | Returns after the welcome screen is dismissed; disappears permanently once the device is ready. | Enter: home. Exit: Set Up -> screen 5a. |
| 3 | Settings > Payments row with status pill | `03-settings-payments-row.png` | OURS | Row is permanent in every state, including ready and ineligible. Status from the merchant record, not local state. | Exit: screen 4. |
| 4 | Settings > Tap to Pay on iPhone | `04-settings-tap-to-pay.png` | OURS | Status, device name, entry into education. Button reads "Set Up Tap to Pay on iPhone". | Exit: screen 5a, or education. |
| 5a | Setup intro (banner, benefits, Continue) | `05a-setup-intro.png` | OURS | Pure UI. | Exit: Continue -> 5b. |
| 5b | Setup > Payments (enable switch, card reader, bank account, payout schedule) | `05b-setup-payments.png` | OURS | Bank account and payout come from the Adyen/merchant account; bank account is read-only. | Exit: "Manage your Apple ID" -> 7. |
| 6 | Card reader bottom sheet with Detect | `06-reader-sheet.png`, `06b-reader-detected.png` | ADYEN inside OURS chrome | Replace the fake spinner with Adyen reader discovery. "Tap to Pay on iPhone" is a reader kind, not a Bluetooth device. | Exit: selection returns to 5b. |
| 7 | Apple ID screen (Continue with This Apple ID / Use a Different Apple ID) | `07-apple-id.png` | OURS shell, APPLE flow | Present Apple's account linking. The Apple ID shown must come from the signed-in account, never hardcoded. | Exit: 9, or 8. |
| 8 | Sign in with your Apple ID sheet | `08-apple-id-signin-sheet.png` | APPLE | Do **not** build a custom credential form on iOS. Hand off to Apple's system sign-in. The prototype form is a stand-in for the system sheet. | Exit: back into 9. |
| 9 | Tap to Pay on iPhone Terms and Conditions, full-screen sheet, Disagree / Agree | `09-terms-sheet.png` | APPLE | Apple presents its own terms. Do not host Apple's terms text in our app. Record only the acceptance timestamp, server side. | Exit: Agree -> 10. |
| 10 | Account Linked | `10-account-linked.png` | OURS | Auto-advances after 3s. No Cancel. | Exit: 11. |
| 11 | Ready / How It Works, with accepted terms row | `11-ready-how-it-works.png` | OURS | Status pill, device label, education entries, terms accepted date. Permanent destination from Settings and Help. | Exit: Continue -> 12-1; "Turn off on this iPhone" -> 20a. |
| 12 | Education steps 1-5: contactless card, Apple Pay on iPhone, Apple Pay on Apple Watch, other wallets and wearables, Secure PIN Entry | `12-1..12-5-education-step-*.png` | APPLE | Use `ProximityReaderDiscovery` only. **Delete every hand-authored education screen and video from the iOS build.** The prototype videos exist purely to show where in the flow Apple's screens appear. | Enter: after setup succeeds, plus Settings and Help. Exit: back to 11. |
| 13 | Set a passcode first | (state in `tap-to-pay/activate`) | OURS, triggered by Apple state | Show only when Apple reports the passcode requirement. Deep-link to iPhone Settings. | Exit: back into activation. |
| 14 | Setting up Tap to Pay on iPhone (progress) | `13-activate-entry.png`, `14-activate-progress-or-ready.png` | APPLE + ADYEN | Progress must reflect real callbacks (terms accepted, account linked, reader prepared). Apple requires visible progress on video. | Exit: 15 or 16. |
| 15 | Tap to Pay on iPhone is ready | `14-activate-progress-or-ready.png` | OURS | Hands straight into education with no extra tap. | Exit: 12-1. |
| 16 | Setup didn't finish | `16-activate-later-state.png` | OURS | Never a dead end mid ticket: always offer "Take payment another way". | Exit: retry, or back to checkout. |
| 17 | Checkout tender button | `17-checkout-tender.png` | OURS | Single state. Exact label "Tap to Pay on iPhone", first and full width, visible without scrolling, never dimmed, never moved, no amount or status appended. If not set up, hold the ticket, run setup, return to the same ticket. | Exit: 18. |
| 18 | Hold Here to Pay | `18a-payment-setup.png`, `18b-hold-here-to-pay.png` | APPLE + ADYEN | This screen is Apple's card-read UI presented by the SDK. Do not draw our own dark "Hold Here to Pay" screen on iOS. | Exit: 19, or cancel back to checkout. |
| 19 | Approved / receipt | (payment success route) | OURS | Receipt and tender lines must name the method in full: "Tap to Pay on iPhone". | Exit: back to tickets. |
| 20 | Turn off: confirm, turning off, turned off | `20a-turn-off-confirm.png`, `20b-turning-off.png`, `20c-turned-off.png` | OURS + ADYEN unlink | Confirm is our own sheet, our own colours, not an Apple lookalike. The turning-off step must call the real deactivate/unlink and update the merchant record server side. Manager permission required. | Enter: 4 or 11. Exit: Done, or Set Up Again -> 5a. |
| 21 | Reader picker (Settings > Payment Methods > Reader) | `21-reader-picker.png` | OURS | "Tap to Pay on iPhone" appears alphabetically. Choosing it saves the reader and, if not yet set up, runs the same setup flow and returns to Payment Methods. | Exit: 5a or Payment Methods. |

---

## C. Rules the iOS build must not break

1. Always the full product name "Tap to Pay on iPhone". Never "Tap to Pay", never any short form, in buttons, receipts, help text or status lines.
2. Every enable button reads exactly "Set Up Tap to Pay on iPhone".
3. The checkout button is single state: never greyed, never repositioned, no amount, no "Charge", no status suffix.
4. Education comes from Apple's API only. No hand-drawn artwork, no reworded copy, no our-own videos.
5. Only Apple's Marketing Toolkit artwork and the SF Symbol `wave.3.right.circle.fill`. No custom contactless graphics.
6. iPhone only. iPad, Android, Windows and desktop show the row disabled with "Available on iPhone only", and none of the Tap to Pay screens can be opened directly. iPhone in landscape still counts as iPhone: check the device, never the viewport.
7. Merchant state (terms accepted, device ready, device label) lives server side per merchant, so a reinstall cannot erase the proof.
8. Manager permission is required for setup and for turning off.

---

## D. What the prototype fakes

Every item here is a placeholder for a real callback:

- Reader "Detect" spinner and the "Reader detected" result -> Adyen reader discovery.
- Setup progress timings and the "Setup did not finish" state -> real Apple/Adyen failure callbacks.
- Terms and Conditions text hosted in `src/lib/tap-to-pay-terms.ts` -> Apple's own system terms sheet.
- The Apple ID email on screen 7 and the credential form on screen 8 -> the signed-in Apple account and Apple's system sign-in.
- The dark "Hold Here to Pay" screen -> Apple's card-read UI from the SDK.
- Simulated tap that commits the payment -> real authorisation result from Adyen.
- Turn-off timings -> real deactivate/unlink call.
- "Allow Tap to Pay on this device" switch under Settings > More > Advanced. Prototype-only, for recording on non-iPhone hardware. Do not ship it.
- Local settings persistence (`eatos.pos.settings`) -> merchant record on the server.

---

## E. Apple review recording map

| Clip | What Apple asked for | Route through the app | Requirements |
| --- | --- | --- | --- |
| 1 | Awareness / communication to merchants | 1 -> 2 -> 3 | 3.1 - 3.4 |
| 2 | New user setup, end to end | 3 -> 4 -> 5a -> 5b -> 6 -> 7 -> 9 -> 10 -> 14 -> 15 | 3.5, 4.1 |
| 3 | Merchant education | 15 -> 12-1 -> 12-5 | 4.1 - 4.5 |
| 4 | Existing user: education reachable later | 3 -> 4 -> 11 -> 12-1, and Help -> education | 4.4, 4.5 |
| 5 | Checkout, filmed on a second device | 17 -> 18 -> 19 | 5.1 - 5.3, 3.7 |
| 6 | Turning it off and setting up again | 11 -> 20a -> 20b -> 20c -> 5a | 3.6 |

Clip 5 must be filmed with a separate camera on real hardware. Screen recordings and simulator captures were rejected before.

An in-app version of this shot list also exists at `/system/tap-to-pay-recording`.
