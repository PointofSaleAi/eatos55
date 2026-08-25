# Increase Split Check limit to 25 people

## Goal

The Split Check stepper currently caps at 10 child checks. Update it to support large parties up to 25 people.

## What to change

- `src/components/pos/split-payments.tsx`
  - Replace the hardcoded `letters` array (`"abcdefghij"`) with a generated 25-letter array (`"abcdefghijklmnopqrstuvwxy"`), so the check stepper max changes from 10 to 25.
  - The existing minimum stays 2; removing the last check below 2 stays disabled.
  - Keep the existing grid layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) and overflow rules; the grid already scrolls internally when content exceeds the pane.
  - No changes to the even/custom math, totals, rounding, or store actions.

## Verification

- Open `/payment/split` with a test order.
- Tap the plus stepper in Split Evenly and Custom modes and confirm it reaches 25.
- Confirm child cards show labels `a` through `y` (e.g. "Check 1 a" ... "Check 1 y").
- In Custom mode, tap an item and verify the Split With sheet lists all 25 checks and scrolls correctly.
- Test on phone portrait and desktop to make sure the child-check grid scrolls only when needed and the watermark / X badge remain visible.
