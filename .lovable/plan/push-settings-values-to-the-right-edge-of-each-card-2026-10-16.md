# Push settings values to the right edge of each card

## What's wrong
On wide screens, the values and arrows in Profile (Personal Information, Security, Job Type, First/Middle/Last Name, Date of Birth, Email, Phone Number, Address) stop partway across the card instead of reaching its right edge. Phones and narrow tablets look fine because the cards are narrow enough.

The cause: the shared body text style caps any element using it at about 66 characters wide (meant for reading paragraphs). The row labels and value fields use that same style, so on a wide card they get cut short and the value/arrow ends early. The same style is used in Default Modifiers, Groups and Inventory, so those can show the same gap.

## Fix
- Keep the reading-width limit only on paragraph text, not on row labels, inputs or values. Every value and arrow then sits at the card's right edge on every screen size.
- Applies app-wide: Profile (all sub-screens), Default Modifiers, Groups, Inventory, and anything else using that text style.
- Phone and tablet layouts stay the same.

## Check
- Open Profile, Personal Information, Address and Security, plus Default Modifiers, Groups and Inventory editors, at phone (393 wide), tablet (1141 wide) and large desktop (1920 wide), and confirm each value/arrow ends the same distance from the card's right edge as the other settings screens.

## Technical details
- `src/styles.css` `@utility t-body` sets `max-width: 66ch`. Change it to apply only to paragraphs (`&:where(p) { max-width: 66ch; }`) so spans, inputs, labels and buttons using `t-body` fill their flex space.
- Verify with Playwright: for each row, the right edge of the last child (input/value/chevron) is within the row padding of the card's right edge.
