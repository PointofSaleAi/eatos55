# Modifiers (Settings > Menu > Modifiers)

Rebuild Modifiers to match the recording, in our settings style (grouped rows, grey highlights, pink only for primary CTA, autosave, no outside-corner X). Same pattern as Categories.

## Modifiers list
- Header: Back (to Menu), title "Modifiers", search icon (inline search by name).
- Intro: "Modifiers customize dishes, catering to preferences. Enhance dining experiences by allowing customers to personalize their orders for satisfaction."
- Archive view button and "+" Add Modifier.
- Table: Modifier Name (left), Type, Selected Options (center), Price (right) + chevron. Type = first option name ("Regular" by default), Selected Options = max selections (1 by default), Price = first option price. Sorted by name.
- Swipe left to Archive / Restore. Phone: stacked rows with Type · Options · Price subtext.

## Add / Edit Modifier (autosave)
Back reads "Modifiers".
- ORDER TYPE APPLICABLE: Order Type Tag — multi-select picker (Dine In, To Go, Delivery, Banquet, Drive Thru) with search and select-all; row shows count + names.
- MODIFIER INFORMATION: Modifier Name (inline text, clear button, required), toggles "Can this modifier be served?", "86 this Modifier?", "Does this modifier have options?".
- MODIFIER OPTIONS (only when options toggle is on): Name / Price table; existing options editable inline with clear; a blank "Add Option / $0.00" row that becomes a new option once named. Hint "At least 1 option should be added" when none. Swipe left to remove an option.
- Maximum Number of Selections toggle; when on, shows a stepper (− value +), minimum 1, max = number of options.
- Archive / Restore button for saved modifiers. Unnamed draft with changes shows the existing exit prompt.

## Demo data
Seed with the recording's modifiers (Add Blackcurrent $0.60, Add Lime $0.60, aperol spritz, Apple and Blackcurrant Fruit Shoot, Apples, Apricot Jam, BBQ Sauce, Beans, Blue Cheese, Brown Bread, Caramel Syrup $0.50, Celery Allergy, Rare, Well Done, Soy Milk $0.50, Slimline Tonic $1.85, Tonic Water $1.85, Truffle Parm Fries $1.50, Vanilla Syrup $0.50, Vegan, Vegetarian, White Bread, …). Demo-only: does not change the New Order product modal or prices.

## Responsive
Verified on phone, tablet and desktop.

## Technical details
- New `src/lib/modifier-settings.ts` (localStorage store like `category-settings.ts`) and `src/components/pos/modifier-settings.tsx`, reusing `Picker`, `SwipeRow`, `GroupCard`, `tableAlign`.
- Route `modifiers` topic to the new component in `settings.detail.$topic.tsx` (check how Menu links to Modifiers today and point it there).
