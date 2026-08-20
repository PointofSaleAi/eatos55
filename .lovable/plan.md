# Right-hand order panel rebuilt to the original spacing and placement

Comparing your two screenshots with what the app renders now, the panel differs in five ways: the action icons sit in the wrong place and are the wrong set, the service-type row is a grey segmented pill instead of three separate buttons, cart lines are boxed cards with plus/minus steppers instead of flat receipt lines, the footer repeats an icon row that the original does not have, and the CHARGE button does not carry the amount.

## Target layout (top to bottom)

1. Guest block: name (large bold), phone, then `ARRIVED AT 12:07 PM` (or `NOT STARTED`), left aligned.
2. Order action icons on the same block, right aligned and vertically centred against the guest text: discount (%), transfer/move check, cash drawer, no-tax, comp (C), no-charge ($ with slash). Six circular grey icon buttons, single row, wrapping is avoided by shrinking on narrow widths.
3. Service type: three separate buttons in one row (Dine-In selected with a raised outline, Takeout, Delivery), each with its icon plus label. Not a grey segmented track.
4. `ORDER# 43` on the left, server name on the right, uppercase muted.
5. Order Notes field, full width, muted fill.
6. Item lines as flat receipt rows: quantity as `1 ea` on the left, item name, price right aligned, modifier sub-lines indented with an elbow marker and tinted (add-ons in one accent tone, choices in another), selected line lightly shaded. No card borders, no stepper buttons; quantity is edited by tapping the line, and swipe/long press keeps the existing remove action.
7. A note line above totals when the check is split, in the warning tone: "This check has been split. Open it in Tickets to edit or re-merge."
8. Totals: Sub Total, Tax, Total, each separated by a hairline rule, values right aligned, Total larger.
9. Footer: square Save button, orange FIRE with flame icon, then a wide purple `CHARGE $66.94` showing the live total. No second row of icons.

## Spacing

- Tighter vertical rhythm at the top so the guest block, service row, order line and notes read as one group, matching the reference proportions.
- The item list is the only scroll area; header and footer stay fixed.
- Footer buttons keep a full-width row with Save fixed width, Fire fixed width, Charge flexing.
- Verified at desktop, tablet landscape, tablet portrait and phone: on phone the six icons drop to a single row under the guest name rather than overflowing, and the service row keeps all three buttons.

## Technical notes

- All changes in `src/components/pos/order-panel.tsx` (presentation only): icon cluster set and position, service-type buttons replacing the segmented control, cart rows replaced with receipt-style rows, footer icon row removed, Charge label interpolates `money(totals.total)`.
- Icons from lucide: `Percent`, `ArrowLeftRight` (transfer), `Inbox`/drawer, `ReceiptText` for no-tax, `C` glyph for comp, `CircleDollarSign` for no charge.
- Existing store actions are reused as they are: `setOrderType`, `changeQty`, `cancelOrder`, `setNoTax`, `setComped`, `setOrderDiscountPercent`. Split notice uses the existing ticket split flag.
- Colours come from existing tokens (`tile-orange` for Fire, `accent` for Charge, `muted`/`surface` for icon buttons); no hardcoded colours.
