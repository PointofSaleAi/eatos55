# Keep product names inside their cards

## Confirmed issue
The screenshot shows product names crossing the right edge of several cards. The current sizing calculation checks wrapped line counts but accepts an individual word even when it is wider than the available space. The name also lacks an explicit width-constrained text container.

## Changes
- Constrain the name area to the card’s inner width, including border and padding, with space accounted for stock badges.
- Choose the largest existing font size that fits both horizontally and vertically, using the rendered text rather than line count alone.
- Keep complete words together whenever possible; reduce the size for long words instead of allowing them to spill outside. Use word-breaking only as a last resort for an unusually long name.
- Recalculate when cards change width, including opening the right-side options panel, and when fonts finish loading.
- Preserve the larger-name styling, compact line spacing, stock badges, prices, and add buttons. Do not hide or truncate product names.

## Technical details
Update the product-card name container and `FitName` sizing in New Order. Use constrained rendered measurements and existing typography tokens, without resize feedback loops.

## Verification
Check the highlighted sandwich names, FROMAGE FONDU, and the out-of-stock card at the screenshot’s layout size, plus phone, tablet, and desktop widths. Confirm full names stay inside the cards, stock badges remain visible, and prices/add controls do not overlap. Repeat with the options panel open and after changing categories.
