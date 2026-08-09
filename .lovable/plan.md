# Ticket rows with real data, plus the screens still missing

## 1. Collapsed ticket rows carry the data points

Right now a collapsed row shows table number, guest, timer, total and status — order number, order type and arrival are hidden until expanded. That changes to a compact two-line row that always shows the essentials, matching the uploaded ticket screens:

- Line 1: table/seat badge, `Order No 1`, guest name, total, status (colour-coded).
- Line 2: order type (Dine-In / Take Away / Delivery / Drive Thru / Pickup, with its icon), `Arrived At 12:21 PM`, live timer.
- Chevron still expands to the full grid (Check, Tips, Date, Employee, Revenue Center, Payment Type, transactions) and the "View ticket" button.
- Phone: the two lines stack and truncate the guest name only; tablet/desktop: both lines merge into one row of labelled columns. Verified at 320, 393, 430, 834, 1280.

## 2. Payment Successful screen (currently missing entirely)

After a tender completes the app goes back without a confirmation screen. New screen at `/payment/success`:

- Back chevron + `Payment Successful`, dark tick badge.
- Card: Order Number, Guest Name (`-` when empty).
- Card: Total Amount, Change Amount (from the tender just committed).
- `Share Receipt` button.
- Phone / Email expandable rows for sending the receipt.
- Bill, `Receipt — Choose >`, `Bill + Receipt — Choose >` rows.
- Footer: outlined `PRINT RECEIPT`, then solid `CLOSE` returning to Tickets.
- Cash, card and QR tenders all route here.

## 3. New Order – Guest Info parity

The guest sheet has name, phone, party size and order type only. It becomes the full `New Order - Guest Info` screen from the screenshots:

- Order type strip with icons, including **DRIVE THRU**, DINE-IN, TAKEOUT, DELIVERY, PICKUP (horizontally scrollable).
- Guest Information: `Guest Name - Table Number - Order Name*` with search affordance, email field, phone with `+1` country prefix.
- **Vehicle Information** section, shown only for Drive Thru, with a green completion tick: Vehicle Type*, Colour*, Brand (optional), License Plate (optional).
- Notes textarea with `0/500` counter.
- Values are stored on the order/ticket and shown on the ticket detail.

## Technical notes

- `src/components/pos/primitives.tsx`: rework `TicketCard` collapsed layout (two lines, order type + arrival always visible), keep the expanded grid.
- `src/lib/demo-data.ts`: add `email`, `notes`, `vehicle { type, color, brand, plate }` to the ticket/guest shape; keep existing demo values valid.
- `src/lib/pos-store.tsx`: `commitPayment` already computes change — expose it via `lastPayment` for the success screen; extend `guest` with email/notes/vehicle.
- New `src/routes/payment.success.tsx`; `payment.cash.tsx`, `payment.card.tsx`, `payment.tender.$kind.tsx` navigate to it.
- Rebuild `src/components/pos/guest-sheet.tsx` as the fuller Guest Info form (still a sheet on phone, centred panel on tablet/desktop).
- Customer Support (Sentry, Instabug, Chat, Contact Us, Live Pin, Upload Logs) already matches its screenshot — no change.
