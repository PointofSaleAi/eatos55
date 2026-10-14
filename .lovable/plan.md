# Country-aware phone validation throughout the app

## Confirmed issues
- Signup offers United States, Canada, United Kingdom, Australia and India, but its phone prefix remains `+1` and validation requires a U.S. ten-digit number regardless of the selected country.
- Password recovery also requires a U.S. ten-digit number.
- Guest forms and inline cart editing share a formatter that truncates numbers to ten digits. Add Guest validates by digit count alone; restaurant phone settings are plain text.

## Country choices
Use the five countries you selected: **United States, Canada, United Kingdom, Australia and India**.

## Changes
1. **Shared phone field and rules**
   - Use country-specific numbering rules, not a universal ten-digit check. Check valid lengths and number patterns, including mobile prefixes where distinguishable.
   - Display the selected country and its dialing code: US/Canada `+1`, UK `+44`, Australia `+61`, India `+91`.
   - Accept typing and pasted national or international numbers, including normal spaces, parentheses and hyphens. Reject letters, extensions and malformed input instead of silently stripping them into a different valid number.
   - Handle national leading zeros and international prefixes correctly, without doubling the dialing code. Do not truncate extra digits into a valid number.
   - Show a country-appropriate example and clear inline errors for incomplete, too-long or invalid numbers. Validate on blur and submission; avoid showing an error before someone has started entering a number.
   - Country changes update the dialing code and revalidate the entered digits without silently changing the selected country or discarding the number. A pasted international number with a conflicting country code prompts the user to select the matching country.
2. **Signup and recovery**
   - Signup’s existing Country selector controls phone formatting and validation; remove hardcoded U.S. prefixes from confirmation and OTP destinations.
   - Add a compact country selector to Forgot Password. Keep email recovery working independently; require a valid mobile number when mobile verification is selected.
   - Keep signup and recovery demo-only; this change does not send SMS or verify ownership of a phone number.
3. **Guest and order entry**
   - Apply the shared field to Add Guest, service-order guest sheets and inline cart phone editing, with the same five-country selector.
   - Preserve existing required/optional field rules. Empty optional phone fields remain valid; populated fields must pass validation.
   - Block invalid saves and inline commits, display the error next to the field, and retain the last saved valid value until corrected.
   - Keep the phone country and normalized international number synchronized across cart, guest forms and saved orders. Existing U.S. numbers remain readable and editable; do not rewrite saved records just by opening a screen.
4. **Other phone inputs**
   - Apply country-aware validation to editable restaurant phone settings, allowing valid landline or mobile numbers because a restaurant contact is not necessarily a mobile.
   - Include the phone branch of Sign In’s email-or-phone input without interfering with email entry or changing demo sign-in behavior. International phone entry must include its dialing code when there is no country selector.
   - Do not alter static contact details, U.S. address fields, payment flows or device-related phone settings.

## Technical details
- Add `libphonenumber-js` with comprehensive numbering metadata and a shared Zod phone schema for parsing, validation and international normalization.
- Use one reusable country-aware field and shared helpers instead of independent formatters or regular expressions in each screen.
- Retain selected country alongside normalized phone values where shared guest/settings state needs it; infer compatible defaults for existing values, using United States when no country information exists. US and Canadian mobile/landline types cannot always be distinguished, so accept valid numbers in those shared ranges.
- Validate at submission and shared state-write boundaries, not only through button disabling. No new backend is introduced for this presentation/demo change; any future server phone-write endpoint must independently apply the shared schema.
- Record the shared validation architecture and retain the five-country requirement for future changes.

## Verification
- Test valid and invalid lengths/prefixes for each country; formatting, leading zeros, pasted international numbers, shared `+1` countries, unsupported prefixes, letters, excessive digits, deletion and country changes.
- Verify signup through OTP, mobile and email recovery, Add Guest save/read-back, service-order guest editing, inline cart save/read-back, restaurant phone settings and demo Sign In.
- Confirm invalid values cannot advance or replace valid saved phone details, and optional blank fields stay optional.
- Check phone, portrait tablet, landscape tablet and desktop for readable fields, compact selectors, keyboard behavior and no overlapping content.
- Check automated validation tests, preview build status and browser errors before completion.