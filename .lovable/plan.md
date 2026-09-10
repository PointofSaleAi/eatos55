# Rebuild the global top bar

## Direction
Use the selected asymmetric Apple-style utility bar across the app:

- Switch the bar from black to the selected System Light palette: white surface, soft gray divider, dark text, restrained status colors.
- Keep the existing Archivo and Hind typography, but reduce the header type scale so labels remain intact at 393px and smaller widths.
- Show the employee identity once as a 44px initials control. Remove the employee name from the top bar.
- Present the role as the main label with clock-in time beneath it, using concise text that never truncates.
- Place the live time and connection state on the right.
- Consolidate notifications, refresh, support, and other secondary actions into one accessible More control on phones. Keep direct actions where space permits on tablet and desktop.
- Integrate the Shift Dashboard handle into the center/lower edge of the bar so it remains visible without covering page content.

## Behavior to preserve
- Tapping the initials opens the existing user switch and PIN flow.
- The dashboard handle continues to open and close the Shift Dashboard.
- Notification, refresh, support, network status, and live clock behavior remain unchanged.
- The More menu closes on outside tap, Escape, and after choosing an action.
- All controls retain accessible names, visible focus states, and at least 44px touch areas.

## Responsive layout
- **Phone portrait:** initials and role status on the left; compact live time, connection state, and More on the right; no employee name and no broken text.
- **Phone landscape and tablet:** reveal selected direct actions as room becomes available while preserving the same hierarchy.
- **Desktop:** retain the full action set without reintroducing duplicated identity or oversized typography.

## Verification
- Check 320px, 393px, 430px, tablet portrait, tablet landscape, and desktop widths.
- Confirm there is no clipping, overlap, horizontal scrolling, or header intrusion into page headings.
- Confirm the PIN flow, Shift Dashboard, notification panel, refresh, support, connection indicator, and live clock still work.
- Check both light and dark appearance, keyboard focus, and 200% text sizing.

## Technical notes
- Refine the existing account information and action sections rather than changing page-specific headers.
- Add semantic light-bar tokens in the global design system and provide dark appearance equivalents.
- Keep all page content, navigation, payment behavior, and business data unchanged.
