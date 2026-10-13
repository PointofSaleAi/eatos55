# Move Dashboard and Settings navigation

## Changes
1. **Dashboard in the left navigation**
   - Add a dedicated Dashboard page and a Dashboard icon in the left navigation.
   - Move the current header-chevron dashboard content there: Maya AI, suggested actions, shift figures, checks and floor overview.
   - Keep the current information, interactions and manager-controlled visibility of shift totals.
   - Remove the settings column from the Dashboard page.

2. **Full Settings menu under the header chevron**
   - The down chevron opens the full Settings menu instead of the dashboard, as selected.
   - Show the existing settings categories, including General, Login Screen, Control Center, Menu, Payments, Workforce, Reports, Network, Hardware and Notifications, plus the existing help and account actions.
   - Choosing a category closes the menu and opens its existing page. Keep all existing confirmations and permission checks.
   - Keep the separate switch-user/PIN panel unchanged.

3. **Clean up the left navigation**
   - Remove the Settings icon and label.
   - Remove Shift Assistant; Maya AI remains available from Dashboard.
   - Preserve the circular eatOS emblem and version information.
   - Add Dashboard to the phone navigation drawer so the moved screen remains reachable on phones. Existing phone Settings shortcuts remain unchanged.

## Layout and verification
- Keep the app's current theme and styling across phone, portrait tablet, landscape tablet and desktop.
- Check Dashboard navigation, header Settings opening and closing, category navigation, Maya AI and manager-controlled figures.
- Confirm the removed rail entries no longer appear and that switching users, PIN entry and order/cart state still behave as before.
- Verify there are no new errors or overlapping controls.

## Technical details
- Create a dedicated `/dashboard` content route with app-specific page metadata and use the shared app shell.
- Separate dashboard content from settings navigation; reuse the existing settings destinations rather than maintaining a second divergent list.
- Update `nav-destinations.ts`, `nav-rail.tsx`, `settings-pulldown.tsx` and the dashboard component; adjust header event wiring only where required by the removed Shift Assistant entry.
- Retain existing settings URLs and navigation permissions. No payment, employee or order business logic changes.