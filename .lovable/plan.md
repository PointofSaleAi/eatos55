# Wave 3 — Settings & Device screens (50, 50b, 51, 52, 53, 54, 55, 57, 58, 59)

Rebuild the Settings area for exact content parity with the 10 uploads, keeping the imported prototype styling. After this, 6 screens remain.

## Shared building block

Add an `IconRow` list row (colored rounded-square icon tile + label + optional right value + chevron) plus an `IconTile` helper, using the exact tile colors from the screens (green, violet, orange, indigo, purple, grey, sky blue, pink, magenta, yellow, red, blue). Colors go in as semantic tokens in `src/styles.css` (`--tile-green`, `--tile-violet`, …) so mobile/tablet/desktop and dark shell all stay consistent.

## Screens

**50 / 50b — Settings main** (`/settings`)
Large "Settings" title, search field with mic icon, user card (initials avatar, name, role, divider, "Clocked in at 5:43 PM"), then grouped icon lists:
- General, Control Center, Menu, Payments, Workforce, Sales Summary Report
- Network, Hardware
- Notifications, Customer Support
- Switch User
Floating dark round "new ticket" FAB above the bottom tabs (Tickets / Orders / Settings). Search filters the rows live.

**51 — General** (`/settings/general`)
"DEVICE SERVICE" section: Device Name `aurora 22`, Device Service `Table Service` with toggle. Then Restaurant Information, Restaurant Settings, Language `English`, Currency, Tax Alias `Tax`; End Of Day, Schedule Info, Timed Pricing; About `5.200.27`.

**52 — Control Center** (`/settings/control-center`, new)
Device Settings, Hardware Control rows; "APP RESTART" section with Restart App toggle (on) and Choose Time `02:30 PM`; grey helper text plus the red warning paragraph, verbatim.

**53 — Menu** (`/settings/menu`)
Menu, Categories, Modifiers, Add-Ons, Products, Inventory, Default Modifiers, Groups.

**54 — Payments** (`/settings/payments`, replacing `settings.payment`)
Gratuity, Taxes, Discounts, Service Charge, Cash Management, Receipts; separate card Payment Platform `NA` with the grey caption.

**55 — Workforce** (`/settings/workforce`)
Centered briefcase-clock glyph, "Workforce" heading, the truncated description with bold "Learn more", divider, then Employee row.

**57 — Network** (`/settings/network`)
Grey intro line, single Servers row with value `aurora 22`.

**58 — Hardware** (`/settings/hardware`)
Grey intro paragraph, then Printer, Card Reader, Integrations, Cash Drawer, Hardware Emulators.

**59 — Hardware ▸ Integrations** (`/settings/hardware/integrations`)
Header back label reads "Hardware" with centered "Integrations"; vertically centered body text "Manage third-party integrations on the Handheld app."

## Technical notes

- New routes: `settings.control-center.tsx`, `settings.payments.tsx`, `settings.network.tsx`, `settings.hardware.tsx`, `settings.hardware.integrations.tsx`, `settings.notifications.tsx` (stub reachable), `settings.sales-summary.tsx` (stub reachable). Existing `settings.payment.tsx` is redirected to `/settings/payments`; `system.*` routes stay and are linked from the new Hardware/Network screens so nothing dead-ends.
- `ScreenHeader` gains a `backLabel` prop so screen 59 can show "Hardware" instead of "Back".
- Store: extend settings with `deviceName`, `deviceService`, `tableService`, `language`, `taxAlias`, `appVersion`, `restartApp`, `restartTime`, `paymentPlatform`, `clockedInAt`; toggles and values persist in-memory across navigation.
- Switch User signs out to the clock-in keypad; every row navigates or shows a toast — no dead taps.
- Each route gets its own unique `head()` metadata.
- Verified with Playwright at mobile, tablet and desktop widths.
