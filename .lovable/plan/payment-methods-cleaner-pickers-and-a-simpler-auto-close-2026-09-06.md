# Payment Methods: cleaner pickers and a simpler Auto Close

Scope: the Payment Methods settings screen only. No changes to how payments actually work.

## 1. Provider, Reader and Connection become drill-down rows

Today each one opens a small floating list that covers the page. Instead:

- The row shows the label on the left and the current choice on the right with a chevron.
- Tapping the row opens a full picker screen with the same title, one large tappable option per line, and a tick on the current choice.
- Picking an option returns straight to Payment Methods.
- "Not set" stays as the first option so a venue can clear a choice.
- Rows stay read-only (no chevron, muted) for staff who cannot manage settings.

Changing the provider still unpairs the current reader, with the same warning line under the group.

## 2. Auto Close Payment becomes one chip per row

The second column of switches goes away. Each payment method row keeps a single Enabled switch, and Auto Close sits on the same row as a small pill labelled "Auto close":

- Pill is filled and highlighted when auto close is on for that method, plain outline when off.
- Tapping the pill toggles it, independently per method, with the stored value kept if the method is later switched off and back on.
- While the method is switched off, the pill is dimmed and not tappable.
- Managers only, same rule as the Enabled switch.
- The column headers above each group are removed since there is only one switch column left.
- The explanatory line under the list stays: the order closes itself once a payment with that method succeeds.

On narrow phone widths the pill shows just "Auto" so the method name is never truncated.

## Technical notes

- New route `src/routes/settings.payment-methods.picker.$field.tsx` (or a shared `settings.picker.$field`) rendering the option list for `provider`, `reader`, `connection`, reading options from `brand.providerCatalog` / `brand.readerCatalog` / the local connections list and writing through `updateSettings`.
- `src/components/pos/settings-rows.tsx`: add `IconPickerRow` (value + chevron, links to the picker route) and `IconToggleChipRow` (Enabled switch plus toggleable chip). Remove `ToggleColumnHeaders` and `IconDualToggleRow` usage from this screen; keep `IconSelectRow` for other screens untouched.
- `src/routes/settings.payment-methods.tsx`: swap the three `IconSelectRow`s for picker rows, swap `IconDualToggleRow` for the chip row, drop the column headers.
- Store shape is unchanged: `settings.tenders` and `settings.tenderAutoClose` keep working as they do now.
- Verify at 1440x950, 1095x713, 1024x768 and 390x844 with no truncation or new scrollbars.
