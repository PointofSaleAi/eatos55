# Products (Settings > Menu > Products) — end-to-end flow

Rebuild the Products screen to match the recording, using our existing Categories / Modifiers / Add-Ons look (grouped rows, grey highlights, pink only for primary actions, no outside-corner X, tap outside to cancel). Demo-only: changes never alter what New Order sells, prices, printing or taxes.

## 1. Products list
- Intro: "Products are offerings listed for purchase. They encompass dishes, beverages, and desserts, showcasing a restaurant's culinary offerings and variety."
- Search icon, archive-view button and **+** to add.
- Table: Product Name (left), SKU, Variant (center), Price (right) + chevron. Seeded from the recording (2 for £14 spritz deal $14.00, APEROL Spritz $7.95, Apple Juice - Pint $3.50, Beef Burger 2 variants $15.00, Beef Chilli Potato, BLT Sandwich, Breakfast Sandwich, Brixton Half/Half Shandy/Pint/Shandy …).
- Swipe left to archive / restore; Archived Products view shows "No Data Available" when empty.
- Phone: rows stack with SKU/variant/price under the name.

## 2. Add / Edit Product (autosave)
- **Photo**: initials avatar (e.g. "CP") with camera badge. Tapping opens a card with the name and two buttons: Take Photo and Choose from Library (real device file picker; image kept locally). Before a name is entered, it shows "Please enter product name first".
- **Product Information**: Product Name (required, inline edit with clear), Menu Display Name, Display Name, Printer Name (all auto-fill from Product Name until edited), Assigned Printers (multi-select: EPSON U220(66), Star Main POS(42), POS EXPO(1), Sunmi Printer(21), iMin Printer(37), TSP143IV (STR-001)(15), EPSON-U220(98)), Product Code, Barcode (with scan icon; scanning is a demo notice), Category (multi-select from our Categories list), Default course (single select: None, Main, …).
- Multi-select rows show a count and the selected names wrapped under the label; pickers have search and a select-all toggle.
- **Modifier Groups**: Modifiers and AddOns pickers — expandable groups with a check per group and per item, Select All. Picking an item that exists in several groups asks "'Chips' is present in N groups. Do you want to include this modifier in all other groups?" (No / Yes).
- **Description**: multi-line, max 1000 characters.
- **Switches**: Add to Menu? (on), 86 this Product, Inventory Tracking, Negative Inventory, Show UOM & Decimals on KOT.
- **Variants table**: Variant Name, SKU, Barcode, Inventory, Threshold (shown when Inventory Tracking on), UOM picker (kg, g, lb, oz, l, ml, gal, pt, fl oz, ea — with Apply), Price and Adjusted Price (cash-register entry), Timed Price picker (from Timed Pricing rules, with Apply). A blank trailing row adds a variant once named; swipe left removes; hint "At least one variant is required".
- **Product Settings**: Default Modifiers, VAT (from Taxes), Discounts (from Discounts) — multi-select pickers.
- Archive / Restore button on edit; leaving a new product without a name shows the exit prompt.
- Title is "Add Product" for new, "Edit Product" for existing.

## 3. Existing behaviour kept
The current per-product Course / Temperature / Preparation / Allergy / Sides / Add-Ons Off-Optional-Required controls (which do affect New Order) stay available as an "Order Options" section at the bottom of Edit Product, so nothing that works today is lost.

Checked on phone, tablet and desktop (variants table scrolls sideways on narrow screens).

## Technical details
- New `src/lib/product-settings.ts`: localStorage store (`eatos.pos.product-settings`) via the same pattern as `createRuleStore`, seeded from the recording; variant prices via `MoneyInput`.
- New `src/components/pos/product-settings.tsx` (list + editor), reusing `SwipeRow`, `SubHeader` local back, `Picker` from tax-settings, settings-rows, `tableAlign`.
- Route `products` topic in `settings.detail.$topic.tsx` to the new component; move the existing product-modifiers block into the editor's Order Options section.
- Pickers source live data from category, modifier, add-on, timed-pricing, tax and discount stores.
- Add an `AGENTS.md` rule: Products settings are demo-only and keep the order-option rules as the only part New Order reads.
