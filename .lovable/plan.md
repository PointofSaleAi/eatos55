# Replace outside-corner X buttons with outside-tap dismissal

## Requested change
- Remove X buttons positioned outside the top-right corner of modals, sheets and popovers throughout the app.
- Tap or click outside the window to close it. Taps inside—including fields, number pads, scrolling areas and dropdowns—must keep it open.
- Preserve the current layout, theme and all other actions. Inline remove icons, navigation controls and X buttons inside other experiences are outside this change.

## Implementation
1. Remove the automatically rendered outside-corner close buttons from the shared dialog and sheet controls. Audit custom windows for equivalent outside-corner X buttons and remove those too.
2. Ensure outside dismissal uses each window's existing cancel/close behavior: never save edits, transfer checks, confirm a destructive action or submit a payment simply because the user tapped outside.
3. Check nested windows and dropdowns: dismiss only the topmost window, retain the underlying window and prevent the same tap from activating content behind the overlay.
4. Preserve keyboard Escape dismissal and focus return where supported. Keep existing Cancel, Back, Save, Charge and confirmation actions unchanged. If a phone window fills the screen and has no outside area, retain its existing in-window exit action so users are not trapped.
5. Replace the documented outside-corner-X convention with the new outside-dismissal rule.

## Technical details
- `src/components/ui/dialog.tsx` and `src/components/ui/sheet.tsx` currently render the shared outside-corner X controls; remove that rendering without changing their layout or consumer close callbacks.
- Keep Radix dismissal and focus handling rather than adding competing global click handlers.
- Review custom overlays and guarded close callbacks for equivalent safe dismissal. Preserve protections during an in-progress transaction; outside dismissal must not bypass payment or PIN validation.

## Verification
- Check phone, portrait tablet, landscape tablet and desktop layouts.
- Exercise product details, Discount, Service Charge, Transfer Check with its confirmation, Gift Card, PIN prompts and Clock Out.
- Confirm no outside-corner X remains, outside taps close safely, inside taps do not close, nested selections work, and no underlying action fires.
- Run relevant existing tests and inspect preview errors before completing the change.