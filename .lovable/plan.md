# Merchant-controlled product modifiers

Today, Course is automatically attached by product category and is hardcoded as required. The Modifiers settings page only edits display rows, so changing it does not affect the ordering screen.

## What will change

- Make modifier rules part of each product's menu setup rather than applying them automatically to every product in a category.
- In Menu settings, let a manager open a product and manage its available groups with simple controls:
  - Course: Off / Optional / Required
  - Bread: Off / Optional / Required
  - Temperature: Off / Optional / Required
  - Preparation: Off / Optional / Required
  - Allergy: Off / Optional / Required
  - Sides and Add-Ons: Off / Optional / Required
- Keep each group's existing selection behavior, such as one Temperature choice or multiple Preparation choices.
- Only show enabled groups in the modifier sheet. Show the required marker and block Add only for groups marked Required.
- If a product has no enabled modifiers, add-ons, or open price, tapping it adds directly to the order as it does now.
- Keep existing demo assignments as the starting product settings, but make Course optional by default unless the merchant explicitly marks it Required.
- Restrict changes to managers using the existing settings permission.

## Technical details

- Replace the current product/category-only modifier lookup with persisted per-product group rules in the POS settings store.
- Use one shared resolver for both the menu-tile decision and modifier sheet, preventing a disabled group from still opening the sheet.
- Extend the Menu settings product editor with compact three-state controls and preserve existing modifier options and prices.
- Existing cart lines remain unchanged when settings are edited; new additions use the latest product rules.
- Verify Course off, optional, and required states, direct-add behavior, manager restrictions, and layouts on phone, tablet, and desktop.
