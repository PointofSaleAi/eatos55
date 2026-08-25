# Fix: Charge button blocked by Handheld preview control

## What is happening

The Charge button is visible, but in the current desktop preview the floating `Handheld preview` control sits directly over the bottom-right of the app frame. In the uploaded screenshot, that pill overlaps the Charge button area, so tapping/clicking Charge can hit the preview toggle instead of the POS action.

The payment screen also intentionally disables the bottom payment action until a tender is selected, but the screenshot shows a separate overlap problem that makes the main Charge CTA hard or impossible to press.

## Fix

1. Move the `Handheld preview` toggle out of the app interaction area so it never overlays POS controls.
   - On wide browser previews, place it at the top-right outside the framed device, or make it a small developer-only floating icon away from the bottom action bar.
   - Keep it available for design review, but not inside the tappable POS surface.

2. Keep the real POS bottom actions clear.
   - Ensure Order screen `Charge`, Payment Method CTA, and bottom navigation stay above safe-area spacing and are not covered by any preview-only UI.
   - Preserve the actual POS design and layout. No redesign, no logo changes, no data changes.

3. Add a guard for framed preview mode.
   - When the app is in handheld/framed preview on a wide browser, reserve outside-frame space for the preview toggle rather than stacking it on top of the device.

## Verification

Use the live app in the same kind of viewport shown in the screenshot and verify:

- The `Handheld preview` control no longer overlaps Charge, Fire, bottom tabs, or payment actions.
- Tapping Charge from the order screen opens `/payment/method`.
- Selecting a tender on `/payment/method` opens the amount keypad or tender dialog.
- Completing the tender shows the payment completion dialog.
- Checks pass at phone portrait, tablet portrait, tablet landscape/POS, and desktop preview sizes.

## Scope

Interaction fix only. This does not change payment rules, tender availability, order data, logos, assets, or the responsive density work awaiting approval.
