# New Order: fit product names to card width + tighter Out of stock / Open price

Scope: `src/routes/order.new.tsx` only. Applies to phone, tablet and desktop (same markup).

## 1. Product name grows to fill the card width

Current: name size is a blunt two-tier rule by character length (`<= 12` chars → `text-fs-base`, else `text-fs-sm`), so names like "CAPRICE SANDWICH" leave unused space at the right of their lines.

Change — replace the length rule with width-aware auto-fit:
- Add a small `<FitName name={...}>` component used inside the product card. It renders the name at `text-fs-sm` first (SSR-safe, no hydration mismatch) and, after layout, measures the card's inner width and picks the largest of three font steps — `fs-sm` → `fs-base` → `fs-lg` — that satisfies both:
  - the wrapped line count never exceeds the line count at `fs-sm` (growing never adds a line, so cards keep their shape), and
  - a hard cap of 3 lines for very long names.
- Measurement runs once per name using a shared offscreen canvas (`measureText`) with word wrapping; the available width comes from the rendered container. When a stock-count badge sits after the name, the badge's width is subtracted from the available width so the two never collide.
- Falls back to `fs-sm` if measurement is unavailable.
- Result: "CAPRICE SANDWICH", "CROQUE MADAME", "FIGARO BLT", etc. step up until their lines reach the card's right edge (up to `fs-lg`), while very long names stay at their current size.

## 2. Out of stock / Open price — tighter line height

Current: the price-slot span (`Out of stock` / `Open price` / price) uses default line height, so the wrapped two lines ("Out of" / "stock") have a visible gap.

Change: add `leading-none` to that span so the wrapped lines sit close together.

## Verification

- Build log clean.
- Playwright at phone (390×844), tablet (820×1180), desktop (1280×900) on `/order/new`: computed font sizes of the demo names are larger than today (e.g. "FIGARO BLT" at `fs-lg`, "CAPRICE SANDWICH" at `fs-base`+), no card overflows its tile, stock badges and names don't overlap, "Out of stock" lines are tight, no console errors.
