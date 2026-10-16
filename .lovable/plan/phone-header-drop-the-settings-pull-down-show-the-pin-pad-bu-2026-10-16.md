## Phone header: drop the settings pull-down, show the PIN Pad button

**What changes (phone only; tablet and desktop stay as they are)**
1. The small chevron tab under the top bar no longer appears on phones, so the bar can't open the settings menu. Settings is still one tap away in the bottom bar.
2. The switch-user button (two arrows) now shows on phones too, just left of the profile pill. Tapping it opens the PIN Pad screen (Clock In / Clock Out / Break / Log Out), the same one tablet and desktop open.

**Technical details**
- `src/components/pos/clock-pulldown.tsx`: hide the chevron handle wrapper below the `sm` breakpoint (`hidden sm:flex`), and skip rendering `SettingsPullDown` there too, so a swipe can't open it either.
- `src/components/pos/account-bar.tsx`: change the switch-user button from `hidden sm:inline-flex` to always visible (`inline-flex`). It keeps sending `pos:switch-user`, which opens the PIN Pad.
- Check at 393x742 (phone), 768x1024 (tablet) and 1280x900 (desktop) that the header doesn't overflow and the PIN Pad opens.
