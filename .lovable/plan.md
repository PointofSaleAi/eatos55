# Match the header and left navigation to the reference screenshot

Applies to every screen, on phone, tablet and desktop. Only styling changes; every button keeps its current behavior.

## Header (top bar)
- Solid black bar.
- Left side: a switch icon, a round initials badge, the name, the role label ("STAFF") and a divider, followed by a rounded dark pill that shows the current service and time, for example "Dinner Service (9:00 PM)".
- Right side, in order: device status pill with its dropdown, Maya AI icon, cash drawer with a status dot, refresh, support, notifications, Wi-Fi and the clock.
- On phones, the right-side icons collapse into the existing More control, so text never wraps or gets cut off.

## Left navigation rail
- A narrow dark rail with rounded corners that floats beside the content.
- Top to bottom: six-dot grip, lock, round venue logo, then icon-only destinations (floor, new order, tickets, payments, refresh or sync), then settings.
- The black-and-white eatOS mark sits at the bottom with a small version line.
- The active destination gets a softly outlined rounded box, as in the screenshot.
- Tablet and desktop: the rail is always visible. Phone: it stays closed until the initials badge is tapped, so the current behavior is kept.

## Not changing
- The order area, menu tiles and right-hand order panel.
- What each nav item does, including the PIN protection.

## Technical details
- Restyle `account-bar.tsx` (header) and `nav-rail.tsx` / `nav-drawer.tsx` (rail). The rail is mounted from `shell.tsx`.
- Use the existing semantic color tokens. Add a dark rail surface token to `src/styles.css` if one is needed.
- If you send the published URL, its exact spacing and icons override the screenshot.
- Check the result in a browser at 390, 768, 1141 and 1440 px wide.
