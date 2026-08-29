# Align brand variants with the real POS wiring

Your audit kills three of my guesses: regional tax rates, a "Stripe US vs Adyen UK/UAE" provider matrix, and per-region delivery partner lists. This plan corrects the variant config to match how the existing POS actually behaves, and keeps everything else that was verified (brand selection, branding, locale wording).

## What changes conceptually

1. Tax rates stop being a brand fact. The variant only decides the wording ("Tax" vs "VAT") and the currency fallback. The rate itself becomes venue data, editable in Settings, with no rate baked per region.
2. Providers stop being a region constant. Both the provider and the card reader become venue settings with a full catalog; the variant only hides tenders that do not apply outside the US, exactly like the real `hideUsOnlyPayments` flag.
3. Delivery partners become one shared tender catalog. The UK build renames Grubhub to Just Eat and In Kind to Deliveroo instead of swapping in a different partner list. Enablement stays a per-venue toggle.
4. Locale formats keep `en-US` vs `en-GB`, and the UAE build follows the UK date pattern (DD/MM) rather than an invented `en-AE` number pattern.

## Technical changes

`src/lib/brand.ts`
- Remove `vatRate` and `venue.taxRate`. Keep `taxLabel` only, driven by locale (`en-GB` gives VAT).
- Replace `deliveryPartners: DeliveryPartnerId[]` with `hideUsOnlyPayments: boolean` (false for US, true for UK and UAE) plus a `tenderAliases` map used by the UK build: `grubhub -> Just Eat`, `in-kind -> Deliveroo`.
- Replace `defaultProvider` / `defaultReader` with a neutral `providerCatalog` and `readerCatalog` plus no regional default preselected; the UAE build gets no dedicated reader matrix.
- Set the UAE locale to `en-GB` formatting with an AED currency fallback, and keep `currencyOptions` as an available list rather than a lock.

`src/lib/pos-store.tsx`
- `taxRate` becomes a plain venue setting with a neutral starting value and no brand source.
- Replace `hasDeliveryPartner(...)` gating with a single `isTenderVisible(tenderId)` helper: hide US-only tenders (Bolt, CardConnect, MagTek, Blizzful) when `hideUsOnlyPayments`, hide Manual Stripe and Poynt on the US build, then apply the venue's own enable toggles.
- Apply `tenderAliases` when resolving tender display names and icons.
- Provider and reader settings start unset and are chosen in Settings, not from the brand.

Screens touched to follow the above: `settings.payment-methods.tsx` (provider and reader selectors read the catalogs, tender rows use aliased labels), `settings.taxes` and receipt/order totals (label from `taxLabel`, rate from venue settings), and any place still reading `brand.vatRate` or `brand.venue.taxRate`.

`README.md`
- Note explicitly that tax rates, providers, readers, and partner enablement are venue data, not build-time variant data, so future work does not reintroduce hardcoded rates.

## Out of scope (audit says "no variant logic found")

Cash denominations by region, tip and auto-gratuity percentages by region, Apple Pay vs Google Pay region gates, fiscal or FTA or MTD receipt fields, age verification, and 24 hour clock switching. These stay as-is or remain venue settings.
