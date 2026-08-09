# Make settings manageable (role-based) and fill in the missing data

Right now every settings detail screen (`/settings/detail/...`) renders a hard-coded read-only list. Only a few pickers (Language, Currency, Tax Alias) actually change anything. That's why nothing is manageable by a manager, and why several screens look empty or thinner than the original app.

## What changes

### 1. Role-based editing
- Managers and Supervisors can edit settings; Servers/Bartenders see the same screens as read-only values.
- Editable rows get the right control per type: toggle (On/Off), picker with checkmarks (either/or lists), stepper/text entry (numbers, names, messages), and list rows with add/edit/remove for collections.
- Read-only users see the value only, no control, plus a single caption: "Only managers can change these settings."
- Rows that genuinely come from Back Office (About, Serial, Employee list, Schedule) stay read-only for everyone and keep their existing caption.

### 2. Saving
- Changes save on the device (persisted locally) and apply immediately across the app — e.g. changing Tax Alias or Currency updates receipts, order review and payment screens.
- No backend in this pass, so a shared dashboard is out of scope; the settings model is shaped so it can be moved to a shared backend later without redoing the screens.

### 3. Fill in the missing data (all detail screens audited)
Screens currently empty or thin get real content matching the original app:
- Discounts: list of discount rules (name, type %/amount, value, scope) with add/edit/remove.
- Service Charge: enabled toggle, name, rate, applies-to (all orders / dine-in / delivery).
- Modifiers, Default Modifiers, Add-Ons, Groups: real modifier groups with options, required/optional, min/max.
- Timed Pricing: rule list (name, days, time window, price adjustment).
- Cash Drawer: pairing state, assigned drawer, open-on-sale, blind close.
- Gratuity, Taxes, Receipts, Cash Management, Printer, Card Reader, Hardware Emulators, Inventory, Categories, Restaurant Settings: each row becomes a working control instead of a static value, and missing rows from the original are added (e.g. tip on pre/post tax, tax-exempt options, receipt footer/logo/email, printer test print, reader reconnect).
- Every screen with a collection also gets its empty state plus an "Add" affordance for managers.

### 4. Consistency across screens
- Every detail screen keeps the imported prototype styling (coloured icon tiles, grouped cards, captions) — no design change.
- Works at phone, tablet and desktop widths; controls keep 44px minimum tap targets.

## Technical notes
- Extend `AppSettings` in `src/lib/pos-store.tsx` with the new fields and collections (discounts, service charge, modifier groups, timed pricing rules, hardware/receipt options), persisted with the existing local persistence.
- Add a `canManageSettings` derived flag from the current user's role, exposed via `usePos()`.
- Rework `src/lib/settings-details.ts` from a static `rows` array into typed row descriptors: `readonly`, `toggle`, `choice`, `text`, `number`, and `collection`, each bound to a settings field.
- Update `src/routes/settings.detail.$topic.tsx` to render the descriptor types, gated by `canManageSettings`, reusing `IconToggleRow` / `SegmentRow` / new picker and text-entry rows in `src/components/pos/settings-rows.tsx`.
- Collections render as a group card with rows plus an editor sheet (reusing the existing bottom-sheet pattern with swipe-to-close).
- Verify by driving the app in a browser: sign in as Supervisor and confirm edits persist across reload; then check a Server role sees read-only.
