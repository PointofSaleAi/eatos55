# Revenue center picker as a popover over the PIN pad

## Problem
Tapping the "Revenue Center" key on the clock-in PIN pad currently swaps the number grid for an inline picker panel, so the keypad disappears and the layout shifts. The reference shows the picker as a floating white panel layered on top of the keypad, with the keys untouched behind it.

## Change (one file: `src/components/pos/pin-pad.tsx`)

1. **Keep the keypad always rendered.** Remove the `centerPickerOpen ? picker : grid` swap and the `centerPickerRow` grid-row logic, so the digit grid, clock row and biometric row never move or resize.

2. **Render the picker as a popover overlay.** Make the PIN pad container `relative` and render the revenue center panel absolutely positioned over the keypad area (anchored just above the revenue center key, covering roughly the lower keypad rows like the reference's floating white box), with rounded corners, border and shadow so it reads as a floating layer.

3. **Same content, compact size.** Keep the "Select Revenue Center" header with Back, and the 3-column tile grid of centers with the active one outlined, sized to fit inside the popover without covering the PIN mask row.

4. **Dismissal.** Selecting a center closes the popover and updates the key label (existing behavior); Back closes it; tapping the dimmed area outside the popover also closes it. The dropdown chevron on the revenue center key keeps its open/closed rotation.

5. **Verify** on phone (390x844), tablet (1023x742) and desktop (1440x1000): keypad visible and unchanged behind the popover, selection applies, no layout shift, build green.

## Technical notes
- No changes to `src/routes/access.clock-in.tsx` — props (`revenueCenter`, `revenueCenterOptions`, `onRevenueCenterSelect`) stay as they are.
- Popover uses the existing gate surface/separator tokens; no new colors.
- Since the picker no longer replaces the grid, the `rows` computation simplifies back to a fixed list.
