# Phone header: More (⋯) menu

On phones (below the `md` breakpoint) Maya AI, Refresh, Support and What's New are hidden from the top bar to save space. Bring them back behind one More button.

## What changes
- Phone top bar gets one ⋯ button between the profile area and the Wi-Fi icon/clock.
- Tapping it opens a small dropdown under the button with four rows, each showing its icon and name: Maya AI, Refresh, Support, What's New. The What's New row keeps the blue unread dot until you open it.
- Each row does exactly what its icon does on landscape. The menu closes after you pick a row, tap outside, or tap ⋯ again. It has no X button and grey highlights.
- Tablet and desktop stay as they are: the separate icons still show at `md` and wider. The ⋯ button shows only below `md`. What's New moves into the menu on small tablets too, so it's never shown twice.

## Technical details
- `src/components/pos/account-bar.tsx` (`AccountActions`): add a `Popover` (shared, no outside X) with a trigger that has `md:hidden`. Its content uses `align="end" side="bottom"` and the same handlers: dispatch `pos:open-dashboard`, the refresh toast, navigate to `/system/customer-support`, and `openNews()`.
- Change the standalone Bell from `hidden sm:inline-flex` to `hidden md:inline-flex`.
- Check at 393x742 and 768 width, and on desktop, that nothing overflows and that each row works.
