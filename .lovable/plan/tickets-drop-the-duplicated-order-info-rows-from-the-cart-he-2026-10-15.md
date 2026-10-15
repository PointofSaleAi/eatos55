# Tickets: drop the duplicated order-info rows from the cart header

## What changes

In the Tickets detail pane (right side, landscape), the cart header currently shows, under the guest name line:

```text
[icon] 2 guests                                   UNPAID
[DINE IN]  [T1]  Main dining
Order# 1047 · Check 1047                    Server name
```

Both of those marked rows go away, leaving:

```text
Guest name            (646) 555-0110   Arrived at 11:40 AM
Order# 1047 · Check 1047                    Server name
```

Room / booking / signed-bill notes and order notes stay exactly where they are. The item list, payment section, totals and bottom actions are untouched.

Why: the highlighted card in the left list already carries the party size, order type, table, revenue centre and status for that same ticket, so repeating them above the receipt adds nothing.

## Scope

- Landscape detail pane only (the split view with the ticket list on the left).
- Phone and portrait ticket screens keep their existing summary card — there is no left-hand card list there, so nothing is duplicated.
- Applies to every ticket, including room tickets.
- No behaviour changes: opening a ticket, the selected-card highlight, Add Tip, Print, Take Payment, Cancel Order and room actions all work as before.
- The status pill (e.g. UNPAID) sits in the row being removed and goes with it, since the selected card already shows it. Say the word and it can be put back on the name line.

## Technical approach

- `src/routes/tickets.$ticketId.tsx`: delete the guest-count/status-badge row and the order-type chip / table pill / revenue-centre row from the `data-ticket-cart-header` block in the landscape branch. Remove the now-unused `orderType` and `TypeIcon` derivations and the `Users`, `Grid2x2`, `Utensils`, `Bike`, `ShoppingBag` imports (the portrait branch keeps `modeOrderType`).
- `roadmap.md` and `src/components/pos/AGENTS.md`: record that the landscape ticket detail header must not repeat what the selected card already shows (guests, order type, table, revenue centre).

## Verification

Playwright at 390x844 (phone), 834x1112 (portrait tablet), 1141x742 and 1440x900 (landscape): confirm the removed text is gone from the detail pane on every ticket type, the name / arrival / order number / server lines still render on one line with no clipping, the item list gains the freed vertical space, and ticket switching, tip adding and void confirmation still behave. Build and typecheck clean.
