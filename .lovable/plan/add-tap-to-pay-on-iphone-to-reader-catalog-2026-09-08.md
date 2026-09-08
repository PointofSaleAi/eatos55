# Add “Tap to Pay on iPhone” to Reader catalog

## Goal
Add “Tap to Pay on iPhone” as a selectable card reader option under Settings → Payment Methods → Reader, shown in alphabetical order.

## Where the data lives
`src/lib/brand.ts` defines `readerCatalog` for each regional variant (`eatos-us`, `lcros-uk`, `eatos-ae`). `src/routes/settings.payment-picker.$field.tsx` renders `["Not set", ...brand.readerCatalog]` for the `reader` field.

## Changes
1. In `src/lib/brand.ts`, add `"Tap to Pay on iPhone"` to every variant’s `readerCatalog` array.
2. Sort each `readerCatalog` alphabetically so the picker list is ordered correctly.

Expected order after the change:
- `eatos-us`: Adyen S1F2, BBPOS WisePOS E, Castles S1F2, MagTek eDynamo, Poynt Smart Terminal, Tap to Pay on iPhone
- `lcros-uk`: Adyen S1F2, Castles S1F2, Tap to Pay on iPhone
- `eatos-ae`: Adyen S1F2, BBPOS WisePOS E, Castles S1F2, Tap to Pay on iPhone

## Verification
- Run TypeScript check.
- Open `/settings/payment-picker/reader` and confirm the new option appears in alphabetical order and can be selected.
