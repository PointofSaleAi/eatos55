# Center the PIN pad and clock block in the two-column lock screen

## What changes
- On the clock-in lock screen in its two-column (wide/landscape) form, the date / time / weather / city block will sit centered in its half of the screen, both horizontally and vertically, instead of hugging the far-left edge.
- The PIN pad stays centered in its half, and the two blocks will read as one balanced, centered pair instead of being pushed to opposite edges with a wide empty middle.
- The phone (single column) lock screen is unchanged: the compact clock strip above the keypad stays exactly as it is today.
- The same centered clock block also appears in the top-bar clock pull-down when it is open in two-column form, so that screen picks up the same tidy alignment.

## How it will look
```text
before                          after
--------------------------------  --------------------------------
| Thursday, 8 October    |      |          Thursday, 8 October      |
| 19:34                  |      |              19:34                |
| (icon) 24              |      |           (icon) 24               |
| New York, NY           |      |           New York, NY            |
|                        |  |   |                                   |
|                        |  |   |              [ PIN PAD ]          |
--------------------------------  --------------------------------
```

## Technical details
- `src/components/pos/clock-panel.tsx`: in the `gate` branch, add `items-center text-center` to the column container, applied only when `compact` is false (the two-column case), so the portrait compact grid layout is untouched. The existing `justify-center` keeps vertical centering; the weather row (icon + temperature) is a shrink-to-content flex row, so it centers as a unit with the text lines above and below it.
- `src/routes/access.clock-in.tsx`: change the wide grid track from `grid-cols-[1fr_minmax(25rem,30rem)]` to `grid-cols-[minmax(0,1fr)_minmax(25rem,30rem)]` so the centered clock text can shrink instead of overflowing on narrower wide windows. The group is already `mx-auto` and the keypad column is already vertically centered (`justify-center` with `max-h-[34rem]`), so no other change is needed there.
- `src/components/pos/clock-pulldown.tsx`: no edit — it renders `<ClockPanel gate />` with `compact` unset, so it inherits the centered block automatically.
- No copy, colors, type sizes, icons, keypad keys, revenue-center popover or PIN behaviour changes.

## Verification
- Measure with Playwright at 1024x768, 1141x742, 1280x800 and 1600x900 that the clock block's horizontal center matches its column's center, and the keypad's center matches its column's center, with both vertically centered.
- Screenshot the phone layout at 390x844 and 768x1024 to confirm the single-column lock screen is untouched.
- Open the top-bar clock pull-down at a wide size to confirm the centered block there, and confirm the keypad, revenue-center popover, Clock Out / Break / Clock In row and Log out bar still work.
- Check `/tmp/observability/build-errors.log` is clean after the edits.
