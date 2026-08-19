# Room charge sign-off and one-screen payments

Two changes: room charge gets a print-and-sign step before it posts (with tips added later from the ticket), and amount entry moves onto the payment screen itself so one check can take several tenders without leaving the page.

## 1. Room charge: print, sign, then post

In the Select Room dialog, after a room is picked the detail step keeps everything it shows today and changes its footer into a two-stage flow:

1. Primary button becomes "Print bill for signature". Tapping it marks the bill as printed (toast plus a printed timestamp) and reveals a short confirmation strip: "Bill printed - collect guest signature".
2. Only then does "Post charge to room 104" become available. A "Reprint" link stays next to it.
3. No tip field anywhere in this flow. Instead the strip states that the tip is added later from the ticket.

After posting, the ticket is created with the room charge recorded as its payment and stays open for a tip, so the existing Add Tip action on the ticket detail page is the single place a room-charge tip is entered. The ticket shows the room and booking number so staff can match the signed slip.

## 2. No separate cash page: all tenders on one screen

The payment method screen keeps its receipt pane and tender grid, and gains an amount panel in place of navigating away:

- Tapping Cash, Manual Card, Manual CC, External CC, Account, House, Gift Card, Other opens the keypad inline on the same screen (in a side panel on wide screens, a bottom panel on phones), prefilled with the remaining balance. Cash also shows the denomination pills.
- Confirming an amount below the balance records a partial payment, closes the panel, and returns to the tender grid with the balance reduced, so a guest can pay part cash and the rest by card without leaving the page.
- A "Payments on this check" strip lists each tender taken with its amount, with a remove action, and the header shows Total / Paid / Balance.
- Confirming an amount that clears the balance completes the order and moves to the success screen; cash over the balance still shows change due.
- Split Check and Room Charge behave as they do now (split screen, room dialog).

Old links keep working: `/payment/cash`, `/payment/card` and `/payment/tender/$kind` redirect to `/payment/method` with the matching tender preselected, so nothing dead-ends.

Every state is checked on phone, tablet and desktop widths with no page scrolling.

## Technical notes

- `src/components/pos/room-charge-dialog.tsx`: add local `printedAt` state, two-stage footer, reprint action, remove nothing from the current detail grid.
- `src/lib/pos-store.tsx`: extend the partial-payment path to record method plus amount (a `pending` payments array) instead of only a running total, so the strip can list and remove entries; room charge posts through `commitPayment("room", ...)` carrying room number and booking number onto the ticket, left open for a tip.
- `src/routes/payment.method.tsx`: replace tender `navigate` calls with an inline panel that reuses `TenderScreen`'s keypad logic; extract the keypad body from `src/components/pos/tender-screen.tsx` into a reusable `TenderPad` so both the panel and any remaining route use one implementation.
- `src/routes/payment.cash.tsx`, `payment.card.tsx`, `payment.tender.$kind.tsx`: become redirects with a `tender` search param.
- Tip entry stays in `src/components/pos/tip-sheet.tsx` / `tickets.$ticketId.tsx`; only the room-charge ticket fields are added.
