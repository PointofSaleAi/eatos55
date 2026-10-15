# Guest Name field with guest search suggestions

## Goal
In the Guest Information sheet, the Guest Name field works as a normal text field and also searches existing guests.

## Behavior
- Typing in Guest Name keeps the text (manual entry always works) and opens a suggestion list below the field.
- Suggestions come from the same guest directory the Guestbook uses. They match on name, email or phone and show:
  - Name (bold)
  - Email and phone on a second line (whichever exist)
- Tapping a suggestion fills Name, Email, Phone and, when the guest has one, Address. Then the list closes.
- No matches: the list shows "No guest found — continue typing to add manually". The typed name stays and saves as a new guest.
- The list closes on outside tap, on Escape, or when the field is cleared. Arrow keys plus Enter select a suggestion on keyboards.
- At most about 6 results show at a time and the list scrolls if there are more. It fits within the sheet on phone, tablet and desktop, and long names or emails wrap instead of being cut off.
- The existing search icon in the field stays as the visual cue.

## Technical details
- `src/components/pos/guest-sheet.tsx`: build records with `guestDirectory(tickets, guest)` from `@/lib/guestbook`, filter by the trimmed query (at least 1 character), and render an anchored list under the name row (relative wrapper, absolute list, `bg-popover`, grey `bg-muted` highlight on hover/active per the project rules). On select, call the existing setters (`setName`, `setEmail`, `setPhone`, `setAddress`).
- No changes to how saving or the Guestbook works.
