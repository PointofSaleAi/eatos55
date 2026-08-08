# Login screen: version label, link styling, bottom space

## 1. Version label
Change the string to `5.200.27(+11350) / 3.44.2/31.07.26` and render it one step smaller (11px) in muted grey, still centred.

## 2. Links
- Remove the underline from "Forgot Your Password?" (and the same treatment on the other in-app text links: Create an account, the workforce screen link).
- Add a clear colour change on hover and on touch/press: text moves from black to the pink accent on hover, active and keyboard focus, with a short transition. Works with mouse, keyboard and touch.

## 3. Bottom white space
The sign-in content sits at the top of a full-height panel, so everything below the version line is empty. Fix: centre the sign-in block vertically inside the available space so the logo, form, links and version line sit as one balanced group with even space above and below — on phone, tablet and desktop. The version line stays as the last item of the group rather than floating far from it.

## Technical notes
- `src/lib/demo-data.ts`: update `APP_VERSION`.
- `src/routes/index.tsx`: `text-[11px]` on the version paragraph; scroll container becomes `justify-center` with a `my-auto` content wrapper; drop `underline`, add `transition-colors hover:text-accent active:text-accent focus-visible:text-accent` on both links.
- `src/routes/settings.workforce.tsx`: same link treatment, no underline.
