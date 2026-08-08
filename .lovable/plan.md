# Fix the burger drawer + tidy the New Order header

## What's wrong (verified in your live preview)

I clicked the burger in your preview: the button exists, but no drawer appears — and the bottom navigation bar is also absent on this screen. Both the drawer and the bottom tabs are only rendered when the app thinks you are clocked in. On this session that flag is false, so the burger renders (it never checks) but the drawer it opens is not mounted at all. That's the whole bug — nothing to do with the drawer's own markup.

## Changes

1. Burger always works
   - Mount the navigation drawer for every app screen, independent of the clocked-in flag.
   - Hide the burger only on the pre-login screens (device setup, login, forgot password, create account) instead of relying on session state.

2. Bottom navigation always present
   - Show the 5-tab bar (Home, Order, Tickets, Board, Settings) on all app screens, again not gated on the clocked-in flag. It stays hidden on pre-login screens and while the on-screen keyboard is open (unchanged).
   - This answers "should there not be a bottom navigation for common links" — the tabs are the urgent/common links; the burger drawer stays as the full map.

3. New Order header cleanup
   - Order left to right: burger, guest block (flexes), then right-aligned icon cluster: search, custom item (icon), more (3 dots) last, so the 3-dot menu is the right-most control.
   - Custom Item becomes an icon button (tag/plus-square icon) with `aria-label` + tooltip, freeing horizontal space on 320–393px phones.
   - Keep search as an icon toggle (it is useful — menus have many items), but it now sits in the right cluster rather than mid-row.
   - Move the Wi-Fi/server status out of this row (it already lives in the header/clock area) so the row is not crowded.

4. Same treatment on tablet/desktop and landscape
   - Header cluster and bottom tabs verified at 320, 393, 768 and desktop widths; landscape keeps the side rail plus the drawer.

## Verification

Playwright pass at 320 / 393 / 768 / 1280: burger opens the drawer and closes on backdrop tap, bottom tabs visible and routing, New Order header shows no truncation, 3 dots right-aligned.

## Technical notes

- `src/components/pos/shell.tsx`: `DeviceFrame` renders `NavDrawer` and `BottomTabs` based on route (public auth routes excluded) rather than `session.signedIn`; `MenuButton` unchanged.
- `src/routes/order.new.tsx`: reorder header children, swap the Custom Item pill for an icon button, drop the inline Wi-Fi badge.
