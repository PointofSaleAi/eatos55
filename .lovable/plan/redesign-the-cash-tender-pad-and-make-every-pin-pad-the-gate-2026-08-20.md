# Redesign the cash tender pad, and make every PIN pad the gate design

## 1. Cash payment redesign

The cash entry today is a plain amount readout with a row of small denomination pills and no clear record of which notes were handed over. The counting information is crammed into sentence text and the numeric pad is squeezed. Rebuild it as a two-part cash drawer panel:

- **Top: money summary block**
  - Amount tendered as the large figure, with `Due` underneath it.
  - `Change due` shown as a single prominent line that turns into `Remaining` (in red) when the tendered amount is still short of the balance.
  - `Quick tender` chips: Exact amount and Half, sized as real tap targets.

- **Middle: note counter**
  - One card per denomination ($1, $5, $10, $20, $50, $100) laid out in a grid.
  - Tap a note to add one; a counter badge on the card shows how many of that note are counted, with a minus control to remove one.
  - The counted notes total feeds the tendered amount, so the running list replaces the old "Notes tendered: 1 x $50, ..." sentence.
  - A `Clear notes` control resets the count.
  - Notes that are already counted are visually raised; uncounted ones stay quiet, so the cashier can read the drawer at a glance.

- **Bottom: keypad and charge bar**
  - Manual keypad keeps its 3x4 layout with `00` and a red `C`, filling the remaining height so keys stay large.
  - Typing manually overrides the note count; adding notes updates the typed figure.
  - One full-width dark charge bar showing the amount being charged, disabled at zero.

- Same component is used everywhere cash is taken (payment method screen dialog, and any other cash tender entry) so there is only one cash design.

- **Responsive:** desktop/tablet landscape puts the summary and note grid in the left column and the keypad in the right column; phone portrait stacks summary, note grid (3 per row), keypad, charge bar with no scrolling.

## 2. PIN pad consistency

The pull-down PIN pad currently renders a different, looser variant than the full-screen clock-in gate: wide stretched keys, digits starting at 1 rather than 7, a translucent backdrop, and the star display pushed out of view. Make the post-login gate design the single PIN design:

- The pull-down pad uses the same gate treatment as the clock-in screen: joined rectangular keys, `7 8 9 / 4 5 6 / 1 2 3 / C 0 ENTER`, the four-star display bar on top, red `Clock Out`, white `Break`, green `Clock In`, fingerprint + revenue center + Face ID row, and the outlined `LOG OUT` bar.
- Solid opaque backdrop instead of the see-through one, so nothing behind is readable while the PIN is required.
- The pad is sized to fit the available height with no scrolling; the date/time/weather panel appears beside it on wide viewports and is dropped on short/narrow ones.
- The manager PIN sheet and any other PIN entry adopt the same key geometry and ordering, scaled down to sheet size, so no screen shows a second PIN style.
- Behaviour is unchanged: four digits required before Enter, Clock In, Clock Out or Break; biometrics stay shortcuts; Log Out signs out.

## Technical notes

- `src/components/pos/amount-entry.tsx`: rewrite the body as summary + note-counter grid + `NumPad` + charge bar, tracking a `Record<denomination, count>` alongside the typed amount; keep the existing `open` / `due` / `onCommit` contract so `payment.method.tsx` needs no logic changes.
- `src/components/pos/tender-screen.tsx` and `src/routes/payment.cash.tsx` reuse the same panel so cash looks identical wherever it is reached.
- `src/components/pos/clock-pulldown.tsx`: render `PinPad` with `gate`, opaque `bg-shell`, remove the internal scroll container.
- `src/components/pos/pin-sheet.tsx`: switch to the gate key styling and digit order.
- No store, routing, or business-logic changes.
