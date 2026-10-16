# Pay In / Pay Out: autosave instead of a confirm button

## What will change
- Remove the **Pay In $… / Pay Out $…** button at the bottom of the Pay In and Pay Out screens.
- The entry saves on its own, like in your recording: once an employee and a reason are picked (plus a note when the reason is **Other**), tapping **Back** records it. You go back to Cash Management, the balances and Cash Logs update, and you see "Pay in recorded" / "Pay out recorded".
- A small line under the title shows the state: "Select an employee and a reason" until it's ready, then "Will be saved when you go back".
- If you go back before choosing both, nothing is recorded. You get the same "Are you sure you want to exit?" pop-up used elsewhere, with **Keep Editing** and **Exit**.
- The Pay In / Pay Out amount box is cleared only after a save.
- Works the same on phone, tablet and desktop.

## Technical details
- `src/components/pos/cash-management.tsx`: in `PayScreen`, drop the bottom Button. `onBack` calls `onDone` when it's valid (`chosen && reason && !needNote`), otherwise it opens a cancel-only confirm Dialog (Keep Editing / Exit, and tapping outside keeps editing).
- Verify with Playwright: pick an employee and a reason, tap Back, and check the log row and balance. Go back with nothing picked and check the confirm pop-up appears and nothing is saved.
