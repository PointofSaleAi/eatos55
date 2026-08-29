/**
 * Build-time brand/region variant. Each deployment (eatOS US, lcrOS UK,
 * eatOS UAE) is its own build from this one codebase:
 *
 *   VITE_BRAND=eatos-us  bun run build   (default)
 *   VITE_BRAND=lcros-uk  bun run build
 *   VITE_BRAND=eatos-ae  bun run build
 *
 * Everything regional (app name, currency, tax model, tenders, delivery
 * partners, locale formatting) derives from this module so screens never
 * hardcode a region.
 */

export type BrandId = "eatos-us" | "lcros-uk" | "eatos-ae";

export type DeliveryPartnerId = "deliveroo" | "just-eat" | "uber" | "doordash" | "grubhub";

export interface BrandConfig {
  id: BrandId;
  /** Display name, e.g. "eatOS" or "lcrOS". */
  appName: string;
  /** Wordmark alt text. */
  tagline: string;
  locale: string;
  currency: string;
  currencyOptions: string[];
  /** Receipt/totals label: "Tax" (US sales tax) or "VAT" (UK 20%, UAE 5%). */
  taxLabel: "Tax" | "VAT";
  /** VAT rate percent when taxLabel is "VAT", else null. */
  vatRate: number | null;
  /** Delivery partner tenders offered in this region. */
  deliveryPartners: DeliveryPartnerId[];
  /** Default payment provider for the region. */
  defaultProvider: "Adyen" | "Stripe";
}

const variants: Record<BrandId, BrandConfig> = {
  "eatos-us": {
    id: "eatos-us",
    appName: "eatOS",
    tagline: "eatOS - Restaurants Made Simple",
    locale: "en-US",
    currency: "USD",
    currencyOptions: ["USD", "CAD"],
    taxLabel: "Tax",
    vatRate: null,
    deliveryPartners: ["uber", "doordash", "grubhub"],
    defaultProvider: "Stripe",
  },
  "lcros-uk": {
    id: "lcros-uk",
    appName: "lcrOS",
    tagline: "lcrOS - Restaurants Made Simple",
    locale: "en-GB",
    currency: "GBP",
    currencyOptions: ["GBP", "EUR"],
    taxLabel: "VAT",
    vatRate: 20,
    deliveryPartners: ["deliveroo", "just-eat", "uber", "doordash"],
    defaultProvider: "Adyen",
  },
  "eatos-ae": {
    id: "eatos-ae",
    appName: "eatOS",
    tagline: "eatOS - Restaurants Made Simple",
    locale: "en-AE",
    currency: "AED",
    currencyOptions: ["AED"],
    taxLabel: "VAT",
    vatRate: 5,
    deliveryPartners: ["deliveroo", "uber", "doordash"],
    defaultProvider: "Adyen",
  },
};

const envBrand = import.meta.env['VITE_BRAND'] as BrandId | undefined;

export const brand: BrandConfig = variants[envBrand ?? "eatos-us"] ?? variants["eatos-us"];

/** True when a delivery partner tender applies to this region. */
export const hasDeliveryPartner = (id: DeliveryPartnerId) =>
  brand.deliveryPartners.includes(id);

/** Format an amount in the variant currency, e.g. £12.50 or AED 12.50. */
export const formatMoney = (n: number) =>
  n.toLocaleString(brand.locale, { style: "currency", currency: brand.currency });

/** Short clock time in the variant locale, e.g. 2:30 PM (US) or 14:30 (UK/UAE). */
export const formatTime = (d: Date = new Date()) =>
  d.toLocaleTimeString(brand.locale, { hour: "numeric", minute: "2-digit" });

/** Short date in the variant locale, e.g. 29 Aug 2026. */
export const formatDate = (d: Date, opts?: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString(
    brand.locale,
    opts ?? { day: "2-digit", month: "short", year: "numeric" },
  );

/** Date plus time stamp in the variant locale, for receipts. */
export const formatDateTime = (d: Date = new Date()) =>
  d.toLocaleString(brand.locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
