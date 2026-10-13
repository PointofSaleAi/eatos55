# Move the tab nav and status columns up on orderOS

## What you'll see

The DINE IN / ONLINE tabs and the status column headings (New Order, Preparing, Ready, Out For Delivery, Completed) sit right under the black top bar. The empty band your red box marks — the space the removed title used to occupy — is gone, so more orders are visible without scrolling.

## How it works

The tabs and the round action buttons (order history, refresh, clear filters, time) move onto a single row: tabs on the left, buttons on the right. That single row replaces the current stack of button row plus tabs row, which is what pushed everything down. Vertical padding around that row and above the columns is tightened.

Current measured spacing (identical on phone, tablet and desktop):

```text
black top bar ends        y = 56
   [ 68px empty band ]    <- action buttons + padding, nothing on the left
tabs row                  y = 124 - 180
   [ ~39px gap ]
first column heading      y = 219
```

Target after the change:

```text
black top bar ends        y = 56
   [ 12px ]
tabs row = action row     y = 68   (tabs left, buttons right)
   [ ~25px ]
first column heading      y = ~140
```

Nothing else changes: the columns, order cards, sort arrows, channel switching, and the three buttons keep working exactly as they do now.

## Technical details

Single file: `src/routes/board.index.tsx`.

- Header block (`px-4 pb-3 pt-4`) becomes `px-4 pb-3 pt-3`.
- The `flex items-center justify-end` row and the separate `mt-3` tabs block merge into one `flex items-center justify-between` row containing the channel-tabs pill (left) and the action-button group (right). The tabs lose their `mt-3`.
- Board body `flex h-full min-w-max gap-3 px-4 py-4` becomes `... pt-3 pb-4`.
- The board's own time label gets `hidden sm:inline` so phone widths (390px: tabs 192px + buttons 128px = 320px inside a 358px content area) keep one row without crowding; the top bar already shows a clock on phones, so no information is lost. The time stays visible from the small breakpoint up, where there is room.
- Verified by rendering `/board` at 1280x900, 834x1112 and 390x844: tabs start ~12px below the top bar, column headings ~25px below the tabs, no overlap or horizontal squeeze at any width.
