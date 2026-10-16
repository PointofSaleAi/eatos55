## One PIN Pad look before and after clock-in (phone)

The PIN Pad from your first screenshot, the sign-in one, becomes the only look. The PIN Pad you open from the header after clocking in will match it:

- **Background:** the same dark grey, replacing the pure black. It stays solid, so the top bar and bottom bar remain hidden.
- **Top block:** the date on the left ("Friday, 16 October 2026"), the large clock below it ("18:33"), and the weather on the right. This replaces the centered date and the "6:33 PM" clock.
- **Spacing:** the same side and top margins around the keypad.
- **Revenue Center:** shows the dropdown arrow and lets you pick a center, the same as the sign-in pad.

The keys, Clock In steps, Clock Out, Break and Log Out keep working as they do now. Tablet and desktop are unchanged.

**Technical details**
- `clock-pulldown.tsx` (phone only): change the overlay to `bg-gate-overlay` on an opaque base, and use the same padding as `access.clock-in.tsx`.
- Replace `PhoneClock` with `<ClockPanel gate compact />` inside the same `grid-rows-[4.5rem_1fr] gap-3` layout.
- Pass `revenueCenterOptions={revenueCenters}` and `onRevenueCenterSelect` (setStation and a toast) to `PinPad`.
- Remove the unused `PhoneClock`.
- Compare side by side at 393x742 against `/access/clock-in`.
