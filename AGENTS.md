<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history, force pushing, or rebasing/amending/squashing commits
> that are already pushed, as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Subdirectories may carry their own `AGENTS.md`; read the nearest one before changing files there.
- SubHeader accepts an optional local back callback for inline editors so returning to a list does not leave the current settings destination.
- Keep root error boundaries typed with TanStack Router's `ErrorComponentProps` because router upgrades expose boundary errors as `unknown`.
- Dashboard and the four-square Menu destination render the same shared shift overview; the header chevron owns the settings menu, and settings destinations are shared by the hub, header and sidebar.
- Shared DialogContent and SheetContent never render outside-corner X controls; use their outside-dismissal callbacks, and give custom overlays cancel-only dismissal so closing cannot commit an action.
- DeviceFrame renders a blank themed surface until mounted and all saved state (session, settings, floor) is loaded; layout hooks use useSyncExternalStore over matchMedia, so no phone-frame or protected-screen flash on load.
- Shared React contexts come from pinnedContext (globalThis registry) and main screens preload after sign-in (router defaultPreload intent + useWarmMainScreens): live preview updates can't split contexts, and first visits or PIN unlock don't stall.
- Clock-out ownership changes retain each ticket's transfer origin so transferred checks can be grouped and reassigned until the shift is completed.
- New Order owns the options panel and inline Custom Item state; cart actions portal into the landscape rail or narrow sheet, while Custom Item replaces only the product area so cart and menu state persist.
- Current-order transfers use shared POS ownership state, with a resumable draft owner for unsaved orders and ticket ownership for existing checks, so ownership survives navigation and payment.
- Add Guest replaces only the cart body in OrderPanel and saves through the shared current-order guest state, preserving products and cart actions while editing.
- Guest addresses retain both structured U.S. fields and a formatted compatibility string so Add Guest and service-order forms stay synchronized.
- Every Tap to Pay surface (checkout, settings rows, reader list, home reminder, route guards) goes through `useTapToPayAvailable` / `useTapToPayTenderVisible` in `src/lib/device.ts`, combining the iPhone check with the phone-layout check, so no screen re-offers Tap to Pay on tablet or web.
- Product-card names use width-constrained browser measurements and semantic typography steps, with emergency word wrapping rather than truncation, so long words cannot overflow on resize.
- Public access routes own responsive widths; the shell never constrains account or recovery content.
- Demo password recovery stays in ephemeral route-local step state and never persists passwords or claims real code delivery.
- Demo signup uses transient route-local steps and only enters the demo session after code verification; setup credentials are never persisted or used for employee authentication.
- Voice dictation in any search field goes through `useVoiceSearch` in `src/lib/voice-search.ts`, so every mic shares one listening state, the same notices, and never submits or overwrites text when nothing is heard.
- orderOS owns its own order lifecycle in `src/lib/orderos-store.tsx` and never routes to Tickets; its board, detail and issue flows stay in-page so status changes persist across navigation.
- Network Servers uses a dedicated connection screen with merged shared demo preferences; sync, offline numbering and edgeOS controls never perform real network operations or alter order numbering.
- Hardware printer topics share dedicated screens and merged demo printer preferences; configuration is separate from checkout and receipt execution, and detection/test actions never claim live hardware results.
- Hardware Emulators uses shared flat demo switches with a cancel-only lab notice; it never changes peripheral execution or payment processing.
- Hardware uses shared demo device lists; Cash Management reuses drawers but saves its assignment separately, so selection never connects hardware or changes payments.
- Customer Support embeds the official Crisp support chat with its public website identifier and the official support site in Contact Us; no simulated delivery or agent responses replace the hosted service.
- Sales retains the published /settings/reports URL and uses separate shared demo filter preferences; changing these controls never changes transactions or claims a live report or print operation.
- Wall-clock labels shown while the app runs come from `useLiveTime` in `src/lib/use-live-time.ts` (mount-gated, minute-aligned), so every screen that displays the current time shares one ticking source rather than its own interval.
- Typed dollar amounts use `MoneyInput` (src/components/pos/money-input.tsx) so every field fills cash-register style from the last decimal, matching the keypads.
- Products settings are demo-only; only the product-order-options rules affect New Order.
