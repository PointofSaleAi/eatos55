# Replace the Table Order backdrop behind the Clock In PIN pad

## What's happening
Two separate things:
1. **The backdrop:** the Clock In gate (`src/routes/access.clock-in.tsx`) paints a decorative fake "Ground Floor" table grid (Tables T1–T5) behind the PIN pad. That's why it looks like the Table Order screen is behind the gate.
2. **The landing page:** this part already works — a correct PIN (Enter, biometric, or completing the Clock In steps) navigates straight to New Order (`/order/new`).

## Change
- Replace the fake table-grid backdrop behind the PIN gate with a neutral branded surface (themed background with the eatOS wordmark, no tables), so the gate no longer suggests the Table Order screen. Keep it purely decorative, non-interactive, and covered by the opaque gate overlay as today.
- Keep the post-clock-in landing on New Order exactly as it is; verify it on every entry path (PIN Enter, biometric, full Clock In flow).

## Verification
- Clock In gate shows the new neutral backdrop on phone, portrait tablet, landscape tablet and desktop.
- After PIN Enter / biometric / completed Clock In, the app lands on New Order.
- Preview build status and browser errors clean.
