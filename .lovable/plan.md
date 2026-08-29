# Pull-down handle opens the Settings menu, not the PIN pad

Today the small handle hanging under the dark top bar opens the clock/PIN keypad. In the real POS it pulls down the main settings map: a full-screen dark overlay with large headings (Restaurant, Menu, Payment, Workforce, Reports, Advanced, Guestbook, Support, Log out), each with a one-line description. This change moves that behaviour over.

## What changes

1. The handle under the top bar opens the settings pull-down overlay. Pulling again (or the chevron flipping up) closes it.
2. The PIN keypad stays reachable exactly where it is in the real app: the "switch user" control on the left of the top bar, which already opens it. No PIN functionality is lost.
3. The overlay matches the reference: dark full-screen sheet, three columns on tablet and web, one or two columns on a phone, each entry a thin vertical accent rule, icon, large underlined title and a short description. Tapping an entry closes the overlay and navigates.
4. Log out keeps the existing confirmation before signing out, then returns to the login screen.

## Entry mapping

| Entry | Goes to |
| --- | --- |
| Restaurant | /settings/general |
| Menu | /settings/menu |
| Payment | /settings/payments |
| Workforce | /settings/workforce |
| Reports | /settings/sales-summary |
| Advanced | /settings/more |
| Guestbook | /rooms (guest and order history view) |
| Support | /system/customer-support |
| Log out | confirm, sign out, back to / |

Advanced renders dimmed like the reference when the current staff role is not a manager or owner, and is not tappable in that state.

## Technical notes

- New component `src/components/pos/settings-pulldown.tsx` holding the overlay grid and its entry list.
- `src/components/pos/clock-pulldown.tsx` keeps the dark bar and the handle, but the handle now toggles the new overlay; the existing PIN pad block stays in the file and is opened only by `AccountInfo onSwitchUser`.
- Entry list reuses the copy from the reference screenshot verbatim, and the icons come from lucide (LayoutGrid, Utensils, CircleDollarSign, Users, BarChart3, SlidersHorizontal, BookMarked, Headset, LogOut).
- Overlay uses the existing `bg-gate-overlay` token, `useBackDismiss` for hardware back, and no new dependencies.
- No store or data changes.
