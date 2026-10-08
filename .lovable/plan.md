# Single layout toggle icon on New Order

## Goal
Replace the two separate subcategory layout buttons with one icon button that flips the view on each tap.

## Current state
The expanded menu controls on New Order currently show a bordered segmented pair: one button for horizontal subcategories and one for vertical subcategories, with the active one filled. This becomes three taps worth of controls in a row that is already tight on phones.

## Changes
- Remove the segmented pair and its bordered wrapper from the expanded menu controls.
- Add one icon button in the same position, sized like the other controls (44px touch target, same rounded style).
- Tapping it flips the layout: horizontal, then vertical, then horizontal, and so on.
- The screen opens in the vertical layout, so the first tap switches to horizontal and the second tap switches back to vertical, as described.
- The icon previews the layout the next tap will apply: left-right arrows when the next tap gives the horizontal scrolling row, up-down arrows when the next tap gives the wrapped grid.
- Tooltip and screen-reader label name the layout the tap applies ("Show subcategories horizontally" / "Show subcategories vertically"), so the control is understandable without seeing the result.
- Subcategory filtering, menu switching, category chips, product grid, cart, search and long-press behavior are untouched.

## Layout behavior (unchanged, just driven by one control)
```text
horizontal: [ BRUNCH SANDWICHES ][ BRUNCH BEVERAGES ][ BRUNCHY DRINKS ] -> scroll
vertical:   [ BRUNCH SANDWICHES ][ BRUNCH BEVERAGES ]
            [ BRUNCHY DRINKS    ][ BRUNCH COFFEE   ]
```

## Responsive behavior
- Phone: the single button is narrower than the removed pair, so the menu control, category chips, search and More keep fitting on one row without horizontal page scrolling.
- Tablet and desktop: same single button in the header row ahead of the category chips, matching the landscape reference.
- Both layouts are checked at phone, tablet and desktop widths.

## Technical details
- `src/routes/order.new.tsx`: the `categoryLayout` state stays as the single source of truth; the removed buttons' two `onClick` handlers become one toggle that sets the opposite value.
- Both arrow icons remain imported since one is shown at a time; the segmented wrapper markup and its conditional active styling are deleted.
- No merchant settings, prices, cart data, menu names or payment behavior are altered.

## Verification
- Confirm first tap gives the horizontal scrolling row and second tap gives the wrapped grid, repeatedly.
- Confirm the icon, tooltip and accessible label update with each tap.
- Confirm menu switching, category switching, subcategory filtering, item selection and the cart still work in both layouts.
- Confirm no clipping, overlap or unintended page scrolling at phone, tablet and desktop widths, with the controls open and closed.
