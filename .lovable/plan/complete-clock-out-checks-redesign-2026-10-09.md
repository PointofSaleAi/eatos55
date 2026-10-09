# Complete Clock-Out Checks Redesign

## Goal
Rebuild the Clock Out experience as a true overlay on the PIN screen, using the uploaded screenshots for structure and behavior while retaining the app’s existing eatOS theme, typography, tokens, controls, and responsive patterns.

## What will change

### 1. Clock-out overlay and shift header
- Present Clock Out as a centered, dismissible overlay above the dimmed PIN screen rather than a standalone full-page list.
- Add the title, instructional subtitle, current employee summary, clock-in time, and live current time.
- Keep the shared outside top-right close control and return safely to the PIN screen without ending the shift.
- Make the overlay responsive: compact full-height treatment on phones, centered dialog on tablets and desktop, with internal scrolling for short screens.

### 2. Unpaid Checks tab
- Show an independent live count, Select All control, selected-count summary, and responsive check-card grid.
- Each card will show order type/table, amount, assigned guest/server, and unpaid status using existing app tokens.
- One selected check: show **Charge** and **Transfer**.
- Multiple selected checks: show **Transfer** only.
- Charge will load the selected ticket into the existing payment flow and reliably return to Clock Out after success or cancellation.

### 3. Transfer and reassignment flow
- Add an anchored employee picker with employee name, role, and current-user disabled state.
- Require confirmation before the first transfer, with singular/plural messaging and Cancel/Confirm Transfer actions.
- Keep transferred checks visible below a **Transferred** divider, grouped by receiving employee.
- Add per-group Select All/Deselect All, individual selection, group reassignment, destination labels, and “tap to reassign” guidance.
- Require a distinct confirmation when moving a previously transferred check or group to another employee.
- Update tab counts and remaining-current-user checks immediately after transfer.

### 4. Open Checks tab
- Show independent count, Select All, selected count, and service-stage statuses.
- One selected check without a tip: show **Add Tip** and **Close Check**.
- One selected check with a tip: show **Close Check** only and display the tip in place of status.
- Multiple selected checks: show **Close Check** only.
- Add Tip opens an inline amount screen with a large money readout, 1–9, 0, 00 and clear controls, Back, and disabled/enabled Add Tip states.
- Closing checks requires an irreversible-action confirmation for single or bulk selections.
- After closure, show the centered “No open checks” empty state when appropriate.

### 5. Completion and clock-out rules
- Block shift completion while the current employee still owns any unpaid or open checks.
- When both current-employee lists are clear, show the requested final **Clock Out** button.
- Confirm the final action, end the shift, clear break state, and return to the PIN screen.
- Preserve transferred checks under their new employee instead of closing or deleting them.

### 6. State and sample coverage
- Extend the existing ticket state only where needed to represent the reference behaviors: current assignment, previous transfer grouping, open service status, tips, and closed state.
- Keep ticket, transfer, tip, payment, and close actions in the shared POS state so tab counts and return flows remain consistent.
- Expand demo checks and employee metadata enough to exercise every attached state without introducing a new backend.
- Remove the fragile one-shot payment-return behavior so an abandoned payment cannot misroute a later payment.

## Technical details
- Refactor the current `/access/clock-out` route into focused overlay, tab, check-card, transfer-picker, confirmation, and tip-entry pieces.
- Reuse the existing Button, shared dialog close treatment, number-pad conventions, semantic design tokens, and ticket/payment store actions.
- Keep `/access/clock-out` as the existing URL and preserve its route metadata.
- Ensure all entry points—the lock-screen Clock Out key and the top pull-down Clock Out key—open the same validated flow.
- Add a store-level clock-out guard so another caller cannot bypass outstanding-check validation.

## Verification
- Exercise every captured state end-to-end: no selection, one/many/select-all, charge and return, first transfer, transferred groups, individual/group reassignment, one/many open checks, tip entry, close confirmation, empty states, and final Clock Out.
- Verify counts, action visibility, selection clearing, employee ownership, tips, and final shift state after each action.
- Check phone portrait, tablet portrait, tablet landscape, and desktop sizes, including short-height scrolling and no overlap with the PIN screen.
- Confirm preview runtime and build diagnostics are clean.
