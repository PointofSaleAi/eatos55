# orderOS order colors from the recording

## What you'll see

Order cards on the orderOS board get the recording's colors, while the rest of the app keeps its black-and-white look:

- **Card header** (order type + source): dark near-black band on every card, as in the recording.
- **Status strip** at the bottom of each card, colored by column:
  - New Order — red
  - Preparing — red (with the countdown)
  - Ready — purple
  - Out for Delivery — amber/yellow
  - Completed — pink
  - Cancelled — red (REFUNDED stays red)
- **Source label** on each card in its brand color: Grubhub orange, Uber Eats green, DoorDash red, eatOS neutral.
- **Wait timer on New Order cards** shifts with waiting time as in the recording: red when just arrived, then blue, then green the longer it waits (replacing the current green → amber → red).
- The same colors apply everywhere the cards appear: the board columns, the split detail list, the phone single-column view, and the Scheduled / Cancelled lists.

Nothing else changes: column layout, card content, buttons, taps and the detail flow all work exactly as they do now. This is limited to orderOS — Tickets, New Order, Settings and the rest of the app stay black and white.

## Technical details

- Add orderOS-specific semantic tokens in `src/styles.css` (e.g. `--oo-new`, `--oo-preparing`, `--oo-ready`, `--oo-delivery`, `--oo-completed`, plus source colors), with dark-mode-safe foregrounds, following the existing token pattern — no hardcoded hex in components.
- In `src/components/pos/orderos/orderos-board.tsx`:
  - Map `OOStatus` to the strip token and apply it to the card's bottom status strip (currently `bg-muted`).
  - Give the card header band the dark token (currently `bg-primary`).
  - Color the source text per `OOSource`.
  - Replace `waitTone()` thresholds with the recording's red → blue → green progression.
- Dine-in channel cards use the same mapping (PAID / UNPAID / REFUNDED line keeps its current meaning; REFUNDED stays red).

## Verification

Render `/board` at 1141x742, 768x1024 and 390x844: each column's cards show the correct strip color, source labels are colored, new-order timers show red/blue/green by age, and accepting / advancing an order updates its color as it moves columns.
