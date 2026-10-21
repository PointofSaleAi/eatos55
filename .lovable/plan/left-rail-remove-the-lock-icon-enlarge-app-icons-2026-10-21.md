# Left rail: remove the lock icon, enlarge app icons

File: `src/components/pos/nav-rail.tsx` only.

1. Delete the "Lock terminal" block (lock icon link under the grip) and the unused `Lock` import. Locking stays available from the pull-down pad / clock-in screen.
2. Increase destination icons (New Order, Table Order, Rooms, Tickets, orderOS) from `size-6` (24px) to `size-8` (32px); keep the tile cell height and the even spacing that fills the rail. Expanded labels unchanged.
3. Collapsed width stays `4.25rem` — a 32px icon fits comfortably; the active outline cell still frames it.

## Verification
- Playwright at 1141x742, 1024x768 and 1357x796, collapsed and expanded: no lock icon, icons 32px, evenly spaced, no clipping or scrollbar.
- Phone layout unaffected (rail hidden there). Build log clean.
