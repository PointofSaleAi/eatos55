# Redesign the Select Room dialog

Rebuild the room charge picker using the approved "Structured detail grid" direction, with meal and alcohol data in their own labelled sections. Presentation only: same rooms data, same charge behaviour.

## New layout (tablet and desktop dialog)

1. Header: "Select Room" title, floor filter as a pill segmented control (All floors, then each floor), close button.
2. Search field full width under the header.
3. Room strip: equal room cards on a tinted band. Each card shows the room number in a badge, the room type, the guest name, and remaining credit. Rooms with no booking or not enough credit read as unavailable (dashed border, muted, "No booking" / "Low credit").
4. Detail area, two columns:
   - Left: booking number, stay dates with nights, occupancy with max adults/children, room and bed type in a boxed 2-up fact grid; then an "Allowances" section with three tiles (Daily food, Alcohol allowed/not allowed, Meals included); then a separate "Meal entitlements" section with meal chips and the entitlement note.
   - Right: credit panel on an inverted surface: available credit large, limit, a credit progress bar with used amount and percent, then transaction total and Due today, plus a warning line when credit is short.
5. Footer: primary action "Post charge to room <number>" with the amount due in an inline chip; disabled until a chargeable room is picked.

## Across sizes

- Phone: same order stacked in the bottom sheet, floor pills scroll horizontally, the fact grid and allowance tiles stay 2-up / 3-up but on fluid tokens, footer button stays pinned.
- Tablet portrait: single column detail, credit panel below the facts.
- Tablet landscape and desktop: 7/5 two-column detail grid inside the 56rem dialog.
- Only the detail region scrolls; header, room strip band and footer stay fixed. Tap targets stay at least 44px.

## Technical notes

- Only `src/components/pos/room-charge-dialog.tsx` changes. No data model, store, routing or charge-logic changes; `creditLeft`, `canCharge` and `onCharge` keep current behaviour.
- Colours come from existing tokens only (`primary`, `success`, `destructive`, `muted`, `border`, `surface`, and `bg-foreground`/`text-background` for the inverted credit panel), so light and dark both work.
- Sizing uses the existing fluid tokens (`text-fs-*`, `min-h-ctl-*`, `rounded-card`, `rounded-pill`), including `text-fs-money` for the large credit figure.
- The floor dropdown is replaced by pills, so the dropdown-menu import is dropped.
- Verify with Playwright at desktop 1440, tablet 1024 and 834, and phone 393: single close button, no dialog-level scroll, nothing clipped.
