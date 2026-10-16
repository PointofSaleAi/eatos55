# Remove the hint text on the Products row (Settings > Menu)

## What is happening now

On the Menu settings page, the Products row shows "Course, sides, add-ons" under its title. That hint was added in an earlier change to make Course easier to find, but the Products screen has since been rebuilt end-to-end from the recording and no other row carries extra text, so the hint is out of place.

## What will change

- Remove the "Course, sides, add-ons" value from the Products row in `src/routes/settings.menu.tsx`, so the row looks like the other rows: title, icon and chevron only.
- Course stays easy to find through the Order Options section inside Edit Product; nothing else changes.

Checked on phone, tablet and desktop.

## Technical details

- `src/routes/settings.menu.tsx`: drop `value="Course, sides, add-ons"` from the `IconNavRow` with `topic="products"`.
- No other files touched.
