# Remove the white background from the Maya AI animation

## Why it looks white

The uploaded video itself has a baked-in near-white background (about `#F2F2F2`) — the colorful ribbons float on a white canvas. The app just plays that video as-is, so the white shows everywhere the Maya mark appears (header shortcut, dashboard card, chat avatar, chat bubbles). It is not a CSS fill color in the app.

## What to do

1. **Strip the background from the video** with ffmpeg:
   - Apply a `colorkey` filter keyed to the sampled background (~`0xF2F2F2`, with similarity/blend tuned so soft ribbon edges stay smooth).
   - Encode the result as a transparent **WebM (VP9, yuva420p, audio dropped)** — the only widely supported format that carries transparency in video.
   - Upload the transparent WebM as a new Lovable Asset (`maya-ai-animation-transparent.webm`).

2. **Update the shared Maya mark** (`AiMark` in `src/components/pos/dashboard/eatos-ai-chat.tsx` — the single component every surface uses):
   - Play the transparent WebM first, keeping the existing white MP4 as a fallback `<source>` for browsers without WebM-alpha support.
   - Drop the light `bg-muted/60` fill on the mark container so nothing shows behind the ribbons.
   - Everything stays looping, muted, autoplaying, rounded.

3. **Verify**: confirm in the preview (Playwright) that the mark renders with no white rectangle on both the dark header and the light dashboard card, and the animation still loops.

## Caveat to be aware of

- Older Safari versions may not play transparent WebM and would fall back to the white-background MP4. Current Chrome, Edge, Firefox and recent Safari/iPadOS show the transparent version. If Safari matters for the POS hardware, we can revisit after publish.

## Files touched

- `src/assets/maya-ai-animation-transparent.webm.asset.json` (new asset)
- `src/components/pos/dashboard/eatos-ai-chat.tsx` (AiMark sources + container fill)
