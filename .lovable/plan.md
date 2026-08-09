# Fix: top bar controls stop responding

## What's happening

Tapping the burger menu freezes the screen. Once that happens, nothing in the top bar (guest block, search, custom item, the 3-dot menu) responds any more — which is why "none of the top links work".

Confirmed by driving the running app: with the drawer closed, each top control fires correctly (guest sheet opens, more-sheet opens, search toggles, custom item navigates). The moment the burger is tapped, the page stops responding to any further interaction.

## Root cause (verified)

`src/hooks/use-back-dismiss.ts` (the Android/browser back-to-close helper) has `onClose` in its effect dependency list, and every overlay passes a freshly created inline arrow function:

- `src/components/pos/shell.tsx` → `<NavDrawer onClose={() => setNavOpen(false)} />`
- same pattern for `item-sheet`, `guest-sheet`, `more-sheet`

So on each render the effect tears down and re-runs: it calls `history.back()` in cleanup, that fires `popstate`, which calls `onClose`, which re-renders, which pushes a new history entry again. The result is a runaway history push/pop loop that pins the main thread and makes the whole header unresponsive.

## The fix

1. Make `useBackDismiss` identity-safe: keep the latest `onClose` in a ref and depend only on `open`, so the history entry is pushed once per open and cleaned up once on close.
2. Stabilise the overlay close callbacks with `useCallback` in `shell.tsx` and the sheet call sites, so no overlay can re-trigger the effect.
3. Guard the cleanup so `history.back()` only runs when our own `posOverlay` entry is still the current one.

## Verification

Re-run the interaction pass on a phone viewport (and 1180 desktop frame) against `/order/new`, `/tickets`, `/floor`, `/settings`:
- burger opens the drawer, backdrop / X / Escape / browser back each close it once
- after closing, guest block, search, custom item and the 3-dot menu all still respond
- item sheet, guest sheet and more sheet open/close repeatedly with no freeze
- no console errors, no runaway history entries

## Scope

Behaviour/interaction fix only — no visual redesign, no data changes. Applies to portrait phone, tablet and desktop frames since the hook is shared.
