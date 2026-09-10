# Restore the checkout tip flow and simplify payment choices

## 1. Global top bar
- Change the global top bar to solid black with white and muted-grey content, using semantic light and dark appearance tokens.
- Keep the initials-only identity, compact role and clock-in time, network state, live time, and More control.
- Keep the slim dashboard pull-down control centered along the bottom edge of the bar with its full 44px touch target.
- Apply and verify the same bar on phone, tablet, and desktop screens.

## 2. Remove the Wallets payment group
- Remove the separate Wallets section and its Apple Pay and Google Pay rows from checkout.
- Remove the Wallets section from Payment Methods settings.
- Keep old wallet setting values readable for existing saved data, but do not display them as separate payment choices.
- Card remains the normal choice for card-reader and wallet transactions. Tap to Pay remains its own device-appropriate choice where already supported.

## 3. Restore Tip as part of checkout
- Reuse and refine the existing Add Tip screen instead of creating a duplicate.
- Default behavior: prompt for a tip only for Card, after the payment is approved and before receipt/payment completion.
- The after-approval sequence will be:

```text
Choose payment type -> payment approved -> Add Tip / No Tip -> receipt and completion
```

- A merchant can change the timing to before payment. That sequence will be:

```text
Choose payment type -> Add Tip / No Tip -> charge the total including tip -> receipt and completion
```

- Save the selected tip with the completed payment and ticket so it appears in the receipt, ticket details, and shift figures.
- Ensure partial payments do not mark the check complete or prompt for a final tip prematurely.

## 4. Merchant gratuity controls
- Extend Payments > Gratuity with a manager-controlled timing choice: Before payment or After approval.
- Add payment-type eligibility controls. Card is enabled by default; merchants may also enable Cash, Tap to Pay, Manual Card, and other direct tenders.
- Do not offer tip prompting for delivery partners such as DoorDash, Uber, Deliveroo, Just Eat, or Grubhub. Also exclude non-direct flows such as Split Check from the eligibility list.
- Keep the existing Ask For Tip switch, preset percentages, tip basis, and custom-tip preference.

## 5. Tip screen presentation
- Show the tip screen as a focused, full-width phone sheet with preset percentages, calculated amounts, custom entry when allowed, and equally clear No Tip and Add Tip actions.
- Use a contained sheet/dialog at tablet and desktop sizes without changing their payment-page composition.
- Match current POS typography and controls, minimize unused space, and keep all actions reachable without unnecessary page scrolling.

## Verification
- Test Card with both timing modes, including Add Tip and No Tip.
- Test Cash and Tap to Pay with tip prompting both disabled and merchant-enabled.
- Confirm delivery partners never prompt for tips.
- Confirm wallet rows are absent from checkout and settings.
- Confirm tip values reach payment confirmation, ticket details, and shift totals.
- Capture the Tip screen and verify the black top bar and centered pull-down at 393x713, tablet portrait/landscape, and desktop.

## Technical notes
- Add persisted gratuity timing and eligible-tender settings with safe defaults for existing installations.
- Thread pending tender, amount, and tip state through the current checkout handlers before calling the existing payment commit function.
- Keep legacy Apple Pay and Google Pay tender IDs for saved-settings compatibility while filtering them from all visible groups.
- No provider, reader, regional branding, or Tap to Pay onboarding changes.
