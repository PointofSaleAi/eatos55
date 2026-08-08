# Portrait-phone optimization pass

Goal: every existing screen is a portrait phone screen, tuned to look right from 320px up to 430px wide, and the item sheet stops feeling oversized. Landscape/desktop/tablet layouts are treated as separate work, not squeezed into these screens.

## 1. Item sheet size fix (the screenshot)

Current sheet uses large type, 40-44px pill controls, full-width stacked modifier buttons, and can grow to 85% of screen height.

- Cap height at 78dvh, keep a single scroll area, keep header/footer pinned so the ADD button is always visible (in the screenshot it is clipped).
- Tighten scale: title to base/semibold-uppercase, controls to 36px height, notes field 40px, ITEM/ADD-ONS tabs 36px, modifier chips 30px, option buttons 40px in a 2-column grid with smaller radius and text-[13px].
- Reduce vertical padding between blocks from 12-16px to 8-10px so the whole sheet fits without scrolling on a 736px-tall phone.
- Same trim applied to the More sheet, Discount sheet and Menu sheet so all bottom sheets share one compact scale.

## 2. One portrait scale across phone widths

- Introduce a small set of shared size tokens/utility classes (control height, chip height, section gap, screen padding) used by the sheets, headers, rows and footers, so a single change re-tunes every screen.
- Verify and fix on three widths: 320 (SE), 393 (current), 430 (Pro Max). Fix the clipping/overflow found: category chip strip, menu item cards, tickets rows, settings rows, keypads, payment tiles.
- Headers/rows follow the grid + min-w-0 + truncate rule so long names (Guest Name, table names, ticket ids) never push layout.

## 3. Portrait-only, no landscape hacks

- Remove the landscape-only behaviour currently baked into these screens: the dark NavRail shown at `max-md:landscape` and the bottom-tab hiding tied to it. Portrait bottom tabs become the only navigation for these screens.
- The framed device preview on wide viewports stays (it is how a phone screen is shown on a desktop browser), but no screen changes its layout based on orientation.
- Desktop/tablet/landscape versions of these screens are a separate, later build; nothing in this pass tries to serve them.

## Technical notes

- Files touched: `src/components/pos/item-sheet.tsx`, `more-sheet.tsx`, `discount-sheet.tsx`, `menu-sheet` usage in `src/routes/order.new.tsx`, `src/components/pos/shell.tsx` (ScreenHeader/SubHeader/ScreenBody/ScreenFooter/BottomTabs), `nav-rail.tsx` (no longer mounted), `numpad.tsx`, `primitives.tsx`, `settings-rows.tsx`, `tickets-screen.tsx`, plus small padding/typography edits in affected routes.
- No data, store or business-logic changes — presentation only.
- Verification: Playwright screenshots at 320x568, 393x736, 430x932 for order/menu, item sheet, tickets, payment, settings and login.
