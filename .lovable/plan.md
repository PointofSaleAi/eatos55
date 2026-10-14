# Match the header settings typography and spacing to the recording

## Confirmed differences
- The panel currently uses 24px desktop headings and 14px descriptions; the recording shows larger, more prominent headings and supporting text.
- The current three rows are packed higher on the screen, leaving too much empty space below them.
- Every shortcut currently has a full-height left border. The reference uses short separators between columns, with no border before the first column.
- The descriptions were shortened, changing their line lengths and the overall spacing compared with the reference.

## Changes
- Use the second attached screenshot—the recording—as the visual target, not the first screenshot of the current app.
- Increase desktop/tablet headings to approximately 28px with matching bold weight, and descriptions to approximately 16px with the reference’s line height. Keep the existing app font and zero letter spacing.
- Match the icon-to-heading alignment, heading underline lengths, and the gaps above and below the descriptions.
- Spread the three rows further down the panel to match the reference’s vertical rhythm, while keeping the bottom chevron visible.
- Replace the full-height borders with short, brighter separators between columns only.
- Restore the reference’s descriptive wording where it accurately describes the destination. Keep Guestbook and logout descriptions truthful: do not claim guest lifetime-value data or an application restart.
- Preserve the dark translucent appearance, shortcut order, destinations, permissions, swipe gestures and safe dismissal.

## Across devices
- Desktop and landscape tablet retain the three-column layout.
- Phone and narrow tablet keep readable text, wrapping and scrolling rather than shrinking everything to fit.
- Short landscape screens retain access to all shortcuts and the close chevron.

## Technical details
- Limit changes to the shared settings panel and its panel-specific typography, spacing and separator rules.
- Define reusable panel sizing roles in the global stylesheet; continue using semantic color tokens and the existing Button component.
- Size main shortcut icons independently of the smaller restriction and close icons.
- Do not change the global font scale, header, left navigation, orderOS or regular Settings pages.

## Verification
- Compare the open panel against the recording at 1141 × 742, checking heading size, description wrapping, column starts, row positions and separators.
- Check phone portrait/landscape, tablet portrait/landscape and desktop for clipping and overlap.
- Confirm every shortcut still navigates correctly and tap, swipe, backdrop and close-chevron dismissal still work.