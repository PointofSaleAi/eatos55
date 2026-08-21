# Order panel to match the original format

The right-hand order area is close but the placement does not match the reference screenshots. Fix presentation only: same data, same store, same actions.

## What changes

1. Header row
   - Guest name, phone and "Arrived at 9:57 PM" stay on the left; the action icons move onto the same row, right aligned, instead of wrapping under the name.
   - Five actions in the reference order: discount, transfer check, tax exempt, comp (C), no charge. The cash drawer icon leaves this row.
   - Icons become plain filled grey circles (no outline ring), slightly larger, matching the reference weight.

2. Service type row
   - Dine-In, Takeout, Delivery keep three equal buttons but each always shows its icon next to the label, at every size (currently the icon only appears on very wide screens).
   - Selected reads as the dark bordered chip from the reference; unselected stays flat grey.

3. Order number and server line, then Order Notes field: unchanged in content, tightened to the reference spacing.

4. Items list
   - Quantity column reads "2 ea" in bold, then the item name which wraps onto a second line instead of truncating (as in "Jambon (Ham) Sandwich"), then the amount in a fixed right money column.
   - Modifier lines keep the elbow marker and read as "- Smoked Lox Sandwich" in the link blue used in the reference rather than orange.

5. Totals and footer
   - Sub Total, Tax, Total rows keep the divider lines with Total heaviest.
   - Footer becomes the two reference actions only: FIRE (orange) and CHARGE $x (purple). Save moves up into the header action row so nothing is lost.

## Across sizes

- Phone portrait: same order, icons compress to a single scroll-free row, service buttons keep icon plus label, footer stays two buttons above the tab bar.
- Tablet portrait and landscape, desktop: identical structure in the sidebar pane.
- No new scroll regions; only the items list scrolls.

## Technical notes

- Only `src/components/pos/order-panel.tsx` changes. No store, routing, pricing or logic changes.
- `OrderAction` restyled to the filled circle variant; header switches from `flex-wrap` to a two-column row with the name block on `min-w-0 flex-1`.
- Item rows switch from `truncate` to a two-line clamp with the money column fixed, using existing `text-fs-*` tokens.
- Modifier colour uses an existing token, not a new hex value.
- Verify with Playwright at desktop 1440, tablet 1024 and 834, phone 393.
