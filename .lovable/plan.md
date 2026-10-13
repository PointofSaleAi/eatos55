# Product Information view inside the product modal

Tapping a product's photo or name inside the product modal swaps that modal's content to a Product Information screen, with a **Back to Order** button at the bottom. No second modal opens — the same window, same size, same position.

## What you'll see

```text
┌──────────────────────────────────────────┐
│ Product Information                      │
│                                          │
│ Buffalo Wings (10pc)              $13.99 │
│ ┌──────────────────────────────────────┐ │
│ │                                      │ │
│ │         product photo                │ │
│ │                                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Description                              │
│ Crispy wings tossed in our house hot     │
│ sauce, finished with blue cheese and     │
│ celery.                                  │
│                                          │
│ ├──────────────────────────────────────┤ │
│ │           Back to Order              │ │
└──────────────────────────────────────────┘
```

- **Layout:** the reference structure — title, name with price at the right, large photo, then the description.
- **Sections:** Description only, as you chose. Allergens, ingredients and nutrition are left out; the same screen can take them later if you change your mind.
- **Content:** every demo menu item gets a real, written-out description so nothing reads as a placeholder. Any item without one shows "No description available."

## How it behaves

- The photo-and-name area in the modal header becomes tappable. The price and quantity controls keep their current behaviour exactly — tapping those still edits price (manager PIN) or changes quantity.
- Everything you had already set up is kept while you read the details: quantity, any price change, item notes, modifiers, add-ons and an applied discount. **Back to Order** drops you back on the identical screen you left, nothing added to the cart.
- Escape, the browser back gesture, dragging the handle down and tapping outside all return you to the order view first when the details are open — none of them add the item or commit anything. From the order view they close the modal as they do today.
- Works on phone, tablet and desktop: the details text scrolls inside the existing modal height and Back to Order stays pinned at the bottom.

## One heads-up

The demo menu items carry no photos yet, so the large photo area shows the current placeholder mark until real product photos are attached. I can generate photos for the demo menu as a separate step if you want that filled in.

## Technical details

- **`src/lib/demo-data.ts`** — add an optional `description` field to the `MenuItem` type and give each of the 18 demo items (m1–m18) a description.
- **`src/components/pos/item-sheet.tsx`** — add a view state (`"order"` / `"info"`) to `ItemSheet`:
  - wrap the header's image + name in a button (`aria-label="View product information"`) that switches to `"info"`; the price and quantity controls already stop pointer events from reaching the drag handle, so they are unaffected.
  - render the details layout in place of the current body and footer when `view === "info"`, reusing the sheet's existing width, rounding, colours and typography tokens.
  - the `useBackDismiss` callback, the sheet's outside-tap handler and the drag-close callback route to "back to order" while the details view is open, and close the modal otherwise.
  - `reset()` and the effect that fires when a different product opens return the view to `"order"`.
- **Verification** — Playwright at 390×844, 900×1000, 1280×900 and the current 1141×742: open a product, tap photo/name, confirm only one modal exists in the DOM, tap Back to Order, confirm quantity/modifiers/notes/discount survived, then add to cart. Console and build log checked for errors.
