# Align Settings headers

The "Settings" header in the left list and the section header on the right ("General", etc.) sit at different heights, so their titles and bottom lines don't line up.

## Fix
- Give both headers the same height and the same top/bottom spacing, so the titles sit on one line and the dividers under them meet in one straight line.
- Applies to every Settings section (General, Menu, Payments, and their inner screens), including ones with a back arrow or right-side buttons.
- Works on tablet and desktop (side-by-side view); phones show one panel at a time and keep the same height for consistency.
- Collapsed left list keeps the same height too.

## Technical details
- `src/components/pos/split-pane.tsx` sidebar header (`px-2 pb-3 pt-4`, button `min-h-tap`) and `SubHeader` in `src/components/pos/shell.tsx` (`px-4 pb-3 pt-4`, title row without min height) differ in inner row height.
- Add `min-h-tap` to the SubHeader grid row so both rows are tap-height, keeping identical `pt-4 pb-3` padding and `border-b`; verify with Playwright at 1141x742 and 1280x900 that both border-bottoms share the same y.
