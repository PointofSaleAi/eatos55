# Show Dashboard content inside Menu

## Requested change
Replace the existing content opened by the left-navigation four-square **Menu** icon with the Dashboard content, using the app’s current theme.

## Changes
- Keep the four-square Menu icon and its current destination.
- Replace the Barcode / Open Price Items picker with a full-page view containing the existing Dashboard sections: Maya AI, Shift figures, checks and live floor.
- Preserve the Dashboard interactions, shared data and manager-controlled visibility of shift totals.
- Keep the separate Dashboard destination and header Settings menu unchanged; this request only replaces Menu’s content.
- Make the page work on phones, tablets and desktop without clipping or overlapping navigation.

## Technical details
- The Menu icon currently opens `/order/menu`, whose content is a bottom-sheet picker in `src/routes/order.menu.tsx`.
- Reuse `ShiftDashboard`, already rendered by `src/routes/dashboard.index.tsx`, inside the standard screen header/body instead of duplicating its data or logic.
- Update Menu’s page metadata to describe its new content and record the revised screen responsibility in project guidance.
- Add the task to the roadmap during implementation.

## Verification
- Sign in, enter a PIN and open the four-square Menu icon; confirm Dashboard content replaces the old picker.
- Check ticket filters, ticket navigation, floor selection and Maya AI opening/dismissal.
- Verify the separate Dashboard page and header Settings still work.
- Check phone, tablet and desktop layouts and confirm no new page errors.