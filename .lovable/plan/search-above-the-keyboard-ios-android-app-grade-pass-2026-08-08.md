# Search above the keyboard + iOS/Android app-grade pass

## 1. Search that docks above the keyboard

Today the search field lives inline in the header and can end up behind the on-screen keyboard; only a `scrollIntoView` nudge tries to save it.

- When search is active on a phone, the search field detaches into a docked bar pinned directly above the keyboard (offset by the measured keyboard height), the way iOS Mail/Safari and Android search sheets behave.
- Dock behaviour: rounded field + Cancel action, results list scrolls behind it, `Enter` and the keyboard "Search" key both commit, Escape/Cancel dismisses and returns focus.
- Applied consistently to every search surface: new order product search, tickets search, settings search, menu category search.
- On tablet/desktop (no software keyboard) search stays inline as it is today — no visual change.

## 2. Platform capability gaps to close

Verified missing in the project today:

- **Safe areas**: no `viewport-fit=cover` and no `env(safe-area-inset-*)` usage. Add both so the app clears the iPhone notch/home indicator and Android gesture bar — header top padding, bottom tab bar, docked search bar and sheet footers.
- **No installable app metadata**: add a web app manifest (name, black-and-white in-app logo, pink launcher icon, `display: standalone`, theme/background colours), Apple meta tags (`apple-mobile-web-app-capable`, status-bar style, `apple-touch-icon` already present), and `theme-color` for Android Chrome.
- **iOS focus zoom**: ensure every text input renders at >=16px so Safari never auto-zooms on focus.
- **Scroll/touch feel**: `-webkit-overflow-scrolling: touch` momentum on scroll areas, overscroll containment on sheets and lists so page-level rubber-banding stops, `touch-action: manipulation` to kill the 300ms tap delay, and tap-highlight removal with a real pressed state instead.
- **Tap targets**: audit every control to a 44px minimum (a few icon buttons and chips are 36–40px today) and keep 8px spacing between adjacent targets.
- **Motion & accessibility**: honour `prefers-reduced-motion` for sheets/drawer, honour `prefers-color-scheme`, keep visible focus rings for keyboard/switch-control users, and confirm labels on all icon-only buttons.
- **Back gesture / navigation parity**: Android hardware/gesture back closes the open sheet or drawer instead of leaving the screen; iOS keeps the on-screen back chevron.
- **Perceived speed**: prefetch route data on tab/drawer press, keep list scroll position when returning from a detail screen, and give buttons instant optimistic feedback (pressed state before navigation).
- **Offline resilience**: the POS shell keeps working with a dropped connection — cached shell assets plus a clear offline banner, since a handheld on venue Wi-Fi will lose signal.

## 3. Verification

Playwright pass at 320, 393, 430 (iPhone Pro Max class), 768 and desktop widths, portrait and landscape: docked search sits above the simulated keyboard, no field or footer is covered, safe-area padding present, no element below 44px, no horizontal overflow.

## Technical notes

- Reuse `useGlobalKeyboardAware` / `--kb-inset` from `src/hooks/use-keyboard-inset.ts` for the dock offset; no second measuring mechanism.
- New `SearchDock` component in `src/components/pos/` used by `order.new`, `tickets-screen`, settings search.
- Safe areas via CSS custom props in `src/styles.css` (`--sat`, `--sab`) composed with `--kb-inset`; `viewport-fit=cover` added to the viewport meta in `src/routes/__root.tsx`.
- Manifest as a static `public/manifest.webmanifest` linked from the root route head; no colour or font token changes.
- Offline shell via a small service worker registered client-side only, guarded so dev/HMR is unaffected.
