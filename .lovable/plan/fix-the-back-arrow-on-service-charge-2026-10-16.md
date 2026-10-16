# Fix the back arrow on Service Charge

## The problem
On the Service Charge list, the back arrow "goes back one step in history" instead of going to Payments. If you reached Service Charge any other way (opened the page directly, refreshed, came from settings search or the header drawer), back takes you somewhere unexpected — in testing it landed on the start screen instead of Payments.

## What you'll see after the fix
- Service Charge list: back arrow always opens **Payments**.
- Add / Edit Service Charge: back arrow returns to the **Service Charge list** (unchanged; still asks "Are you sure you want to exit?" for an unfinished new charge).
- The same fix applies to Taxes and Discounts, which have the identical issue.
- Works on phone, tablet and desktop.

## Technical details
- `src/components/pos/service-charge-settings.tsx`, `tax-settings.tsx`, `discount-settings.tsx`: replace `backTo="/settings/payments"` on the list `SubHeader` with an explicit `onBack={() => navigate({ to: "/settings/payments" })}` (SubHeader's `onBack` path always renders the chevron and skips `history.back()`).
- No change to the shared `BackButton` so other screens keep their current behavior.
- Verify with Playwright: direct load of `/settings/detail/service-charge` → back lands on `/settings/payments`; edit → back → list → back → Payments; at 1141x742, 390x844 and 820x1180.
