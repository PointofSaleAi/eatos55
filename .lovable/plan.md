# Order panel starts at the top, menu pills stay on the left

Two layout problems on the ordering screen, both from the header block spanning the full width above the right panel:

1. The order panel starts below the menu and category rows instead of at the top of the screen, as in the original screenshot.
2. The menu and category pills run across the full width, so they sit in the space that belongs to the order panel and get clipped instead of wrapping.

## What changes

- On tablet landscape and desktop, split the screen into two full-height columns: the menu column on the left and the order panel on the right. The order panel starts flush at the top, directly under the dark top bar, and runs to the bottom, matching the reference.
- The header (menu button, menu pills, search and more icons, category pills) moves inside the left column, so it can never overlap the panel.
- Menu pills and category pills wrap onto as many lines as they need within the left column width, keeping the selected pill visible. No horizontal scroll on wide screens.
- Panel content order and styling stay exactly as they are today.

## Across sizes

- Phone and tablet portrait: unchanged. The Menu / Order tabs stay, the header stays above the content, and the panel fills the tab. Category pills continue to scroll horizontally in that narrow layout.
- Tablet landscape and desktop: two-column layout described above, panel width unchanged.

## Technical notes

- Only `src/routes/order.new.tsx` changes. No store, pricing or routing changes; `OrderPanel` itself is untouched.
- The outer wrapper becomes the flex row for wide layouts; the current header `div` and the products grid move into a new left column wrapper that owns `min-w-0 flex-1` so the pills wrap instead of pushing the panel.
- The `aside` keeps its fixed width and left border but becomes a top-level sibling of the left column so it spans the full height.
- Verify with Playwright at 1440, 1024, 834 and 393 px that the panel top aligns with the top bar and no pill row is clipped.
