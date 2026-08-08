# Keyboard-aware forms on mobile

When the on-screen keyboard opens on a phone, the email/password fields must stay visible — the content should shift up instead of being covered.

## What changes

1. Add a small reusable hook `useKeyboardInset()` that tracks the on-screen keyboard height using `window.visualViewport` (resize + scroll events), returning the number of pixels the keyboard covers. Returns 0 on desktop and when no keyboard is open.

2. Sign-in screen (`/`):
   - Reserve the keyboard height as bottom padding on the scroll container so nothing is hidden behind the keyboard.
   - While the keyboard is open, switch the block from vertically centred to top-aligned so the form moves up rather than being clipped.
   - On field focus, scroll the focused input into view (smooth, `block: "center"`) after a short delay so it lands above the keyboard.

3. Apply the same behaviour to the other keyboard-facing screens so it is consistent: forgot password, create account, and the custom item / PIN entry sheets that contain text inputs.

4. Verify on mobile, tablet and desktop viewports: no layout change when no keyboard is present; footer/version line still sits at the bottom of the scroll area.

## Technical notes

- `visualViewport.height` vs `window.innerHeight` gives the inset; guard for SSR (`typeof window === "undefined"`) and read it in `useEffect` only, to avoid hydration mismatches.
- Padding applied via inline `style={{ paddingBottom: inset }}` so Tailwind classes stay unchanged.
- No changes to styling, colors, or data.
