# Replace the Maya AI animation app wide with the approved video

## Current state

- Every Maya surface (header shortcut, dashboard card, chat avatar, chat bubbles) renders one shared component: `AiMark` in `src/components/pos/dashboard/eatos-ai-chat.tsx`.
- `AiMark` today plays the old transparent animated WebP (`maya-ai-animation-transparent.webp`) via `<picture>`, falling back to the static logo (`maya-ai-logo.png`) where animated WebP is unsupported.
- The new upload `maya_AI_Approved.mp4` is 512x506, 3.5 s, 24 fps, H.264 with an audio track, and has a dark near-black background baked in. The user wants that dark background **kept** (a small dark tile behind the ribbons), so no transparency processing is needed.

## What to do

1. **Convert the video to animated WebP** with ffmpeg, matching the current mark's implementation:
   - Drop the audio track, scale down to ~256 px wide (the mark renders at 28–36 px, so 256 px covers retina), cap frame rate at ~15 fps, quality tuned so the final asset stays near or under ~1.5 MB like the current one.
   - Keep the dark background as-is (no colorkey, no alpha).
2. **Upload as a new Lovable Asset**: `src/assets/maya-ai-approved.webp.asset.json` (pointer only; binary stays out of the repo).
3. **Update `AiMark`** in `src/components/pos/dashboard/eatos-ai-chat.tsx`:
   - Import the new pointer and use it as the `<source>`; keep the static `maya-ai-logo.png` `<img>` as the fallback.
   - Keep the rounded, overflow-hidden container so the dark tile is cropped to the mark's shape (`rounded-card` on the dashboard/chat, `rounded-full` in the header).
   - Because the background is now dark instead of transparent, give the mark container a neutral dark fill (e.g. a near-black surface color) so fallback states and letterboxing never flash a light box on light surfaces.
4. **Remove the now-unused old asset** `maya-ai-animation-transparent.webp.asset.json` with `lovable-assets delete` so no orphan stays on the CDN.

## Files touched

- `src/assets/maya-ai-approved.webp.asset.json` (new asset)
- `src/components/pos/dashboard/eatos-ai-chat.tsx` (AiMark source swap + container fill)
- `src/assets/maya-ai-animation-transparent.webp.asset.json` (deleted)

## Verify

- Playwright on phone (390x844), tablet (1141x742) and desktop: the Maya mark shows the new dark-tile animation on the dark header and inside the light dashboard card, loops continuously, and the chat overlay's avatars use the same mark.
- Check the build log and console for errors; confirm no request still references the deleted old asset.
