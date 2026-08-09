# Floating pill nav + separate "+" action

Yes — this pattern suits the POS well: the four things you *browse* stay in the bar, and the one thing you *do* most (start an order) becomes a single always-reachable button. It also frees the crowded 5-up tab row, which is tight at 320px.

## What changes

Current bar: a full-width, edge-to-edge row of 5 tabs (Home, Order, Tickets, Board, Settings).

New bar: a floating rounded pill that hovers above the bottom edge, containing 4 tabs, with a separate circular "+" button to its right.

```text
 ┌───────────────────────────────────┐  ┌────┐
 │  Home   Tickets   Board   Settings│  │ +  │
 └───────────────────────────────────┘  └────┘
```

- Active tab: filled pill behind the icon + label, accent-coloured (as in your reference).
- Inactive tabs: icon + label in muted foreground; colour change on press.
- "+" button: goes to New Order. On the order screens it becomes a checkmark/cart action instead of a duplicate.
- Both float over content, sitting above the home-indicator safe area.

## Details that must be handled

- **Content must not hide behind it.** The bar becomes overlaid rather than stacked, so screens need bottom clearance equal to the bar height plus safe area (existing `--tabs-h` token grows and every scroll area keeps using it).
- **Existing FABs collide.** Tickets and Settings already have their own round floating buttons in the bottom-right — exactly where "+" now lives. Those get folded into the new "+" (context-aware: New Ticket on Tickets, and the Settings FAB is dropped since it duplicates a row action).
- **Keyboard open:** the pill and "+" hide, same as today.
- **Small screens:** at 320px the four labels still fit; if a label would truncate, the inactive tabs show icon-only and only the active tab shows its label.
- **Landscape / tablet / desktop:** the side rail stays the primary nav there; the floating pill is portrait-phone only, so no double navigation.
- **Reduce Motion / accessibility:** press feedback keeps 44px hit areas, tabs keep accessible names, "+" gets an explicit label ("New order").

## Technical notes

Rework `BottomTabs` in `src/components/pos/shell.tsx` into a floating pill plus a sibling action button; drive sizing from the existing fluid tokens and grow `--tabs-h` so every `ScreenBody`/`ScreenFooter` keeps its clearance. Remove the per-screen FABs in `src/components/pos/tickets-screen.tsx` and `src/routes/settings.index.tsx`. Presentation only — no data or business-logic changes.

## Open question

The reference also shows a small secondary round button (scan). Say the word if you want a scan/barcode button there too; otherwise it's just "+".
