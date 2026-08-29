# 5.5 Handheld

can you import this sites and make all functional screens conencted "https://github-5945c9d4.ploy.build/"

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://popeos.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f29b0e6-a169-4096-8cf3-f8f9968eff3a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm, [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Brand variants (separate builds)

One codebase builds three regional apps. Set `VITE_BRAND` at build time:

```bash
VITE_BRAND=eatos-us  bun run build   # eatOS (US): USD, en-US, "Tax" wording, full tender catalog
VITE_BRAND=lcros-uk  bun run build   # lcrOS (UK): GBP, en-GB, "VAT" wording, Just Eat / Deliveroo names
VITE_BRAND=eatos-ae  bun run build   # eatOS (UAE): AED, en-GB formats, "VAT" wording
```

Default (no variable) is `eatos-us`. Everything regional lives in `src/lib/brand.ts`:
app name and wordmark alt text, locale, currency fallback (and the currency
options in Settings > General), tax wording ("Tax" vs "VAT"), the
`hideUsOnlyPayments` flag, tender display renames, and the provider and reader
catalogs. Screens never hardcode a region; they read `brand` or the
`formatMoney` / `formatTime` / `formatDate` / `formatDateTime` helpers.

Not variant data, on purpose: tax rates, the payment provider, the card reader
model, and which delivery partners are switched on are all venue settings, not
build-time facts. There is no default 8.75% / 20% / 5% rate and no "Stripe for
US, Adyen elsewhere" matrix anywhere in the config. The variant only decides
wording, formats, tender visibility and tender naming. Do not reintroduce
hardcoded regional rates or provider defaults.


Note: `public/manifest.webmanifest` is static, so swap its `name`/`short_name`
per variant in your CI packaging step (lcrOS build: "lcrOS Handheld" / "lcrOS").
