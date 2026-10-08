# PIN Pad: transparent asterisk mask

## Goal
On the PIN pad (clock-in gate and every screen using the shared PIN pad), replace the current "✳" text glyph with a proper asterisk mark that is:
- **Filled solid white** for each digit already entered
- **Transparent (outline only, white stroke)** for the remaining empty slots

This matches the attached screenshots: 4 asterisks in the field, hollow when empty, filling in solid as the PIN is typed. No other part of the pad changes (keypad, actions, biometrics, Log out stay as-is).

## Change
File: `src/components/pos/pin-pad.tsx` (the single shared PIN pad used by the clock-in gate and all PIN prompts, so every PIN pad stays identical)

1. Add a small inline SVG asterisk component (six-armed asterisk matching the screenshots) with a `filled` prop:
   - Filled state: solid fill in `currentColor` (resolves to the existing `text-gate-key-foreground`).
   - Empty state: transparent fill with a `currentColor` stroke, so it reads as a hollow transparent asterisk.
2. In the PIN field row, render this SVG in all four slots instead of the "✳" character:
   - `i < pin.length` → filled asterisk (replaces today's full-opacity glyph).
   - `i >= pin.length` → outlined asterisk (replaces today's 25%-opacity glyph — no dimming, the outline itself is the empty state).
3. Keep the existing cell layout, size (`clamp(2rem,4vw,3.25rem)`), borders, and background unchanged.

## Verification
- Playwright at the clock-in gate (phone, tablet, desktop widths): confirm 4 hollow asterisks on load, asterisks turn solid as digits are typed, hollow again after Clear/backspace, and no layout shift in the PIN field.
- Build check clean.
