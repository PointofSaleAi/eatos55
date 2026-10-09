# Multiple mock checks on Unpaid Checks & Open Checks

## Current state
The Clock Out screen (`/access/clock-out`) already lists 6 unpaid and 9 open checks for the signed-in user (Elizer Cruz), but the variety is thin: every unpaid card shows the same plain "UNPAID" pill, there are no partially paid checks, no bar tabs, and most open checks are takeaway orders with a single full payment.

## Goal
Both tabs always open with multiple, visibly varied mock checks so every UI state can be reviewed without running flows first.

## Changes — `src/lib/demo-data.ts` only (no logic changes)

Add/adjust demo tickets assigned to Elizer Cruz (existing filters pick them up automatically):

**Unpaid Checks tab (new variety):**
- A bar tab with an open pre-auth ("PAYMENT PROGRESS" status, partial payment row).
- A partially paid dine-in check (e.g. $42.50 total, $20.00 card payment already taken).
- A delivery order and a curb-side order (exercise the other check titles).
- Different revenue centers (Bar, Patio, Main dining, Counter pickup) and guest names.

**Open Checks tab (new variety):**
- A split-payment check (two payment rows, e.g. Card + Cash).
- Checks across all four stages: Ordering, Waiting, Ready, Served.
- One already tipped (tip replaces status), one QR Code paid, one Cash paid.
- A larger dine-in party with a higher total.

## Verification
- Playwright pass on phone, tablet and desktop widths: both tabs render the new mock checks, counts update, selection/charge/transfer/tip actions still work on the new cards.
- Build log clean.
