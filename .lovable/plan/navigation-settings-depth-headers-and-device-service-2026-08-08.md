# Navigation, settings depth, headers and Device Service

Presentation + light routing work, verified at mobile, tablet and desktop.

## 1. Bottom navigation everywhere it belongs

Today the tab bar is only on Home, Tickets, Board, Orders, Rooms, Settings hub and clock-in. Every sub screen (all Settings detail pages, system pages, order review, payment screens) has no tab bar, so you dead-end and must use back.

- Add the tab bar to every screen that is a destination, including all Settings/System detail pages and the order/payment screens.
- Exception kept deliberately: `/order/new` and `/order/custom-item` keep their own action footer (Custom Item / Menu / Server Connected + Review order) as the only bottom bar, because you flagged the double navigation there earlier. Say the word and I'll add tabs there too.
- Tab bar stays hidden while the on-screen keyboard is open (unchanged).

## 2. Settings rows that actually open something

In General (and the other Settings screens) most rows only fire a toast. Each row gets a real destination:

- Restaurant Information — read-only detail screen (name, address, phone, tax id).
- Restaurant Settings — grouped rows for service, receipts and rounding.
- Language — pick list (English selected).
- Currency — pick list (USD selected).
- Tax Alias — pick list (Tax / VAT / GST) instead of the current tap-to-cycle.
- Schedule Info — shift schedule detail.
- Timed Pricing — list with the "no rules on this device" empty state.
- About — device/app info screen (version 5.200.27).

Same sweep on Control Center, Menu, Payments, Workforce, Network, Hardware, Notifications and Customer Support: every row navigates to a screen with the matching content; nothing is a toast-only tap.

## 3. Header cleanup (every screen)

- Drop the "BACK" / eyebrow label above the title; the chevron alone remains.
- The chevron keeps an accessible label and shows a tooltip/alt text on hover and long-press, so it still reads as "Back".
- Titles keep their current size and position, just moved up into the freed space.

## 4. Device Service is either/or

Replace the on/off switch with a two-option control: **Table Service** / **Quick Service**. Exactly one is selected, styled as a segmented control matching the existing chips, and the choice persists across navigation.

## Technical notes

- `SubHeader`/`ScreenHeader` in `src/components/pos/shell.tsx`: remove the eyebrow line, add `title` attribute + `aria-label` on the back button.
- New routes under `src/routes/settings.*` and reuse of existing `system.*` screens; each new route gets its own `head()` metadata and renders `<BottomTabs />`.
- `settings-rows.tsx`: add a `SegmentRow` (either/or) primitive; `IconNavRow` gets `to` targets in place of `toast.info` handlers.
- Store: `deviceService` becomes `"Table Service" | "Quick Service"`; `tableService` boolean is dropped.
- Verification: Playwright at 393px, 834px and 1280px — tap every Settings row and confirm no dead ends and no page scroll.
