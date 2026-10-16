# Groups (Settings > Menu > Groups)

Rebuild the Groups screen to follow the recording, reusing our Menu settings look (same as Categories / Default Modifiers).

## List screen
- Header: Back (to Menu), title "Groups", search icon.
- Intro: "Groups customize dishes, catering to preferences. Enhance dining experiences by allowing customers to personalize their orders for satisfaction."
- Archive button ("Archived Groups") and **+** ("Add Groups").
- Table: Group Name (left), Type (center: Modifier or Add-On), chevron; A–Z; swipe left to Archive / Restore. Empty state "No item found / try to search with different word".
- Seed from the recording: Add Ons (Add-On); Allergen, Burger and Sandwich Sides Choice, Cheese Choice, Choice of Dipping Sauce, Choice of Peas, Choice of Side, Coffee Options, Coffee Syrup, DRAUGHT ADDONS, Egg Style Choice, Gammon Side Choice (Modifier).

## Add / Edit screen ("Add Groups" / "Edit Groups", back label "Groups")
**GROUP INFORMATION**
- Group Name — inline text with clear button (required).
- Group Display Name — copies Group Name until changed ("Enter Name" placeholder).
- Group Type — "Select Type" picker: Modifier or Add-On. The rows below change with the type:
  - **Modifier:** Modifier ("Choose", opens "Applicable Modifiers" searchable multi-select with select-all, "No Items Found" when empty), Default Modifiers (same picker over our Default Modifiers list), Organize (reorder the chosen modifiers), Modifier Group Position (number).
  - **Add-On:** Add-On ("Applicable Add-Ons" picker from our Add-Ons list), Add-On Group Position (number).
  - Before a type is chosen: Add-On and Modifier Group Position rows show "Choose".

**MODIFIER GROUP ADVANCED**
- Modifier type: "Is This Modifier Group Mandatory?" switch — when on, shows "Minimum Number Of Selections" − 1 + stepper. "Number of Selections" switch — when on, shows a maximum stepper.
- Add-On type (and no type yet): "Maximum Number of Selections" switch — when on, shows a stepper.

Autosaves once a name and type are set; Archive / Restore button on saved groups; leaving an unnamed new group asks before discarding. Pickers close by tapping outside (no outside X).

## Devices
Same layout on tablet, desktop and phone; on phone Type shows under the name.

## Notes
- Demo only, saved on the device; doesn't change New Order modifiers or add-ons.
- The recording didn't open Organize or show the maximum stepper, so those follow our existing patterns.

## Technical details
- New `src/lib/group-settings.ts` (localStorage `eatos.pos.group-settings`).
- New `src/components/pos/group-settings.tsx` reusing SubHeader, GroupCard, SwipeRow, `Picker` (tax-settings), a stepper like `QtyStepper`, and options from `useModifierSettings`, `useAddOnSettings`, `useDefaultModifierSettings`.
- Route `groups` topic in `settings.detail.$topic.tsx`; add a demo-only rule to `src/components/pos/AGENTS.md`.
- Verify add (both types), pickers and toggles on tablet and phone.
