# Give the order list the space on the phone screen

On a portrait phone the order area currently spends almost 60% of the screen on things around the order: the guest name is printed twice, the action icons wrap onto two rows, the service-type buttons are tall, and the notes field takes a full row even when empty. The item list is left with a thin band in the middle.

## Target proportions (phone portrait)

Above the list, one compact block instead of five stacked ones:

1. Guest line: name, phone and arrival on two tight lines, left. The duplicate guest name in the screen header disappears while the Order tab is showing, since the panel already states it.
2. Action icons: one single row of five smaller circular buttons, aligned to the guest line, no wrapping.
3. Service type: shorter buttons on one scrolling row, tighter than today, with the table/arrival chip merged into the same row instead of its own strip.
4. Order number, server and notes share one row: `ORDER# 43` left, server right, and a small notes button that expands into the input only when tapped. No permanent full-width notes field.
5. MENU / ORDER switch loses height so it reads as a switch, not a pair of hero buttons.

The item list becomes the tallest region on the screen and is the only scrolling area. Totals and Save / Fire / Charge stay pinned at the bottom, unchanged in behaviour, slightly tighter in padding.

Once the order has lines, the guest block collapses further to a single line so lines take the reclaimed height.

## Tablet and desktop

The side panel keeps its current composition; only the same padding trim and the single-row icon cluster apply, so nothing shifts on wider screens. Verified at 393, 430, 768, 1024 and 1440 wide.

## Technical notes

- Presentation only, no store or logic changes.
- `src/components/pos/order-panel.tsx`: header regrouped, icon grid becomes `grid-cols-5` with `size-8`, table/arrival chip folded into the service row, notes collapsed into the order-number row, padding reduced.
- `src/components/pos/order-type-strip.tsx`: shorter control height on phone via existing size tokens.
- `src/routes/order.new.tsx`: hide the duplicated `GuestBlock` when the Order tab is active, reduce the MENU/ORDER switch height.
- Verification: Playwright screenshots of `/order/new` empty and with lines at the widths above.
