# Smooth settings drawer collapse and swipe-to-close

## Changes
- Make both the header collapse arrow and the drawer’s bottom arrow smoothly slide the settings drawer upward, rather than abruptly hiding it.
- Allow an upward swipe over the drawer to close it, not just a swipe beginning on the bottom arrow. A completed swipe must not accidentally activate a settings shortcut or Log out.
- Preserve normal scrolling on smaller screens: scrolling the settings list should not dismiss the drawer. Use the bottom handle for unrestricted swipe closing; allow body swipe dismissal when the list is already at its bottom and cannot scroll further down.
- Keep short or cancelled gestures open, and preserve the current page and unfinished order when closing.
- Leave fonts, spacing, shortcut destinations, permissions and the rest of Settings unchanged.

## Technical details
- The current panel combines a filled opening keyframe animation with transform/opacity transitions and removes itself after a fixed 230ms delay. Replace that combination with a coordinated opening/closing lifecycle so the visible starting position is retained during collapse.
- Keep the panel mounted until its closing animation finishes, with a safe fallback for interrupted animations and immediate dismissal for reduced-motion preferences.
- Share the close path across arrows, swipe, Escape, Back and backdrop dismissal; retain existing confirmation and navigation behavior.
- Add directional gesture thresholds and click suppression after recognized swipes. Avoid capturing shortcut taps or interfering with native list scrolling.
- Limit implementation to the header drawer controls and panel-specific animation styles.

## Verification
- Check collapse from both arrows, upward swipe, cancelled gestures and rapid open/close taps.
- Confirm the drawer visibly travels upward throughout closing, disappears only when finished and reopens reliably.
- Test phone, tablet and desktop, including short landscape screens and scrollable lists.
- Verify shortcut navigation, logout cancellation, Escape/Back dismissal and preservation of unfinished orders; respect reduced-motion settings.