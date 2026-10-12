# Add Guest address search

## Goal
Replace the current single Address input with a prototype U.S. address search that works with the existing device-only POS session and does not expose a paid address service.

## Changes
- Rename the prompt from **Enter address** to **Search address**.
- Show a themed suggestion list beneath the search input as the user types, filtering a realistic built-in set of U.S. addresses by matching letters and words.
- Require the user to tap a suggestion; pressing Enter without selecting one will not populate the address.
- After selection, populate standard U.S. fields: **Street Address**, **Apartment / Suite**, **City**, **State**, and **ZIP Code**.
- Keep Apartment / Suite editable and optional; allow the populated fields to be corrected before saving.
- Save both the structured address fields and a formatted address compatible with the existing guest and delivery-order displays.
- Preserve existing guest validation, photo, vehicle details, Save, and Cancel behavior.
- Apply the address structure consistently wherever the shared guest address is edited so reopening a guest or delivery form retains the selected address.

## Interaction and states
- Debounce filtering while typing and cap the visible results so the form remains compact.
- Include clear empty-result and selection states without auto-selecting the first result.
- Close the suggestion list after selection, on Escape, or when focus leaves the address search area.
- Ensure the suggestion list and structured fields fit the cart-replacement form on phone, tablet, and desktop without covering Save/Cancel.

## Validation
- Verify partial-letter matching, explicit suggestion selection, Enter-without-selection behavior, field population, optional apartment entry, save/reopen, and cancel.
- Check Add Guest and delivery address compatibility across phone, tablet, and desktop.
- Confirm the app still builds without errors.

## Technical details
- Extend the shared guest address model with structured U.S. fields while retaining the existing formatted `address` value for compatibility.
- Keep the prototype dataset in client-safe demo data; no Google Maps connection, API key, or public lookup endpoint will be added.
- A future switch to real Google Places suggestions will require secure staff authentication first; that is outside this prototype plan.
