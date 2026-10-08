# Revenue Center Picker Inside the PIN Pad

## Goal
The revenue center key on the PIN pad gets a small dropdown arrow, and tapping it opens the revenue center picker **inside the PIN pad area itself** (like the reference screenshots), not as a bottom-sheet modal.

## Changes

### 1. Dropdown indicator on the key (`src/components/pos/pin-pad.tsx`)
- Add a small chevron-down icon next to the revenue center name on the middle key, so it reads as a tappable dropdown.
- When the picker is open, the chevron flips up (or the key shows a highlighted state) to indicate it can be tapped again to close.

### 2. Inline picker inside the PIN pad (`src/components/pos/pin-pad.tsx`)
- Add optional props: `revenueCenterOptions?: string[]`, `onRevenueCenterSelect?: (center: string) => void`, and internal open/close state.
- When the key is tapped, the digit grid area swaps to a "SELECT REVENUE CENTER" view: a title row (with a back/close affordance) and a grid of revenue center tiles, styled with the same gate key look (light gradient keys, same borders and typography) so it feels native to the pad.
- Tapping a center selects it and returns to the normal PIN pad; tapping the key again or the back affordance closes without changing.
- The masked PIN display, clock row, biometric row, and Log Out bar stay visible; only the 3x4 digit grid area swaps.

### 3. Remove the bottom-sheet modal (`src/routes/access.clock-in.tsx`)
- Delete the `Sheet`/`SheetContent` picker and the `centerPickerOpen` state.
- Pass `revenueCenterOptions={revenueCenters}` and `onRevenueCenterSelect={(c) => { setStation(c); toast.success(...) }}` to `PinPad` instead.

## Technical details
- No new dependencies; the swap is a conditional render inside the existing `grid-rows-4` digit area.
- `revenueCenters` still comes from `src/lib/demo-data.ts`; selection still persists via `setStation` in `pos-store`.
- Since `PinPad` is shared, the inline picker appears wherever a revenue center is shown (clock-in gate); other PIN prompts without a revenue center are unaffected.

## Verification
- Playwright on phone (390x844), tablet (1024x768), and desktop (1440x1000) at `/access/clock-in`: chevron visible, picker opens inline, selection updates the key label, close works, PIN entry still works after closing.
- Confirm build is green.
