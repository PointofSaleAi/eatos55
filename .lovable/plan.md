# Restore the original imported design, keep the wave data

The four upload waves added the right content but also rewrote the visual language of most screens (new keypads, settings tile rows, sheets, an account bar, a dark help-center header). This plan puts every screen back on the design system from the imported prototype, with zero exceptions, while keeping all copy, fields, values and navigation from your uploaded screenshots.

## Rule for this pass

- Content (labels, field names, sections, values, version numbers, station lists, statuses, totals, warning text) = your screenshots.
- Styling (header style, card style, row style, keypad style, sheets, typography scale, spacing, colors, buttons) = the original imported design only.
- Nothing gets dropped: every route added during the waves stays, it just gets restyled.

## Screens to restyle (all of them, grouped by wave)

Wave 1 — Sign in, Clock In / station select, Forgot password, Create account, New order header.
Wave 2 — Custom item, Menu sheet, Tickets list, Tickets sort / filter / search, Order review, Payment method, Pay by cash, Pay by card.
Wave 3 — Settings hub, General, Control Center, Menu, Payments, Workforce, Network, Hardware, Hardware Integrations, Notifications, Sales summary.
Wave 4 — Customer Support, Contact Us, tickets account bar, Enter PIN sheet.

## What changes on each

- Headers go back to the original screen header (eyebrow + title + back), replacing the wave-added sub-header variant.
- Lists go back to the original card + row components (nav row, value row, action row, toggle row) instead of the coloured icon-tile rows introduced in wave 3. Row titles and values stay exactly as in the screenshots.
- Keypads go back to the original keypad component; the extra Clock Out / Break / Clock In and back-arrow / plus keys stay as data-driven keys on that component rather than a second bespoke keypad.
- Overlays (menu sheet, sort, filter, search, payment method, Enter PIN, what's new) use the original sheet/popover styling and spacing.
- The account bar and help-center screen drop their bespoke dark treatment and use the original shell surfaces and tokens.
- The tile colour tokens added in wave 3 are removed from the stylesheet since nothing will reference them.
- Every screen is checked at mobile, tablet and desktop widths.

## Screens I may need screenshots for

I have content for everything you uploaded. If, while restyling, a screen has data you never sent (for example Sales Summary, Notifications, Network / Servers detail, or the ticket detail view), I'll pause and ask you for that screenshot rather than invent values.

## Technical notes

- Baseline for styling is the commit that finished the original import (`Added remaining screens and shell`); the design components there — `src/components/pos/shell.tsx` and `src/components/pos/primitives.tsx` — are the reference and the wave-era `settings-rows.tsx`, `numpad.tsx`, `account-bar.tsx`, `pin-sheet.tsx` get folded back into those primitives.
- State in `src/lib/pos-store.tsx` and data in `src/lib/demo-data.ts` are kept as they are now — the wave data lives there.
- Route files and `head()` metadata stay; only the JSX/presentation inside them is rewritten.
