# Fix the startup "phone then landscape" flash and sign-in/navigation glitches

## What is going wrong (confirmed in the code)

1. **Phone frame flashes first.** The app decides "phone vs. tablet/desktop layout" only after the page has loaded. Until then it assumes a phone, so on every refresh or first open you see the handheld frame for a moment before it snaps to the landscape layout.
2. **Saved sign-in loads late.** Your sign-in, clock-in, settings and floor plan are read from the device only after the first screen has drawn. For that moment the app thinks you are signed out with default settings, so a protected screen can flash, then bounce to sign-in / clock-in or redraw with your real settings.
3. **Theme loads late.** Light/dark preference is applied after the first draw, so the colours can flicker.
4. **Some popups and the clock-in screen** use the same late "is this wide?" check, so they can open in the phone style and then jump.

## The fix

- **Hold the first frame until the app knows the device and the session.** On open/refresh, show a plain background (in the correct light/dark colour) for that split second, then draw the correct layout straight away: phone, tablet or desktop. No more handheld frame flashing on wide screens.
- **Read the layout and theme instantly.** Layout width and theme are set before anything paints, so popups, the clock-in screen and the left nav open in the right form the first time.
- **Load all saved data together.** Sign-in, clock-in, settings and floor plan are loaded in one step before screens render, so no screen shows default values and then changes.
- **No protected screen flashes before a redirect.** If you are signed out or not clocked in, the app goes straight to sign-in / the PIN pad without briefly showing the screen behind it.
- **Navigation check.** After the fix, walk through sign-in, PIN, Floor, New Order, Tickets, Payment and Settings on phone, tablet and desktop, capturing frames during each change to confirm there are no jumps, double renders or layout switches.

## Technical details

- `src/hooks/use-layout-mode.ts`: replace the `useState(false)` + effect pattern in `useWideViewport` / `useLandscapeWide` with `useSyncExternalStore` over `matchMedia` (server snapshot `false`), so post-hydration mounts read the true value on first render.
- `src/routes/__root.tsx`: add a tiny inline head script that sets `html[data-layout]` (from `matchMedia("(min-width: 768px)")`) and the stored appearance class before first paint.
- `src/components/pos/shell.tsx` (`DeviceFrame`): add a client-ready gate. Until mounted and `sessionReady`, render only the themed background (SSR and hydration output match, so no mismatch); then render the real frame. Also render the background instead of `children` while `useSessionGate` has a redirect pending (signed out on a protected path, or not clocked in).
- `src/lib/pos-store.tsx`: load session, settings and floor from storage in one effect and set `sessionReady` only after all three are applied, so consumers never see defaults.
- `src/hooks/use-appearance.ts`: initial state read aligned with the inline script so the theme is not re-applied with a flicker.
- Verification: Playwright on 390x844, 1024x768, 1141x742 and 1440x900, screenshotting immediately after load and during route changes, plus build log check.
