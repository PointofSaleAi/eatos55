# Simplify payment methods and optimize phone layout

## Payment method rules
- Make **Cash** and **Card** the two primary payment choices.
- Use **Card** for all standard card payments, including card-reader, contactless network, and American Express payments.
- Keep **Tap to Pay on iPhone** as its own choice only on eligible iPhones when enabled; show **Tap to Pay** on other supported devices when enabled.
- Remove the separate **Amex** choice from checkout and Payment Methods settings.
- Remove the duplicate **House** choice and keep **Account**.
- Keep Cash and Card available as core methods; every other payment choice continues to follow its on/off setting and regional availability.
- Preserve existing saved settings safely so older Amex and House values do not create visible duplicate methods.

## Phone portrait design
- Replace the uniform card grid with a compact priority layout:
  - Cash and Card become the largest first-row actions.
  - Other enabled methods appear below in smaller two-column cells.
  - Use connected groups, thin dividers, restrained borders, and minimal vertical gaps instead of widely separated boxes.
- Keep touch targets comfortably large while reducing decorative whitespace around each option.
- Keep section labels only where they improve scanning and avoid leaving empty grid cells.
- Keep the payment action fixed directly above the bottom navigation with safe-area clearance and no oversized blank band.

## Tablet and desktop
- Preserve the existing tablet and desktop payment composition.
- Apply the simplified method list consistently across every screen size.
- Verify portrait phone, landscape phone, tablet, and desktop layouts for clipping, scrolling, and touch-target size.

## Technical details
- Consolidate Card behavior in the existing payment handler rather than adding a new payment flow.
- Update the canonical labels and Payment Methods settings rows so checkout and settings remain consistent.
- Retain legacy tender identifiers internally only where needed for saved-data compatibility.
- Validate that disabled optional methods disappear immediately and that enabled methods fit without overlapping the fixed action and navigation areas.
