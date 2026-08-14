# Landscape sign-in, loading screen and clock-in weather panel

Brings the wide (tablet/desktop landscape) pre-login experience in line with the live eatOS Point of Sale, using our own brand colours and type — only the components/structure come from the reference screens. Phone portrait keeps its current single-column sign-in.

## 1. Sign-in screen (landscape)

- Wide viewport (>=768px): two-column split. Left ~60% is a full-bleed photo carousel; right ~40% is a white/surface panel with the eatOS wordmark, the heading, the email + password form, Forgot password, Create an account, and the version line.
- Heading reads **Point of Sale** in landscape. Portrait phone keeps its current layout, also relabelled to "Point of Sale" for consistency (page titles/meta updated too).
- Carousel: 4 slides, auto-advancing (~6s), with tappable dot indicators bottom-centre, pause on hover/focus, crossfade transition, and no motion when the user prefers reduced motion. Each slide has an image plus a short overlaid headline (e.g. "Make your staff measurably happy") set in our brand type, not the reference's.
- Images: 4 generated on-brand restaurant photos (kitchen, service, counter, guests) stored as CDN assets.
- Accessible markup: real `<h1>`, descriptive alt text, form labels kept.

## 2. Loading screen

- A brand loading screen shown while the app boots: centred eatOS wordmark, "Point of Sale" title, a circular progress ring with a percentage in the middle, a rotating status caption ("Warming the ovens…"), and the version line at the bottom.
- Shown after a successful sign-in on the way to clock-in (short, progress animates to 100%), so the transition matches the live app. Reusable component so it can also back future slow loads.

## 3. Clock-in / PIN screen

- Adds the left information panel from the reference: full date ("Friday, August 14, 2026"), large live time (updates every second), temperature with a weather icon, and the venue location line.
- Weather is demo data (fixed temperature/condition) with a live clock and real date; venue name and demo weather are editable in settings.
- Landscape: information panel left, PIN pad right (pad keeps its current max width and styling). Portrait phone: the info panel sits compactly above the pad, keeping the pad fully visible without scrolling.

## 4. Settings: Login screen

- New Settings entry (manager/supervisor editable, same permission rules as other settings) to manage:
  - the 4 carousel slides: image and headline per slide, plus show/hide
  - venue location label and demo weather values used on the clock-in screen
- Persisted with the existing local settings store so it survives reloads, ready to be swapped for platform-managed values later.

## Responsiveness

Every change is verified in phone portrait, tablet portrait, tablet landscape and desktop widths — the split sign-in and side-by-side clock-in only apply at the existing wide breakpoint; below it the current stacked layouts stay.

## Technical notes

- New: `src/components/pos/login-carousel.tsx`, `src/components/pos/boot-screen.tsx`, `src/components/pos/clock-panel.tsx`, `src/routes/settings.login-screen.tsx`, 4 image assets under `src/assets/`.
- Edited: `src/routes/index.tsx` (split layout + "Point of Sale"), `src/routes/access.clock-in.tsx` (info panel + landscape two-column), `src/lib/pos-store.tsx` (login-screen settings slice), settings index/nav for the new row, and the "Point of Purchase" strings in route `head()` metadata.
- Uses `useWideLayout`/`useLayoutMode` for the breakpoint; all colours via existing semantic tokens.
