# Restore the full order panel on the ordering screen

The right-hand order area currently shows only the item list and totals. The original design puts the guest identity and every order-level control there. This restores those data points without changing the visual language we already use.

## What the right panel will show (top to bottom)

1. Guest header
   - Guest name (large, bold) with fallback "Guest Name"
   - Phone number, fallback "(XXX) XXX-XXXX"
   - "ARRIVED AT h:mm AM" line
   - Tapping this block opens the existing guest details sheet
2. Order-level action icons, right-aligned next to the guest block
   - Discount (%), Tax exempt / no-tax, Comp (C), Void / no-charge ($ struck)
   - Each is a round icon button with tooltip + aria-label; they open the sheets/flows we already have (discount sheet, tax-exempt toggle, comp needs manager PIN, void order confirm)
3. Service type segmented control: DINE-IN / TAKEOUT / DELIVERY with icons, replacing the small dropdown in the footer, and driving the same order type state (other service types stay reachable from the guest sheet)
4. Meta row: "ORDER# --" on the left, server name (from the session) on the right
5. Order Notes field with a note icon, saved on the order
6. Item list, or the empty state: burger-and-drink illustration plus "Let's create an order"
7. Footer stays as today: quick action icons, totals (Sub Total / Tax / Discount / Total) and SAVE / FIRE / CHARGE

## Layout across sizes

- Desktop and tablet landscape: panel on the right as in the screenshots; the guest block is removed from the top header since it now lives in the panel.
- Tablet portrait and phone: the same panel content appears in the ORDER tab, stacked in the same order. The header keeps its compact guest block on phone only so the identity is visible while browsing the menu.
- No new scrolling: guest header, service segments, meta and notes are fixed; only the item list scrolls.

## Technical notes

- New component `src/components/pos/order-panel.tsx` holding the panel content, used by `src/routes/order.new.tsx` in both the wide sidebar and the phone ORDER tab.
- Extend the order state in `src/lib/pos-store.tsx` with `orderNotes`, `arrivedAt`, `taxExempt` and `comped` flags plus setters; totals honour `taxExempt` (tax 0) and `comped` (total 0). Order number shows `--` until the order is saved or fired.
- Reuse existing `GuestSheet`, `DiscountSheet`, `PinSheet` and confirm sheet; no new dialogs.
- Service type segmented control built with the existing pill/segment styling and design tokens only.
