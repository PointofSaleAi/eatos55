# Gift Card modal: stop early auto-jump to Amount

## Problem
In the Gift Card window, the number pad switches from the card-number field to the amount field as soon as 8 digits are typed — long before the card number is complete (the field allows up to 19 digits). The user wants the jump to happen only when the number is fully entered, or when they tap the amount field themselves.

## Fix
In `src/components/pos/gift-card-dialog.tsx`:

1. Remove the auto-advance at 8 digits. The pad stays on the card-number field until the number reaches its full length (19 digits), then hands over to the amount field.
2. Manual selection keeps working exactly as today: tapping the Amount field (or the card field) moves the pad focus at any time.

So the two ways to reach the amount field:
- Type the full card number (all 19 digits) — pad moves over automatically.
- Tap the Amount field at any time.

No other behavior changes: Charge still requires at least 8 digits and an amount, the balance line still appears once a known card is recognized, and backspace/editing stay as they are.

## Verification
- Type a partial number (e.g. 10 digits): focus stays on the card field.
- Type all 19 digits: focus moves to Amount.
- Tap Amount mid-entry: focus moves immediately.
- Check on phone, tablet and desktop widths.
