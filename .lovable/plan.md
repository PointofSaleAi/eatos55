# Voice mic in the Settings search bar, plus a shorter field

## What you'll see

The Settings search bar gets a microphone button on its right edge — tap it, speak, and what you said lands in the field as your search text. The bar itself becomes a little shorter, on every screen size.

```text
before   ( Search                      )
after    ( Search                 mic  )   typing adds:   ( Search        mic x )
```

## Where it applies

Both Settings search bars, so phone, tablet and desktop behave the same:

- The sidebar bar (landscape tablet / web) — the one added last round.
- The Settings hub bar (phone / portrait), which already shows a mic that does nothing today; it will start listening.

Other search bars in the app (Tickets, New Order product search) stay exactly as they are.

## Mic behaviour

One shared voice-search helper, the same one the add-on search already uses, so there is a single copy of the logic:

- Tap the mic: "Listening…" notice, the mic turns accent-coloured and pulses while it is hearing you.
- Speech found: the words are written into the search field and the list filters live.
- Nothing heard / mic unavailable on that device: a short notice says so, the field keeps whatever you typed.
- The mic never submits or saves anything — it only fills the search text.

## Height change

The bar drops from the large control size to the medium one:

| Screen | Now | After |
| --- | --- | --- |
| Phone (<1024px) | ~44px | ~44px (already at the comfortable tap minimum, so unchanged) |
| Your view (1141x742) | 56px | 52px |
| Laptop 1366px+ | 60px | 56px |
| Large desktop 1920px+ | 68px | 60px |

The text inside keeps its current size and stays at least 44px tall to tap, so the bar reads tighter without becoming harder to hit.

## Technical details

- New `src/lib/voice-search.ts`: `useVoiceSearch(onResult)` returning `{ supported, listening, start }`; wraps `SpeechRecognition` / `webkitSpeechRecognition`, guards for `window` so it is click-only and SSR-safe.
- `src/components/pos/item-sheet.tsx`: its inline voice-search code is replaced by the shared hook, behaviour identical.
- `src/components/pos/split-pane.tsx`: mic button added inside the sidebar field (input, mic, then clear X when typing); field switches `min-h-ctl-lg` to `min-h-ctl-md`.
- `src/components/pos/search-dock.tsx`: gains optional `voice` and `compact` props, both off by default, so the Tickets and New Order search fields are untouched.
- `src/routes/settings.index.tsx`: the hub trigger's mic starts listening and opens the search dock; hub trigger and docked field use the medium height.
- No data, routing or business-logic changes; the search still only filters the visible destinations.

## Verification

- Build log clean.
- Browser check at your viewport (1141x742): mic sits inside the sidebar bar, measured height 52px, typing still filters, tapping the mic in headless Chromium shows the "not available here" notice without breaking the field.
- Phone 390x844 and portrait tablet 768x1024: hub mic starts listening, docked field is the shorter size, "No settings found" still shows for a nonsense term.
- Tickets and New Order search fields confirmed unchanged (no mic, original height).
