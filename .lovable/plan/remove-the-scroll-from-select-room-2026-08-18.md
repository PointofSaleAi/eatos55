# Remove the scroll from Select Room

The detail area of the Select Room dialog is currently an `overflow-y-auto` region, so on shorter windows (like the 713px-tall one in the screenshot) Allowances and Meal entitlements get cut off and a scrollbar appears. Fix: make the whole dialog fit its height budget instead of scrolling.

## Changes

1. Detail pane: drop `overflow-y-auto` and make it a fixed flex region that shrinks to fit. Content adapts rather than scrolls.
2. Tighten the room strip: reduce card height (number badge inline with the room type, single-line guest and credit), lower vertical padding, keep horizontal swipe for the card list only (that is a card carousel, not page scroll).
3. Compact the detail column: merge Allowances and Meal entitlements into one block. Allowances stay a 3-up tile row; meal chips sit directly under it with the entitlements note as a single truncated line with tooltip-style full text on tap.
4. Credit panel keeps the big amount, limit, used bar and Due today, with reduced padding so it matches the shortened left column height.
5. Height budget: dialog capped so header + search + rooms strip + detail + footer always fit inside `90dvh` (desktop) and `92dvh` (sheet). Non-essential rows collapse first on short viewports: the entitlements note hides below a small height threshold, then meal chips wrap to a single line with a "+N" pill.
6. Mobile/portrait sheet: single column, same collapse order, footer button pinned.

## Verification

Screenshot the dialog at 1440x950, 1155x713 (the reported case), 1024x768, 834x1112 and 393x852 and confirm no vertical scrollbar anywhere and the Post charge footer stays visible.
