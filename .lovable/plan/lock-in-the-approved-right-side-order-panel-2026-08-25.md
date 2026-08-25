# Lock in the approved right-side order panel

The panel you approved (the denser sidebar option) is still the one in the code, and it is back in its right-hand column after the wrong move to the bottom was reverted. The captures above are that panel, live, with seven lines in the order. Nothing about it needs rebuilding.

Two small things remain.

## 1. Save the approved reference

Store the two captures as the project's reference images for this panel, at `docs/qa/evidence/order-panel/`:

- `panel-1280x900.png`, the panel alone with a seven line order
- `screen-1280x900.png`, the full ordering screen showing menu left, panel right

Any future change to the panel gets compared against these before it ships.

## 2. Fix the clipped item control

At the right edge of each item row the quantity/remove control is cut off by the panel edge (visible as a half "-" on every line). Give the item rows the small right inset they need so that control sits fully inside the panel at every panel width, without shortening the item name column more than necessary.

## Technical notes

- `src/components/pos/order-panel.tsx`: presentation only, right padding on the row grid and the trailing control column so nothing overflows at 21rem, 24rem and 26rem panel widths.
- No state, pricing or routing changes.
- Verified at 1920x1080, 1280x900, 1024x768 and 390x844 with a long order, plus swipe on the order type strip still reaching every order type.
