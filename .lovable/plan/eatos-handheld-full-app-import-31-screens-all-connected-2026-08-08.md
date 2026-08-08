# EATOS Handheld — full app import (31 screens, all connected)

Recreate the handheld POS from the prototype as a real, fully clickable app. No gallery/showcase wrapper: the app itself fills the screen. All data is realistic in-memory demo data, so every flow works end to end without a backend.

## Design

Ported from the prototype: near-black shell, white app surface, magenta accent, teal "paid" green and amber "preparing" states, tight bold sans headings, rounded 2xl cards, pill filter tabs, bottom tab bar (Tickets / Orders / Settings), floating dark search button.

All colors/radii/fonts become semantic tokens in `src/styles.css` — no hardcoded color utilities in components.

## Responsive behaviour (mobile, tablet, desktop)

- Mobile: true full-screen handheld app.
- Tablet/desktop: the app renders inside a centered device frame on the dark backdrop (as in the prototype), so layouts never stretch. Tablet gets a wider frame; touch targets stay ≥44px everywhere.
- Header rows use grid + `min-w-0` + `truncate` so names and totals never clip.

## Screens and connections

**Access (6)** — Sign in, Forgot password, Create account, Clock in (PIN pad + biometric prompt), Select station, Manager PIN.
Flow: Sign in → Clock in → Select station → Tickets. Forgot password / Create account link off Sign in. Manager PIN appears as a modal gate before protected actions (voids, discounts, manager controls).

**Tickets (6)** — Live tickets (All / Ordering / Payment / Ready filter pills, live ticket cards), Sort tickets, Filter tickets, Search tickets, Manager controls, What is new.
Sort/filter/search actually reorder and narrow the live ticket list. Tapping a ticket opens Order review.

**Order (4)** — New order (categories + product grid), Choose menu (selling modes), Custom item (open price keypad), Order review (line items, tax, total).
Flow: Tickets → New order → add items to a real cart → Order review → Payment. Quantity edit and remove work.

**Payment (3)** — Payment method, Pay by cash (quick tender + keypad, change due), Pay by card (terminal handoff with processing → approved states).
On completion the ticket flips to Paid and returns to Live tickets with a success toast, plus a receipt/completion step.

**Settings (6)** — Settings hub, More settings, General, Menu settings, Payment settings, Workforce. All toggles/selects hold state.

**System (5)** — Control Center, Network, Hardware, Integrations, Customer support, plus Help center.

Every list row, tab, back arrow, and toggle is wired — no dead ends. Missing pieces the prototype implies and I'll add: receipt/order-complete screen, ticket detail from the Orders tab, clock-out from Manager controls, and a 404 route.

## Technical notes

- Route files under `src/routes/` mirroring the six groups (e.g. `access.sign-in.tsx`, `tickets.index.tsx`, `order.new.tsx`, `payment.cash.tsx`, `settings.general.tsx`, `system.network.tsx`), each with its own `head()` metadata; `/` becomes the app entry (Sign in / Live tickets).
- Shared `AppShell` (header, bottom tab bar, device frame) as a layout route so chrome is defined once.
- Demo data in `src/lib/demo-data.ts`; session/cart/ticket state in a React context provider (`src/lib/pos-store.tsx`) mounted in `__root.tsx` so state persists across navigation.
- shadcn primitives + `sonner` for toasts (`<Toaster />` mounted once in `__root.tsx`).
- No backend; can be swapped to Lovable Cloud later without changing screens.
