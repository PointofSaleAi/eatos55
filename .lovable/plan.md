# Receipts — design per receipt type, with live preview (demo)

Rebuild Settings → Payments → Receipts to follow the recording, in our grouped-row style (grey highlights, pink only for branding). Works on phone, tablet and desktop.

## Receipts list
- Short description: "Choose a named design per channel. Designs apply to emulator print preview today. Physical printers stay Classic Thermal until a later release. Email/SMS store the preference now and use the same design when a text body path exists."
- Five rows with chevrons: **KOT**, **Payment Receipt**, **Receipt**, **Email Receipt**, **SMS Receipt**.

## Each receipt type screen
Back returns to Receipts; Receipts back returns to Payments. Changes save on their own.
- The description from the recording (e.g. KOT: "Kitchen order ticket layout (emulator preview). Default is Classic Thermal (today's layout).").
- **Design** chips: Classic Thermal · Compact Service · Guest Table · Modern Bistro, with a one-line note under them:
  - Classic Thermal: Today's full Star layout (default).
  - Compact Service: Shorter header; fewer lines.
  - Guest Table: Order/table up front; guest-friendly.
  - Modern Bistro: Cleaner spacers; emphasize totals.
- **Show store logo** switch.
- **Font style:** Thermal / Clean.
- **Font size:** S / M / L.
- **Live preview:** a paper-style sample receipt that updates as soon as you change anything (logo, font, size and design all change it). The design changes which lines appear (device and printer lines, where the order and table show, emphasized totals). Each type shows its own content:
  - KOT: the kitchen ticket ending with FIRE NOW.
  - Payment Receipt: totals plus the Paid by card line.
  - Receipt, Email and SMS: the guest bill.
  - Every preview is captioned "Sample preview — not a physical print".

## Notes
- Demo only: nothing prints, emails or texts, and real checkout receipts are unchanged.
- The preview uses the black eatOS wordmark as the logo, with our demo restaurant, items and $ prices.

## Technical details
- `src/lib/receipt-settings.ts`: per-type prefs (design, logo, fontStyle, fontSize), stored with the shared localStorage pattern via useSyncExternalStore.
- `src/components/pos/receipt-settings.tsx`: list plus a type view held in component state, using a SubHeader onBack callback. The preview is rendered in monospace or sans by font style, at three sizes.
- Route the `receipts` topic in `settings.detail.$topic.tsx`.
- Verify with Playwright on phone, tablet and desktop: change the design, logo, font and size, then check that the preview updates and the choices persist after going back.
