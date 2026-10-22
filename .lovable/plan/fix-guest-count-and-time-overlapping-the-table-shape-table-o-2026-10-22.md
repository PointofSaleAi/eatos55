# Fix guest count and time overlapping the table shape (Table Order grid)

## Problem
On each table card, the guest count (e.g. "4 / 4") and the elapsed time (e.g. "215:04") sit on top of the table circle/square. Both are positioned over the bottom corners of the shape area, so on narrower cards they run into the table outline and the table name.

## Fix
Give the count and time their own row instead of placing them over the shape:

```text
+---------------------+
|       ( T1 )        |   table shape, centered, nothing over it
|  👥 4 / 4    15:04  |   own info row, left + right
|      ORDERING       |   status band (unchanged)
+---------------------+
```

- Table shape stays centered in its area with a little space below it.
- A new info row sits under the shape: guest count on the left, time on the right, both on one line, never wrapping; the time stays fully visible and the row keeps its height even for available tables with no time, so all cards line up.
- Merged-table member names at the top, status band and Merged row stay as they are.
- Applies to phone, tablet and desktop (same grid card on all of them).

## Verification
Check the Ground Floor grid at 1141x742 (your screen), 1528x796 desktop, 834x1112 tablet and 390x844 phone: no count or time touches a table outline or name, including long names (EW79223) and long times.

## Technical notes
Only `src/routes/floor.index.tsx` grid card: replace the two `absolute bottom-2` spans with an in-flow `flex justify-between` row below the shape container. Presentation only.
