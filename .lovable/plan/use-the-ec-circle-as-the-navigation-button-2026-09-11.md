# Use the "EC" circle as the navigation button

The burger button below the black bar is removed everywhere, and the initials circle in the black bar becomes the way to open the app navigation. The row under the black bar then belongs entirely to the guest details.

## Changes

1. Initials circle opens navigation
   - Tapping "EC" in the black top bar opens the full navigation drawer (phone/portrait) instead of the switch-user prompt.
   - Switch user moves into the navigation drawer itself, as a row at the bottom, so nothing is lost.
   - Label and tooltip become "Open navigation"; keeps its current size and look.

2. Burger removed from screens
   - The burger disappears from the New Order header, screen headers, sub headers, tickets, floor and settings screens.
   - Where a back chevron exists today, it stays exactly as it is.

3. Guest details gain the space
   - On the order screen the guest name, phone and order type start at the left edge and get the reclaimed width: larger name, clearer second line, no truncation on 320-430px wide phones.
   - The action icons and search / more controls keep their positions on the right.

4. Tablet, landscape and desktop
   - These already use the side navigation rail, so no burger existed there; the initials circle behaves the same way (opens the drawer) for consistency.
   - Checked at 320, 393, 430, 768, 1024 and 1440 wide.

## Technical notes

- `src/components/pos/shell.tsx`: `MenuButton` no longer rendered by `ScreenHeader` / `SubHeader`; keep the component export only if still referenced, otherwise remove it. Drawer context stays as is.
- `src/components/pos/account-bar.tsx`: `AccountInfo` avatar calls the nav-drawer `open()` from `useNavDrawer()`; drops the `onSwitchUser` behaviour.
- `src/components/pos/nav-drawer.tsx`: add a "Switch user" row wired to the existing switch-user PIN action.
- `src/components/pos/clock-pulldown.tsx`: stop passing `onSwitchUser` into `AccountInfo`.
- `src/routes/order.new.tsx`, `settings.index.tsx`, `floor.index.tsx`, `src/components/pos/tickets-screen.tsx`: remove the `MenuButton` usage and let `GuestBlock` / titles take the freed space.
- Presentation only; no store or business-logic changes.
