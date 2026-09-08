# Honest answer, then the fixes: turn-off screens against Apple's rules

Short answer: mostly yes, with three real problems. Apple's letter and the review requirements never described a turn-off flow, so nothing here breaks a numbered requirement, but the screens I just added do break rules Apple applies everywhere else in the feature, and one line of copy states something about Apple's behaviour that we cannot promise.

What is already correct: the full product name "Tap to Pay on iPhone" is used everywhere with nothing appended, no Apple artwork is imitated, and the checkout button is untouched, so turning the feature off still leaves the single-state checkout button in place (requirements 5.1 to 5.3).

## What to fix

1. Wrong claim in the confirmation copy
   Remove "Your linked Apple ID and merchant account stay linked." Apple owns what happens to the device link and the Apple ID, and it is managed in the iPhone Settings app, not by us. Replace with neutral, true lines: this iPhone stops taking contactless payments, payments already taken are unaffected, this can be set up again at any time, and anything to do with the Apple ID is managed in the iPhone Settings app.

2. The confirmation looks like an Apple system sheet
   It currently uses a fixed white background, Apple's blue and Apple's red, and Apple's pill buttons. Apple's rule is that merchant screens must not imitate system UI. Rebuild it as our own confirmation using the app's own colours and our square button shape, matching the rest of the app in both light and dark mode. This also fixes the hardcoded colours, which currently ignore dark mode.

3. Copy and titles read as our own product voice
   Keep "Turn off Tap to Pay on iPhone" as the action and title, drop the extra "?" styling of a system alert, and keep the success wording factual: "Tap to Pay on iPhone is off on this iPhone".

## Also worth doing while in here

- Note in the code, for the iOS team, that turn-off must call the real Apple unlink/deactivate API and that the resulting state belongs server side per merchant, exactly as the earlier plan noted for setup proof.
- Manager permission stays required for turning it off; guard the route itself, not only the button, so the screen cannot be reached directly by staff without permission.

## Technical notes

- `src/routes/tap-to-pay.turn-off.tsx`: replace the white/Apple-styled `Sheet` confirm step with a token-based confirmation (`bg-surface`, `text-foreground`, `border-border`, `rounded-row`, destructive token for the Turn Off action); remove `#0a84ff` and `#ff3b30`; update the bullet copy; redirect to `/settings/tap-to-pay` when `canManageSettings` is false.
- Copy stays in this route; no store shape change is needed beyond the existing `tapToPayState`.
- Verify at 1440x950, 1181x713, 1024x768 and 390x844, in light and dark, then typecheck and build.
