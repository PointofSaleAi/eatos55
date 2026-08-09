# Hard rule: one adaptive scale for every phone size

Goal: no screen shows unintended scrolling, clipping or cramped text on any phone from a 320x568 small Android up to an iPhone 17/18 Pro Max class device, and text still adapts when the user increases their system/browser font size.

## What is wrong today

- Sizes are hard-coded in pixels all over the app: `text-[11px]`, `text-[13px]`, `h-9`, `min-h-[36px]`, `h-[124px]`, `h-[128px]`, `min-h-[92px]`. Fixed px does not grow on a large phone and does not respond when the user enlarges text, so big phones waste space and enlarged text clips.
- Sheet heights are fixed fractions (`78dvh`, `85dvh`, `92dvh`, `60vh`) rather than "content height, capped", so short sheets look empty and long sheets scroll unnecessarily.
- Card/tile heights are fixed (`h-[124px]`, `h-[128px]`, `min-h-[92px]`), so on a 430-wide phone tiles stay small and on 320 they crowd.

## The fix

### 1. A fluid size scale in `src/styles.css`

Define one set of tokens that scale smoothly with viewport width and respect the user's font size, then use them everywhere:

- Type steps: `--fs-xs`, `--fs-sm`, `--fs-base`, `--fs-lg`, `--fs-xl`, `--fs-2xl` built with `clamp(min, preferred-with-vw, max)` so 320px gets the compact end and 430px+ gets a slightly larger end, and `rem` bases keep user text-size preferences working.
- Spacing/control steps: `--tap` (44px floor), `--ctl-sm/md/lg` control heights, `--gap-sec` section gap, `--pad-screen` screen padding — all clamp-based.
- Tile steps: `--tile-h` for menu/room/table cards so tiles grow with the screen instead of a fixed 124/128px.
- Expose them as Tailwind utilities via `@theme inline` (e.g. `text-fs-sm`, `h-ctl-md`) so components read as tokens, not magic numbers.

### 2. Replace hard-coded px with tokens across the app

Sweep every `text-[NNpx]`, fixed `h-*` control, `min-h-[NN]` and fixed tile height in: `order.new`, `order.custom-item`, `order.review`, `order.menu`, `item-sheet`, `more-sheet`, `discount-sheet`, `guest-sheet`, `pin-sheet`, `numpad`, `tender-screen`, `tickets-screen`, `board.index`, `floor.index`, `rooms.index`, `settings.*`, `system.*`, `access.*`, `index`, `primitives`, `settings-rows`, `shell`.

Rules applied while sweeping:
- Every interactive control keeps a 44px minimum, expressed as `min-h-[var(--tap)]`.
- Text containers keep `min-w-0` + `truncate` (or 2-line clamp) so longer names never push layout — grid + `shrink-0` header pattern stays.
- No text below the equivalent of 11px at the small end and it grows with the screen.

### 3. Sheets sized by content, capped by screen

Bottom sheets switch from fixed `dvh` fractions to `max-height: min(<cap>dvh, content)` with the inner area as the only scroller, footer pinned. Short sheets (guest details, discount) become short; long sheets (item modifiers) scroll only their list.

### 4. Layout that reflows by width, not by device

- Menu/tender/room grids use `repeat(auto-fill, minmax(<token>, 1fr))` so 320 shows 2 columns, 393 shows 2 comfortably, 430+ shows 3 where it helps, without device-specific breakpoints.
- Keypads (custom item, cash, PIN) use a flexible row height range so keys fill the remaining space on tall phones and shrink on 568-tall phones instead of pushing the footer off-screen.
- Very short viewports (`@media (max-height: 620px)`) get a compact step: smaller section gaps and control heights, still 44px taps.

### 5. Enlarged-text and narrow-device safety

- Verify at 100%, 120% and 140% browser/system text size on 320 and 393: nothing overlaps, footers stay visible, headers truncate rather than wrap into two lines.
- Galaxy Flip closed (roughly 344x882 with tall aspect) and Fold open are treated as: closed = phone layout, open = the future tablet layout (out of scope for this pass, noted only).

## Verification

Playwright screenshot matrix, portrait, on every primary screen (login, new order, item sheet, custom item, review, payment method/cash/card, tickets, floor, rooms, board, settings main + detail, drawer, PIN):

- 320x568 (SE 1st gen / small Android)
- 360x640 (Android 10 class)
- 375x667 (iPhone SE 2/3)
- 393x852 (iPhone 15/16/17 class)
- 430x932 (Pro Max class)
- 344x882 (Flip closed)

Pass criteria per shot: no page-level scrollbar (only the intended content area scrolls), no horizontal overflow, bottom bar/tabs visible, no clipped text, every tap target >= 44px. Re-run at 140% text size on 320 and 393.

## Technical notes

- Presentation-only pass: no store, data, routing or business-logic changes.
- Tokens live in `src/styles.css` under `@theme inline` plus a `:root` block of `clamp()` values; components reference utilities so a single token edit re-tunes every screen.
- Existing `--kb-inset`, `--sat`/`--sab` safe-area and search-dock behaviour stay as-is and compose with the new spacing tokens.
