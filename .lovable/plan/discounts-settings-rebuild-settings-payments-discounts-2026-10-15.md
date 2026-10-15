# Discounts settings rebuild (Settings > Payments > Discounts)

Rebuild Discounts to match the recording, in the same style as the new Taxes screen. Works on phone, tablet and desktop.

## 1. Discounts list
- Header: back to Payments, title "Discounts", search icon (filters by name).
- Description: "Discount is a reduction in the total amount due for a purchase, often granted for early or prompt payment." with a "+" button to add.
- Table columns: Discount Name / Amount / Require Manager PIN (Yes/No) / Applicable Products (count) + chevron. Phone shows stacked rows.
- Demo starts with: Big Sale Hour 15.0%, PIN Yes, 0 products; Limited Sale 10.0%, PIN No, 1 product (Tuna & Mayo Sandwich).

## 2. Add / Edit Discount form
Grouped rows like Add Tax:
- Name (placeholder "Required"), Discount value (0.00), Discount Type (Percentage / Amount dropdown; shows % or $).
- Apply Individual Discount toggle with its explanation text.
- Applicable Categories toggle; when on, opens a category picker and the row shows chosen names.
- Applicable Products row ("Select Product", or names + count) opening the product picker.
- Require Manager PIN toggle, Only Show Name toggle, Open Discount toggle — each with the recording's helper text.
- Open Discount on: hides the Discount value and product/category options (amount entered at checkout); forces Amount type.
- Scheduled Discount section: "Configure Scheduled Discount Availability?" toggle; when on, shows start/end date and start/end time rows.
- Errors in red: "Please enter a name for the discount", "Enter a valid value for the discount" (percentage max 100).
- Autosaves once valid. Leaving a new discount that isn't complete shows "Are you sure you want to exit? If you go back now, you will lose the progress." with Keep Editing / Exit. Edit adds Delete Discount with confirmation.

## 3. Pickers
- Same picker modal as Taxes (search, select-all, check marks): Applicable Categories (our demo menu categories) and Applicable Products (demo menu products).

## Notes
- Demo only: discounts are saved as settings and don't change cart or checkout totals or the existing cart discount buttons.

## Technical details
- New `src/lib/discount-settings.ts` and `src/components/pos/discount-settings.tsx`; reuse/export the Picker from `tax-settings.tsx` into a shared `settings-picker.tsx`.
- Add `discountRules` to POS settings; route `discounts` topic in `settings.detail.$topic.tsx` to the new screen.
- Verify with Playwright on phone, tablet and desktop.
