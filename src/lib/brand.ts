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

export interface BrandConfig {
  id: BrandId;
  /** Display name, e.g. "eatOS" or "lcrOS". */
  appName: string;
  /** Wordmark alt text. */
  tagline: string;
  /** Formatting locale: en-US or en-GB (UAE follows en-GB day/month order). */
  locale: string;
  /** Currency fallback used until the venue picks one in Settings. */
  currency: string;
  /** Currencies offered in Settings, not a lock. */
  currencyOptions: string[];
  /**
   * Receipt/totals wording only. Rates are venue data, never a brand fact:
   * there is no regional default rate anywhere in this config on purpose.
   */
  taxLabel: "Tax" | "VAT";
  /**
   * Mirrors the POS `hideUsOnlyPayments` flag: outside the US, US-only
   * tenders are hidden from the tender catalog.
   */
  hideUsOnlyPayments: boolean;
  /** Display renames applied to shared tenders, e.g. Grubhub shown as Just Eat. */
  tenderAliases: Record<string, string>;
  /** Providers offered in Settings. Nothing is preselected per region. */
  providerCatalog: string[];
  /** Reader models offered in Settings. Nothing is preselected per region. */
  readerCatalog: string[];
  /** Demo venue defaults shown until Back Office syncs real ones. */
  venue: { address: string; city: string; phone: string; taxId: string; timezone: string };
}

/**
 * Tenders that exist only in the US catalog. Hidden when
 * hideUsOnlyPayments is true.
 */
export const US_ONLY_TENDERS = ["grubhub"] as const;

/**
 * Synthetic partner ids kept for compatibility. The real POS has one shared
 * tender catalog and renames entries per region, so these never render.
 */
const ALIAS_SHADOW_TENDERS = ["deliveroo", "just-eat"] as const;

const variants: Record<BrandId, BrandConfig> = {
  "eatos-us": {
    id: "eatos-us",
    appName: "eatOS",
    tagline: "eatOS - Restaurants Made Simple",
    locale: "en-US",
    currency: "USD",
    currencyOptions: ["USD", "CAD", "EUR", "GBP", "AED"],
    taxLabel: "Tax",
    hideUsOnlyPayments: false,
    tenderAliases: {},
    providerCatalog: ["Adyen", "Stripe", "CardConnect", "Bolt", "Poynt"],
    readerCatalog: [
      "Adyen S1F2",
      "BBPOS WisePOS E",
      "Castles S1F2",
      "MagTek eDynamo",
      "Poynt Smart Terminal",
      "Tap to Pay on iPhone",
    ],
    venue: {
      address: "418 W 25th St",
      city: "New York, NY 10001",
      phone: "(212) 555-0148",
      taxId: "88-4102397",
      timezone: "America/New_York",
    },
  },
  "lcros-uk": {
    id: "lcros-uk",
    appName: "lcrOS",
    tagline: "lcrOS - Restaurants Made Simple",
    locale: "en-GB",
    currency: "GBP",
    currencyOptions: ["GBP", "EUR", "USD", "AED"],
    taxLabel: "VAT",
    hideUsOnlyPayments: true,
    tenderAliases: { grubhub: "Just Eat", "in-kind": "Deliveroo" },
    providerCatalog: ["Adyen"],
    readerCatalog: ["Adyen S1F2", "Castles S1F2", "Tap to Pay on iPhone"],
    venue: {
      address: "25 Great Chapel St",
      city: "London W1F 4AH",
      phone: "+44 20 7946 0958",
      taxId: "GB 123 4567 89",
      timezone: "Europe/London",
    },
  },
  "eatos-ae": {
    id: "eatos-ae",
    appName: "eatOS",
    tagline: "eatOS - Restaurants Made Simple",
    // No en-AE formatting exists in the POS wiring; UAE follows en-GB.
    locale: "en-GB",
    currency: "AED",
    currencyOptions: ["AED", "USD", "GBP", "EUR"],
    taxLabel: "VAT",
    hideUsOnlyPayments: true,
    tenderAliases: {},
    // No dedicated UAE provider or reader matrix exists; the full catalog shows.
    providerCatalog: ["Adyen", "Stripe"],
    readerCatalog: ["Adyen S1F2", "BBPOS WisePOS E", "Castles S1F2", "Tap to Pay on iPhone"],
    venue: {
      address: "Sheikh Zayed Rd, Trade Centre 1",
      city: "Dubai",
      phone: "+971 4 555 0148",
      taxId: "100123456700003",
      timezone: "Asia/Dubai",
    },
  },
};

const envBrand = import.meta.env['VITE_BRAND'] as BrandId | undefined;

export const brand: BrandConfig = variants[envBrand ?? "eatos-us"] ?? variants["eatos-us"];

/**
 * Region visibility for a tender id. Venue enable toggles are applied by the
 * caller; this only answers whether the build ships the tender at all.
 */
export const isTenderVisible = (id: string) => {
  if ((ALIAS_SHADOW_TENDERS as readonly string[]).includes(id)) return false;
  if (brand.hideUsOnlyPayments && (US_ONLY_TENDERS as readonly string[]).includes(id)) {
    // A regional alias keeps the shared tender visible under its local name.
    return Boolean(brand.tenderAliases[id]);
  }
  return true;
};

/** Local display name for a tender, applying the region's rename map. */
export const tenderLabel = (id: string, fallback: string) =>
  brand.tenderAliases[id] ?? fallback;


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
