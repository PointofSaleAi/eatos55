# Brand variants: eatOS (US), lcrOS (UK), eatOS (UAE)

## What exists today

- A single `currency` setting (USD, CAD, EUR, GBP) in `src/lib/pos-store.tsx`, defaulted to USD.
- One regional behaviour only: Grubhub is hidden unless currency is USD
  (`src/routes/settings.payment-methods.tsx`, `src/routes/payment.method.tsx`).
- UK tenders (Chip and PIN, Contactless, Pay by Bank, Deliveroo, Just Eat, etc.) are always
  listed regardless of region.
- Locale formatting is hardcoded: `en-US` for currency/times in `src/lib/demo-data.ts` and
  `src/lib/pos-store.tsx`, `en-GB` for some dates in `src/lib/date-range.ts` and
  `src/components/pos/primitives.tsx`.
- Branding is a single eatOS wordmark; no lcrOS assets, no AED currency, no UAE option.
- No variant concept anywhere: one build behaves identically for every region.

## What we build

A single source of truth for the brand variant, resolved at build time, so each deployment
(eatOS US, lcrOS UK, eatOS UAE) ships its own app from the same codebase.

### 1. Variant config module (`src/lib/brand.ts`)

- Read `import.meta.env.VITE_BRAND` (`"eatos-us" | "lcros-uk" | "eatos-ae"`), default
  `eatos-us` for local dev.
- Export a typed `brand` object:
  - `appName` and `wordmark` assets (eatOS black/white marks for US and UAE, lcrOS marks
    for UK once assets are provided; app icon/pink mark rules stay as they are).
  - `currency` (`USD` / `GBP` / `AED`), `locale` (`en-US` / `en-GB` / `en-AE`), currency
    symbol and minor units.
  - `taxModel`: `sales-tax` (US) or `vat` (UK 20%, UAE 5%), with the label used on receipts
    and settings ("Tax" vs "VAT").
  - `tenderRegion`: which tender groups and delivery partners apply (Grubhub US only,
    Deliveroo/Just Eat hidden for US, etc.).
  - `providers`: default payment provider and reader lineup per region.
- A small `formatMoney` / `formatDateTime` helper pair so all screens format from the
  variant locale instead of hardcoded `en-US`/`en-GB` strings.

### 2. Wire the variant through the app

- `src/lib/pos-store.tsx`: default `currency`, tax label and settings defaults come from
  `brand`; replace the hardcoded `en-US` time formatting with the helper.
- `src/routes/settings.payment-methods.tsx` and `src/routes/payment.method.tsx`: tender
  visibility and provider/reader options keyed off `brand.tenderRegion` and
  `brand.providers` instead of the `currency === "USD"` check.
- `src/lib/demo-data.ts`, `src/lib/date-range.ts`, `src/components/pos/primitives.tsx`,
  `src/components/pos/room-bill-sheet.tsx`, `src/components/pos/split-payments.tsx`:
  swap hardcoded locales for the brand helpers.
- Login screen, header/footer wordmarks, manifest, and route head titles read
  `brand.appName` / wordmark (per the memory rule: black wordmark in content, white on
  dark, pink mark stays app icon only).
- Receipts and totals rows show "VAT" where the variant is VAT-based.

### 3. Build-time selection

- `VITE_BRAND=lcros-uk bun run build` (and equivalent for `eatos-ae`) produces each
  variant; documented in `README.md`.
- Settings General keeps its currency display but the default and available options follow
  the variant.

### 4. lcrOS and UAE assets/data needed from you

- lcrOS wordmark (black and white versions) and app icon.
- Confirmation of UAE tender list, VAT rate (assumed 5%), and any UAE-specific providers.
- These slot into the config without further code changes.

## Repo audit prompt (to run against your existing POS git repo)

Paste this to your coding agent on the existing eatOS/lcrOS repo and send back the output
so we mirror the real regional wiring:

```text
Audit this repository for everything that varies by region or brand
(eatOS US, lcrOS UK, eatOS UAE). Report, with file paths and line references:

1. Branding: app name, logos, wordmarks, colors, themes per brand.
2. Currency: supported currencies, defaults per region, formatting helpers, symbol logic.
3. Tenders/payment methods: which payment types, delivery partners, and wallet options
   are enabled or hidden per region, and where that gating lives.
4. Tax: sales tax vs VAT handling, rates, receipt labels, tax-inclusive vs
   tax-exclusive pricing per region.
5. Locale: date, time, and number formats per region; any locale config files.
6. Providers/integrations: payment providers, card readers, fiscal/compliance
   integrations (e.g. UAE FTA, UK Making Tax Digital) per region.
7. Configuration mechanism: how the region/brand is selected today (env var, build
   flavor, server flag, tenant setting), including env var names and build scripts.
8. Anything else that differs per region (receipts footer text, support contact details,
   legal text, feature flags).

Output as a structured list grouped by the sections above. Do not change any code.
```

## Technical notes

- New module `src/lib/brand.ts` is browser-safe (no server-only imports) so both SSR and
  client agree on the variant; `VITE_BRAND` is inlined at build time.
- Formatting helpers wrap `Intl.NumberFormat` / `Intl.DateTimeFormat` with the variant
  locale and currency; existing `toLocaleString` call sites are replaced mechanically.
- No backend or schema changes; settings remain device-local.
- Verification: three builds (us/uk/ae) typecheck, plus a Playwright pass per variant
  checking wordmark, currency symbol, tender list, and tax label on key screens
  (login, payment method, payment methods settings, order panel).
