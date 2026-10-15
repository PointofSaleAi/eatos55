# Taxes settings rebuild (Settings > Payments > Taxes)

Rebuild the Taxes screen to match the recording, styled with our existing settings look (grouped rows, grey highlights, pink only for the primary add button). Works on phone, tablet and desktop.

## 1. Taxes list
- Header: back to Payments, title "Taxes", search icon (filters by tax name).
- Short description under the header: "Taxes are levies imposed on financial transactions or income, collected by government authorities to fund public services and infrastructure."
- "+" button opens Add Tax.
- Table with columns Tax Name / Amount / Type / Applicable To (count) and a chevron; tapping a row opens Edit Tax. On phone the table becomes stacked rows (name + amount/type underneath, count on the right).
- Demo starts with one tax: VAT, 20.0%, Inclusive, applied to all order types and all products.
- Empty state when search finds nothing.

## 2. Add / Edit Tax form (same screen, title changes)
Grouped rows, Apple-style like the Employee form:
- Name (text, placeholder "Required").
- Amount (percentage, shows e.g. 20.00%).
- Type: small dropdown with Exclusive / Inclusive.
- Applicable To: picker modal; row shows the selected names as a grey subtitle and the count on the right.
- Applicable Products (its own group): picker modal; same subtitle + count display.
- Errors shown in red under the row: "Name cannot be empty", "Please select a type" (also amount must be a valid 0–100 value).
- Saves automatically once valid (same as the employee form); Back returns to the Taxes list. Edit adds a Delete Tax option with confirmation.

## 3. Picker modals (Applicable To / Applicable Product)
- Title, search field, and a select-all / clear toggle button beside the search.
- Scrollable list with a check mark on selected rows; multi-select.
- Applicable To options: Banquet, Cash Drawer, Custom Item, Delivery, Dine-In, Pick Up, Take Out, Online Ordering, Service Charge, Drive Thru.
- Applicable Product options: our demo menu products.
- No outside X; tapping outside closes keeping the selections already made (nothing extra is submitted).

## Notes
- Demo only: taxes are saved as settings and do not change cart or checkout totals.

## Technical details
- New `src/lib/tax-settings.ts` (types, defaults, shared demo preference store, validation) and `src/components/pos/tax-settings.tsx` (list, form, picker dialog).
- Route the `taxes` topic in `settings.detail.$topic.tsx` to the new screen instead of the generic rows in `settings-details.ts`; existing `taxRate`/`taxAlias`/`inclusivePricing` fields left untouched.
- Product list sourced from existing demo menu data; reuse shared Dialog (no corner X) and SubHeader back callback.
- Verify with Playwright at phone, portrait/landscape tablet and desktop; record rule in AGENTS.md.
