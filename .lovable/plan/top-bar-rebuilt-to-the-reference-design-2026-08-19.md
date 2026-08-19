# Top bar rebuilt to the reference design

The header strip has drifted from the attached design: it is a light strip with an initials square, "Name · Role (time)" as one text line, and only two icons (bell, refresh) on the right. The design is a dark full-width bar with a specific set of items in a specific order.

## Target layout (left to right)

1. Switch-user icon (two horizontal arrows) at the far left, over the rail width.
2. Round staff avatar photo, then the staff name in bold.
3. A thin vertical divider, then a dark rounded pill containing a stopwatch icon and the role ("Manager"). The pill is the clock/shift chip, not plain text.
4. Flexible gap.
5. Right cluster, in this order: purple circular eatOS "e" badge, refresh, support headset, notification bell with a blue unread dot, wifi status icon, then the live clock as "08 : 31 AM" in large bold type.
6. Centred below the bar: the dark rounded pull-down handle with a chevron, wider and flush to the bar (it hangs from the bar, not a small outlined tab).

## Behaviour

- Bar is dark in both light and dark appearance (its own surface token), foreground white.
- Switch-user opens the PIN pad / user switch; avatar and name open the same clock pad as today.
- Role pill shows the role and, on tap, the clock-in time (kept as a tooltip/secondary line, removed from the name text).
- Refresh keeps the tickets-refresh toast; bell keeps the what's-new panel with the unread dot shown only when there is news; headset routes to customer support; wifi reflects the existing offline/online state.
- Clock ticks live, formatted with spaced colon.
- Handle keeps the existing open/close clock-pad behaviour.

## Responsive

- Desktop and tablet landscape: full bar as above.
- Narrow tablet: name truncates, role pill stays, icon cluster keeps all icons.
- Phone portrait: avatar + truncated name + role pill; icon cluster collapses to bell, wifi and clock, with refresh/support moved into the pull-down pad so nothing overflows.

## Technical notes

- Rework `src/components/pos/account-bar.tsx` (`AccountInfo`, `AccountActions`) into the design's item set and order; add the switch-user, support, wifi and clock elements there.
- `src/components/pos/clock-pulldown.tsx`: dark bar background, three-column grid replaced by left cluster / spacer / right cluster, wider bar-attached handle.
- Add a dark bar token (for example `--bar` / `--bar-foreground`) in `src/styles.css` so no hardcoded colours are used; reuse the existing `accent` for the purple badge.
- Wifi state from the existing offline detection used by `OfflineBanner`; clock from a 1s interval, no store changes.
- Presentation only: no changes to session, tickets or payment logic.
- Verify at 1440x950, 1155x713, 1024x768, 834x1112 and 393x852 with no bar overflow and no new scroll.
