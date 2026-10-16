## Clock In from the header PIN Pad: full flow on every screen size

**What's wrong:** on landscape, Clock In uses the clock-in screen, which goes PIN → choose role → shift summary (time, revenue center, role) → mood check → optional mood details → clocked in. The header PIN Pad, which is what phones use, skips all of that and clocks you in straight away.

**Fix**
- Tapping Clock In on the header PIN Pad (after a 4-digit PIN) follows the same steps as landscape: choose role → summary → mood → mood details (or Skip) → clocked in, with the "Clocked in at …" message. Back arrows return to the previous step.
- The steps appear in the same full-screen phone overlay, under the date and clock, with no top bar or bottom bar showing. Tablet and desktop get the same steps inside their existing overlay.
- Finishing saves the chosen role and revenue center, the same as landscape, then closes the PIN Pad. Back gesture or Escape still closes it without clocking in.
- Clock Out, Break, Enter and Logout are unchanged.

**Technical details**
- `clock-pulldown.tsx`: add `step` state (`pin | role | summary | mood | moodDetail`) plus role, center, mood and clockedAt. Render `RoleStep`, `SummaryStep`, `MoodStep` and `MoodDetailStep` from `clock-in-flow.tsx` in place of `PinPad`, with the same handlers as `access.clock-in.tsx`. `finishClockIn` calls setStation, setRole and clockIn(pin), shows a toast and runs `close()`. Reset the step on close. Let the step container scroll on short phones.
- Verify on phone (393x742) end to end: PIN → role → summary → mood → done, with the header showing the new role. Spot-check tablet and desktop.
