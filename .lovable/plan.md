# Device-aware Tap to Pay naming and compact bottom actions

## Payment method naming and behavior
- On iPhone before setup, keep the dedicated **Tap to Pay on iPhone** onboarding choice and hide the separate Contactless choice, leaving one clear option.
- On iPhone after setup, use one **Tap to Pay on iPhone** payment choice that opens the existing iPhone payment flow.
- On Android, rename Contactless to **Tap to Pay** while preserving its current card-payment behavior.
- On iPad, Windows, Mac, and other non-iPhone devices, rename Contactless to **Tap to Pay** while keeping Apple’s iPhone-only onboarding unavailable.
- Apply the same device-aware wording in Payment Methods settings so the setup list and checkout list agree.
- Preserve Apple’s exact product name only for the iPhone flow.

## Bottom action spacing
- Correct the shared bottom-navigation height reservation to match the navigation’s actual rendered height.
- Remove the extra blank band between page actions such as **Charge** or **Continue to payment** and the bottom navigation.
- Keep safe-area clearance, keyboard clearance, and all existing actions fully tappable.
- Apply the spacing correction globally on phone screens without changing tablet or desktop navigation layouts.

## Verification
- Check pre-setup and ready iPhone states show exactly one correctly named choice.
- Check Android and other devices show **Tap to Pay**, never **Tap to Pay on iPhone**.
- Verify payment settings use the matching labels.
- Verify bill and payment-method screens at phone sizes, plus tablet and desktop layouts, with no overlap or excessive bottom space.
