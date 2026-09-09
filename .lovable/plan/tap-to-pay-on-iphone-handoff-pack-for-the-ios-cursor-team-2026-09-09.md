# Tap to Pay on iPhone: handoff pack for the iOS (Cursor) team

Produce a single written handoff, plus captured screenshots, that tells the iOS team exactly which of our Tap to Pay screens they must build, which ones Apple supplies, and which ones come from Adyen. Nothing in the app's behaviour changes.

## What gets delivered

1. `docs/ios/tap-to-pay-handoff.md` — the instruction document.
2. `docs/ios/screens/*.png` — one iPhone-sized screenshot per screen, captured at 390x844, named to match the document's screen numbers.

## Structure of the document

**A. Ownership key**
- `OURS` — we design and build it (SwiftUI in the iOS app).
- `APPLE` — Apple's own system sheet or system education screens. Never redrawn, never reworded: present the system API and let iOS render it.
- `ADYEN` — driven by the Adyen iOS SDK (reader discovery, session, tap capture, result).

**B. Screen inventory**, one row per screen: number, name, where it appears in our web prototype, ownership, the iOS API or SDK call that should replace our simulation, and entry/exit rules.

Screens in the pack:

| # | Screen | Ownership |
|---|---|---|
| 1 | Awareness / welcome ("Accept payments right on this iPhone") | OURS |
| 2 | Home nudge card | OURS |
| 3 | Settings > Payments row with status pill | OURS |
| 4 | Settings > Tap to Pay on iPhone entry screen | OURS |
| 5 | Setup: Payments step (enable, reader, bank account, payout) | OURS |
| 6 | Card reader bottom sheet with Detect | ADYEN (discovery) in OURS chrome |
| 7 | Apple ID screen (Continue with This Apple ID / Use a Different Apple ID) | APPLE flow, our entry screen |
| 8 | Sign in with your Apple ID sheet | APPLE |
| 9 | Terms and Conditions full-screen sheet (Agree / Disagree) | APPLE |
| 10 | Account Linked confirmation | OURS |
| 11 | Ready / How It Works list (with accepted terms row) | OURS |
| 12 | Education steps 1-5 (contactless, Apple Pay iPhone, Apple Watch, other wallets, secure PIN) | APPLE (ProximityReaderDiscovery) |
| 13 | Set a passcode first | OURS, triggered by Apple's state |
| 14 | Setting up Tap to Pay on iPhone (progress) | APPLE + ADYEN |
| 15 | Tap to Pay on iPhone is ready | OURS |
| 16 | Setup didn't finish | OURS |
| 17 | Checkout tender button, single state, exact label | OURS |
| 18 | Hold Here to Pay | APPLE (ProximityReaderPaymentCardReader UI) |
| 19 | Approved / receipt naming the method in full | OURS |
| 20 | Turn off: confirm, turning off, turned off, failed | OURS + ADYEN unlink |
| 21 | Reader picker entry from Settings > Payment Methods > Reader | OURS |

**C. Rules the iOS build must not break**
- Always the full name "Tap to Pay on iPhone"; every enable button reads "Set Up Tap to Pay on iPhone".
- Checkout button is single-state: never dimmed, never moved, no amount or status appended.
- Education screens come from Apple's API only. Delete any hand-authored version.
- Only Apple's marketing-toolkit artwork; no custom contactless imagery.
- iPhone only. iPad, Android, Windows and desktop show a disabled row reading "Available on iPhone only".
- Merchant state (terms accepted, device ready) lives server side per merchant, not on the device.

**D. What is simulated in the web prototype**
A short list of the places our prototype fakes behaviour (timed progress, simulated tap, simulated failure, developer override switch) so the iOS team knows those are placeholders for real Apple/Adyen callbacks.

**E. Apple review mapping**
Which screens cover the six required video clips and the requirement numbers from the App Review PDF, so the recording team knows the route through the app for each clip.

## Technical notes

- Screenshots captured with the existing local preview at 390x844 using an iPhone user agent, with a seeded signed-in and clocked-in session, walking each route: `/tap-to-pay/welcome`, `/tap-to-pay/setup/$from` (terms, payments, appleId, linked, ready, failed states), `/tap-to-pay/education/1..5`, `/tap-to-pay/activate`, `/tap-to-pay/turn-off`, `/payment/tap-to-pay`, `/settings/tap-to-pay`, `/settings/payments`, `/settings/payment-picker/reader`.
- No source files change; only new files under `docs/ios/`.
