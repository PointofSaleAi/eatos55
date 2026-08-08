# Ordering + modifiers screens, and rail only in landscape

Two things from your message: the item-ordering flow (tap an item, pick modifiers, set quantity, add) is missing, and the dark left rail should not appear in mobile portrait.

## 1. Left rail is landscape/tablet only

- Hide the rail in mobile portrait; show the bottom tab bar there instead (Home, Order, Tickets, Board, Settings).
- Show the rail from tablet/landscape width upward, where it replaces the bottom tabs — same slim dark strip that expands on tap, as in the staging screenshot.
- The pull-down clock handle stays on all sizes.

## 2. Item detail / modifiers sheet (screens 3.46.30, 3.46.44, 3.47.00)

Tapping a menu item opens a bottom sheet instead of adding straight to the cart:

- Header row: item name, editable price pill `$20.00` with pencil, quantity pill `1` with a dropdown listing 1-10.
- `Item Notes` field with note icon.
- `Item` / `Add-Ons` segmented toggle (black active pill).
- `Additional Modifiers` group chips (e.g. Bread, Sandwiches Sides, Sides); selecting a group shows its options (Baguette, Foccacia, Lettuce Wrap) as selectable chips.
- Footer: discount badge button on the left, full-width black `ADD - $20.00` that reflects quantity, price edit and any priced add-ons.
- Discount badge opens a second sheet with radio rows: Comp Meal 100%, Employee Shift 50%, Police & Fire 20%.

## 3. Menu browsing parity (screen 3.45.02)

- Menu picker dropdown (`BAR MENu`) plus menu chips `BRUNCH`, `DINNER` beside it.
- Category chip row under it (`BRUNCH SANDWICHES`, `BRUNCH BEVERAGES`, `BRUNCHY DRINKS`, `BRUNCH COFFEE`), active chip outlined white, others grey.
- Item cards get the boxed `+` at top-left, name, and a price row divider, three-up on wider screens and two-up on phones.

## 4. "More" sheet (screen 3.47.32)

The `…` header button opens a sheet titled `More` with icon rows: `Service Charge`, `No Tax`, `Discount`, `Open Register`. Service Charge and Discount open amount/percentage entry; No Tax toggles tax off on the current order; Open Register logs a register-open action.

## Technical notes

- Data: extend `src/lib/demo-data.ts` with `menus` (Bar/Brunch/Dinner), per-menu categories, brunch sandwich items and prices from the screenshot, `modifierGroups` with options, and `discountPresets`.
- New components: `src/components/pos/item-sheet.tsx` (item detail + modifiers), `src/components/pos/discount-sheet.tsx`, `src/components/pos/more-sheet.tsx`, all built from the existing sheet/primitives styling.
- `src/lib/pos-store.tsx`: `addItem` accepts quantity, price override, notes, selected modifiers and a line discount; order-level `noTax` and service charge added to totals.
- `src/components/pos/shell.tsx` / `nav-rail.tsx`: responsive gating so rail is `hidden md:flex` and bottom tabs `md:hidden`.
- Verified on mobile, tablet and desktop viewports before finishing.
