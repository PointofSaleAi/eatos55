# Landscape tablet + web version of the same app

Today every screen renders inside a fixed 420px handheld frame on tablet and desktop (`DeviceFrame` in `src/components/pos/shell.tsx` pins `md:w-[420px]`), so a tablet in landscape shows a phone in the middle of a dark page. This adds a real landscape layout for tablets and web while keeping the phone experience untouched.

## 1. Adaptive shell with a frame toggle

- Below ~768px: unchanged phone layout (bottom pill tabs, full-bleed).
- 768px and up: the app fills the viewport — no phone frame, no letterboxing. Content is capped by a max width with generous gutters so it never stretches to unreadable line lengths on a 27" monitor.
- A small "Handheld preview" toggle (top-right of the shell chrome, only visible at md+) switches back into the 420px framed handheld view for demos and design review. The choice is remembered locally.

## 2. Navigation: rail + collapsible drawer

- Landscape gets a persistent left navigation rail: compact icon rail by default (Home, Tickets, Board, Order, Settings) with the primary action button at the top.
- Tapping the rail's expand control widens it into a full labelled sidebar with the same grouped destinations as the phone drawer; collapsing returns to icons. State persists.
- Bottom pill tabs are phone-only; the rail is tablet/desktop-only. Never both.
- The grey account band (name, notifications, refresh) moves to the top-right of the landscape layout.

## 3. Two-pane screens (landscape only)

Each of these keeps its current single-pane phone behaviour and gains a side-by-side layout at md+ landscape. Selecting an item updates the right pane instead of navigating away; deep links still work, and with nothing selected the right pane shows a clear empty state.

```text
┌──────┬────────────────┬──────────────────────┐
│ rail │ list / grid    │ detail / cart        │
└──────┴────────────────┴──────────────────────┘
```

- Tickets: ticket list left, ticket detail (items, payments, tips, actions) right.
- Order: menu category + item grid left, running order/cart with totals and Pay pinned right. Item modifiers open as a centred dialog instead of a bottom sheet.
- Settings: settings tree left, selected topic right (Apple-style split).
- Floor plan: larger table grid left, selected table panel (status, guests, timer, open ticket) right.

## 4. Tablet-grade density and touch

- Wider breakpoints raise grid column counts (menu items, payment tiles, floor tables) and use the extra room instead of scaling everything up.
- Bottom sheets become centred dialogs at md+ (item, discount, guests, tip, split, status, date range); drag-to-close stays phone-only.
- Keypads (cash, custom item, PIN) get a landscape arrangement: keypad beside the summary rather than stacked.
- Tap targets stay at 44px minimum; hover and keyboard focus states are added since landscape web has a pointer.
- Safe-area insets kept for iPad; keyboard-inset logic unchanged.

## 5. Verification

Playwright pass at 320/393/430 portrait (no regression), 820x1180 and 1180x820 (iPad), 1024x768, 1280x800 and 1728x1117: no horizontal overflow, rail present, two-pane screens laid out correctly, sheets rendering as dialogs, frame toggle working both ways.

## Technical notes

- `src/components/pos/shell.tsx`: `DeviceFrame` gains a layout mode (`adaptive` | `framed`) from a small `useLayoutMode` hook (localStorage-backed) plus a `useLandscapeLayout` hook (`min-width: 768px`); `BottomTabs` gated to phone; rail mounted for landscape.
- `src/components/pos/nav-rail.tsx` is revived and extended with expand/collapse and the grouped destinations from `nav-drawer.tsx` (shared destination list extracted so both stay in sync).
- New `src/components/pos/split-pane.tsx` renders single-pane on phone and list+detail at md+; tickets, order, settings and floor routes wrap their existing components in it. Detail panes reuse the existing route components — no duplicate screens.
- Sheet-vs-dialog handled by one shared `AdaptiveSheet` wrapper so each sheet file changes minimally.
- Presentation only: no changes to `src/lib/pos-store.tsx` business logic beyond a selected-id for panes, no data or backend changes.
