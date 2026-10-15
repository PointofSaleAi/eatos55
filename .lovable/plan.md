# Guest search suggestions: always show contacts, on one line

## What you'll see

Every guest suggestion row shows the guest's name, email and phone number on a single line — name on the left, email next to it, phone at the right edge of the row — instead of three stacked lines with "No email on file" / "No phone on file".

## Changes

### 1. Every suggestion carries a demo email and phone
`src/lib/guestbook.ts`

- Add two deterministic helpers used only when a record has no stored contact:
  - `mockEmail(name)` → follows the existing demo style, e.g. `Rachel G.` → `rachel.g@eatos.com`, single-word names → `alex@eatos.com`.
  - `mockPhone(name)` → stable per-name pick from the demo area-code list, e.g. `(312) 555-0142`, so the same guest always shows the same number.
- Apply them in `guestDirectory` so a record never reaches the UI without an email and a phone. Because the values live in the directory, tapping a suggestion fills the same email/phone into the form, and the Guestbook list and guest detail stay consistent.
- Fix the current-guest merge so a seeded guest cannot reappear as a second, contact-less row:
  - When the guest being edited has no email and exactly one directory record shares the name, that record is adopted instead of a new name-only record being pushed (this is why `Rachel G.` — who does have seeded contacts — showed "No email on file").
  - Stop overwriting a stored phone with an empty one (`record.phone = current.phone || undefined` keeps the existing number unless the current guest actually has one).

The "No email on file" / "No phone on file" strings in the suggestion row go away; the "No guest found — continue typing to add manually" empty state stays.

### 2. One-line suggestion row
`src/components/pos/guest-sheet.tsx`

- Replace the vertical `flex-col` row with a single horizontal row:

```text
| Rachel G.   ✉ rachel.g@eatos.com        📞 (312) 555-0164 |
  bold 13px     muted 12px, truncates      muted 12px, pinned right
```

- Name: `shrink-0`, bold, keeps full text.
- Email: `min-w-0 truncate` so it ellipsizes before anything overflows.
- Phone: `ml-auto shrink-0 whitespace-nowrap` so it always sits at the row's right edge and never wraps.
- Keyboard, hover (`bg-muted`, grey — never pink), active-option highlight, `role="option"`/`aria-selected`, mouse-down focus guard and the 6-row cap all stay exactly as they are.

## Technical details

```ts
// src/lib/guestbook.ts — deterministic demo fallbacks
const AREA = ["212","312","415","503","617","646","702","720","917"];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const mockEmail = (name: string) => { /* first[.initial]@eatos.com from the name */ };
const mockPhone = (name: string) => `(${AREA[hash(name) % AREA.length]}) 555-0${100 + (hash(name) % 900)}`;
```

- Fallbacks are applied when building the record, so `GuestRecord.email` / `.phone` are always present and no caller needs a new branch.
- `pickGuest` already copies `g.email` / `g.phone` into the form, so mock contacts fill the fields the same way real ones do.
- No new files, no new dependencies, no data-model or storage change — the demo tickets keep their seeded contacts and nothing is written back to them.
- `src/routes/settings.guestbook.tsx` needs no edit: its rows and detail view read the same directory, so they simply stop showing "No contact information available."

## Verification

Playwright on the running preview at phone (390×844), tablet and desktop, signed in and clocked in to `/order/new`, then on the ORDER tab opening Guest Information (order type pill) and typing a query:

- Every visible suggestion row renders on one line with name, email and phone; assert the row's text height equals a single line and that no element overflows the row (scrollWidth ≤ clientWidth).
- Phone stays at the right edge; email truncates only when width is tight.
- Typing a phone fragment still matches (digit search), arrow keys/Enter pick the highlighted row, tapping fills name/email/phone (and address where saved).
- A guest typed into the field that has no directory match still shows the "No guest found" notice and saves as a new guest.
- `tail /tmp/observability/build-errors.log` shows `build OK`, and a typecheck of the touched files is clean.

## Notes

These are sample values only — no email or SMS is sent, and nothing is written to real customer records.
