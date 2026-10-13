# Simplify the Gift Card modal

Three edits in the Gift Card window opened from the cart's three-dot panel:

1. **Available balance becomes one quiet line.** It reads `Available balance` with the amount on the same row, and it is only present once the typed card is recognised. No `Enter card number`, no `New card`, no `No existing balance found`, no explanatory second sentence, no divider.
2. **The `Gift Card` header row goes away** on both tablet/desktop and phone. The window opens straight to its content.
3. **Card number entry stays as it is** — the field remains for typing or scanning a card, since the recognised number is what drives the balance line and the charged card.

## What the screen looks like after

```text
wide (tablet / desktop)
+----------------------------------------------+
|  (grabber: none)                             |
|  Enter gift card details                     |
|  Purchase a new card, add funds, ...         |
|  [i] Adding funds activates a new card       |
|  [ Gift card number                ]         |
|  [ Amount                        ]           |
|  Available balance              $120.00      |
|                                    [ num ]   |
|                                    [  pad ]  |
|  [ Charge $25.00                           ] |
+----------------------------------------------+

phone (bottom sheet)
+----------------------------------------------+
|                  ------                      |
|  Enter gift card details                     |
|  ...                                         |
|  Available balance              $120.00      |
|  [ num pad ]                                 |
|  [ Charge $25.00                           ] |
+----------------------------------------------+
```

Before a card is recognised, the balance row is simply absent — the space is left empty rather than filled with a prompt.

## What does not change

- The intro heading `Enter gift card details`, its one-line subcopy, and the activation info row stay, because only the balance block and the `Gift Card` title row were named.
- Amount entry, the number pad, the `Charge` button and its enabled/disabled rule are untouched.
- Charging still loads the card and drops the tax-exempt `Gift Card - XXXX` line on the order.
- The separate payment-side window (`Payment By Gift Card`) is not part of this change.

## Technical details

File: `src/components/pos/gift-card-dialog.tsx`

- Delete the `border-t border-border pt-3` balance block and its three text nodes; replace with a single `flex items-baseline justify-between` row rendering `money(balance)`, wrapped so it is not mounted when `balance === null`.
- Delete the `balanceStatus` variable (becomes unused) and the `isNewCard`-based copy branches that only fed it; `isNewCard` itself stays for the charge toast.
- Wide branch: remove the `border-b border-border px-4 py-3` bar containing `DialogTitle`, and render `DialogTitle` with `className="sr-only"` inside `DialogContent` so the window keeps an accessible name (Radix requires a labelled dialog).
- Narrow branch: remove the visible `SheetHeader` / `SheetTitle` row, keep `SheetGrabber` and its drag handlers at the top, and render `SheetTitle className="sr-only"` — the same header-less pattern already used in `src/components/pos/item-sheet.tsx`.
- No store or data changes: `giftCardBalance`, `loadGiftCard` and `addGiftCardLine` in `src/lib/pos-store.tsx` keep their current signatures, so the card number typed here still flows through to the balance lookup and the order line.
- Both layouts are handled in this one component, so phone, tablet and desktop all pick up the change.

## Verification

- Build log check for errors.
- Browser pass at 1280x800 and 390x844: open New Order, add an item, open the three-dot panel, tap Gift Card. Confirm no `Gift Card` title row, no `Enter card number` wording anywhere, the balance row absent before typing, the balance row appearing as a single line for a recognised card, and Charge still adding the `Gift Card - XXXX` line to the cart.
