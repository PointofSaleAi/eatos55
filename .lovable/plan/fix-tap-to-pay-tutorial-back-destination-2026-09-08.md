# Fix Tap to Pay tutorial Back destination

## Confirmed issue

The Back control on all five tutorial steps navigates to `/tap-to-pay/setup/settings`, but that page always initializes its internal screen to `terms`. Because the ready "Tap to Pay on iPhone / How it works" view is only held in temporary page state, returning to the route remounts the page on the wrong screen.

## Changes

- Add an explicit, validated setup-page view parameter for opening the ready "How it works" state.
- Update the Back control on tutorial steps 1 through 5 to return to `/tap-to-pay/setup/settings` with that ready view selected.
- Keep normal entries from Settings, checkout, and onboarding unchanged so they still begin at their intended screen.
- Verify Back from each of the five steps lands on the attached ready screen, including its image, Ready status, tutorial rows, Terms and Conditions row, and actions.
- Check the flow at phone, tablet, and desktop sizes and confirm there are no navigation or build errors.

## Technical detail

Use typed TanStack Router search state rather than browser history. Browser history would return step 2 through 5 to the preceding tutorial step, while the requested behavior is for every Back control to return directly to the ready "How it works" screen.