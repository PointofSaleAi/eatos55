# Give the order list the space on the phone screen

On a portrait phone the order area spends most of the screen on things around the order: the guest name is printed twice, five action icons wrap onto two rows, the service-type buttons are tall, the notes field takes a full row even when empty, and the Menu/Order switch is oversized. The item list, which is the hero, gets a thin band in the middle.

## Target layout (phone portrait)

1. Top bar keeps the single guest block (name, phone, order type) that is already there. The duplicate guest block inside the order area is removed. Tapping the top guest block still opens guest details.
2. The five order action icons (discount, transfer, tax exempt, comp, no charge) move into the top bar, right of the guest block, one slim row of small circular buttons, beside the existing search and more icons. They never wrap and never push the guest text off screen.
3. The Menu/Order switch shrinks: shorter height and tighter text so it reads as a switch, not a pair of hero buttons.
4. Inside the order area, top to bottom:
   - Service type: shorter buttons on one scrolling row, with the table and arrival chip merged into the same row instead of its own strip.
   - One shared row for `ORDER# --`, the server name, and a small notes button. The notes input expands only when tapped; no permanent full-width notes field.
5. The item list becomes the tallest region and the only scrolling area. Totals and Save / Fire / Charge stay pinned at the bottom, same behaviour, slightly tighter padding.

Once the order has lines, nothing in the top bar changes; the list simply gets the reclaimed height.

## Tablet and desktop

The side panel keeps its current composition, but gains the same deduplication: icons stay in one row, notes collapse into the order-number row. Nothing shifts structurally on wider screens. Verified at 393, 430, 768, 1024 and 1440 wide.

## Technical notes

- Presentation only, no store or logic changes.
- `src/components/pos/order-panel.tsx`: accept an optional `actions` slot or expose the icon cluster so the phone header can render it; remove the in-panel guest block on phone; fold table/arrival into the service row; collapse notes into the order-number row.
- `src/components/pos/order-type-strip.tsx`: shorter control height on phone via existing size tokens.
- `src/routes/order.new.tsx`: keep `GuestBlock` visible on both tabs, render the action icon cluster in the header row on phone, reduce the Menu/Order switch height.
- Verification: Playwright screenshots of `/order/new` empty and with lines at the widths above, confirming one guest name, one icon row, and a taller item list.
