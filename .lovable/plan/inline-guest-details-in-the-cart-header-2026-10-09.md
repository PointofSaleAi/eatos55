# Inline guest details in the cart header

## Goal
Let staff enter or edit the guest name and mobile number directly in the cart header without opening the Dine In / Guest Information form.

## Changes
- Replace the cart header’s read-only guest name and phone text with compact inline inputs.
- Keep the arrived time in the same row as a read-only status.
- Auto-save each field when the user leaves it or presses Enter.
- Format the mobile number consistently while typing and preserve the existing guest details in the current order.
- Keep the full Guest Information form for order-type-specific details such as party size, address, scheduling, and vehicle information.
- Keep order-type buttons working as they do now; selecting an order type may still open its required details form.
- Prevent accidental form opening when staff tap the inline name or phone fields.

## Responsive behavior
- Desktop and landscape: show guest name, mobile number, and arrived time on one row.
- Phone and narrow tablet: keep the fields usable without covering or pushing the cart actions off-screen; allow a compact responsive arrangement when one row cannot fit.
- Preserve the current primary action row and cart space below it.

## Validation
- Verify entering, editing, clearing, blurring, and pressing Enter for both fields.
- Confirm the saved values remain visible when switching between Menu and Order and while moving through payment.
- Confirm Dine In and other order-type forms still open only for their additional details.
- Test phone, portrait tablet, landscape tablet, and desktop layouts for clipping, overlap, and keyboard behavior.