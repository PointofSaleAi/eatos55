# Payment Method: Split Check in Standard, only enabled tenders, no scrolling

## 1. Split Check joins Standard

Split Check is currently a wide banner button above the groups. It becomes a normal tile inside the **Standard** group, alongside Cash, Manual Card, Manual CC and External CC, with the same icon + label treatment as its neighbours (the "Split evenly, by item or by amount" line drops, since no other tile carries a subtitle). Tapping it still opens `/payment/split`.

## 2. Tiles only show when the method is enabled

Today Room Charge is always rendered and just dimmed with "Enable in Settings" when Room service is off, and every other tender is hard-coded on. Instead:

- A new **Payment Methods** screen under Settings > Payments lists every tender with an on/off switch: Cash, Manual Card, Manual CC, External CC, Split Check, Account, House, Gift Card, Loyalty, In-kind, Room Charge, Uber Eats, Doordash, Grubhub.
- The payment screen renders only the enabled ones. No dimmed placeholder tiles, no "Enable in Settings" note.
- Room Charge stays tied to the Room service module: it is only offered when Room service is on (and its own switch is on).
- A group whose tenders are all off disappears with its heading, so no empty sections.
- Cash cannot be switched off, so a check can always be tendered.
- Sensible defaults keep the current visible set (Room Charge off until Room service is enabled).

## 3. No scrolling on the payment screen

The right pane scrolls because the intro paragraph, four group headings and up to 14 tiles are stacked at a fixed tile height.

- The intro paragraph is trimmed to one short line and hidden below tablet height, where space is tightest.
- Tiles become a single auto-fitting grid that shares the available height: rows size to the space left over (`auto-rows-fr`, min tap height respected), and column count adapts from 2 up to 4 by width.
- Group headings become compact inline labels so they cost a single small row each.
- The receipt pane keeps its own internal scroll only when the item list genuinely exceeds the pane; short checks do not scroll.
- Target: zero vertical scrollbars at 1440x950, 1155x713, 1024x768, 834x1112 and 393x852 with the full enabled tender set. If a very long enabled list still cannot fit on the shortest phone, the grid pages (Prev/Next) instead of scrolling, matching the Select Room grid.

## Technical notes

- `src/lib/pos-store.tsx`: add a `tenders: Record<TenderId, boolean>` map to settings with defaults, plus a setter; persisted with the existing settings persistence.
- `src/routes/payment.method.tsx`: move Split Check into the Standard group array, filter every group by the tender map (and `settings.roomService` for Room Charge), drop the unavailable/dimmed branch and the `Settings` link tile, and convert the scroll container to a height-sharing grid with the same paging hook approach used by `room-charge-dialog.tsx`.
- New `src/routes/settings.payment-methods.tsx` using the existing `GroupCard` / switch rows, linked from `src/routes/settings.payments.tsx`.
- Presentation and settings only: totals, `commitPayment`, room charge and reference-tender dialogs are unchanged.
- Verified on phone, tablet and desktop widths.
