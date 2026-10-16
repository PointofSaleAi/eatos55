# Bottom nav shows the same names as the landscape rail

## What will change
On phone (portrait) the bottom tab bar currently reads Home, Tickets, Board, Settings. It will read the same names the landscape left rail uses for the same destinations:
- Home → **Table Order** (opens the floor plan, /floor)
- Tickets → **Tickets** (unchanged, already matches)
- Board → **orderOS** (opens the order status board, /board)
- Settings stays as is.

## Details
- Only the labels in the bottom tab bar (`tabs` in `src/components/pos/shell.tsx`, `BottomTabs`) change; routes, icons, active states and the floating action button stay as they are.
- The same tab bar is reused across screens on phone, so the rename applies everywhere it appears.
- Landscape/desktop left rail is untouched.

## Verification
- Phone viewport: bottom bar shows Table Order, Tickets, orderOS, Settings; each still opens its screen and the active state still highlights.
- Landscape tablet/desktop: left rail unchanged.
