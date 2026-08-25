# One responsive system, screen by screen, with your approval each time

The uploaded matrix comes from the Flutter payment module. This project is the React POS, so nothing Cursor changed there carries over: no logos, tokens or assets get touched by this work. What does carry over is the method: one shared density system, then one screen at a time behind an approval gate, each with a screenshot matrix as proof.

## What exists today, and what is actually missing

The app already has one fluid scale in `src/styles.css` (`--fs-*`, `--tap`, `--ctl-*`, `--tile-h`, `--key-h`, `--row-h`, `--gap-sec`, `--pad-screen`), all `clamp()` based, and the shell already switches between a phone layout and a wide rail/two-pane layout at 768px.

The gap: every clamp is tuned for phone widths (320 to 430) and tops out there. At 1024, 1366 and 1920 the type and controls sit at their phone maximum, so wide screens look sparse and undersized while individual screens compensate with one-off `text-[13px]`, fixed heights and hard grid column counts. That is why some screens read as a mess on tablet and desktop.

## The system (built once, applies everywhere)

1. **Form-factor tiers** driven by CSS only, no JS measuring:
   - phone portrait (up to 767)
   - tablet portrait (768 to 1023)
   - tablet landscape / POS (1024 to 1365)
   - POS wide (1366 to 1919)
   - desktop (1920 and up)
   Each tier re-declares the same token names with a density multiplier, so the whole app rescales from one block. Short-height and enlarged-text guards stay as they are.

2. **A density contract**: text, control height, tile height, row height, section gap and screen padding all come from tokens. No screen sets a raw px size. Tap targets never drop below 44px in any tier.

3. **Grids reflow by width, not by device**: `repeat(auto-fill, minmax(<token>, 1fr))` everywhere tiles appear (tenders, menu, rooms, floor grid, keypads), so a 390 phone gets 2 columns and 1920 gets 4 or 5 with no per-device branches. Fixes the wrapped `Manual CC` / `Account` labels seen in the phone shot.

4. **Regression guard**: a documented pass list per screen (no page-level scroll, no horizontal overflow, no clipped or wrapped tile labels, footer visible, every target 44px+), checked at each tier before a screen is called done.

## Pilot screen: Payment Method / Charge

Matches your recommendation, and it is the densest screen in the app.

- Left summary panel and right method panel both driven by tokens.
- Tender grid becomes auto-fill: 2 columns at 390, 3 at tablet, 4 at POS wide and desktop, labels never wrapping.
- Total due header, section labels, tiles and the Charge bar scale per tier.
- Nothing about payment routing, tender availability, settings gating, split behaviour or copy changes.

## Evidence you review before anything is kept

For the pilot and every screen after it, a screenshot matrix captured in the real running app:

| Orientation | Sizes |
|---|---|
| Landscape | 1024x768, 1366x768, 1920x1080 |
| Portrait | 390x844, 768x1024 |

Posted in chat as a grid, plus the token values resolved at each size so the scaling is verifiable rather than asserted. You reply approve, tweak, or reject. Nothing moves to the next screen until you approve.

## Queue after Charge is approved

Split Payments, Order screen (menu grid plus order panel), PIN gate, Tickets, Floor plan (grid and layout), Settings tree, Room Charge, Login and Clock-In. Order is adjustable at any point.

## Technical notes

- Tier tokens live in `src/styles.css` as media-query blocks re-declaring the existing `:root` values; `@theme inline` mappings stay untouched so every existing `text-fs-*` / `h-ctl-*` usage picks up the new tiers for free.
- Per-screen work is a sweep of hard-coded px and fixed column counts in that screen's files only.
- Presentation only: no store, routing, data, business logic, logo or asset changes. Existing safe-area (`--sat`/`--sab`), keyboard inset (`--kb-inset`) and the Handheld preview toggle keep working and compose with the tiers.
- Screenshots are produced with a headless browser against the running app, saved under `docs/qa/evidence/<screen>/` for reference.
