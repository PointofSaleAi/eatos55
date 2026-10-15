# Header profile bar: Profile card and Shift Summary

Based on the recording, tapping the profile bar in the header (name, role, shift time) opens a small profile card, and from there the user can open a full Shift Summary or log out. Built in our current black-and-white theme, working on phone, tablet and desktop.

## 1. Profile card (popover under the profile bar)
- Restaurant logo (circle), employee full name and role (e.g. "Francist Obera / Manager").
- Boxed clock-in block: large clock-in time (e.g. "10:57 PM") with "Clock In" caption.
- Primary black button: **View Shift Summary**.
- Secondary button: **Log Out** (uses the existing lock / switch-user flow, so nothing is clocked out by accident).
- Tapping outside closes it; no X in the corner. On phone it opens as a bottom sheet.
- The initials circle keeps opening the navigation; the rest of the pill (name, role, time) opens the card.

## 2. Shift Summary screen (large modal, full screen on phone)
Title "SHIFT SUMMARY", then a filter row:
- **Date range** field (defaults to today–today) opening a range calendar with "Start Date – End Date" header, scrolling months, Cancel / Save.
- **Employees** multi-select dropdown with checkboxes (current employee checked by default, list from Workforce employees).
- **Time range** field (defaults 12:00 AM – 11:59 PM) opening our existing wheel time picker for start, then end.
- **Print** button (shows a demo "sent to printer" notice; no real printing).
- Second row: **Select Tip** (Tipout / No Tipout checkboxes) and **Select Revenue Center** (single select from existing revenue centres).

Results area:
- While filters change, show a short loading state with the eatOS cup animation/emblem.
- Then: summary stats row — Total Card Sales, Total Cash Sales, Total Sales, Cash Tips, Card Tips, Total Tips.
- Table: Type | Quantity | Amount | Tip (one row per payment type, plus totals).
- Footer stats: Total Cash On Hand, Cash Drop.
- Figures come from the demo tickets matching the filters (zeros when nothing matches, as in the recording).
- Tapping outside closes; no corner X.

## Technical details
- New `src/components/pos/profile-card.tsx` (popover/sheet) and `src/components/pos/shift-summary-dialog.tsx`; wire into `AccountInfo` in `account-bar.tsx`.
- Calculations added to `src/lib/shift-summary.ts` as a pure filter-based function over `usePos()` tickets; filter state is local to the dialog (not persisted).
- Reuse `WheelTimePicker`, shared Dialog/Sheet, `formatMoney`, workforce employee list and revenue centres; hover states use grey `bg-muted`.
- Verify with Playwright at phone, portrait/landscape tablet and desktop sizes.
