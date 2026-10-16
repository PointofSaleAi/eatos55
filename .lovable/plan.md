# Fix price entry in Modifier Options

Applies to Add/Edit Modifier on phone, tablet and desktop.

## Changes
- Price cell becomes one tidy right-aligned field: "$" sits directly beside the number (no gap), fixed width, so it lines up under the "Price" header for every row.
- Placeholder shows "0.00" instead of the long "Enter Price".
- Only digits and one decimal point accepted, max 2 decimals; leaving the field formats it (2.5 → 2.50, empty → 0.00). Number keypad on touch devices.
- The "Add Option" row's price is a real field too: you can type a price first or a name first; the option is created once it has a name, keeping the typed price.
- Tapping anywhere in the price cell focuses the field; the clear (X) button stays on the right for removing the option.

## Technical details
- In `src/components/pos/modifier-settings.tsx`, replace the price `<span>`/`<input>` with a shared `PriceField` (label wrapper, `$` prefix, `inputMode="decimal"`, `w-24 text-right`, onBlur format to `toFixed(2)`), used by `OptionRow` and the add row (add row keeps a local `newPrice` state merged when the option is created).
