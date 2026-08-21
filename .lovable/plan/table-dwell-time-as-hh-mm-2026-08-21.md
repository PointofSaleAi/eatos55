# Table dwell time as HH:MM

Show how long guests have been at a table as a zero-padded `HH:MM` duration everywhere a table appears, matching the time format used on tickets. Today the floor plan shows shorthand like `48M`, `23H`, `1H`, which is inconsistent between tables and unreadable at a glance.

## What changes

- One shared time formatter turns "seated since" into `HH:MM` (for example 8 minutes becomes `00:08`, 48 minutes becomes `00:48`, 1 hour 5 minutes becomes `01:05`). Durations past a day keep counting in hours (for example `26:10`) so nothing silently resets.
- Grid view: the table card shows `HH:MM` next to the seated/capacity readout.
- Layout (seating plan) view: the table label pill and the seated readout use the same `HH:MM` value, and the compact phone dot view keeps the time in its detail line.
- Table status sheet and guest count sheet: where a time is surfaced, it uses the same `HH:MM` value.
- Demo/seed tables get real seated timestamps instead of hardcoded `48M` / `23H` strings, so every table renders through the same formatter.
- The value ticks live once a minute, so an open table's time advances without a reload.
- Available and reserved tables show no time (nothing seated yet), unchanged.

## Devices

Verified on phone portrait, tablet portrait and landscape, and desktop: the `HH:MM` string is monospaced-width friendly and fits the existing pill and card widths without truncation, wrapping or new scrollbars.

## Technical notes

- Add `formatDwell(minutesOrIso)` to a shared module (`src/lib/floor-data.ts` alongside the table types, or `src/lib/time.ts`) and delete the local `elapsed()` helper in `src/routes/floor.index.tsx`.
- Change the seed `since?: string` field to a seated-at timestamp (minutes ago) in `src/lib/floor-data.ts`; the route derives `since` from `tableSince[name]` when present, else from the seed value, always through `formatDwell`.
- Consumers to update: `src/routes/floor.index.tsx` (grid card), `src/components/pos/floor-canvas.tsx` (label pill and seated readout), `src/components/pos/status-sheet.tsx` and `src/components/pos/guests-sheet.tsx` if they display a time.
- Live ticking via a one-minute interval in the floor route (single timer, cleared on unmount) so the canvas and grid stay in sync.
