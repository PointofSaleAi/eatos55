# App-wide mobile number validation

## Problem
Phone fields are inconsistent and under-validated. The Create Account field accepts unlimited digits (as shown in the screenshot), validation is hardcoded to 10-digit U.S. numbers with a fixed +1 prefix, and formatting rules are duplicated across files. The agreed convention is country-aware validation for five countries: United States, Canada, United Kingdom, Australia and India.

## Changes

### 1. Shared phone helper (new `src/lib/phone.ts`)
- Country list: US (+1), CA (+1), UK (+44), AU (+61), IN (+91) with flag, dial code, expected digit lengths and formatting pattern per country.
- `formatPhone(country, raw)` — strips non-digits, caps input at the country's max digit length (fixes the unlimited-typing bug), formats while typing.
- `isValidPhone(country, raw)` — validates digit count/pattern per country.
- Replaces the duplicated `formatPhone` in `guest-sheet.tsx` (kept as a re-export so existing imports keep working).

### 2. Apply everywhere a phone number is entered
- **Create Account** (`access.create-account.tsx`): country selector drives the prefix and validation instead of the fixed 🇺🇸 +1; input capped at max digits; error message names the selected country.
- **Forgot Password** (`access.forgot-password.tsx`): same country-aware validation for the mobile option.
- **Guest sheet** (`guest-sheet.tsx`), **cart inline guest phone** (`order-panel.tsx`), **Add Guest form** (`add-guest-form.tsx`), **receipt phone entry** (`payment-complete-dialog.tsx`): use the shared formatter/validator, capped length, consistent display.

### 3. Validation messages
- Clear, country-specific errors (e.g. "Enter a valid 10-digit U.S. mobile number" / "Enter a valid UK mobile number").
- No silent truncation confusion: extra digits simply cannot be typed.

## Responsive behavior
- Country picker + prefix + input layout works on phone, tablet and desktop without overflow; no change to surrounding layouts.

## Verification
- Type more than the allowed digits — input stops at the cap.
- Invalid lengths rejected with the right message per country; valid numbers accepted for all five countries.
- Check Create Account, Forgot Password, Add Guest, cart inline phone and receipt phone on phone (390px), portrait tablet, landscape tablet and desktop.
