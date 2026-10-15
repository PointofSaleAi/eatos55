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
- Product-card names use width-constrained browser measurements and semantic typography steps, with emergency word wrapping rather than truncation, so long words cannot overflow when the product area resizes.

- Public access routes own responsive widths; the shell never constrains account or recovery content.

- Demo password recovery stays in ephemeral route-local step state and never persists passwords or claims real code delivery; this keeps the prototype separate from real authentication.

- Demo signup uses transient route-local steps and only enters the demo session after code verification; setup credentials are never persisted or used for employee authentication.
- Voice dictation in any search field goes through `useVoiceSearch` in `src/lib/voice-search.ts`, so every mic shares one listening state, the same notices, and never submits or overwrites text when nothing is heard.

- orderOS owns its own order lifecycle in `src/lib/orderos-store.tsx` and never routes to Tickets; its board, detail and issue flows stay in-page so status changes persist across navigation.
- The header settings panel uses a focused shortcut map resolved against shared settings destinations; guestbook derives read-only identities from existing POS data without fabricating contacts or combining distinct known email identities.
- Settings drawer dismissal retains the panel through its exit animation; body swipe closing is allowed only at the scroll boundary and suppresses subsequent clicks, so scrolling and gestures cannot activate shortcuts.
- Restaurant Information uses a dedicated form backed by shared demo settings, keeping structured address fields synchronized with its address summary and contact validation consistent with shared country helpers.
- Restaurant operating hours use shared demo settings with native time inputs and presentation-only 12-hour formatting, so edits persist without changing order or reporting logic.
- End of Day settings use shared demo settings and a separate start-checklist route; closing is explicitly a demo confirmation, never an implicit ticket, staff, drawer or reporting mutation.
- Schedule Information uses a dedicated editor and shared demo settings with per-day times and a reversible archive flag; row swipes reveal actions without opening the editor or archiving on dismissal, and never change employee shifts or ordering logic.
- Timed Pricing uses structured demo settings for dates, source, centre and times, separate from checkout pricing; archive/restore uses reversible swipe actions, never deletion.
- Control Center's Device Settings, Hardware Control and Guest Facing Display have dedicated routes with merged demo defaults; switches do not change hardware, payments or auth, and App Theme uses the appearance hook.
