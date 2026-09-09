# Fix the payment screen on phones

On a phone the order summary at the top is taking whatever height it wants, so the payment methods below it get squashed: the list is cut off mid-way ("STANDARD" is sliced in half) and the big "Select a payment method" button ends up sitting on top of the bottom tab bar. On tablet and desktop, where the summary sits in its own column beside the methods, the screen is fine.

## What is causing it

In `src/routes/payment.method.tsx` the two-pane wrapper stacks on phones, but the summary column is marked as never-shrinking while its inner content is free to grow. So the summary claims its full natural height first and the methods pane gets only the leftover, which is not enough for the group headings, tiles and footer. The methods pane measures that squeezed height and lays out into it, which is why the list looks clipped rather than scrollable.

A second thing makes it worse on this preview: on anything that is not an iPhone, the "Tap to Pay on iPhone" button is still rendered full width with the "Available on iPhone only" note under it, eating another chunk of the little vertical space a phone has.

## What changes

- On phones the order summary becomes a bounded, scrollable block (roughly a third of the screen, with its own scroll) instead of an unbounded one, so the payment methods always get the space they need. Tablet and desktop columns are untouched.
- The payment methods pane keeps a guaranteed minimum height on phones and scrolls when the tender list genuinely does not fit, instead of clipping.
- The action button row stays pinned above the bottom tabs with correct safe-area and tab-height padding, never overlapped.
- The Tap to Pay button keeps Apple's rules where it applies: on iPhone it stays first, full width, above the fold, single state. On a device where it cannot be used, it collapses to a single compact disabled row with the note inline, so it stops stealing height on small screens.

## Technical notes

- `src/routes/payment.method.tsx`: remove `shrink-0` from the phone summary column and give it `max-h-[38dvh] md:max-h-none` with `min-h-0`; give the grid column `min-h-0 flex-1`.
- Keep the existing ResizeObserver fit solver as-is; it will now measure a real pane height, so `fit.fits` correctly decides between the fit-to-pane and scrolling modes.
- Tap to Pay block: when `!ttpDevice.available`, render label and `TTP_DEVICE_NOTE` on one shorter row (`h-ctl-md`, note inline, `text-fs-xs`) rather than button plus paragraph.
- No changes to tender logic, settings, or the Tap to Pay flows.
- Verify at 390x844 and 430x932 (phone), 768x1024 and 1024x768 (tablet), 1440x950 (desktop), with both the iPhone and non-iPhone cases, plus a typecheck.
