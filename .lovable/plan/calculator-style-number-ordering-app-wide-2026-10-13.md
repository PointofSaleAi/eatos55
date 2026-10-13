# Calculator-style number ordering app-wide

## What will change
- Arrange every in-app number pad with these first three rows:

```text
7  8  9
4  5  6
1  2  3
```

- Apply this to payment amounts, gift-card number and amount entry, Custom Item, tips, guest counts, manager PIN entry, price overrides, and numeric payment-reference entry.
- Keep the existing eatOS styling, number sizes, spacing, and layouts. The screenshot is a reference for number order only.
- Preserve each pad’s existing bottom row and action keys, including zero, decimal, double-zero, clear, backspace, Enter, and Add.
- Keep all input, validation, PIN, payment, and gift-card behavior unchanged. Device-provided keyboards are outside this change.

## Technical details
- Reorder digit arrays in `numpad.tsx` (both variants), `primitives.tsx` (`Keypad`), `guests-sheet.tsx`, `reference-tender-dialog.tsx`, both PIN and amount grids in `price-override.tsx`, and the inline tip pad in `access.clock-out.tsx`.
- Leave the shared `PinPad` ordering unchanged: it already uses the requested calculator arrangement.
- Change only number placement; do not replace the existing pads or alter their consumers.

## Verification
- Check every keypad implementation for the same first three rows, including standalone pads as well as shared ones.
- Verify phone, portrait tablet, landscape tablet, and desktop layouts, with no shifts or overlaps.
- Enter a recognizable sequence on each pad and confirm the displayed value matches the tapped digits.
- Check bottom-row controls, decimal restrictions on gift-card numbers, PIN completion, Custom Item Add, and tip/payment entry still work.
- Check preview errors after the changes.