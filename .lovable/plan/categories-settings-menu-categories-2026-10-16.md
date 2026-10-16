# Categories (Settings > Menu > Categories)

Rebuild Categories to match the recording, using our existing settings style (grouped rows, grey highlights, pink only for primary CTA, no outside-corner X).

## Categories list
- Header: Back (to Menu), title "Categories", search icon (expands inline search by name/parent).
- Intro text: "Categories organize dishes by type, facilitating navigation. Common categories include appetizers, entrées, desserts, and beverages for easy customer selection."
- Two buttons: Archive view toggle and "+" Add Category.
- Table columns: Category Name, Parent, Category Position, Course, chevron. Sorted by name. "-" when no parent.
- Swipe left on a row reveals Archive (Restore in archive view), with confirmation — same pattern as Schedules/Timed Pricing.
- Phone: table collapses to rows (name + parent/position/course as subtext).

## Add / Edit Category (autosave, no Save/Cancel)
Back reads "Categories" and returns to the list. Rows:
- Category Name (text, required)
- Position (number)
- Default course (None / Main / Starter / Dessert picker) — shown once a Parent Category is set
- Menu Display Name (text)
- Category Code (text, inline input with clear button)
- Assigned Printer — multi-select picker (EPSON U220(66), Star Main POS(42), POS EXPO(1), Sunmi Printer(21), iMin Printer(37), TSP143IV (STR-001)(15), EPSON-U220(98)); row shows count + names as subtext — shown with parent set
- Label Printing toggle (appears once printers are assigned)
- Show Allergen Prompt toggle — shown with parent set
- Parent Category — single-select searchable picker of top-level categories
- Products — multi-select searchable picker with select-all; row shows count + names subtext
- Archive / Restore action at bottom for existing categories.
- Leaving a new category without a name shows the existing "unfinished draft" exit prompt; otherwise valid changes save immediately and appear in the list.

## Demo data
Seed with the recording's categories (Colombian Flavor Fiesta Appetizer, DBL Spirits, DESSERTS, Draught Half/Pints/Shandy/Soft Drinks, Drinks, Foods, Half Shandy, Hot Drink, Reception, …) and products from our demo menu. Demo-only: does not change New Order categories or printing.

## Responsive
Verified on phone, tablet (portrait/landscape) and desktop.

## Technical details
- New `src/lib/category-settings.ts` (shared demo store, same pattern as `menu-settings.ts`) and `src/components/pos/category-settings.tsx` (list + editor + pickers, reusing the tax/discount picker dialogs and swipe-row component).
- Route `categories` topic in `settings.detail.$topic.tsx` to the new component; list back explicitly targets the Menu settings page.
