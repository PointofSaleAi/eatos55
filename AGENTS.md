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
- Dashboard and the four-square Menu destination render the same shared shift overview so figures and interactions stay consistent; the header chevron owns the settings menu, and settings destinations are shared by the hub, header and sidebar.
- Shared DialogContent and SheetContent never render outside-corner X controls; use their existing outside-dismissal callbacks, and give custom overlays equivalent cancel-only dismissal so closing cannot commit an action.
- DeviceFrame renders only a blank themed surface until mounted and all saved state (session, settings, floor) is loaded, and layout hooks use useSyncExternalStore over matchMedia: prevents the phone-frame flash and protected-screen flashes on load.
- Shared React contexts are created via pinnedContext (globalThis registry) and main screens are preloaded after sign-in (router defaultPreload intent + useWarmMainScreens): live preview updates can't split contexts, and first visits/PIN unlock don't stall.
- Clock-out ownership changes retain each ticket's transfer origin so transferred checks can be grouped and reassigned until the shift is completed.
- New Order owns the options panel and inline Custom Item state; cart actions portal into the landscape rail or narrow sheet, while Custom Item replaces only the product area so the cart and menu state persist.
- Current-order transfers use shared POS ownership state, with a resumable draft owner for unsaved orders and ticket ownership for existing checks, so ownership survives navigation and payment.
- Add Guest replaces only the cart body in OrderPanel and saves through the shared current-order guest state, preserving products and cart actions while editing.
- Guest addresses retain both structured U.S. fields and a formatted compatibility string so Add Guest and service-order forms stay synchronized.
- Every Tap to Pay surface (checkout, settings rows, reader list, home reminder, route guards) goes through `useTapToPayAvailable` / `useTapToPayTenderVisible` in `src/lib/device.ts`, which combine the iPhone check with the phone-layout check, so no screen can re-offer Tap to Pay on tablet or web.
