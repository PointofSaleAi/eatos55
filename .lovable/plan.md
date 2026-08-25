# Restore the right-hand order pane and compact the category header

## What went wrong

On tablet and web the ordering screen should always show the menu on the left and the running order in a fixed pane on the right, as approved. It is currently falling back to the phone pattern (a full width MENU / ORDER switch with the order taking over the whole screen), and the menu/category header uses large single line pills that waste the space the product grid needs.

## What to fix

1. Right-hand order pane, always on, at tablet and web widths
   - The order pane becomes a permanent right column on any viewport 768px and wider: menu grid left, order right, no MENU / ORDER switch, no bottom order bar.
   - Pane width scales with the viewport (about 21rem on small tablets, 24rem on large tablets, up to 26rem on wide desktop) so the product grid keeps the rest.
   - The MENU / ORDER switch and the compact bottom total plus Charge bar stay phone only, unchanged.
   - Nothing inside the order pane changes: guest header, order type strip, item rows, borderless Sub Total / Tax / Total, and the SAVE, FIRE, CHARGE footer row all stay as approved.

2. Density of the menu and category header, matching the older POS screenshot
   - Category buttons wrap their label onto two lines instead of one long pill, with a smaller uppercase type size, tight leading and a fixed compact height, so a large category set fits in two or three rows.
   - Menu tabs (Brunch, Dinner, Desserts, Bakery, Bar) use the same compact treatment and wrap rather than scroll on wide screens.
   - Header padding trimmed so the reclaimed vertical space goes to the product grid.
   - Long labels such as BRUNCH EGGS (LE OEUFS) stay fully readable on two lines with no truncation.

3. Product grid gains the reclaimed space
   - Tile minimum width and gaps tuned so more tiles fit per row at wide widths, with the same tile content (name, stock or open price badge, price, plus button) and the same tap and long press behaviour.

## Technical notes

- `src/routes/order.new.tsx`: gate the tab switch and bottom bar strictly on the phone branch, make the `aside` a persistent sized right column at wide widths, restyle the menu tab row and category chip row as compact two-line buttons, retune the grid `minmax`.
- `src/components/pos/order-panel.tsx`: no structural change, only width-driven spacing if needed.
- No changes to state, cart logic, routing, or payment flow.

## Verification

Screenshots at 1920x1080, 1280x900, 1024x768 portrait and 390x844, confirming: right-hand order pane present on all tablet and web sizes, two-line category labels with no clipping, and phone layout unchanged.
