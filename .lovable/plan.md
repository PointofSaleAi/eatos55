# Order type on phones, plus a setting for where it appears

## What is wrong today

The order type row (Dine-In, Takeout, Delivery, Banquet and the rest) only reads well in the wide tablet and desktop pane. On a phone the same panel is squeezed into the Order tab, so the row and the table/arrival information are easy to miss, and the uploaded phone screen shows them as first-class rows.

## The Apple answer

Apple keeps one control, in one predictable place, and lets the venue decide only if it is needed at all. So: the same order type row on every size, placed directly under the guest block, always in the same spot; the venue chooses the placement once in Settings rather than the row moving around by itself.

## 1. Phone order screen

- The order type row becomes a proper full-width row on phone: horizontally scrollable, uppercase labels with icons, selected type outlined, same styling as tablet so nothing new is invented.
- Directly below it, the table and arrival row from the uploaded screen: table number with the table icon on the left, a dark pill with the walk-in icon and arrival time on the right. Shown for Dine-In when a table is attached.
- Tapping a type selects it and, as today, opens the guest details sheet for the types that need contact information.
- Split Check stays where it is on the payment screen. No Split Check row is added here.

## 2. Order type placement setting

Restaurant Settings gains one manager-only choice, Order Type:

- Order screen (default) - the row sits under the guest block, phone, tablet and desktop.
- Charge screen - the row is hidden on the order screen and appears as a compact row on the payment summary above Fire and Charge, so the type is picked just before payment.
- Both - row in both places, the charge screen one acting as a late correction.
- Off - venues that only do one service type hide the row entirely; the order keeps its default type.

The setting is persisted with the other app settings and read by both screens.

## 3. Sizes

Phone portrait, tablet portrait, tablet landscape and desktop all use the same row, only the density differs. Verified at 390x844, 768x1024, 1024x768 and 1440x950.

## Technical notes

- `src/lib/pos-store.tsx`: add `orderTypePlacement: "order" | "charge" | "both" | "off"` to `AppSettings`, default `"order"`, merged on load for existing saved settings.
- `src/lib/settings-details.ts`: add a `choice` row under `restaurant-settings`.
- `src/components/pos/order-panel.tsx`: gate the service strip on the setting; add the table + arrival row under it, using existing `activeTable`, `tableGroupLabel` and `arrivedAt` state and existing tokens.
- `src/routes/payment.method.tsx` (and the phone bill step): render the same strip when the setting is `charge` or `both`, reusing the strip markup extracted into a small shared component so both places stay identical.
- No changes to cart logic, totals, tender flow or routing.
