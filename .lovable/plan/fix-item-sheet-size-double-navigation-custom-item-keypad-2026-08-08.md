# Fix item sheet size, double navigation, custom-item keypad

Three fixes, all presentation-only, verified on mobile, tablet and desktop.

## 1. Item / modifier sheet is oversized and off-design

The sheet is portalled to the page body, so on tablet and desktop it stretches to the whole browser window instead of staying inside the handheld frame — that's why the type and buttons look huge.

- Constrain the sheet to the device frame width (centered, same max width as the phone frame) so it looks identical at every viewport.
- Bring the internals back to the app's type/spacing scale: item title at the same size as other screen titles, price pill and quantity select at standard control height, notes field one row, ITEM / ADD-ONS toggle at chip height, modifier options in a two-up grid with normal body text.
- Keep the footer (discount circle + full-width black ADD button) pinned, single line, no clipped text.
- Same treatment for the discount sheet and the More sheet so all three match.

## 2. Two navigations on the order screen

Today `/order/new` stacks three bars: the Custom Item / Menu / Server Connected strip, the Review order button, and the global bottom tab bar.

- Match the live app: on the order screen the Custom Item / Menu / Server Connected strip plus the Review order button are the footer; the global bottom tab bar is not repeated there.
- All other screens keep the bottom tab bar as-is, so Home, Tickets, Board and Settings stay reachable (the order screen keeps a back path via the tabs on the previous screen and the rail in landscape).

## 3. Custom item needs a full keypad

- The keypad grows to fill the space between the amount display and the Add to order button instead of sitting as a short block with a large empty gap.
- Keys stretch with the available height (tall backspace and `+` column preserved), so on a phone the pad occupies the lower half of the screen as in the live app; on tablet/desktop it fills the framed area.

## Technical notes

- `src/components/pos/item-sheet.tsx`, `discount-sheet.tsx`, `more-sheet.tsx`: add a shared width/typography wrapper class on `SheetContent` (`mx-auto w-full max-w-[420px]`) and downscale text/control classes to the existing tokens.
- `src/routes/order.new.tsx`: drop `<BottomTabs />`.
- `src/routes/order.custom-item.tsx` + `src/components/pos/numpad.tsx`: make the order-variant grid `flex-1` with `auto-rows-fr` so keys expand vertically.
