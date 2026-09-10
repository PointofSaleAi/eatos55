# Slim top settings pull-down without screen overlap

## Update

- Replace the wide hanging black tab with a slim centered handle contained inside the existing top bar.
- Keep the arrow easy to tap without letting its visible shape cover page titles, dates, totals, or other screen content.
- Preserve the current tap behavior: open and close the Shift Dashboard exactly as it does now.
- Apply the shared change globally so every in-app screen receives the correction.

## Responsive behavior

- Phone: compact handle stays within the top bar and clears page headings.
- Tablet and desktop: use the same restrained control without changing the left navigation or dashboard layout.
- Keep the current safe-area handling for iPhone screens.

## Technical details

- Update the shared top-bar control in `src/components/pos/clock-pulldown.tsx`; no individual page changes are needed.
- Remove the below-bar absolute positioning that currently causes the overlap.
- Keep the existing accessible label, expanded state, icons, and dashboard event behavior.
- Verify closed and open states at phone portrait, phone landscape, tablet portrait, tablet landscape, and desktop widths.
