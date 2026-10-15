# New Order chip font sizes + app-wide version format

## 1. New Order: larger category & subcategory chip text

Scope: `src/routes/order.new.tsx` only; the same markup serves phone, tablet and desktop.

- Category chips (Bar Menu / Brunch / Dinner pills, line ~281): `text-[0.6875rem]` (11px) → `text-[0.8125rem]` (13px). Height `h-9`, padding, colors and everything else unchanged.
- Subcategory chips (Brunch Sandwiches, etc., line ~376): `text-[0.6875rem]` (11px) → `text-[0.75rem]` (12px). Single-line `whitespace-nowrap` stays; horizontal mode scrolls longer chips, vertical mode wraps rows naturally.

## 2. App-wide version format: Build Version / Flutter Version / Build Date

Target format, per the attached screenshot (spaces and separators exactly like it):
`5.200.27 (+11350) / 3.44.2 / 15.10.26` — keeping the current numbers (5.200.27 (+11350) / 3.44.2) with today's date (15.10.26, DD.MM.YY) as the build date.

Single source of truth in `src/lib/demo-data.ts`:
- `APP_BUILD_VERSION = "5.200.27 (+11350)"`
- `APP_FLUTTER_VERSION = "3.44.2"`
- `APP_BUILD_DATE = "15.10.26"` (today's date, DD.MM.YY)
- `APP_VERSION` becomes the composed string `"5.200.27 (+11350) / 3.44.2 / 15.10.26"` (replaces the current `"5.200.27(+11350) / 3.44.2/31.07.26"`).
- A small `formatVersionLabel(buildVersion)` helper (e.g. `formatVersionLabel("5.200.27")` → `"5.200.27 (+11350) / 3.44.2 / 15.10.26"`) for screens that read the editable `settings.appVersion`.

Where the format applies:
- Login screen (`src/routes/index.tsx`) and boot screen (`src/components/pos/boot-screen.tsx`): already render `APP_VERSION`, automatically updated.
- Left rail footer (`src/components/pos/nav-rail.tsx`, currently `Ver 5.200.27`): shows the full combined label; it may wrap onto the second line under the emblem as it does today (keeps its existing small muted styling).
- Account bar (`src/components/pos/account-bar.tsx`, currently `eatOS ver 5.200.27`): shows the full combined label.
- About screen (`src/components/pos/about-settings.tsx`): keeps its three rows, values updated to the current numbers in the new format: App Version `5.200.27 (+11350)`, Flutter Version `3.44.2`, Build Date `15.10.26` (drops the "FL"/"BD" prefixes so the values match the attached format).
- `src/lib/settings-details.ts` About fallback rows: Build Date `31.07.26` → `15.10.26`, Framework stays `3.44.2`.
- `settings.appVersion` (editable on General settings) stays the plain build number and remains the source the rail/bar format from; no behavior change to editing it.

## Verification

- Build log clean; `bunx tsgo --noEmit` clean.
- Playwright at phone (390×844), tablet (768×1024) and desktop (1280×900):
  - `/order/new`: category chips visibly larger than today and larger than subcategory chips; no horizontal overflow or clipped chip text in horizontal and vertical layouts.
  - Version string `5.200.27 (+11350) / 3.44.2 / 15.10.26` visible on the login screen, boot screen, left rail footer (wrapping to a second line) and About rows; no truncation or layout break.
