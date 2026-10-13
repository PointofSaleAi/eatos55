# New Order: one-line subcategory chips + auto-scaling product names

Scope: `src/routes/order.new.tsx` only. Both changes apply to phone, tablet and desktop (the same markup serves all widths).

## 1. Subcategory chips — one line, slightly larger text

Current: chips are fixed `w-[7.25rem]`, text is `text-[0.625rem]` (10px), and long names wrap to two lines via `line-clamp-2 whitespace-normal`.

Change:
- Drop the fixed width (`w-[7.25rem]`); each chip sizes to its text (`shrink-0`, comfortable `px-3` padding).
- Replace the wrapping span with `whitespace-nowrap` so the name always renders on a single line.
- Raise the font size one step: `text-[0.625rem]` → `text-[0.6875rem]` (11px), matching the category pills above.
- Layout behavior stays as-is:
  - Horizontal mode: the row already scrolls horizontally (`flex flex-nowrap` + `no-scrollbar`), so longer single-line chips simply scroll.
  - Vertical mode: `flex flex-wrap` with content-sized chips wraps rows naturally.

## 2. Product name — auto-scale by length

Current: every product name renders at `text-fs-sm` regardless of length, leaving unused space at the bottom of short-name cards.

Change: two-tier sizing by name length so short names use the spare space:
- `item.name.length <= 12` characters → `text-fs-base` (larger step).
- Longer names → keep `text-fs-sm` so multi-word names still fit the tile.

The stock-count badge, price row, quick-add button and card sizing (`min-h-tile`) are untouched.

## Verification

- Build log clean after edits.
- Playwright at phone (390×844), tablet (820×1180) and desktop (1280×900) widths on `/order/new`: subcategory chips render on one line and scroll horizontally; a short-name product (e.g. "Coffee") visibly renders larger than a long-name product; no console errors.
