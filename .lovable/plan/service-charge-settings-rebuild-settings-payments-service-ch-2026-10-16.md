# Service Charge settings rebuild (Settings > Payments > Service Charge)

Follow the recording's flow, styled like our rebuilt Taxes and Discounts screens.

## Service Charge list
- Header: back to Payments, title "Service Charge", search icon that opens an inline search field with Cancel.
- Short description: "Service Charge is a fee levied for processing financial transactions, covering the cost of services provided by the financial institution." plus a **+** button.
- Table: Service Charge Name, Amount, Tax Applicable (count), chevron. Starts with **Delivery Fee — $20.00** and **Half Payment — 50.0%**.
- Search filters by name, with an empty state.

## Add / Edit Service Charge
Grouped Apple-style rows (same as Taxes/Discounts):
- **Name** — inline text, "Enter Name" placeholder, clear button.
- **Amount** — inline number entry with a Percentage / Amount type picker (small popover with checkmark); shows "%" or "$" formatting.
- **Only Show Name** toggle + note: "On order details and receipts, show only the service charge name instead of a prefixed label".
- **Tax Applicable** — searchable multi-select of our taxes (e.g. VAT); shows count and names.
- **Order Type** — searchable multi-select (Restaurant, Take Out, Banquet, Delivery, Drive Thru) with select-all; row shows count and the picked names underneath.
- **Applied as** — Basic / Auto Service Fee / Tip popover + note "Choose this as a 'large table' service charge".
- **Automatically apply this service charge?** toggle, and **Apply to table with seats at least** stepper (− / +) with note "Table size must be greater than 0".
- Edit mode adds **Delete Service Charge**. Validation like Taxes (name required, amount required/within range).
- Pickers close on outside tap without saving extra changes; no outside-corner X.

## Notes
- Demo only: these rules don't change charges in the cart; the existing cart Service Charge picker is unchanged.
- Works on phone, tablet and desktop (phone uses full-width list/editor).

## Technical details
- New `src/lib/service-charge-settings.ts` (type, reference rows, validation, formatting) and `src/components/pos/service-charge-settings.tsx`, modeled on `tax-settings.tsx` / `discount-settings.tsx`.
- Route the `service-charge` topic in `settings.detail.$topic.tsx` to the new component, same as taxes/discounts; persist via the same demo settings mechanism used there.
- Verify list, search, add, edit, delete and pickers with Playwright at phone, tablet and desktop sizes.
