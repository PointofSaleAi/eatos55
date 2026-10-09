# Rework New Order guest details and order options

## What will change

### Cart header
- Put **Guest name**, **phone number**, and **arrived time** on one compact row at the top of the cart.
- Keep the row editable through the existing guest-details flow, without repeating the same guest information elsewhere.
- Place the most-used order actions directly below that row: **Custom Item**, **Discount**, **No Tax**, and **No Sale**.
- Preserve the current order type, check number, server, notes, item list, totals, Fire, and Charge behavior beneath the reorganized header.

### Three-dot options
- Use one three-dot button at the end of the cart action row.
- Tapping it opens a **right-side options panel**, following the recording’s structure while using the current eatOS theme.
- Move secondary actions into that panel: **Transfer Check**, **Service Charge**, **Add Guest**, **Gift Card**, **Sell Voucher**, **Create Deposit**, **Redeem Deposit**, **Reopen Check**, **Comp Order**, and **Cancel Order**.
- Reuse each action’s existing manager PIN, confirmation, discount, guest, and service-charge flows where they already exist. Options not yet backed by a dedicated workflow will retain a clear safe placeholder response rather than pretending the transaction completed.
- The panel closes from its outside close control, by tapping outside, or after completing an action when appropriate. Opening it must not resize the menu or cart.

### Remove duplication
- Retire the separate options sheet currently opened beside Search and consolidate those commands into the cart action row/right panel.
- Remove the present row of Discount, Transfer Check, Tax Exempt, Comp Order, and No Charge controls beside guest details after their actions are relocated.
- Keep Search dedicated to product search.

### Responsive layout
- **Desktop/landscape tablet:** keep guest details and primary actions within the cart column; the options panel slides in from the right over the screen.
- **Portrait tablet/phone:** show the same hierarchy in the Order view, allow the guest row and primary actions to fit without clipped text, and use a full-height right panel sized for touch.
- Preserve cart visibility, scrolling, totals, and bottom actions at every supported size.

## Technical details
- Rework `OrderPanel` and the phone `GuestBlock` area into a shared guest-summary/action-header so both layouts expose the same information and actions.
- Replace the order-specific use of the current bottom `MoreSheet` with a dedicated right-side order-options sheet built from the shared `SheetContent side="right"` pattern.
- Centralize the action definitions so primary and overflow controls do not drift or duplicate dialogs.
- Keep semantic theme tokens and shared Button/Sheet controls, including the standardized outside top-right close control.

## Verification
- Test guest editing and every moved action from an order containing items.
- Confirm the right panel overlays instead of shrinking the order screen and closes correctly by all supported methods.
- Verify empty guest values, long guest names, phone formatting, arrived/not-started states, and no duplicate controls.
- Verify phone, portrait tablet, landscape tablet, and desktop layouts, including keyboard/touch focus, readable hover states, and no overlap with Fire/Charge controls.
