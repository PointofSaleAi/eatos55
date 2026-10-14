# orderOS: remove the card-level CTAs added last turn

The previous change added buttons directly on the compact order cards in orderOS
(Accept/Cancel row on New Order cards, and a per-step action button on
Preparing/Ready/Out for Delivery cards). The CTAs already exist in their proper
places — tapping a New Order card expands it with Accept/Cancel/Report, and
tapping any other card opens the detail view with the step's action button.
This plan reverts only the card-level additions; the order lifecycle itself
(accept → Preparing → Ready → Out for Delivery → Completed) stays exactly as is.

## Changes

### 1. `src/components/pos/orderos/orderos-board.tsx`

- **OrderCard**: delete the two CTA blocks at the bottom of the card —
  - the `o.status === "new"` Accept/Cancel grid (`grid grid-cols-2 …` block)
  - the `onAdvance && ["preparing","ready","delivery"]` action button block
- Remove the now-unused props `onAccept`, `onAdvance`, `onCancel` from
  `OrderCard`'s signature and from both call sites (board column and the left
  detail sidebar). Cards return to tappable-only:
  tap New Order card → expands in place (existing Accept/Cancel/Report CTAs),
  tap any other card → opens the split detail view (existing action button).
- Keep everything else untouched: status colors, wait timers, source labels,
  expanded card, detail view, Cancel dialog, scheduled/cancelled lists.

### 2. No store changes

`src/lib/orderos-store.tsx` stays as-is — accept/advance/cancel/activate and
the Dine In shortcut (Preparing → Completed) are already correct.

## Verification

- Typecheck and build pass.
- Playwright check: compact cards show no extra buttons; tapping a New Order
  card expands with Accept; tapping a Preparing card opens the detail view with
  "Make Order Ready"; stepping still moves the order column to column.
- Works at phone (390×844), tablet (1024×768) and desktop (1440×900) widths.
