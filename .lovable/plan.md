## Center item names on the quantity control

**Cause:** on the bill screen, each item row lines everything up along the top edge. The − 3 + control is taller than the text, so the product name and price sit above its middle.

**Fix**
- Bill screen: the product name and the price line up with the middle of the − / + control. Modifier lines still stack under the name, so long items aren't squeezed.
- App-wide: check every other row that puts a name next to a − / + control and fix any with the same problem, so they look the same on phone, tablet and desktop. That includes the cart in New Order, split payment, the Inventory adjustment, the Modifiers / Add-Ons / Groups selection counters, and the table-guest counters.

**Technical details**
- `payment-bill.tsx`: keep the `li` as `items-start`. Make the name's first line and the price `flex min-h-8 items-center` (matching the `size-8` stepper buttons), so they center on the stepper while modifiers flow below.
- Run `rg` for rows with an `items-start` stepper and apply the same `min-h` pattern only where the misalignment exists.
- Verify at 393x742, 768x1024 and 1280x900.
