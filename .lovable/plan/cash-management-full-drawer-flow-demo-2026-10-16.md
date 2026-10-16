# Cash Management — full drawer flow (demo)

Rebuild Settings → Payments → Cash Management to match the recording, in our grouped-row style (grey highlights, pink only on primary buttons). Works on phone, tablet and desktop.

## Main screen
- Short description at top (same copy as recording).
- **Cash Drawer** row (shows assigned drawer, opens the existing drawer list).
- Balances card: **Previous Day's Closing Balance**, **Estimated Cash in Drawer**, **Opening Till Balance**.
- **Pay In / Pay Out** amount row: tap to type an amount (cash-register entry, $0.00 → fills from the right, clear button), plus a four-button bar: **Pay In · Pay Out · Open Till Balance · Close**.
- **Cash Logs**: Select Date row (opens the wheel date picker) and a table Time · Name · Reason · Pay In · Pay Out (pay outs shown as -$), newest first.
- **Employee Tips** table: Name · Cash Tips · Non Cash Tips.

## Flows
- **Open Till Balance** → small dialog "Enter Amount" with Back / Yes → Disclaimer ("once the open till balance has been added it cannot be adjusted… close the drawer first") with No / Yes. On Yes: Opening Till and Estimated Cash update, log row "Open Till". Disabled while a till is already open.
- **Pay In** (needs amount entered) → screen "Select an employee to receive pay in": search, sort toggle, employee table (Name · Cash Tips · Other Amount) with check mark; reasons Change Order / Tips / Other; Notes field; confirm button. Saves log row, adds to estimated cash; Tips reason adds to that employee's cash tips.
- **Pay Out** → same screen "Select an employee for pay out" with reasons Tips / Cash Refund / Cash Out / Delivery / Grocery / Other and Notes. Subtracts from estimated cash.
- **Close** → confirm, logs "Close Drawer" with the remaining cash as pay out, resets balances to $0.00 and moves it to Previous Day's Closing Balance; toast "Drawer closed successfully".
- Back on Pay In/Out returns to Cash Management; Cash Management back returns to Payments. No outside-corner X; tapping outside dialogs cancels without saving.
- Seeded with a few sample log rows like the recording; managers only can act.

## Notes
- Demo only: no real drawer opens, nothing changes checkout or End of Day totals.
- Employees come from our demo staff list.

## Technical details
- New `src/lib/cash-management.ts` (shared demo state via localStorage-backed store: logs, opening till, previous close, tips) and `src/components/pos/cash-management.tsx` (main + pay in/out sub-view via in-component state, using SubHeader local back callback).
- Route `cash-management` topic in `settings.detail.$topic.tsx` to the new screen; reuse `money-entry` helpers, `WheelTimePicker`-style date wheel, `Dialog`, `GroupCard`.
- Verify with Playwright on phone/tablet/desktop: open till → pay in → pay out → close, check balances and logs.
