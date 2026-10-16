# Inventory (Settings > Menu > Inventory)

Rebuild the Inventory screen to match the recording, using our existing settings look (SubHeader, grouped table, grey highlights, no outside X).

## What the screen does

**Header:** Back to Menu, title "Inventory", search icon that opens a product-name search field (with the shared voice mic).

**Intro line:** "Enter physical counts to record inventory adjustments. Variances are calculated automatically."

**Filters (two dropdown chips):**
- **All Stock (15)** — All Stock / Low Stock / Out of Stock, each with its live count.
- **All Categories (29)** — checkbox list of categories (Hot Drink, DBL Spirits, Red Wine 250ml, Sandwiches / Ciabattas, ...); picking none means all. Taps outside close without changes.

**Product table:** Product Name (left), SKU, Variant count (center), Price (right) + chevron. Only products with Inventory Tracking on are listed (same products as the Products screen).

**Tap a row to expand it** (chevron flips up; one or several can be open). Inside, a sub-table per variant:
- **Variant** name, with an amber warning triangle and amber row tint when Stock on Hand is below PAR.
- **PAR** — editable number (decimals allowed, e.g. 15.621), saved on tap-away.
- **Stock on Hand** — shown read-only.
- **Adjustment** — compact − value + control; you can also type a number (negative allowed). When committed (tap-away / Enter, or after a +/− tap settles), it is added to Stock on Hand and resets to 0 — e.g. stock 5 + adjustment 6 becomes 11. The warning clears once stock reaches PAR.

## Devices
- Tablet/desktop: as in the recording.
- Phone: product rows show SKU and variant count under the name; the expanded variant table stacks PAR / Stock / Adjustment under each variant name.

## Data
- Seeded from the recording (2 for £14 spritz deal: spritz deal PAR 5 / stock 5; Apple Juice - Pint 15.621 / 50.512; Camomile 20 / 60; Chicken Pizza "med" 1 / 1; others 0/0), using the existing Products list.
- Demo only, saved on the device. Never changes New Order, sales or 86 status.

## Technical details
- New `src/lib/inventory-settings.ts` (localStorage `eatos.pos.inventory-settings`, per product+variant `{par, onHand}`), joined with `product-settings` products and `category-settings` categories.
- New `src/components/pos/inventory-settings.tsx`; route the `inventory` topic in `settings.detail.$topic.tsx` to it, replacing the old toggle-only entry in `settings-details.ts`.
- Reuse `QtyStepper` styling, `Picker`/popover patterns and `tableAlign`.
- Add an AGENTS.md rule: Inventory counts are demo-only and never affect ordering.
- Verify on phone, tablet and desktop.
