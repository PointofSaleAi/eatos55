# Three-dot options open as a dropdown popover on mobile

## What will change
- On phone (and any non-docked layout), tapping the fixed three-dot control no longer slides in the right-side "Order Options" drawer. Instead, a compact dropdown popover appears anchored to the three-dot button, listing the same options.
- Desktop and landscape tablet keep the existing docked options rail unchanged.

## Popover behavior
- Same options in the same order as today: Custom Item / Menu Item, Gift Card, Service Charge, Add Guest, Open Orders, Allergy, Merge, Reopen Check — with active-state tinting (e.g. Service Charge on, Allergy note set) preserved.
- Anchored to the three-dot button, right-aligned so it never overflows the screen edge; on phones it can span nearly the full width but stays a floating card, not a full-height panel.
- Rows are icon + label (plain single-line labels, not the rail's stacked words), full-width tap targets with grey hover/highlight, matching the eatOS theme.
- Closes by tapping outside (no X control), by choosing an option, or by tapping the three-dot control again.
- Opening it must not resize or shift the cart or product list.

## Technical details
- In `src/components/pos/order-panel.tsx` (`CartHeaderActions`), replace the `Sheet side="right"` branch (`moreOpen && !docked`) with a `Popover` controlled by the existing `moreOpen` state, wrapping the three-dot button as trigger.
- Reuse the existing `secondaryActions(false)` renderer for the popover rows; the docked-rail branch stays as is.
- Keep all option flows (dialogs, sheets, custom-item handoff, navigate to Tickets) unchanged; each action still closes the popover first.

## Verification
- Phone viewport: tap three dots → popover appears near the button; choose an option (e.g. Add Guest), confirm it opens and the popover closes; tap outside to dismiss; reopen.
- Confirm active-state tint (e.g. set a service charge, reopen popover) and that no drawer/overlay panel appears.
- Desktop/landscape tablet: docked rail behavior unchanged.
- Portrait tablet: same popover behavior as phone for consistency.
