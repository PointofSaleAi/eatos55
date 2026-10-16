## Phone PIN Pad: full screen, no header or bottom bar

**What changes (phone only; tablet and desktop stay as they are)**
1. When the PIN Pad opens on a phone, it covers the whole screen. The top bar and the bottom bar are hidden until it closes.
2. Following your screenshot, the order from top to bottom is: today's date, a large live clock, the "Enter PIN" prompt with the four PIN dots, the keypad, Clock Out / Break / Clock In, fingerprint / revenue center / face, and Logout. It keeps our existing keypad look.
3. Ways to leave it stay the same: enter a PIN and press Enter or a clock action, tap Logout, or use the phone's back gesture or the Escape key, which closes it without doing anything.

**Technical details**
- `clock-pulldown.tsx`: on phone (below `sm`), render the overlay as `fixed inset-0 z-[60]` with safe-area padding so it sits above the header (z-40) and BottomTabs (z-30). Add a compact date + `useLiveTime` clock block above `PinPad`. Hook up `useBackDismiss(open, close)` and Escape to close it.
- Tablet and desktop keep the current `absolute` overlay below the header.
- Check at 393x742 that the header and tabs are hidden and everything fits without scrolling. Also check 768x1024 and 1280x900 for no regressions.
