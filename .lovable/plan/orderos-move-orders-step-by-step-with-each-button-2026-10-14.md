# orderOS: move orders step by step with each button

Each order moves one column at a time, only when you tap its button:

```text
New Order --Accept--> Preparing --Make Order Ready--> Ready --Out for Delivery--> Out for Delivery --Mark Delivered--> Completed
                                                       Ready --Ready for Pick Up--> Completed   (Pick Up / Curbside)
```

## What changes
- **A button on every card**, not only inside the detail: Preparing cards show "Make Order Ready", Ready cards show "Out for Delivery" or "Ready for Pick Up", Out for Delivery cards show "Mark Delivered". Completed cards have no button. Tapping the rest of the card still opens the detail.
- **Detail follows the order**: after tapping the button in the detail, the detail stays open on the same order in its new column, showing the next button, so you can go all the way to Completed without reopening. It closes on its own once the order reaches Completed.
- **Phone**: the status tab switches to the order's new column so you can see where it went.
- **Auto Accept** still skips only the New Order step; every later step stays manual.
- A short notice confirms each move ("Order #20 moved to Ready").
- Dine In: New Order → Preparing → Completed with the same buttons.
- Works on phone, tablet and desktop.

## Technical details
- `orderos-board.tsx`: add `onAdvance` to `OrderCard` rendering `actionLabel(o)` with `stopPropagation`; `doAdvance` keeps `selected` unless next status is completed, and sets `phoneCol` to the new status. Compute next status via a shared `nextStatus(o)` helper exported from `orderos-store.tsx` (also used by `advance`), with Dine In ready/preparing → completed.
