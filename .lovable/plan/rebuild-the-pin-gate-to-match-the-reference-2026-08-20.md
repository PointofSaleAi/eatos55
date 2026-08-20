# Rebuild the PIN gate to match the reference

## Goal
Match the uploaded 1:50 PM reference as the source of truth, rather than adapting the current white clock-in page.

## Changes
1. **Use a locked POS backdrop**
   - Keep the normal POS context visible behind the gate, including the top account bar, navigation rail, and floor content.
   - Cover the entire app with one charcoal scrim so every underlying control looks muted and is completely non-interactive.
   - Remove the foreground `Tickets` heading, `Main` label, white page treatment, and handheld-preview control from the locked experience.

2. **Recreate the reference composition**
   - Landscape: left information block and right keypad block, with the same relative widths, vertical alignment, and edge spacing as the screenshot.
   - Left block: date, oversized time, weather icon and temperature, then venue location in white.
   - Right block: a wide four-star PIN display followed by tightly joined keypad rows.

3. **Rebuild the keypad geometry and styling**
   - Match the exact number order: `7 8 9`, `4 5 6`, `1 2 3`, then `C 0 ENTER`.
   - Use broad rectangular keys with subtle light vertical shading, dark separators, minimal corner radius, large dark digits, red `C`, and a charcoal `ENTER` key.
   - Add the exact action rows: red `Clock Out`, white `Break`, green `Clock In`; then dark fingerprint, white revenue center, and dark Face ID.
   - Finish with the full-width outlined `LOG OUT` control.
   - Remove the current floating-card look, excessive gaps, rounded tiles, and magenta Enter button.

4. **Enforce the lock behavior**
   - Require four PIN digits before Enter, Clock Out, Break, or Clock In can run.
   - Keep the masked PIN state, clear action, biometric actions, logout, and existing navigation outcomes functional.
   - Ensure no click or touch can reach the dimmed app beneath the overlay.

5. **Adapt without changing the visual language**
   - Tablet and desktop landscape retain the exact two-column reference composition.
   - Portrait phone and narrow tablet stack the information and keypad compactly while preserving the same colors, key order, controls, and full-screen lock.
   - Fit within each viewport without page scrolling or clipped controls.

## Technical details
- Refactor the clock-in route and shared PIN pad so this gate can use its reference-specific arrangement without degrading PIN sheets elsewhere.
- Adjust shell gate handling so the inactive app backdrop remains visible and the gate owns the full interaction layer.
- Use existing semantic design tokens and the project font; add only gate-specific semantic styling where needed.
- Verify visually at 1155x713 against the uploaded screenshot, then at desktop landscape, tablet landscape, and representative phone portrait sizes.
- Confirm zero page scroll, no active underlying navigation, and no em dash characters in changed user-facing text.
