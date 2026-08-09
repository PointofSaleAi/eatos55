# Honest answer first, then the real audit

No — I have not walked every one of the 48 routes plus every sheet, drawer, overlay and sub-link against the Apple guidelines. What the last pass did was build the *foundations* (haptics, live regions, confirm sheets, appearance switching, pull-to-refresh, swipe rows, fluid type/control tokens, safe areas) and wire them into the busiest flows: tickets, order, review, payment, board. Settings sub-pages, access/onboarding screens, system/help screens, floor, rooms and several sheets were only checked for overflow, not for typography, spacing, shape, contrast or component semantics. That is the gap, and it is the work below.

This plan is a screen-by-screen conformance pass, not another infrastructure pass.

## 1. Establish the visual contract first (so the audit has a ruler)

Before touching screens, write down the single spec every screen is measured against, in `src/styles.css` only:

- **Type ramp**: keep the existing fluid `--fs-*` scale but assign each step a role — screen title, section header, row label, value, caption, badge — with a fixed weight and letter-spacing per role. Archivo stays the family; the current problem is the same size used at three different weights across screens.
- **Line length and leading**: body copy capped near 60-70 characters, explicit `line-height` per type role rather than Tailwind defaults.
- **Spacing rhythm**: one 4px-based scale, with fixed values for screen padding, section gap, row gap, and in-row gutter. No ad-hoc arbitrary values.
- **Shape**: radius tokens by component class — sheets, cards, rows, pills, inputs, keypad keys — so every surface of the same class has the same corner.
- **Elevation**: two levels only (raised surface, modal surface); no per-screen shadows.
- **Colour**: audit every text/surface pair to AA (and AAA for small caption text) in both light and dark; status colours always carry an icon or word.
- **Icon sizing and optical alignment**: fixed icon sizes per control class, with labels baseline-aligned.

Currently 118 files carry arbitrary bracket values for size, height, padding or gap. Those get folded into the tokens as each screen is worked.

## 2. Route-by-route pass — all 48 routes, in groups

For each screen: title/header contract, type roles applied, spacing rhythm, correct component primitive (never a hand-rolled one where a shadcn/Radix primitive exists), tap targets, accessible names, empty and loading states, destructive actions through the confirm sheet, focus order, and light/dark contrast.

1. **Access and onboarding** — index (sign in), forgot password, create account, select station, clock in, manager PIN.
2. **Ordering** — new order, menu, custom item, review, plus item sheet, menu sheet, discount sheet, guest sheet, more sheet.
3. **Tickets** — list, detail, sort, filter, search, manager controls, what's new.
4. **Service** — floor, rooms, board, orders.
5. **Payment** — method, cash, card, tender by kind.
6. **Settings** — index, general, control center, menu, payment(s), workforce, network, hardware, hardware integrations, notifications, sales summary, more, detail topics.
7. **System** — index, help center, customer support, contact us, integrations, network, hardware.
8. **Global chrome** — shell header, bottom tabs, nav drawer, account bar, clock pulldown, search dock, offline banner, numpad, settings rows, primitives.

Each screen is captured before and after at phone, tablet and desktop widths, in light and dark, so the change is visible rather than asserted.

## 3. Component semantics sweep

- Replace any hand-rolled dropdown, dialog, tooltip, popover, tabs or switch with the Radix-backed primitive so keyboard and ARIA behaviour comes for free.
- Segmented controls for either/or choices, switches only for on/off, steppers for quantity — applied consistently, not per screen.
- Rows follow one anatomy: leading icon, label, optional secondary text, trailing value or chevron; chevron only where navigation actually happens.
- Buttons: one primary per screen, destructive always red plus a confirm, disabled states legible.

## 4. Verification

A Playwright matrix over 320, 360, 375, 393, 430, tablet and desktop widths, portrait and landscape where relevant, at 100% and 200% text, light and dark, reduced-motion on and off. Per screen: no horizontal scroll, no clipped footer, no target under 44px, no missing accessible name, no failing contrast pair. Results reported as a table per screen so the remaining gaps are explicit instead of implied.

## 5. Sequencing

Given the breadth, I'll do it in four reviewable batches — foundations + global chrome, then ordering + payment, then tickets + service, then settings + system — and report findings for each batch before moving on, so you can correct direction early.

## Technical notes

- Token work confined to `src/styles.css`; no new hard-coded values in components.
- No data, store, pricing or tax changes — presentation and accessibility only.
- Existing infrastructure (haptics, live region, confirm sheet, appearance, keyboard inset, safe areas) is reused, never duplicated.
