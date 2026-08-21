# Order type strip with drill-down guest form

The order panel currently shows only three service types (Dine-In, Takeout, Delivery) with a fallback dropdown, and the guest form always shows the same fields (plus vehicle info for Drive Thru). The screenshots show a wider, swipeable order type strip and a Guest Information panel whose fields change per type.

## Order type strip (top of order panel)

Full set, in this order, as an equally sized pill row that scrolls horizontally with a chevron affordance on the left/right edge:

Dine-In, Takeout, Delivery, Drive Thru, Banquet, Scheduled, Phone-In, Custom, Online

- Each pill: icon + uppercase label, selected pill gets the dark outlined/raised treatment from the screenshots, others are muted.
- Tapping a pill sets the order type and immediately opens the Guest Information panel for that type (no separate dropdown any more).
- Removes the existing `<select>` fallback.

## Guest Information panel, per type

Shared fields: Guest Name - Table Number - Order Name (with search icon), email, phone with +1 flag prefix, Notes with 0/500 counter, Clear and Save actions. The order type strip stays pinned at the top of the panel so the type can be switched in place, and a round close button sits on the "Guest Information" title row.

Required-field markers and extra blocks by type:

| Type | Required | Extra fields |
| --- | --- | --- |
| Dine-In | name | party size |
| Takeout | name | - |
| Delivery | name, phone, address | Address with "use my location" button |
| Drive Thru | name | Vehicle Information card (type, color, brand, plate) with green completion tick |
| Banquet | name | Address, Event Type, Event Date, Event Time, Number of Guests |
| Scheduled | name | Scheduled date and time |
| Phone-In | name, phone | - |
| Custom | name | custom order label |
| Online | name | read-only source note |

Save is blocked with an inline hint until the required fields for the active type are filled.

## Responsive behaviour

- Phone portrait: panel is the existing bottom sheet, fields stack full width, strip scrolls.
- Tablet/desktop landscape: panel opens as a right-side overlay sized to the order column, two-column field grid where space allows so the taller Banquet and Drive Thru forms do not need scrolling.
- All controls keep the 44px minimum tap target and fluid `clamp()` type scale already in use.

## Technical notes

- `src/lib/demo-data.ts`: extend `serviceOrderTypes` with Drive Thru already present plus Banquet, Scheduled, Phone-In, Custom; add `eventTypes` list and a per-type field requirement map.
- `src/lib/pos-store.tsx`: extend the guest record with `address`, `event` (type/date/time/guests) and `scheduledAt`; keep persistence per PIN session.
- `src/components/pos/order-panel.tsx`: replace the 3-button grid and select with the scrollable strip; tapping opens `GuestSheet`.
- `src/components/pos/guest-sheet.tsx`: pinned type strip, conditional field blocks, validation, adaptive wide layout.
- Ticket creation continues to carry `orderType`, so the tickets board and payment screens pick up the new types with no further change beyond icon labels.
