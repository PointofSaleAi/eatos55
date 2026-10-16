# Menus: list, add, edit, archive (demo)

Rebuild Settings → Menu → Menus to follow the recording, in our grouped-row style (grey highlights, pink only for primary buttons and branding). Works on phone, tablet and desktop.

## Menus list
- The description text, with an **Archive** button and a **+** button, and a search icon in the header that opens search.
- A table showing Menu Name, Status (a switch you can flip right there), Start Date and End Date, with a chevron. It starts with **Boathouse**.
- Swipe left on a row to archive it, like Schedules and Employees.
- **Archived Menus** has search, the same table, Restore, and an empty state when there's nothing archived.

## Add Menu / Edit Menu
- **Menu Name** row you can edit inline, with a clear button.
- Four channel sections, each with its own switch:
  - Keep Menu Active for Point Of Sale
  - Keep Menu Active for Point Of Purchase
  - Keep Menu Active for KIOSK
  - Keep Menu Active for Order-OS
- Turning a channel on shows:
  - **Start Date** and **End Date**, which show "Choose" until set and open a wheel date picker (month / day / year).
  - A **Days** table with Start Time and End Time per weekday. Tap a day's circle to turn it on or off, and tap a time to open the existing wheel time picker.
  - A **copy** icon on each row, which opens **Select Days** (search, select all, check marks) to copy that day's times to the days you pick.
- Errors show in red, e.g. "Please select end date", and "End date must be after start date".
- **Categories:** a picker with search and select all. The row shows the count and the chosen names.
- **Organize:** opens **Organize Categories**, a numbered list of the chosen categories that you reorder by dragging the handle (up/down buttons also work for touch and keyboard). The row shows the count, or "Organize Categories" when nothing is chosen.
- **Revenue Centers:** a picker with search and select all, showing Manila, Alabang, Sucat and Bicutan. The row shows the count and names.
- **Saving and leaving:** changes save on their own, like Taxes and Discounts. A new menu is created once it has a name.
  - Going back from an unfinished new menu asks "Are you sure you want to exit? If you go back now, you will lose the progress." with **Keep Editing** and **Exit**.
  - Edit Menu also has **Archive Menu**.
- Back on Edit/Add returns to the Menus list, and Back on the list returns to Menu settings.

## Notes
- Demo only: menus don't change what's sold on New Order or anywhere else yet.
- Categories come from our demo menu, not Foods, Drinks, Reception and Colombian Flavor Fiesta Appetizer from your recording. Revenue Centers use the four names from your recording.
- Popups have no outside-corner X, and tapping outside closes them without saving.

## Technical details
- `src/lib/menu-settings.ts`:
  - Menu model (`name`, `active`, `channels{pos, pop, kiosk, orderos}`, each with `{enabled, start, end, days[7]{on, start, end}}`, `categories[]` ordered, `revenueCenters[]`, `archived`), with a seeded Boathouse.
  - Stored with the shared localStorage + useSyncExternalStore pattern.
- `src/components/pos/menu-settings.tsx`: list, archive and editor views held in component state, using SubHeader `onBack`. Reuses `Picker`, `WheelTimePicker` and `SwipeRow`.
- New `WheelDatePicker` added in `time-picker.tsx`.
- Route the `menus` topic in `settings.detail.$topic.tsx`.
- Verify with Playwright on phone, tablet and desktop:
  - Add a menu, set dates and times, copy times, pick and reorder categories, pick revenue centers.
  - Toggle status, archive and restore.
  - Check the exit prompt.
