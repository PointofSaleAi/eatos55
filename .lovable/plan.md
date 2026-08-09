# Apple HIG conformance pass

Much of the foundation is already in place: one adaptive `clamp()` scale (Dynamic Type friendly), ≥44px tap targets, safe-area insets, keyboard-aware layout and search dock, reduced-motion support, back-gesture dismissal, momentum scrolling, no tap delay. This pass closes the remaining Human Interface Guidelines gaps, on phone portrait first and mirrored to tablet/desktop landscape.

## 1. Feedback and clarity (Principles / Patterns)
- Wire the existing `hapticFeedback` setting to real feedback: a small `haptics.ts` helper (Vibration API where supported, no-op on iOS Safari) fired on add-to-cart, tender confirm, PIN entry, and errors. Respects the toggle.
- Announce state changes for VoiceOver/TalkBack: polite `aria-live` region for cart total, item added, payment applied, ticket saved.
- Loading: replace bare spinners with content-shaped skeletons on menu, tickets, floor, board. Never block the whole screen for a partial load.
- Empty states: every list (tickets, search results, held orders, notifications) gets an icon + one-line explanation + primary action instead of blank space.

## 2. Destructive and confirming actions (Patterns / Components)
- Void item, void ticket, clear cart, refund, sign out, factory-reset style settings all route through a consistent action sheet with a red destructive label and a Cancel that is always the safe default.
- Use an action-sheet style (bottom, thumb-reachable) rather than centered alerts on phones; centered dialog on tablet/desktop.

## 3. Navigation and hierarchy (Designing for iOS)
- Consistent header contract on every screen: back chevron with accessible label on the left, title centered and truncating, at most two right-side actions, overflow into the 3-dot menu.
- Large-title-to-compact behavior on the main scrolling screens (Tickets, Settings, Board): title shrinks into the bar on scroll.
- Swipe actions on ticket rows (open / void) with tap equivalents in the row menu, so nothing is swipe-only.
- Pull-to-refresh on Tickets and Board, with the refresh also available in the overflow menu.

## 4. Color, contrast, appearance (Foundations)
- Follow the system appearance by default (`prefers-color-scheme`) with a Light / Dark / System control in Settings, using existing tokens only.
- Contrast audit: every text/background and badge pair to AA; honor `prefers-contrast: more` with stronger borders and dividers.
- Never use color alone to convey status — stock, ticket state and payment status get an icon or text label alongside the color.

## 5. Accessibility (Foundations)
- Accessible names on all icon-only buttons (drawer, header actions, keypad keys, tab items), with tabs exposing selected state.
- Focus order and visible focus rings on external keyboard use; sheets trap focus and restore it on close.
- Verify at 200% text with no clipping or horizontal scroll; verify reduce-motion swaps sheet slide for a fade.

## 6. Performance feel (Technologies)
- Route prefetch on tab/row press (extend existing behavior), image `decoding="async"` and fixed aspect boxes to stop layout shift, and virtualize long menu/ticket lists so scrolling stays at 60fps.
- Optimistic UI on add/void/apply-payment so taps register instantly.

## 7. Verification
Playwright matrix over 320x568, 360x640, 375x667, 393x852, 430x932 plus tablet/desktop landscape: no page-level or horizontal scroll, bottom bar visible, sheets capped, at 100% and 200% text, in light and dark, and with reduce-motion on. Screenshots for login, order, item sheet, custom item, review, payment, tickets, floor, board, settings.

## Technical notes
- New: `src/lib/haptics.ts`, `src/components/pos/confirm-sheet.tsx`, `src/components/pos/empty-state.tsx`, `src/components/pos/live-region.tsx`, `src/hooks/use-appearance.ts`, `src/hooks/use-pull-to-refresh.ts`.
- Changed: `src/components/pos/shell.tsx` (header contract, live region host, appearance class), `src/styles.css` (contrast + appearance tokens only, no new hard-coded px), tickets/order/payment/settings routes for sheets, empty states and swipe actions.
- No backend or business-logic changes; tax, pricing and data stay exactly as they are.
