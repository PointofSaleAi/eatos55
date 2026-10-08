# Consistent modal close control

## Goal
Make every user-facing modal and bottom sheet that uses an X close control match one pattern: the X sits just outside the modal's top-right corner, as shown in the reference, without copying the reference UI.

## Changes
- Create one reusable modal close control with a consistent icon size, color, focus state, and 44px touch target.
- Update the shared dialog and sheet foundations so their default close icon uses that control automatically.
- Replace modal-specific header X buttons with the shared outside control, including product, guest, payment, room-charge, room-bill, split-payment, amount-entry, reference-tender, and similar overlays.
- Preserve each modal's current close behavior, title alignment, content, actions, and dismissal rules.
- Keep non-modal X icons unchanged, including remove-item chips, clear-search controls, sort-menu dismissal layers, navigation controls, and page-level tools.
- Keep intentional back arrows and Cancel/Done actions unchanged because they represent navigation or decisions rather than a modal X.

## Responsive behavior
- Centered dialogs: position the X immediately beyond the top-right corner over the dimmed backdrop.
- Phone bottom sheets and edge-bound panels: place the X above the sheet's top-right edge with safe-area spacing so it remains visible and tappable.
- Tablet and desktop sheets that become centered dialogs: use the same outside-corner placement as other dialogs.
- Prevent clipping by modal overflow and preserve keyboard, drag-to-close, and backdrop-close behavior.

## Technical approach
- Extend the shared dialog/sheet close rendering rather than duplicating placement classes throughout the app.
- Add a reusable close-button variant for custom controlled modals that currently suppress the default close button.
- Use semantic theme tokens and the existing accessible close labels; no hardcoded reference colors.
- Audit all dialog and sheet call sites after the shared update to avoid duplicate X controls.

## Verification
- Test representative centered dialogs, bottom sheets, nested flows, and large payment overlays.
- Verify phone portrait, tablet portrait/landscape, and desktop sizes.
- Confirm the X is outside, consistently aligned, keyboard-focusable, not clipped, and closes only its intended modal.
- Confirm no duplicate close icons and no changes to clear/remove/back icons outside modal close controls.
