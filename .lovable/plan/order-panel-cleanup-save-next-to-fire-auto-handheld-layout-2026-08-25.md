# Order panel cleanup, Save next to Fire, auto handheld layout

Approved direction: "Denser sidebar v5".

## 1. Totals block

- Remove the divider rules between Sub Total, Tax, Discount and Total. One clean stack, no lines.
- Sub Total / Tax / Discount stay in muted bold; Total stays the large bold line.
- Keep the "(exempt)" and "(comped)" labels and the discount row logic exactly as today.

## 2. Footer actions

- Action row becomes SAVE + FIRE + CHARGE on one line: Save as a compact icon button (save icon, aria-label "Save order"), Fire as the orange action, Charge takes the remaining width and keeps the amount.
- The duplicate Save icon in the header action grid is removed, so the header drops to a 5 icon set (Discount, Transfer, Tax exempt, Comp, No charge) and gains a little breathing room.
- Buttons keep current disabled behaviour when the cart is empty, and keep tap-safe heights on phone.

## 3. Handheld preview toggle

- Remove the floating "Handheld preview" / "Full layout" button and its stored `pos:layout-mode` value.
- Layout becomes purely size driven: phone widths get the handheld single pane with tabs, 768px and up get the tablet/web layout. Nothing to click, nothing to overlap the Charge button.

## 4. Large order scroll

Only the item list scrolls; everything else stays fixed, so long orders now fit far more lines:

- Denser rows: quantity in a compact rounded tile on the left, item name and price on one line, modifiers on one compact uppercase line, line note below, no fixed 3rem column and no extra vertical padding.
- Modifiers join into a single wrapped line instead of one row per modifier, so a 4 modifier item costs one extra line, not four.
- The header block condenses as the order grows: once the order has items, the guest identity block and the order notes field collapse to a single compact strip (guest name plus notes chip, both still tappable to open the same sheets), which hands roughly 40 percent more height to the item list. Nothing is removed, only collapsed.
- Sticky totals footer keeps Total and Charge always visible.
- Same panel is used by the phone ORDER tab, so the density gain applies at every size.

## Technical notes

- `src/components/pos/order-panel.tsx`: totals `dl` loses `divide-y`, footer becomes a 3 button grid, item rows and modifier rendering rebuilt to the denser layout, header gets a collapsed state driven by `cart.length`.
- `src/components/pos/shell.tsx`: delete the mode toggle button and the `mode`/`setMode` usage.
- `src/hooks/use-layout-mode.ts`: drop `LayoutMode`, storage key and the framed branch; `wide` becomes `wideViewport`.
- No store, pricing or business logic changes; presentation only. Verified with Playwright at 390x844, 768x1024, 1024x768, 1366x768 and 1920x1080 with a 12 line order.
