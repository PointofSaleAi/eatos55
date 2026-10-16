# Fix Maximum Number of Selections stepper (Menu settings)

Applies to Modifiers and Add-Ons (the Menu screens that have a quantity stepper), on phone, tablet and desktop.

## Problem
The "+" button is capped at the number of options, so with 0–1 options it is stuck at 1 and can't be raised (the recording shows e.g. "Add One Egg" with 1 option and 3 selections). Saving also silently pulls the value back down when options change.

## Fix
- "+" always works up to 99; "−" stops at 1. Value never auto-reduces when options are added or removed.
- Stepper shown as one compact grouped control (− value +) on the right of the row, with the value centered between the buttons; buttons stay at least 44px for touch.
- Value can also be typed directly (digits only, 1–99), committed on blur.
- Turning the toggle off and on keeps the last value.

## Technical details
- `src/components/pos/modifier-settings.tsx`: remove the `options.length` clamp in `update()` and the `+` disabled condition; extract a small `QtyStepper` (min 1, max 99) and use it for the Maximum Number of Selections row.
