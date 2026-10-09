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

- Keep root error boundaries typed with TanStack Router's `ErrorComponentProps` because router upgrades expose boundary errors as `unknown`.
- Use the shared DialogContent and SheetContent close control for modal X buttons so they remain outside the top-right corner consistently across viewports.
- DeviceFrame renders only a blank themed surface until mounted and all saved state (session, settings, floor) is loaded, and layout hooks use useSyncExternalStore over matchMedia: prevents the phone-frame flash and protected-screen flashes on load.
- Shared React contexts are created via pinnedContext (globalThis registry) and main screens are preloaded after sign-in (router defaultPreload intent + useWarmMainScreens): live preview updates can't split contexts, and first visits/PIN unlock don't stall.
- Clock-out ownership changes retain each ticket's transfer origin so transferred checks can be grouped and reassigned until the shift is completed.
- New Order owns the order-options open state and docks the options as a third column only on landscape-wide screens: keeps product, cart, and option widths coordinated while preserving a usable overlay on narrow screens.
