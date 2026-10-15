# Tickets header and filter — match the recording

## What changes

**Header row (all screen sizes)**
- "Tickets" title on the left; on the right only three round icons: Filter (sliders), Messages, Search.
- The date stepper row and the always-visible row of square filter boxes underneath are removed, so the list starts higher.

**Filter tray**
- Tapping Filter expands an inline row of round icons to the left of the Messages/Search icons, in the same header line, ending with an X that collapses it again:
  `$` Payment · Calendar (date / period) · People (Employee) · Clipboard (Order Type) · Coin (Revenue Center) · Wallet (Sort) · X
- Each icon opens a small dropdown under it, like "Order Type" in the recording: a muted section title, then a plain list of options with their icon; tapping toggles the option (checked state in grey, never pink). Calendar opens the existing period picker.
- An icon with active selections shows a small count dot so filters stay visible after the tray collapses; the Filter icon shows the total count.
- On phones the tray scrolls sideways if it doesn't fit; the title stays visible.

**Status chips**
- Replace the long tab row with four pill chips: All, Open, Paid, Unpaid, each with a count badge (selected chip is white with dark text, others dark grey), as in the recording.

**Unchanged**
- Search keeps its current dock and scopes; table/room filter chip, ticket cards, swipe-to-void, right-side cart and all filtering logic stay as they are.

## Technical details
- Edit only `src/components/pos/tickets-screen.tsx`: new `filtersOpen` state; reuse `filterFacets`, `filters/setFilters`, `sortOptions`, range dialog; Popover lists with `align="start"`.
- Tabs reduced to `all | open | paid(=closed) | unpaid`; counts computed from `tableList`.
- Messages icon reuses the existing header messages action if present, otherwise a demo notice.
- Verify at 390×844, 834×1112, 1141×742, 1440×900 with Playwright.
