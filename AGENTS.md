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

- Subdirectories may carry their own `AGENTS.md`; read the nearest one before changing files there — `src/routes/AGENTS.md` covers screens (settings, access, guestbook), `src/components/pos/AGENTS.md` covers POS surfaces, tiles and tickets, `src/AGENTS.md` covers shared `src/lib` and `src/styles.css` conventions.
- Keep root error boundaries typed with TanStack Router's `ErrorComponentProps` because router upgrades expose boundary errors as `unknown`.
- Dashboard and four-square Menu share the shift overview; the header chevron owns settings. Lists share destinations and isSettingsDestinationVisible for consistent session-based visibility.
- Shared DialogContent and SheetContent never render outside-corner X controls; use their outside-dismissal callbacks, and give custom overlays cancel-only dismissal so closing cannot commit an action.
- DeviceFrame renders a blank themed surface until mounted and all saved state (session, settings, floor) is loaded and owns rail placement, while layout hooks use useSyncExternalStore over matchMedia — so no phone-frame or protected-screen flash on load, and navigation drag rules stay with the POS rules file.
- Shared React contexts come from pinnedContext (globalThis registry) and main screens preload after sign-in (router defaultPreload intent + useWarmMainScreens): live preview updates can't split contexts, and first visits or PIN unlock don't stall.
- Every Tap to Pay surface (checkout, settings rows, reader list, home reminder, route guards) goes through `useTapToPayAvailable` / `useTapToPayTenderVisible` in `src/lib/device.ts`, combining the iPhone check with the phone-layout check, so no screen re-offers Tap to Pay on tablet or web.
- Voice dictation in any search field goes through `useVoiceSearch` in `src/lib/voice-search.ts`, so every mic shares one listening state, the same notices, and never submits or overwrites text when nothing is heard.
- Wall-clock labels shown while the app runs come from `useLiveTime` in `src/lib/use-live-time.ts` (mount-gated, minute-aligned), so every screen that displays the current time shares one ticking source rather than its own interval.
- orderOS owns its own order lifecycle in `src/lib/orderos-store.tsx` and never routes to Tickets; its board, detail and issue flows stay in-page so status changes persist across navigation.
