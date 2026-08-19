# Split Payments, rebuilt to the new design

## What Split Pay does

A check can be paid in three ways, chosen on one screen:

- **Standard Check**: one check, no split. This is the default and the "do nothing" option: the panel shows a large "Standard Check / Select a split option or Close to continue with single check" placeholder and PAY is disabled, because payment continues on the normal payment screen.
- **Split Evenly**: the whole check is divided into N equal child checks. Each child shows its own TOTAL, Sub Total, TAX, Service, Discount, and every parent item at a fractional quantity (for example "4 / 8 ea Iced Tea Passion Fruit 2.50"). Rounding remainders land on the last check so the children always add up to the parent total.
- **Split Custom**: N empty child checks are created and each parent item is assigned to one or more of them. An item shared between checks is divided by the number of checks it is on. Unassigned items keep the child at $0.00 and PAY stays disabled until every item is assigned.

Number of checks is a minus / count / plus stepper next to the mode tabs (2 to 10). Each child card carries a round X badge to drop that check. Once a split is saved, items can no longer be added to it, so a Disclaimer confirmation appears with "Proceed" and "Close".

## New design

Split Pay becomes a full-screen overlay opened from the Split Check tile on the payment screen (the `/payment/split` route stays valid for direct links and renders the same overlay).

- Title "Split Payments" centred, single close X top right.
- **Left column**: the parent check as a torn-edge receipt: "Check 19 / Guests: 1", "ARRIVED AT 5:41 AM", "Table:", then TOTAL, Sub Total, TAX, Service Charge (CC Fee), then the item lines with quantity superscript, name, modifier lines and price. This column keeps its own height and never scrolls the whole overlay.
- **Right column**: the three mode tabs as equal outlined buttons with icons (active tab tinted green with a green border), the check stepper on the right of the tab row, then the child-check grid: up to 4 across on desktop, 2 on tablet, 1 on phone, each a torn-edge receipt with a big ghost number watermark and an X badge.
- **Footer**: discount (%), card-brand and print icon buttons on the left; save icon and the wide black PAY button on the right. PAY is disabled in Standard mode and while a custom split is incomplete.
- On phone the two columns stack: parent summary collapses to a compact total strip at the top, mode tabs and stepper below, child checks in a single column.
- No overlay-level scrolling on desktop or tablet; the child-check grid gets its own scroll region only when the number of checks genuinely exceeds the space, matching the existing no-scroll rules.

## Disclaimer step

Tapping PAY on a split check first shows the centred "Disclaimer" dialog: "This check is split, so items cannot be added to it. Remerge and save to add items, or start a new order." with **Proceed** (continues to the payment screen with the first child check preselected) and **Close** (returns to the split screen).

## Em dash sweep

Confirm and enforce zero em dashes anywhere: `src/` is already clean, and the remaining occurrences in `vite.config.ts`, `AGENTS.md`, `README.md`, `bunfig.toml` and `public/manifest.webmanifest` are rewritten with a comma, colon or plain hyphen. New copy added by this change (including the disclaimer text) uses no em dash.

## Technical notes

- Extract the split UI from `src/routes/payment.split.tsx` into `src/components/pos/split-payments.tsx` (overlay + panes) so both the route and the Split Check tile in `src/routes/payment.method.tsx` render one implementation.
- Reuse `ReceiptCard` / `ReceiptRow` from `src/components/pos/receipt.tsx` for the parent and child receipts (torn edge, watermark, `topAction` for the X badge); reuse `SplitWithSheet` and `PrintSplitSheet` from `src/components/pos/split-sheets.tsx`, plus `DiscountSheet`.
- Keep the existing even / custom maths in a `useMemo`, add the last-check rounding correction, and per-check service and discount shares in custom mode.
- X badge on a child removes that specific check and reassigns its items in custom mode, instead of only decrementing the count.
- Disclaimer uses the existing confirm dialog primitive with Proceed / Close labels.
- Presentation only: no store or totals changes beyond passing the selected child check through to `/payment/method`.
- Verified at 1440x950, 1155x713, 1024x768, 834x1112 and 393x852.
