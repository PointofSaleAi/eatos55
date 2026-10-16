# Add-Ons (Settings > Menu > Add-Ons)

The recording shows Add-Ons works exactly like Modifiers, with Add-On wording and one fewer switch. Build it on the same screens so both stay consistent (phone, tablet, desktop).

## Add-Ons list
- Header: Back (to Menu), "Add-Ons", search icon.
- Intro: "Explore a culinary revolution with food add-ons – from truffle-infused salts to exotic spice blends, transforming ordinary dishes into extraordinary experiences."
- Archive view + "+" Add Add-Ons.
- Table: Name (left), Type, Selected Options (center), Price (right) + chevron; swipe left to Archive/Restore; phone shows stacked rows.
- Seed from the recording: Add Bacon, Add Cheese, Add Chicken, Add Chorizo, Add Ham, Add Honey, Add Mushroom, Add Olives, Add One Egg (Fried, 3 selections), Add Pepperoni, Add Pineapple, Add Sausage — each $1.00, "Regular", 1 selection.

## Add / Edit Add-Ons (autosave)
Title "Add Add-Ons" / "Edit Add-Ons", back reads "Add-Ons".
- ORDER TYPE APPLICABLE: Order Type Tag multi-select (Dine In, To Go, Delivery, Banquet, Drive Thru).
- ADD-ONS INFORMATION: Name (required), "86 this Add-On?", "Does this Add-Ons have options?" (no "served" switch).
- ADD-ONS OPTIONS: Name / Price rows with cash-register price entry, "Add Option" row, "At least 1 option should be added" hint.
- Maximum Number of Selections toggle + − / + stepper.
- Archive / Restore button; unnamed draft exit prompt.

Demo-only: does not change New Order product add-ons or prices.

## Technical details
- Generalise `src/lib/modifier-settings.ts` into a store factory (separate localStorage key + seed for add-ons) and parameterise `src/components/pos/modifier-settings.tsx` with a copy/config object (labels, intro, served toggle on/off, store hook). Export `AddOnSettings` using the add-ons config.
- Route `add-ons` topic to `AddOnSettings` in `settings.detail.$topic.tsx`.
