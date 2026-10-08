# Fix the PIN "first try fails", slow screen changes, and missing cart

## What I found

I ran the full flow in a fresh browser (sign in, PIN 1500, Tickets, New Order) on your screen size. On a warm machine it worked first time. The problems come from three things that show up when the app is loading for the first time, which is what you see in the preview:

1. **The PIN looks like it failed, but it is still loading.** After you press Enter, the PIN pad clears straight away and the "PIN accepted" message shows, but the app stays on the PIN screen while it loads the next screen. Nothing on the screen shows that it is working. On a first open that loading takes a few seconds, so it looks like the PIN was rejected. You type it again, the next screen is already loaded by then, and it lets you in.
2. **Every screen is loaded only when you tap it.** The app never loads the next screen ahead of time and shows nothing while it loads. So the first visit to Tickets, Floor or New Order is slow, and a tap seems to do nothing for a moment.
3. **The cart can go missing next to the menu.** In your screenshot the left menu is showing, which means the app knows it is in wide mode. But New Order still shows the phone-style MENU / ORDER switch with no cart. Those two parts read the wide setting from a shared value. When the preview refreshes itself after a change, the two parts can end up reading different copies of that value. I fixed the same problem for sign-in data earlier, but not for this value.

## The fix

**PIN screen**
- When a correct PIN is entered, the stars stay filled, the keys lock and a small "Signing in" spinner shows until the next screen is actually open. You never get a blank pad that looks like a rejection.
- If opening the next screen fails, the pad resets and asks you to try again.
- While the PIN screen is open, the app quietly loads Tickets, Floor, New Order and the screen you were last on. Pressing Enter then opens it straight away.

**Moving between screens**
- The app loads a screen as soon as your finger touches its button in the left menu, bottom tabs or menu drawer, before you let go.
- After you unlock, the main screens (Tickets, Floor, New Order, Payment, Settings) load quietly in the background.
- A thin progress line appears at the top whenever a screen takes more than a moment, so a tap always shows a response.

**Cart beside the menu**
- The shared "wide mode", menu drawer, confirm and screen-reader values get the same protection as sign-in data, so the preview can't split them.
- New Order decides whether to show the cart from the same source as the left menu, so you can never see the menu without the cart again.

**Check**
- I'll run the full flow from a completely fresh browser with the cache cleared and the computer slowed down to mimic a real tablet. That covers sign in, then PIN on the first try, then Tickets, Floor, New Order with the cart, then Payment and Settings.
- I'll repeat it on phone, tablet and your desktop size (1141x742) and time each step.

Note: the preview runs in a slower test mode. Your published app loads much faster, but these fixes help both.

## Technical details

- `src/routes/access.clock-in.tsx`: `unlock` becomes async with an `unlocking` state; await `router.navigate(...)`; keep `pin` until resolved; pass `busy` to `PinPad` (disables keys, shows spinner in the Enter key). On mount, `router.preloadRoute` for `/tickets`, `/floor`, `/order/new` and the `resumeAfterUnlock` target (peek without consuming).
- `src/components/pos/pin-pad.tsx`: new optional `busy` prop.
- `src/router.tsx`: `defaultPreload: "intent"`, `defaultPreloadDelay: 0`, `defaultPendingMs` tuned; keep `defaultPreloadStaleTime: 0`.
- New `src/components/pos/route-progress.tsx`: top progress bar driven by `useRouterState({ select: s => s.status === "pending" })`, shown after ~150ms, mounted in `DeviceFrame`.
- `src/components/pos/shell.tsx`: after unlock (`session.clockedIn` true), idle-preload the main section routes once.
- Pin `WideContext` (shell.tsx), `NavDrawerContext`, `ConfirmContext`, `LiveRegionContext` on `globalThis`, same pattern as `PosContext`.
- `src/routes/order.new.tsx`: keep `useWideLayout()`, now backed by the pinned context.
- Verification: Playwright with fresh context, `CDPSession Emulation.setCPUThrottlingRate(4)` and cache disabled; timings and screenshots at 390x844, 1024x768, 1141x742.
