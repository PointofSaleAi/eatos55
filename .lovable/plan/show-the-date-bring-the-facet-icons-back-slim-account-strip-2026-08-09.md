# Show the date, bring the facet icons back, slim account strip into the grey band

## 1. Name / notifications / refresh move into the top grey band

The white account card is removed. Its content moves into the thin grey strip at the very top, arranged around the existing pull-down chevron:

```text
 EC  Elizer Cruz · Supervisor (5:43 PM)     ⌄     🔔  ⟳
```

- Left: small initials chip, then name in bold with role and clock-in time in muted text beside it (one line, truncates on narrow phones).
- Centre: the existing pull-down handle stays exactly where it is, so the clock/PIN pad still opens.
- Right: bell (What's New popover) and refresh, as small ghost circles.
- Tap targets stay 44px; the strip is one compact row instead of a 64px card, so the tickets header starts higher.
- Because this lives in the shell, every screen gets the same strip, not just Tickets.
- Phone: name only (role/time hidden if space is tight). Tablet/desktop: name, role and time all shown.

## 2. The date is always fully visible

On the tickets header the date pill currently competes with the title and three icons and gets truncated. Fix:

- The `Tickets` title and burger keep row one, with search / sort / filter on the right.
- The date stepper (`‹  📅 31 Jul 2026  ›`) gets its own centred row and never truncates.

## 3. The facet icons come back

The icon row from the live app returns under the date, as circular outlined buttons: Revenue Center, Employee, Order Type (receipt), Payment (card), My Tickets (person), Sync (refresh).

- Tapping one opens that facet's option list directly (no going through the Filters sheet).
- An active facet gets a pink ring and pink icon, exactly like the uploaded screenshot; tapping an active icon again clears it.
- `My Tickets` toggles on/off; `Sync` refreshes.
- The Filters sheet stays as the full multi-facet view.
- Phone: the row is centred and scrolls horizontally only if it can't fit. Tablet/desktop: it sits inline to the right of the date.

## Technical notes

- `src/components/pos/account-bar.tsx`: becomes the compact inline strip (`AccountStrip`) with the What's New popover anchored under the bell.
- `src/components/pos/clock-pulldown.tsx`: the handle row becomes a 3-column grid — account info, handle, actions — so the account strip and chevron share one band.
- `src/components/pos/shell.tsx`: nothing structural; the strip renders inside the pull-down band for all app-chrome screens.
- `src/components/pos/tickets-screen.tsx`: remove `<AccountBar />`, split the header into title row + date row + facet icon row, and add a per-facet popover/sheet driven by the existing `filterFacets` config and `filters` state.
- Verify at 320, 393, 430, 834 and 1280 widths.
