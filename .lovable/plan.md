# Payment Method: one screen, all tenders, no dead space

## Goal
Every enabled payment type shows on a single screen. No "1/2" pager, no scrolling, and the tender area fills the pane instead of leaving a large empty block above the action bar.

## What changes
1. Remove pagination entirely from the Payment Method screen: drop the page state, the prev/next arrows, and the "1/2" counter.
2. Render all groups (Standard, Accounts and Rewards, Digital Wallets, Delivery partners, and any others enabled in settings) in one continuous layout.
3. Fit-to-pane sizing instead of paging: measure the pane once, then compute a column count and a tile height that make the full tender set fit the available height.
   - Columns grow with width (2 on a 390 phone, 3 to 5 on tablet, up to 6 on a 1920 desktop).
   - Tile height shrinks within a min/max band (tap-target floor respected) so the grid ends near the action bar rather than halfway up it.
   - Groups flow into the same grid track set, with compact uppercase group headings spanning the full row.
4. Reclaim the leftover space: group gaps and section headings share the surplus, so a small tender set spreads out evenly and a large set tightens instead of paginating.
5. Keep the show/hide behaviour driven by settings (a disabled tender never renders), the Room Charge module check, the selection highlight, and the bottom action bar wording unchanged.
6. Keep the helper line under the title, shown on wider screens only, as today.

## Verification
Check the screen at phone portrait (390x844), tablet portrait and landscape, and 1920x1080 landscape: all enabled tenders visible at once, no pager control, no vertical scrollbar, no large gap between the last tile row and the action bar.

## Technical notes
Single file: `src/routes/payment.method.tsx`.
- Delete `page`/`setPage`, the `pages` memo, and the chevron header block.
- Replace with a fit solver: from measured `box.w`/`box.h` and the density tokens (`--tender-min`, `--tender-h`, `--gap-sec`), pick the smallest column count whose required height fits, otherwise clamp tile height down to the tap-target floor.
- Keep the existing `ResizeObserver` and the rem-normalising `readMetrics` reader.
- No store, settings, or payment logic changes.
