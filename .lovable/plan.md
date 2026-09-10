# Scope lock: Shift Dashboard screen only

## The screen you showed

The screen in your screenshot is the **Shift Dashboard** (the "MY SHIFT" pull-down dashboard with Suggested Next, tickets, shift figures, floor tables, and the Settings column on the right).

It lives in:
- `src/components/pos/dashboard/shift-dashboard.tsx` — the dashboard itself (name, Suggested Next, ticket filters, shift figures, floor tables, settings links)
- `src/components/pos/settings-pulldown.tsx` — the pull-down container that opens it
- `src/lib/shift-summary.ts` — the data behind the figures and suggestions

## Rule going forward

- Every comment you give next applies **only** to this Shift Dashboard screen.
- No other screen, view, or navigation will be touched.
- Changes must still work on mobile, tablet, and desktop for this screen.

## Next step

Send your comments for this screen and I will apply them here only.
