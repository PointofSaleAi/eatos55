# Cart arrival time: live clock instead of "Not started"

## What changes

The cart will always show **ARRIVED AT** followed by a time — never "Not started".

- On an empty cart the time is the **live clock**: it matches the device time and moves forward as the clock advances.
- The moment the **first item lands in the cart**, the arrival time **freezes** at that instant and stops tracking the clock.
- Cancelling or completing an order clears the cart, so the line goes back to the live clock.

This applies to all three places that show arrival time:

1. Cart header row (next to guest name and phone) on New Order
2. The table chip in the cart (the pill with the table name and footprint icon, currently showing "--")
3. The guest line on the Custom Item screen

Label reads `ARRIVED AT 4:34 PM` (uppercase label, time in the existing app format).

## How it behaves

```text
empty cart          ARRIVED AT 4:34 PM   <- ticks to 4:35 PM on its own
first item added    ARRIVED AT 4:35 PM   <- frozen from here on
cancel / new order  ARRIVED AT 4:41 PM   <- live again
```

## Technical details

**New shared hook** — `src/lib/use-live-time.ts` exports `useLiveTime(): string`.
- Returns `formatTime(new Date())` from `src/lib/brand.ts` (already gives "4:34 PM").
- `useEffect` interval aligned to the next minute boundary, then every 60s; state is only updated when the formatted label actually changes, so the cart re-renders once a minute rather than every tick.
- SSR-safe: renders the label only after mount (no hydration mismatch), consistent with how `clock-panel.tsx` handles its live time.

**Renderers** (each calls the hook unconditionally and falls back to it):
- `src/components/pos/order-panel.tsx:426` — `ARRIVED AT {arrivedAt || liveTime}`, replacing `arrivedAt ? \`Arrived ${arrivedAt}\` : "Not started"`.
- `src/components/pos/order-panel.tsx:453` — table chip shows `arrivedAt || liveTime` instead of `arrivedAt || "--"`.
- `src/components/pos/guest-block.tsx:25` — `· ARRIVED AT {arrivedAt || liveTime}`.

**Freeze consistency in `src/lib/pos-store.tsx`** — `addItem` (line 1689) and `addGiftCardLine` (1729) already capture the time with `setArrivedAt(a => a || formatTime())`. Two cart-entry paths do not, so they would keep ticking after items exist:
- `addCustomItem` (1708)
- `mergeTicket` (1818)

Both get the same `setArrivedAt((a) => a || formatTime())` guard. `startOrder` (1508) already freezes at table start and `cancelOrder` (1778) already clears the value — both unchanged.

**Verification** — Playwright at desktop 1290×796, tablet 768×1024, phone 390×844, manager session restored from localStorage:
- Empty cart shows "ARRIVED AT" plus a time equal to the device's current time; no "Not started" text anywhere.
- Using Playwright's clock control to advance 60s, the empty-cart label advances by a minute.
- After adding an item the label stops changing while the clock keeps advancing; after cancel it tracks the clock again.
- Table chip and Custom Item guest line show the same value; no horizontal overflow at any width.
- `bunx tsgo --noEmit` clean and build OK.
