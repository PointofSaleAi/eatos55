# Match our Clock Out flow to the published reference

## What I checked

I opened https://pointofsale6.lovable.app in a browser and read its clock-out screen, then compared it with our own `/access/clock-out`. Both the screen and its wording are confirmed, not assumed.

What the reference does, and what ours does today:

| Area | Reference | Ours today |
| --- | --- | --- |
| Check status on a card | Real value per check (Ordering, Waiting, Ready, Served, Unpaid), each with its own colour | Made up from the card's position in the list, so the same check shows a different status each time |
| Greeting | Changes with the hour: Good Morning / Good Afternoon / Good Evening | Always "Good Evening" |
| Transfer picker | Name plus "(current)" tag, second line shows job type then role | Shows role and clock state, and hides anyone clocked out |
| Transfer wording | "You are about to transfer N unpaid checks to Sarah Johnson." then "This action cannot be undone." | Shorter question-style wording |
| Already-transferred check | Own panel: "Check Already Transferred / This check was transferred to X. Do you want to reassign it?" with Cancel and Confirm Reassign | Same idea, but different title and wording |
| Close wording | "You are about to close N open checks." plus "This action cannot be undone." | Question-style wording |
| Tip keypad | Amount starts at $0.00, Add Tip greyed until an amount exists, confirmation flash after adding | Same behaviour, different look |
| End of shift | "Clocked Out!" with "Great shift, Elizer Cruz" and a shift summary | A small pop-up message, then straight back to the PIN screen |
| Card layout | Two cards across on a phone, three on a tablet | One card on a phone, two on a tablet |

Counts on the two tabs are red for unpaid and orange for open in the reference; ours uses the same accent colour for both.

## What I will build

1. **Real statuses on open checks.** Each check shows the status stored against it, coloured per status (orange for ordering, amber for waiting and ready, grey for served, red for unpaid). No check will change status just because the list reordered.
2. **A greeting that follows the clock.** Good Morning before noon, Good Afternoon until 5pm, Good Evening after.
3. **A richer staff picker.** Everyone is listed, the signed-in person is tagged "(current)", and each row shows job type and role. Transfers to anyone clocked out are still blocked.
4. **Reference wording on every confirmation**, in our own colours and type: transfer, close, and the separate "Check Already Transferred" reassign panel.
5. **A proper end-of-shift screen.** Once the last unpaid check is transferred or paid and the last open check is closed, the dialog becomes "Clocked Out!" with "Great shift, {name}" and a short summary (hours, sales, tips), then a control back to the PIN screen. This replaces the pop-up message and settles the open question about how a shift finishes.
6. **Tab badges** red for unpaid, orange for open, using our warning and destructive colours.
7. **Card density** two across on a phone, three from tablet up, matching the reference.

Everything keeps our black-and-white theme, our icons and our type scale — the reference is used for structure and wording only.

## Responsive

Phone, tablet and desktop get the same structure: the dialog fills the phone width with a scrollable check list and a fixed action bar; from tablet up it centres at its current width with a multi-column card grid. Landscape phone and tablet are checked too, since the dialog is tall.

## How I will verify

- Drive the flow in a browser: select one unpaid check and confirm Charge and Transfer appear; select several and confirm only Transfer; transfer and confirm the check moves under that person; reopen the transferred check and confirm the reassign panel; add a tip and confirm the amount replaces the status; close checks and confirm the empty state; then confirm the "Clocked Out!" summary and return to the PIN screen.
- Screenshot phone, tablet and desktop widths and read them back.
- Check the build log for errors.

## Technical details

- `src/routes/access.clock-out.tsx` — replace the index-derived status prop with `ticket.status`, add the greeting helper, reword `ConfirmPanel` into the three reference panels, add the "(current)" marker to `EmployeePicker`, widen the picker list, adjust the card grid columns and badge colours, and add a `clockedOut` view with the shift summary.
- `src/lib/pos-store.tsx` — expose shift start time, hours worked and totals (card, cash, tips) for the summary; keep the existing guard that refuses to end a shift while checks remain.
- `src/lib/demo-data.ts` — add a job type to each staff record and make sure the demo checks carry the statuses the reference shows (ordering, waiting, ready, served, unpaid).
- `roadmap.md` — mark the clock-out item complete once the browser pass passes.
- No new routes, packages or database changes.
