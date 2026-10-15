# Settings screens (also `src/routes/settings.*`)

- Tickets opts into non-expanding reference-style cards only in wide landscape split panes; route-driven selection and a minimum cart width preserve readable columns without changing default cards or portrait widths. The landscape detail header must not repeat what the selected card already shows (guests, order type, table, revenue centre, status), so it carries only guest, phone, arrival time, order/check numbers, server and room or note lines.

- The header settings panel uses a focused shortcut map resolved against shared settings destinations; guestbook derives read-only identities from existing POS data without fabricating contacts or combining distinct known email identities.
- Settings drawer dismissal retains the panel through its exit animation; body swipe closing is allowed only at the scroll boundary and suppresses subsequent clicks, so scrolling and gestures cannot activate shortcuts.
- Restaurant Information uses a dedicated form backed by shared demo settings, keeping structured address fields synchronized with its address summary and contact validation consistent with shared country helpers.
- Restaurant operating hours use shared demo settings with native time inputs and presentation-only 12-hour formatting, so edits persist without changing order or reporting logic.
- End of Day settings use shared demo settings and a separate start-checklist route; closing is explicitly a demo confirmation, never an implicit ticket, staff, drawer or reporting mutation.
- Schedule Information uses a dedicated editor and shared demo settings with per-day times and a reversible archive flag; row swipes reveal actions without opening the editor or archiving on dismissal, and never change employee shifts or ordering logic.
- Timed Pricing uses structured demo settings for dates, source, centre and times, separate from checkout pricing; archive/restore uses reversible swipe actions, never deletion.
- Control Center's Device Settings, Hardware Control and Guest Facing Display have dedicated routes with merged demo defaults; switches do not change hardware, payments or auth, and App Theme uses the appearance hook.
- Customer Support is the only support destination in the shared settings navigation; both the Contact Us and Help Center screens are reached from inside it and return there on back, so support never appears as separate left-nav entries.
- Workforce employee records use dedicated shared demo settings with reversible swipe archive flags and inline-editor back dismissal; saving clears list filters so the saved record is visible. PIN input is transient and never used for authentication, and hardware enrollment and payroll access are not simulated as real operations.

- Employee editors use scoped grouped-row styling with borderless inline values and a separate phone editor; shared settings controls remain unchanged to avoid restyling other destinations.
- Closing a paid ticket keeps it listed as Completed; refunds are demo-only, recorded once per ticket via refundTicket, and shown as struck-through items plus REFUNDED/REFUND payment rows (src/components/pos/ticket-refund.tsx).
- Ticket payment rows (the Paid dropdown, or closed/refunded rows) always sit directly above the totals summary on every layout — outside the scrolling item list in landscape and before the summary card in portrait — so one shared paymentsSection drives both, and expansion grows upward without moving the pinned summary.
- Left-rail icons (src/components/pos/icons/) are inline SVG components using fill/stroke currentColor — never PNG images or CSS masks — so every icon dims, hovers and highlights through the same paint path as the Lucide icons and the orderOS mark.
