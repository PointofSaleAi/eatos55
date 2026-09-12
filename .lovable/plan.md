# Fix the Menu row in Settings and make Course easy to find

## What is happening now

In Settings > Menu, the first row labelled "Menu" does not open a settings screen at all. It opens the ordering pop-up that lets a server pick Barcode or Open Price Items, and choosing either sends them back into the order screen. That is why clicking it feels like being thrown out of Settings.

Course is already switchable, but it is buried: Settings > Menu > Products > pick a product > set Course to Off, Optional or Required. Nothing on the Menu screen says that.

## What will change

1. The "Menu" row in Settings > Menu becomes a real settings screen called Menus, listing the venue's menus (Bar Menu, Brunch, Dinner) with their category counts. It no longer jumps into ordering.
2. The Products row gets a short line under it explaining that this is where Course, Temperature, Preparation, Allergy, Sides and Add-Ons are turned on or off per product.
3. Inside Products, each product row shows which groups are required, so a manager can see at a glance where Course is on.
4. Course itself keeps working the way it does today: Off hides it, Optional shows it, Required makes a choice mandatory before the item can be added.

Everything is checked on phone, tablet and desktop.

## Technical details

- `src/routes/settings.menu.tsx`: change the first `IconNavRow` from `to="/order/menu"` to `topic="menus"`.
- `src/lib/settings-details.ts`: add a `menus` detail screen (readonly rows sourced from the existing menu/category demo data) and add intro/subtitle copy for `products`.
- `src/routes/settings.detail.$topic.tsx`: in the Products list, replace the "N enabled" summary with a compact summary naming required groups (for example "Course required"), falling back to "N optional" or "None".
- No changes to the modifier resolver, the item sheet, or persisted `productModifierRules`.
