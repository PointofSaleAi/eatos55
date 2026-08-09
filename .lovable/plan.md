# Fix the invisible eatOS logo in dark mode

## What happened

The logo did not disappear — it turned invisible. The recent Apple-guidelines pass added a real dark appearance that follows the device setting (`src/hooks/use-appearance.ts` adds a `dark` class to the page). The wordmark is a **black** PNG and `src/components/pos/brand.tsx` only flips it to white when a screen passes `invert` by hand. Sign in and Forgot password don't pass it, so on a dark phone the black mark sits on a near-black background and reads as blank space — exactly what your screenshot shows.

## The fix

1. Make the wordmark appearance-aware in one place: it stays black on light surfaces and automatically renders white when the dark appearance is active, so no screen has to remember a flag. The existing manual `invert` on the dark support header keeps working (it must not double-invert and go black again).
2. Apply it everywhere the mark appears: Sign in, Forgot password, Customer support / Contact us, and the navigation drawer / brand moments if any pick it up later.
3. Keep the rule intact: black/white wordmark in page content, pink mark only as the app icon and favicon.

## Same-cause sweep (dark appearance regressions)

Since the dark mode arrived after most screens were built, I'll check for the same class of problem rather than only this one instance, on phone, tablet and desktop, in both light and dark:

- Any other fixed-colour image or asset that assumes a light background.
- Text or icons that were given a literal light/dark colour instead of a theme token, so they vanish or lose contrast when the appearance flips.
- Surfaces that stay light while their content turns light (cards, sheets, keypads, the account bar, the help-centre header).
- Focus rings, borders and disabled states that disappear on the dark palette.

Anything found gets moved onto the existing theme tokens so it flips correctly instead of being patched per screen.

## Verification

Screenshot Sign in, Forgot password, Tickets, New order, Payment and Settings in light and dark at phone, tablet and desktop widths, and confirm the logo and all text are legible in every combination.

## Technical notes

- `src/components/pos/brand.tsx`: derive inversion from the `dark` variant (with the explicit `invert` prop still supported and non-cumulative) instead of requiring callers to pass it.
- No change to `use-appearance.ts` behaviour, the assets, or any data.
