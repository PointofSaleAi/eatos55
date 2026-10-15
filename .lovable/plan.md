# Make the Rooms (room service) icon match the other nav icons

## Problem
The Rooms icon currently uses the uploaded artwork, which is a **solid filled shape**. Every other icon on the left nav (New Order, Table Order, Tickets, orderOS row, Settings, etc.) renders as a **thin 2px line icon with rounded caps**. The filled cloche therefore looks heavier and out of place next to them — and it can't dim/highlight the same way Lucide icons do when a destination is active.

## Plan
Replace the filled custom icon with Lucide's **ConciergeBell** icon — it is the same room-service visual (a serving dome on a base line) drawn in the exact same stroke style as the rest of the nav (2px stroke, round caps, currentColor), so it inherits the identical active/inactive color treatment automatically.

1. `src/lib/nav-destinations.ts`
   - Import `ConciergeBell` from lucide-react.
   - Point the Rooms entry in `navGroups` (phone menu) and `railPrimary` (left rail) at `ConciergeBell`.
   - Remove the `RoomServiceIcon` import.
2. `src/routes/payment.method.tsx` (payments modal)
   - Point the Lodging → Rooms item at `ConciergeBell`.
   - Remove the `RoomServiceIcon` import and the `ComponentType` type widening added for it (the `Tender` type goes back to Lucide icons only).
3. Delete `src/components/pos/icons/room-service-icon.tsx` (no longer referenced).

## Verification
- Build/typecheck passes.
- Playwright check on the expanded rail: Rooms shows the stroked dome icon, same visual weight as Table Order and Tickets above/below it; active destination highlight still works.
- Payments modal still shows the Rooms row with the new icon, on phone, tablet and desktop.
