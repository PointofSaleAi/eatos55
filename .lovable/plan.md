## Close the gap between the clock and the PIN field (phone)

**Why it happens:** the keypad is capped in height and centered in the space left under the clock. That leaves empty space above it, and below Logout as well.

**Fix (phone only; tablet and desktop unchanged)**
- Place the keypad directly under the clock with a small, even gap.
- Let the keypad grow to fill the rest of the screen down to Logout, so the keys get taller instead of leaving empty space.

**Technical details**
- `clock-pulldown.tsx`: on the PinPad wrapper, use `justify-start sm:justify-center`. On PinPad, use `max-h-none sm:max-h-[34rem]` so it fills the remaining height on phone.
- Check at 393x742 and a short phone (375x667) so nothing scrolls or clips. Spot-check tablet.
