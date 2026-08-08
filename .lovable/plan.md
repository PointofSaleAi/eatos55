# Fix navigation gaps, duplicate Custom Item, and the empty payment screen

## 1. Every screen can go back
Right now a few screens rely on the bottom tabs alone, and some (order, custom item, payment) hide the tabs entirely, so there is no way out except the browser back gesture.

- Add a consistent back affordance (chevron, with tooltip/alt text) to the header of every screen that is not a top-level tab: order, custom item, review, all payment screens, all settings detail screens, tickets sub-screens, system screens, and access screens after sign-in.
- Back always resolves to a real parent (e.g. payment -> review, review -> order, settings detail -> its section, ticket detail -> tickets list), never a dead end. When there is no history entry, fall back to that parent route rather than doing nothing.
- Keep the chevron in the same top-left position and size on mobile, tablet and desktop.

## 2. Restore the real bottom navigation
- Bring the global bottom tabs back on the order, custom item and payment screens so Home / Tickets / Order / Board / Settings stay reachable everywhere.
- The screen's own action footer (Review order, Charge, Save) sits above the tabs instead of replacing them, so nothing is hidden and neither bar scrolls away.
- Remove the improvised 3-up bar on the New Order screen (Custom Item / Menu / Server Connected) which was standing in for navigation. The "Server Connected" status moves into the header as a small indicator.

## 3. Custom Item appears once
- Keep the single "Custom Item" pill in the New Order header.
- The duplicate Custom Item button in the bottom bar goes away with that bar.

## 4. No empty payment screen
- If the payment method screen is opened with nothing to settle (no cart, zero balance), it redirects back to the order/review screen with a short message instead of showing a blank page behind the tender sheet.
- The tender selection renders on the full-screen payment layout with the order summary above it, so it is never a sheet floating over an empty dark background.

## Technical notes
- `src/components/pos/shell.tsx`: drop `hideTabs` for `/order/*` and `/payment/*`; layer the page action footer above `BottomTabs` using the existing keyboard-inset padding vars. Add a shared `BackButton` used by `ScreenHeader`/`SubHeader` with an explicit `fallbackTo` prop.
- `src/routes/order.new.tsx`: remove the bottom 3-up bar and its Custom Item entry; move the connection indicator into the header row.
- `src/routes/payment.method.tsx`: guard on empty cart / zero due with a redirect + toast; keep the summary + tender grid in the page body.
- Audit each route under `src/routes/` for a back affordance and correct `fallbackTo`.
- Verify at 320, 393, 430 (portrait), 834 (tablet) and 1280 (desktop) that both bars are visible without page scroll.
