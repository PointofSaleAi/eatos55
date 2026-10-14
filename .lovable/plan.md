# Add Confirm PIN after Set PIN in demo signup

## Why it's missing
The four-step signup flow (Create Account → Set PIN → Confirmation → OTP) was built without a PIN re-entry step, so a mistyped setup PIN is never caught before continuing.

## Change
Insert a **Confirm PIN** step between Set PIN and Confirmation in `src/routes/access.create-account.tsx`:

1. **Set PIN** (unchanged): enter a 4-digit PIN on the calculator-order keypad, Continue enabled at four digits.
2. **Confirm PIN** (new): same PinPad and hollow/filled indicators, asking the user to re-enter the PIN. Continue compares both entries:
   - Match → advance to Confirmation.
   - Mismatch → show an error ("PINs don't match. Try again."), clear the confirmation entry, and keep the original PIN.
3. Progress indicator becomes five steps: Create Account, Set PIN, Confirm PIN, Confirmation, OTP — in both the landscape side rail and the compact phone/portrait indicator.
4. Back from Confirm PIN returns to Set PIN with the original PIN preserved; Back from Confirmation returns to Confirm PIN. Cancel still exits to Sign In; refresh still clears the draft.
5. PINs stay transient (never persisted); no change to demo employee-PIN behavior, OTP step, or completion screen.

## Verification
- Match and mismatch paths, back/cancel from each step, progress states.
- Phone, portrait tablet, landscape tablet and desktop, including short windows and resizing mid-flow.
- Preview build status and browser errors; regression-check Sign In and Forgot Password.
