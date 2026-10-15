# Cart header: keep Guest Name, Mobile Number and ARRIVED AT on one line

## Problem

The cart header row wraps ARRIVED AT onto a second line. Measured at the user's current viewport (1141×742): the header row is **351px** wide, but its contents need ~377px because

- `flex-wrap` allows a second line,
- Guest Name input has `min-w-[5.5rem]` (88px),
- Mobile Number input has `min-w-[8.5rem]` (136px),
- ARRIVED AT is `shrink-0` (~137px),
- plus 2 × 8px gaps.

88 + 136 + 137 + 16 = 377px > 351px → flex-wrap pushes ARRIVED AT to line 2.

## Fix — src/components/pos/order-panel.tsx (header row, lines ~397–429)

1. Change the row container from `flex-wrap` to `flex-nowrap` (keep `items-center gap-x-2`, drop `gap-y-1` need).
2. Reduce the minimum widths so all three always fit on one line:
   - Guest Name: `min-w-[4.5rem]` (72px) — still shows the full "Guest Name" placeholder.
   - Mobile Number: `min-w-[6.5rem]` (104px) — still shows "(XXX) XXX-XXXX" fully at `text-fs-xs`.
3. Keep the clock `shrink-0 whitespace-nowrap`, and drop the all-caps label: it reads `Arrived at 4:34 PM` (sentence case) instead of `ARRIVED AT 4:34 PM`, in all three places it appears (cart header, table chip, Custom Item guest line). Lowercase also trims a few px of width, which helps the row fit.
4. With `flex-1` on both inputs they share leftover space; on the narrowest realistic panel (~351px) the total is 72 + 104 + 137 + 16 ≈ 329px, so one line holds. If a panel is somehow narrower, the inputs compress (text ellipsis is NOT added — placeholders still render, inputs keep their behaviour).

No change to inline-editing behaviour (save on blur/Enter), fonts, or the live-clock rule. The table chip's ARRIVED AT (line ~455) and the Custom Item guest line are unaffected — they already render on their own lines by design.

## Verification

Playwright at desktop 1141×742 (user's viewport), tablet 768×1024, phone 390×844, manager session via `localStorage 'eatos.pos.session'`, 2500ms wait after load:

- Guest Name input, Mobile Number input and the ARRIVED AT span all share the same `y` coordinate (one visual line).
- Full placeholders visible; typing a name/number still saves on blur.
- No horizontal overflow anywhere.
- `bunx tsgo --noEmit` clean; build OK.
