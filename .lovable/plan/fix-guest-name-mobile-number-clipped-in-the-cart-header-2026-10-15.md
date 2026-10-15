# Fix: Guest Name & Mobile Number clipped in the cart header

## Problem
In the cart header (`src/components/pos/order-panel.tsx`, guest editing row), Guest Name and the mobile number are clipped mid-word — screenshot shows "Guest Nam…" and "(XXX) XXX-XXX…".

Root cause: the row is a fixed 3-column grid `grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]`. Each input gets an equal 1fr track and the live "ARRIVED AT h:mm PM" span (much wider than the old "--" it replaced) takes the rest. Inputs cannot shrink below their placeholder text, so the text clips at the track edge with no wrap or ellipsis.

## Fix
Restructure that row into a wrapping flex row so all three pieces stay readable at any cart-panel width (desktop, tablet, phone):

- Guest Name input: `flex-1` with a small `min-w` (~5.5rem) so short names still fit.
- Mobile number input: `min-w-[8.5rem]` so the full "(XXX) XXX-XXXX" placeholder and formatted values always fit; `flex-1` for extra room.
- "ARRIVED AT h:mm PM" span: `shrink-0`, stays on the same line when space allows and wraps to its own line when the two inputs need the full width.
- No changes to fonts, colors, inline-editing behaviour (save on blur/Enter), or the live-clock rule (live until the first item, then frozen).

## Verification
Playwright at desktop 1290×796, tablet 768×1024, phone 390×844:
- "Guest Name" and "(XXX) XXX-XXXX" render fully unclipped at all three widths.
- Typing a guest name/number still saves on blur/Enter.
- No horizontal overflow anywhere.
