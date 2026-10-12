# Restore text labels for Out of stock & Open price on New Order cards

## What changes
- On New Order product cards, the circular status icons are replaced by the earlier plain-text labels in the price slot: **Out of stock**, **Open price**, or the item's price — all in the same small, bold, muted style the price uses.
- No badge beside the product name; the label in the price row is the only indicator.
- Everything else on the card stays as it is: the stock count pill, the quick-add "+" button, long-press to open options, and out-of-stock items staying disabled with the manager-override toast.

## Technical details
- File touched: `src/routes/order.new.tsx` only.
- Replace the `<img src={outOfStockIcon | openPriceIcon}>` branch inside the card's bottom row with the single span used before: `text-fs-sm font-bold text-muted-foreground` rendering `item.outOfStock ? "Out of stock" : item.openPrice ? "Open price" : money(item.price)`.
- Remove the now-unused `openPriceIcon` / `outOfStockIcon` imports (this card is their only reference); the SVG files stay in `src/assets`.
- The image's `alt`/`title` text goes away with it; the visible label carries the same wording and the card's existing `aria-label` still announces out-of-stock items.
- No data, store, or route changes.

## Verification
- Typecheck (`bunx tsgo --noEmit`) and check the build log.
- Playwright at phone (390), tablet (1024) and desktop (1440): "CROQUE MONSIEUR" reads *Out of stock*, "FROMAGE FONDU" reads *Open price*, normal items still show their price; quick-add and long-press still work; no console errors.
