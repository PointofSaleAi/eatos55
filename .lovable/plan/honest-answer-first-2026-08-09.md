# Honest answer first

No — I am not 100% sure. What I can verify right now:

- 48 route files exist and the fluid token system (font sizes, spacing, tap heights, sheet widths, radii) is in place.
- Only 2 files still contain hardcoded colors, so colour tokenisation is nearly complete.
- 11 files still contain fixed-pixel sizes that should be fluid tokens.

What I have **not** done: viewed every one of the 48 screens plus every sheet/dialog/drawer state at each phone size in both light and dark mode, walked every link and sub-link by hand, or checked each one against the Apple HIG pages you listed. I fixed the screens I sampled (cash keypad, tickets, settings). Claiming full coverage would be wrong.

On Android: everything is web/CSS, so it renders on Android — but Android has different safe areas, back-gesture behaviour, keyboard resize behaviour, default font metrics, and taller/narrower aspect ratios (e.g. 20:9, Galaxy Flip cover screen). Those need their own pass; today only iOS-style safe areas and keyboard insets are handled.

# Plan: full per-screen audit and fix

## 1. Build the inventory
Enumerate all 48 routes plus every overlay state (item sheet, modifiers, discount, guest, more, PIN, confirm, search dock, nav drawer, clock pulldown, notifications, top bar expanded). Produce a checklist so nothing is "assumed fine".

## 2. Automated crawl with evidence
Script a crawl that visits every route and opens every overlay at 6 device profiles:

```text
iPhone SE       320x568   smallest supported
iPhone 13 mini  375x812
iPhone 15       393x852
iPhone 15 Pro Max 430x932
Android compact 360x800   Pixel-class
Android tall    412x915   20:9 Samsung
```

Each profile runs in light and dark mode. For every state, capture a screenshot and machine-check: horizontal overflow, clipped/truncated text, tap targets under 44x44, overlapping elements, contrast ratios, missing accessible names, and content hidden behind the tab bar, footer, or keyboard.

## 3. Fix by category, not one-off
- **Typography**: one type ramp; verify heading/body/caption pairings and line lengths at every size; no fixed px font sizes left.
- **Boxes and spacing**: remaining 11 files moved onto fluid tokens; consistent card/sheet padding and row heights.
- **Shapes**: one radius scale (pill / card / sheet) applied everywhere; no stray radii.
- **Colour**: last hardcoded colours tokenised; status never conveyed by colour alone; dark mode contrast AA.
- **Components**: same control for the same job across screens (rows, segmented controls, sheets, keypads, empty states).
- **Navigation**: every screen reachable and escapable; back destination correct; no dead ends.

## 4. Apple HIG conformance pass
Work through the HIG areas you linked and check the app against each: clarity/deference/depth, iOS layout and safe areas, foundations (typography, colour, layout, motion, accessibility, icons), patterns (launch, loading, entering data, feedback, modality, search, onboarding), components (bars, sheets, lists, controls, pickers, alerts), technologies (haptics, VoiceOver, Dynamic Type, reduce motion, dark mode).

## 5. Android parity pass
Gesture-navigation insets, keyboard resize behaviour, back-gesture handling, Material-acceptable touch feedback, font-scale up to 130%, and layout on 20:9 and cover-screen widths.

## 6. Report
A per-screen table: screen, device sizes checked, issues found, fixed or open — with before/after screenshots for anything changed.

## Technical notes
Playwright drives the crawl against the local dev server; checks run in-page via computed styles and bounding boxes. Fixes stay in presentation code: `src/styles.css` tokens, `src/components/pos/*`, and route files. No data or business-logic changes.

This is a multi-pass job, not a single quick sweep — I will report findings per wave of screens rather than claim it is all done at once.
