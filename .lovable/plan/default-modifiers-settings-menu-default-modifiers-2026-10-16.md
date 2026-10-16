# Default Modifiers (Settings > Menu > Default Modifiers)

Rebuild the screen to match the recording, reusing the look and behavior of our Categories / Modifiers screens.

## List screen
- Header: Back (to Menu), title "Default Modifiers", search icon (opens a search field with Cancel).
- Intro: "Default Modifiers detail dish components, informing customers. Transparency supports dietary choices, ensuring a more informed and satisfying dining experience."
- Archive button (opens "Archived Default Modifiers") and **+** (opens "Add Default Modifiers").
- Table: Default Modifier Name (left), Type (center), chevron. Sorted A–Z. Swipe left to Archive (or Restore in the archived view).
- Empty state (archive or no search match): "No item found" / "try to search with different word".
- Seed from the recording: Bacon, Baked Beans, Brownie Pieces, Butter, Cheese, Chili Jam, Choc Sauce, Coleslaw, Dairy, Egg, Gherkins, Gluten, all "Normal".

## Add / Edit screen
- Title "Add Default Modifiers" or "Edit Default Modifiers".
- Two rows:
  - **Add Default Modifiers** — shows "Choose" until tapped, then becomes an inline text field ("Enter Modifier") with a clear button; shows the name once done.
  - **Add Default Modifier Category** — "Normal" by default; tapping opens a picker with Normal and Exceptional.
- Autosaves once a name is entered (no Save button), like our other Menu screens. Leaving a new one without a name asks before discarding. Edit screen also has an Archive / Restore button.

## Devices
Same layout on all sizes; on phones the Type shows under the name.

## Notes
- Demo only, saved on the device; doesn't change New Order or product default modifiers.
- I'm assuming the category options are just "Normal" and "Exceptional" (the two seen in the recording).

## Technical details
- New `src/lib/default-modifier-settings.ts` (localStorage `eatos.pos.default-modifier-settings`, seed above).
- New `src/components/pos/default-modifier-settings.tsx` reusing SubHeader, ScreenBody, GroupCard, SwipeRow and the `Picker` from tax-settings.
- Route the `default-modifiers` topic in `settings.detail.$topic.tsx` to it; add a demo-only rule line to `src/components/pos/AGENTS.md`.
- Verify add, edit, archive/restore on tablet, phone and desktop.
