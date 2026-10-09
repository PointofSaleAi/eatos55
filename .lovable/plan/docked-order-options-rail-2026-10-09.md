# Docked order-options rail

## Goal
Match the reference behavior when the fixed three-dot control is tapped: open a narrow options rail at the far right while keeping the product list and cart visible in reduced widths.

## Changes
- Lift the options-open state to the New Order screen so the product list, cart, and options rail resize together.
- Keep the three-dot control fixed beside the primary cart actions; while open, show a clear close state in the same position.
- On landscape tablet and desktop, render Order Options as a third, docked column with no dark overlay:
  - product list remains the flexible main area;
  - cart contracts to a usable compact width;
  - options appear as the narrow icon-and-label rail shown in the reference;
  - opening and closing animates widths smoothly without covering content.
- Preserve the existing actions and flows: Transfer Check, Service Charge, Add Guest, Gift Card, Sell Voucher, Create/Redeem Deposit, Reopen Check, Comp Order, and Cancel Order.
- On phone and narrow portrait layouts, retain a right-side overlay panel because three simultaneous columns would make the menu and cart unusable; use the same controlled open/close state and actions.
- Keep the current eatOS theme, guest fields, cart contents, product grid, and order logic unchanged.

## Responsive validation
- Verify desktop, landscape tablet, portrait tablet, and phone layouts.
- Confirm the three-dot control never scrolls away.
- Confirm the product grid reflows, the cart remains readable, and the docked rail does not overlap the header, left navigation, or footer actions.
- Exercise every option from the docked rail and the narrow-screen panel, including their nested prompts and close behavior.
