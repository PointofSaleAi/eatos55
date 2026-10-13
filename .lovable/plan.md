# Room Charge: print, sign, post (end-to-end)

The second recording is the target flow, built in our look: black and white, pink only for branding, no X in the outside corner, tap outside to close. Every part works on phone, tablet and desktop.

## Flow

```text
Cart -> Charge -> Rooms -> pick room -> Print Bill -> Room Bill preview -> Print
  -> "Bill printed" alert (Close / Go to Ticket)
  -> Tickets (filtered to that room): ticket shows "Payment in Progress · Pending proof"
  -> Room Bill: Re-print / Upload Signed Bill / Signature Collected
  -> ticket shows "Signature collected"; button becomes "Post to Room $X"
  -> Post to Room window (optional tip) -> Post
  -> ticket shows "Posted to Room"; the room's credit goes down
  -> Add Tip / Edit Tip later -> Post to Room again (tip added to the room charge)
```

## 1. Payment screen: Rooms
- The tender is called **Rooms**. Tapping it opens **Select Room to Post** in place of the keypad: search by room number or guest, a floor filter, and room cards showing room, guest, stay dates and "$X remaining".
- When a room is picked, the bill side shows:
  - Guest card: name, room, room type, booking number
  - Occupancy, stay period, and credit limit / used / remaining
  - Room setup (room type, bed, max adults and children, accessibility) and entitlements as chips
- One **Print Bill** button. It's disabled when credit is too low, with the message "Low credit: $X remaining".

## 2. Room Bill and the printed alert
- The Room Bill preview shows room, guest, stay, the **real order number**, date and time, items, subtotal, tax, total due and "Payment method: Posted to Room", with a **Print Bill** button.
- Printing creates or updates the ticket: Payment in Progress, payment type Room Charge, proof pending, linked to the room. It does not post yet.
- An alert follows: "Bill printed successfully. Collect the guest's signature, then upload the signed bill and post the charge." It has **Close** and **Go to Ticket**. Go to Ticket opens Tickets filtered to the room with that ticket selected.

## 3. Tickets screen for rooms
- The filter chip reads **Rooms / Room 101 · John Smith**, with a summary chip showing "N unpaid · $total".
- Room-charge tickets show their status: Payment in Progress, then Posted to Room. They also show proof status (Pending proof or Signature collected) and the tip once one is added.
- **Ticket detail:**
  - The main button reads **Awaiting Signature** (disabled) until the signature is collected.
  - A bill button opens the Room Bill with **Re-print Bill**, **Upload Signed Bill** (photo or file picker; demo only, stored for this session) and **Signature Collected**.
  - After the signature, the button becomes **Post to Room $X**.

## 4. Post to Room and tips
- The **Post to Room** window shows order number, check number, base amount, tip, total to post, guest, room, stay, credit limit and remaining balance, with **Cancel** and **Post to Room** buttons.
- Posting:
  - marks the ticket Posted to Room
  - takes the amount off the room's remaining credit (also reflected on the Rooms page and in the picker)
  - shows "Order posted to Room 101"
- After posting, an **Add Tip** button opens the same window with a calculator-order keypad for the tip. Posting again adds the tip to the room charge and the ticket shows Tip and Grand Total. The button then reads **Edit Tip**.
- Posting is blocked if the total is more than the remaining credit.

## Fixes from the first recording
- No "Order not found": printing always works from the current order and creates the ticket.
- The bill shows the real order number, not an internal ID.
- No double close buttons; tapping outside the window closes it.
- The ticket is never marked as paid by Cash.

## Technical details
- `src/lib/pos-store.tsx`:
  - Room-charge state per ticket: `roomCharge: { roomId, stage: "printed" | "signed" | "posted", proofName?, tip, postedAt? }`
  - Per-room `creditUsed` overrides, kept with the existing saved floor state
  - Actions: `printRoomBill` (creates or links the ticket via the existing fire path and assigns the order number), `markRoomSigned`, `postToRoom(ticketId, tip)`
- `src/components/pos/room-charge-dialog.tsx`: rebuild as the inline "Select Room to Post" panel plus room details, reusing `rooms`, floors and the credit helpers. The Rooms tender renders it inside `src/routes/payment.method.tsx` instead of the keypad on wide layouts, and as a full-height sheet on phones.
- `src/components/pos/room-bill-sheet.tsx`: preview, Print, and post-print alert; a ticket mode adds Re-print, Upload Signed Bill and Signature Collected.
- New `src/components/pos/post-to-room-dialog.tsx`: summary plus tip keypad (shared calculator-order numpad).
- `src/components/pos/tickets-screen.tsx`:
  - Room-aware filter chip and unpaid summary
  - Status and proof labels on cards
  - Detail actions: Awaiting Signature, then Post to Room, then Add Tip / Edit Tip
- Check the whole flow in the browser on phone, tablet and desktop.
