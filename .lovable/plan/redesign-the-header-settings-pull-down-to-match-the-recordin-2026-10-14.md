# Redesign the header settings pull-down to match the recording

## Reference layout
Replace the current full-page settings list with the recording’s dark, translucent overlay. The current screen stays visible underneath, and the black header remains accessible.

On desktop and landscape tablet, show these shortcuts in the same three-column order:

```text
Restaurant     Menu        Payment
Workforce      Reports     Advanced
Guestbook      Support     Log out
```

- White outline icons alongside bold headings, short supporting text beneath, and thin separators—no boxed tiles or coloured icon backgrounds.
- Generous spacing matching the recording, scaled to fit shorter screens without cutting off the last row.
- A centred upward chevron at the bottom closes the overlay.
- Phone and narrow tablet layouts reflow the same shortcuts into fewer columns, with scrolling when needed and no clipped text.

## Opening, closing and navigation
- Keep tapping the header chevron to open and close the panel; also support dragging down from that handle to open and dragging up from the panel’s bottom handle to close.
- Animate the panel’s vertical reveal and dismissal; respect reduced-motion preferences.
- Tapping a shortcut closes the overlay and opens its destination directly:
  - **Restaurant:** General settings, including Restaurant Information and Restaurant Settings.
  - **Menu:** Menu settings, not the Dashboard.
  - **Payment:** Payments settings.
  - **Workforce:** Workforce settings.
  - **Reports:** Reports settings.
  - **Advanced:** Advanced settings, retaining the existing manager restriction.
  - **Guestbook:** The new guest directory described below.
  - **Support:** Customer Support.
  - **Log out:** Keep the existing confirmation before signing out; cancelling leaves the session unchanged.
- Escape, Back, and tapping non-interactive backdrop space dismiss without navigating, saving or signing out. No outside-corner X.
- Keep the current screen and any unfinished order intact when the panel is simply dismissed.

## Include Guestbook
Add a working Guestbook page, as requested, rather than an inactive shortcut.

- A searchable guest directory using named guests available from existing POS ticket data and the current order; exclude anonymous “Guest” entries and combine repeated names carefully.
- Selecting a guest displays available contact information and their matching order history, including order number, date, status and total.
- Show a clear empty state when no named guests or matching orders are available; do not invent contact details or lifetime-value figures.
- Include Guestbook in the shared Settings navigation so it is accessible from both the header panel and the Settings sidebar/hub.
- This is a read-only prototype directory using existing demo information. It does not introduce cloud storage, guest editing, marketing or a separate customer-account system.

## Scope
Only the header settings panel and the new Guestbook destination change. Leave the regular header information, left navigation, Settings search, Dashboard, orderOS and payment workflows unchanged.

## Technical details
- Restyle `src/components/pos/settings-pulldown.tsx`; use semantic dark-overlay/foreground/border tokens from `src/styles.css` rather than hardcoded colours.
- Update `src/components/pos/clock-pulldown.tsx` for shared tap/drag state while keeping the PIN and Maya shortcuts independent.
- Define a header-specific shortcut map referencing existing settings destinations rather than replacing the full settings category list.
- Create the Guestbook route and its focused directory/detail view before adding links. Reuse POS guest/ticket types and the shared voice-search helper if a microphone is included in its search field.
- Preserve TanStack links, existing access checks, Back dismissal and cancel-only confirmation behavior. Make route changes close the overlay reliably.
- Give the new Guestbook route its own eatOS title, description and social metadata.

## Verification
- At the current **1141 × 742** view, all nine shortcuts are visible, with readable text and the bottom chevron accessible.
- Check phone portrait/landscape, tablet portrait/landscape and desktop for wrapping, scrolling and overlap.
- Exercise tap and drag opening/closing, Escape/Back/backdrop dismissal, every shortcut destination, Advanced access restrictions, and both cancel/confirm logout paths.
- Verify Guestbook search, guest selection, available contact information and matching order history through the UI.
- Confirm dismissing the overlay preserves an unfinished cart and that orderOS remains in its own module.