# PIN pad: Enter goes to New Order, Clock In runs a guided clock-in flow

## What changes

**Enter**
- Correct PIN + Enter opens the New Order screen straight away. It no longer reopens the last screen you were on.

**Clock In (new flow)**
The date, time, weather and city stay on the left. Only the right side (where the PIN pad sits) changes step by step. Phones show the same steps stacked under the compact clock.

1. **Select your job type**: back arrow, staff photo or initials, name, "Select your job type", and a 3x2 grid: Server, Host, Bartender, Manager, Barista, Runner. Each has a coloured icon. Tapping one goes to step 2.
2. **Clocked In!**: green check, "Welcome back, {name}", then three rows:
   - Clocked In At (current time, read only)
   - Revenue Center: a dropdown that opens a 3x2 grid in place (Dine Center, Main Hall, Outdoor Patio, Private Dining, Bar Area, Takeout Counter). The current one is highlighted.
   - Role: a dropdown that opens the job-type grid in place.
   - Only one dropdown is open at a time. A full-width **Continue** button sits at the bottom.
3. **How are you feeling today?**: back arrow, the check plus "Welcome, {name}", and a 3x2 grid: Happy, Energized, Motivated, Emotional, Okay, Thankful. The green **Submit & Done** button stays dimmed until you pick a mood. **Skip** is underneath.
4. **Mood detail**: back arrow, the large chosen emoji and its name, and word chips you can pick several of. For Happy these are Joyful, Cheerful, Delighted and so on, and every mood has its own set. A "Share anonymously" switch, then **Submit & Done** and **Skip**.
- Submit & Done or Skip opens New Order, with the clock-in time, revenue center, role and mood saved.
- Back goes to the previous step. Back on step 1 returns to the PIN pad.
- Colours, fonts, corners and buttons use our existing theme. The screenshots are used only for the flow.

**Unchanged**: Clock Out, Break, fingerprint or face sign-in, the revenue-center popover on the PIN pad, and Log Out.

## Assumptions (tell me if any are wrong)
- Every employee sees the job-type step, since we don't track which roles each person has.
- Revenue center names come from the reference, replacing the current list everywhere.
- Mood answers are saved on the device only. Nothing is reported yet.
- Fingerprint or face sign-in behaves like Enter and goes straight to New Order.

## Technical details
- `src/routes/access.clock-in.tsx`: add a `step` state ("pin" | "role" | "summary" | "mood" | "moodDetail") and render the right column per step. Enter, biometric and finish call `navigate({ to: "/order/new" })`, and Enter skips `resumeAfterUnlock`. Keep the `unlocking` overlay.
- New `src/components/pos/clock-in-flow.tsx`: RoleGrid, ClockedInSummary (expandable rows), MoodGrid, MoodDetail. Shared tile styled with gate tokens (`bg-surface`, `border-gate-separator`), using lucide icons and native emoji.
- `src/lib/demo-data.ts`: `jobRoles`, `moods` (with chip words), and updated `revenueCenters`.
- `src/lib/pos-store.tsx`: `session.role` and `session.mood` (persisted), and `clockIn` sets `clockedInAt`.
- Verify at 390x844, 768x1024, 1141x742 and 1600x900.
