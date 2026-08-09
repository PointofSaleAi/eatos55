# Honest status, then a real per-screen audit

## Straight answer

No — I am not 100% sure. What I can verify right now:

- 48 route files exist; the type/radius/tap-target token contract is defined in `src/styles.css` (fluid `--fs-*` clamps, `t-title`/`t-row`/`t-caption`/`t-numeric`, `rounded-sheet/card/row/key/pill`, `min-h-tap`) and raw Tailwind `text-xs…text-4xl` usage is now zero outside `src/components/ui`.
- Hardcoded colour leftovers remain in 5 files (`floor-data.ts`, `confirm-sheet.tsx`, `error-page.ts`, `__root.tsx`, `nav-drawer.tsx`) and fixed-`px` values remain in ~15 files (`pin-sheet.tsx` has 7, `shell.tsx` 3, `tickets-screen.tsx` 3).

What I did **not** do: open every screen and every sub-link visually at each phone size, exercise every interactive path, or read every Apple HIG page and sub-page. The token sweep was mechanical (search-and-replace), so it guarantees consistent tokens — not correct text placement, box sizing, or feel on each screen. That is why it was fast.

## The audit I propose (evidence, not claims)

### 1. Build a route + interaction inventory
Enumerate all 48 routes plus every sheet, dialog, drawer, pulldown and tab state reachable from them. Output a checklist file so nothing is claimed done without a screenshot.

### 2. Automated visual crawl
Playwright script, portrait only, at 320x568, 375x667, 393x852, 430x932, in light and dark:
- screenshot every route and every reachable overlay
- assert per screen: no horizontal overflow, no clipped text, no unintended page scroll, every interactive element >= 44px, every icon-only control has an accessible name, contrast passes on text
- record console errors per route

### 3. Fix in passes, by category
- **Colour**: remove the remaining hardcoded colours; move status colours to tokens with an icon/text partner.
- **Sizing**: replace remaining fixed `px` with fluid tokens or `clamp()`; sheets/keypads sized by available height, not magic numbers.
- **Text placement**: consistent header/title/subtitle placement, list-row baseline alignment, tabular numerals on all money, truncation rules on long names.
- **Components/shapes**: one radius per role, two elevation levels, one control-height ramp; sheets share one grabber/dismiss behaviour.
- **Fonts**: single Archivo ramp, verify weights 400/500/700/800 render and no reflow on load (`display=swap` already set).

### 4. Apple HIG conformance checklist
Work through the HIG sections you listed and record a pass/fail line per item that applies to a phone POS: hierarchy and depth, safe areas and Dynamic Island, back/dismiss patterns, sheet detents and drag-to-dismiss, keyboard avoidance and Return-key semantics, destructive-action confirmation, empty and error states, haptics on commit actions, Reduce Motion, VoiceOver labels and focus order, Dynamic Type behaviour, minimum contrast, tap-target spacing.

### 5. Report
One table: screen x size x light/dark, with pass/fail and screenshot evidence, plus a list of anything I chose not to change and why.

## Technical notes

- Crawl script under `/tmp/browser/hig-audit/`, screenshots kept out of the repo.
- Checks run against the dev server at `http://localhost:8080`; PIN `1111` for authed screens.
- Expect this to run in several batches (roughly 10 screens per pass) so each fix is verified before moving on — it will not be one fast sweep this time.

## Scope note

This is an audit-and-fix pass. It changes styling, accessibility attributes, and layout sizing only — no data, copy, or business logic changes unless a screen is genuinely broken.
