# Disable Clock Out / Break / Clock In / ENTER until a PIN is entered

## What changes

The four action keys on the PIN pad — **Clock Out**, **Break**, **Clock In** and **ENTER** — become untappable until all four PIN digits are entered. While locked they stay in their own colours (red Clock Out, green Clock In, dark ENTER) at about 40% strength, with no hover or press response. Once the fourth digit lands, they return to full strength and work exactly as they do today.

Everything else on the pad is untouched: number keys, **C**, the delete key, fingerprint and face keys, the Revenue Center button and its popover, and **Log out** all stay active at all times.

## Where it applies

The pad is one shared component used in two places, so both are covered by the same change:

```text
PIN pad (shared)
├── Lock screen  -> Clock In / break / ENTER   (access clock-in screen)
└── Top bar pull -> Clock In / break / ENTER   (switch-user keypad)
```

The "Enter PIN" bottom sheet is unaffected — it has no ENTER or clock row.

## Behaviour details

- A disabled key cannot be clicked, focused by keyboard, or announced as available to screen readers.
- The existing "Enter your 4-digit PIN" warning stays in the code as a safety net, but in normal use you will no longer see it from these four keys, because they can't be pressed.
- Entering a wrong 4-digit PIN still behaves as before — the keys unlock, and the action runs as it does now.
- Because the fix lives in the shared pad, it applies identically on phone, tablet and desktop, in portrait and landscape, and in both themes.

## Technical details

- `src/components/pos/pin-pad.tsx`
  - `GateKey` gains an optional `disabled` prop: renders `disabled` + `aria-disabled`, removes `hover:brightness-95` / `active:scale-[0.985]`, and applies a dimmed treatment (roughly `opacity-40`, `cursor-not-allowed`) that keeps the existing tone colours.
  - `PinPad` derives `pinReady = pin.length >= 4` and passes `disabled={!pinReady}` to the ENTER key (only when an enter action exists) and to Clock Out / Break / Clock In.
- `src/routes/access.clock-in.tsx` and `src/components/pos/clock-pulldown.tsx`: no logic change — their `withPin` / `requirePin` guards remain as the fallback path.
- Verification: build log clean, then a Playwright pass at 390x844, 768x1024 and 1141x742 confirming the four keys report disabled with an empty pad, become enabled after four digits, and that Clock In still opens the job-type step and ENTER still opens New Order.
