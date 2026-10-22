- [x] Show the Course option only on table orders and render the chosen course as a coloured chip above the item name in the order summary; verified hidden without a table, visible and selectable on a table order (pink Dessert chip), and hidden again when editing on takeout across desktop
- [x] Move the cart line's modifiers expand arrow below the price, onto the add-ons/modifiers line; placement, expansion and collapse verified on desktop, tablet and phone
- [x] Move the order panel between left and right by dragging its grip (placed after the arrival time in the header row), with the menu flipping sides; verified grip placement, both drag directions, cancelled drops and header fit on desktop, tablet and phone
- [x] Run product-tile photos edge to edge across the card's top band and shrink the name on photo tiles; verified flush right edge, clean corners, small name, unchanged text-only tiles and adding to the order on phone, tablet and desktop
- [x] Use the uploaded archive mark on the guestbook archive controls over a neutral grey surface (swipe action and toolbar toggle); verified phone, tablet and desktop in light and dark
- [x] Make General's Language, Currency and Tax Alias rows display-only (value shown, no chevron, no navigation) and remove their unreachable detail screens; verified phone, tablet and desktop

- [x] Rework the Guestbook guest list with initials avatars, a New Guest popover, sort and archive/restore with per-row actions; verified on phone, tablet and desktop

# Roadmap
- [ ] Show Course for every table-order product, move seat details directly after names, hide the unassigned course tag and list unassigned items first; verify on phone, tablet and desktop.
- [x] Remove Item sorting and verify all 24 reference additional modifiers, pictured prices/stock, retained Add-Ons search/sort, stable popup size and configured order readback across desktop, tablet and phone; six tests pass.
- [x] Restore full product-detail access for every product, Add-Ons search and sorting on both tabs; verified all five reference groups, search filtering, name/price sorting, preserved selections and $29 configured order readback on desktop, tablet and phone, including detail controls on a product with no add-ons.
- [x] Restore product prices and keep Item/Add-Ons available throughout product details; verified prices, retained selections, choices and adding across phone, tablet and desktop, with no page errors.
- [x] Limit wrapped submenus to three rows with a horizontally scrolling last row; Device Settings Show Product Prices hides/restores tile prices with reload persistence and unchanged order amounts, verified on phone, tablet and desktop; two rule tests pass.
- [x] Reduce Local Host artwork to match toolbar icons, add uploaded Caprice photo and show demo modifier remaining stock; verified photo, options and adding on desktop, tablet and phone
- [x] Replace the device pill with the uploaded Local Host icon immediately after Maya AI; verified desktop, tablet and phone menu
- [x] Allow dragging side navigation left/right while preserving phone navigation; verified both sides, cancelled drops, expansion and screen switching
- [x] Remove the archive button from every Menu settings editor (menu, category, modifier, add-on, product, default-modifier, group); archiving stays only as the list left-swipe, verified phone, tablet and desktop
- [x] Hide Login Screen settings entries unless a manager is clocked in; actual manager clock-in and hidden states verified on phone, tablet and desktop
- [x] Replace Cash Management drawer navigation with an available-drawer dropdown; selection and reload persistence verified on phone, tablet and desktop
- [x] Allow Pay In without opening the till balance; saved cash and logs verified after reload on phone, tablet and desktop, with 10 cash tests passing
- [x] Complete demo Cash Management pay in, pay out, opening till and closing flows; balances, logs, notes, cancellation and saved state verified on phone, tablet and desktop
- [x] Align the empty upcoming visit row, open all most-ordered items with sorting, and show the reservation info legend; verified phone, tablet and desktop
- [x] Center Add Tags and push Allergy Add and Book A Visit to the right edge of their cards on the guest profile; verified on phone, tablet and desktop
- [x] Match Guestbook Order History references; expansion, collapse and sorting verified on phone, tablet and desktop
- [x] Keep Guestbook feedback on one line, reveal full text/time/server only through More, and use uploaded source logos; verified phone, tablet and desktop
- [x] Open table selection from Guestbook Book A Visit and save future guest reservations; verified saving and readback on phone, tablet and desktop
- [x] Rebuild the Guestbook Feedback tab with sample review rows (date badge, rating icons, More/Less expansion, time, source wordmarks, reviewer); verified on desktop and phone
- [x] Remove the duplicated guest-count/status and order-type/table/revenue-centre rows from the landscape Tickets cart header; verified on desktop, wide, landscape tablet, portrait tablet and phone
- [x] Landscape Tickets: removed expansion/status arrow, added route-driven grey selection, and matched the full New Order receipt structure; verified landscape sizes, expanded rail, payment details, tip save, payment handoff, cancel/void dismissal and phone expansion/rotation
- [x] Restructure landscape Tickets cards into reference-aligned badge, guest, employee/payment and status/amount columns; verified landscape sizes, expanded rail, ticket opening, expansion and swipe cancellation; portrait and phone unchanged
- [x] Guest search suggestions show name, email and phone on one line, with sample contacts for guests that have none; verified phone, tablet and desktop
- [x] Guest search results show name, email and phone with no clipping; verified phone, tablet and desktop
- [x] Rename Reports navigation to Sales and match reference date/time, filters and six switches; saved controls verified on phone, tablet and desktop, with live reports/printing remaining unconnected
- [x] Contact Us opens the live official support website inside POS; verified phone, tablet and desktop with no new tabs
- [ ] Chat opens the official support box on all layouts, but live content verification is blocked: the hosted Crisp embed remains on its loading spinner in the test browser
- [x] Add reference Card Reader and Cash Drawer connection lists, selection, detection notices and drawer addition; verified phone, tablet and desktop
- [x] Match Hardware Emulators reference options; verified four switches, lab dismissal and saved settings across phone, tablet and desktop
- [x] Remove Hardware Integrations and add reference Printers, Paired Printers and Advanced Settings; verified navigation, 16 switches, copies, selections, cancel and saved values across phone, tablet and desktop
- [x] Add screenshot-matched Server Connection options under Network → Servers; verified saved demo controls, sync notice and return navigation on phone, tablet and desktop
- [x] Match the employee form to the Apple-style reference; editing, phone selection, save and return verified on phone, tablet and desktop
- [x] Add employee list subtext, swipe archive, visible saved additions and employee-detail return; verified desktop, tablet and phone
- [x] Simplify Workforce and add reference employee list, add/edit employee fields and reversible archive; verified phone, tablet and desktop
- [x] Add reference Hardware Control and Guest Facing Display screens under Control Center; verified navigation, all switches and persistence on phone, tablet and desktop
- [x] Add all reference Device Settings options under Control Center instead of General; verified choices, saved toggles and appearance on phone, tablet and desktop
- [x] Match Timed Pricing reference list and add/edit form; verify selections, copying times and saved edits on all devices
- [x] Timed Pricing archive: left-swipe reveals Archive/Restore, archive toggle view, editor Archive button; verified on desktop and phone
- [x] Remove the marked schedule editor Back button and verify swipe-left archive across phone, tablet and desktop
- [x] Update Schedule Info with reference entries, add/edit, copy daily times and archive/restore; verify across devices
- [x] Add screenshot-matched End of Day settings and Start End of Day checklist; verify all device sizes
- [x] Match restaurant field widths and circular logo; replace Restaurant Settings with reference operating-hours options and verify across devices
- [x] Add every restaurant information option from the two reference screenshots and verify editing across devices
- [x] Replace the four-square Menu page content with the shared Dashboard and verify across devices
- [x] Rename the four-square Menu rail item to Dashboard and remove the separate Dashboard left-nav entry

- [x] Move Dashboard to navigation, move full Settings into the header menu, and remove rail Settings/Shift Assistant
- [x] Remove outside-corner modal X controls app-wide and verify safe outside dismissal across devices
- [x] Arrange all in-app number pads in calculator order and verify across devices
- [x] Add searchable U.S. address suggestions and structured address fields to guest forms
- [x] Replace the cart with an inline Add Guest form and verify save/cancel across devices
- [x] Add cart Transfer Check beside Discount with searchable employees and current owner; verify selection across layouts
- [x] Apply solid black global top bar with centered pull-down
- [x] Remove visible Wallets groups from checkout and settings
- [x] Add merchant gratuity timing and tender eligibility settings
- [x] Integrate tip selection into checkout and save tips to payments/tickets
- [x] Verify phone, tablet, and desktop layouts
- [x] Add merchant-controlled per-product modifier visibility and requiredness
- [x] Add New Order menu dropdown with category and subcategory layout controls
- [x] Show product image before the name and move cost and quantity to the right end of the name row in the product modal
- [x] Stop truncating modifier names in the product modal
- [x] Fix the quantity chip's dropdown arrow spacing so it sits clear of the chip's right edge
- [ ] Add real product photos to the menu data (placeholder tile shows until then)
- [x] Disable Clock Out, Break, Clock In and ENTER on the PIN pad until all four digits are entered
- [x] Complete the reference-matched unpaid/open checks clock-out flow
- [x] Rework New Order guest details and move secondary order options into a right-side panel
- [x] Add inline auto-saving guest name and mobile fields to the cart header
- [x] Dock New Order options as a third column on landscape screens while keeping a right-side overlay on narrow screens
- [x] Break each two-word option label onto two lines in the docked options rail
- [x] Rearrange cart options into the single agreed row: Discount, No Tax, Cancel Order, No Sale, Custom Item, Gift Card, Service Charge, Add Guest, Open Orders, Allergy, Merge, Reopen Check (three-dot rail removed; Allergy note and Merge checks added)


- [x] Restore the fixed three-dot button with Custom Item onward in the docked landscape rail and narrow-screen panel
- [x] Open Custom Item inline in the New Order product area while keeping the cart and menu state visible
- [x] Hide menu categories, subcategories and product search while the Custom Item workspace is open
- [x] Enlarge the Custom Item keypad digits and keep the pad clear of the phone bottom bar
- [x] Rename the Custom Item option to Menu Item in the three-dot panel while that screen is open
- [x] Open Product Information (name, price, image, description, Back to Order) inside the same product modal from its image and name
- [x] Tap an Ordering/Ordered Table on Table Order to open its tickets sheet: resume a ticket, start a New Order, and Fire now creates a table-linked ticket (charging also stamps the table)

- [x] Fix Create Account and Forgot Password landscape layouts and verify phone, portrait tablet, landscape tablet and desktop without changing submission flows

- [x] Complete and verify the demo Forgot Password code, reset-password and completion flow across devices

- [x] Complete the four-step demo signup flow and verify navigation, validation, code expiry and completion across devices

- [x] Add the Settings sidebar search bar above the navigation list (matches iPadOS: filters destinations live, empty state, hidden while collapsed)
- [x] Add voice dictation to both Settings search bars and shorten them; verify across phone, tablet and desktop

- [x] orderOS end-to-end flow (board, detail, report issue, cancel, scheduled, prep/auto-accept/pause)
- [x] Match the recorded header settings panel with tap/drag and safe dismissal across devices
- [x] Add Guestbook directory, details and shared Settings shortcut; verify navigation and history
- [x] Smooth settings drawer collapse and upward swipe dismissal; verify arrows, scrolling and gestures across devices

- [x] Replace pink hover/highlight with the shared grey across settings rows, menus, selects and toggles; verified phone, tablet, desktop

- [x] Remove the dividers splitting the Auto End of Day, Print Employee Data and Send Daily Reports rows from their own descriptions
- [x] Remove Contact Us from the settings navigation and move Help Center inside Customer Support; verified across phone, tablet and desktop
- [x] Keep Contact Us inside Customer Support (row + screen with back to Customer Support); verified phone, tablet and desktop

- [x] Remove Save/Cancel from the employee editor and auto-save details as they are typed; verified phone, tablet and desktop
- [x] Rename Server Connection device values to eatOS and make Cloud server off turn edgeOS on automatically; verified phone, tablet and desktop
- [x] Clear every remaining LCROS mention from page content (employee demo emails) and apply the rename without a reload; verified phone, tablet and desktop
- [x] Replace the cart's "Not started" with a live ARRIVED AT clock that freezes when the first item lands; verified cart header, table chip and Custom Item guest line on phone, tablet and desktop
- [x] Stop the cart header from clipping Guest Name and Mobile Number: name and phone keep their minimum widths and the ARRIVED AT clock wraps to its own line when narrow; verified no clipping and inline saving on desktop, tablet and phone
- [x] Keep the cart header on one line at every size (no wrap), switch the label to sentence case "Arrived at", and shorten the name hint to "Guest" so the phone format hint and clock stay fully visible; verified one line, no clipping and inline saving on phone, tablet and desktop
- [x] Restore the full "Guest Name" hint and hold the header on one line by widening the New Order cart column (24rem, 24rem with the options rail docked) and easing the arrival-time size; verified one line, no clipping and inline saving on phone, portrait/landscape tablet and desktop
- [x] Rebuild the Tickets header (title left; round Filter/Messages/Search icons right) with the expanding round-icon filter row including date, sort and close; verified phone, tablet and desktop
- [x] Remove the Messages icon from the Tickets header so only Filter and Search remain; verified the filter row still opens and closes on phone, tablet and desktop
- [x] After-close ticket flow: Completed state, swipe/tap Refund, reason codes, refunded display
- [x] Move the ticket Paid dropdown to the bottom directly above the totals summary on phone, tablet and desktop; verified expansion keeps the summary pinned
- [x] Select the first ticket by default when Tickets opens in landscape (route-derived, order draft untouched); verified phone, portrait tablet, landscape tablet and desktop
- [x] Put the guest profile account, Loyalty and Visits cards in one row on tablet and desktop (stacked only when too narrow); verified no clipped text on phone, portrait tablet, landscape tablet and desktop
- [x] Add swipe-left "No show" on guestbook reservation rows with tap-menu parity, undo, persistence and the Profile no-show count; verified on phone, tablet and desktop
- [x] Open the guestbook with the first guest already selected on wide layouts, and make the reservation left swipe reveal only the "No show" button (undo stays in the tap menu); verified on phone, tablet and desktop
- [x] Guest list: drop the per-row ⋯ menu for a swipe-revealed red Archive icon (ArchiveRestore in the archived view), make Add New Guest a bare `+`, and move the archived toggle next to it; verified on phone, tablet and desktop
- [x] Use the uploaded archive-box mark for archive *and* restore on every POS settings screen that has the action (Menus, Categories, Modifiers, Add-Ons, Products, Default Modifiers, Groups, Schedule Information, Timed Pricing, Workforce Employees, Guestbook) — toolbar toggle, swipe-revealed action and editor button — through one shared `ArchiveGlyph`; verified on phone, tablet and desktop, light and dark

- Reservation no-show swipe works with touch and mouse drag: SwipeRow drives both through pointer events (touch is no longer ignored), the row content sits above the revealed action (`z-10`) and `wasDragged()` stops a swipe release from opening the row tap menu.
- [x] Add Tax flow completed and verified signed-in on desktop and phone (name/amount/type/applicability popups, validation, autosave)
- [x] Taxes: swipe action shows the archive mark alone with no "Archive" word, and the toolbar archive button is removed so the header keeps only the plus; verified signed-in on desktop and phone
- [x] Menu settings (Menus, Categories, Modifiers, Add-Ons, Products, Default Modifiers, Groups): swipe strips and editor archive buttons show the archive mark alone with no "Archive"/"Restore" word; verified signed-in on desktop, tablet and phone
- [x] Table-order seat picker: seat row (ALL + numbered seats) in the order panel for Dine In table orders; new items take the picked seat and show a seat badge; guest name placeholder stays 'Guest Name' (verified desktop + phone)
- [x] Order panel header: the table number now sits beside the order number in the Order# row with the server name centred in the middle, and the duplicate table chip is gone from the order-type row; verified signed-in on desktop, tablet and phone (server centred, no overflow)
- [x] Order summary modifiers and add-ons: always listed vertically one per row with the group word gone, each line coloured by kind (blue "•" choices, orange "+" extras, red "-" removals, amber allergies) at regular weight and a size below the item name; verified signed-in on desktop, tablet and phone (12px/400 vs 16px/700 item name), light and dark
- [x] Order summary: drop the leading dot/plus/minus marks on modifier and add-on lines (kind stays conveyed by colour), and the left/right swipe now moves only the item name row while modifiers, notes and the seat line stay put; verified signed-in on desktop (row translates -88px, modifier list does not move, Cancel still removes the line)
- [x] Order summary: bring the leading marks back on modifier and add-on lines — blue "•" choices, orange "+" add-ons, red "−" removals, amber "−" allergies — alongside the existing colours; verified signed-in on desktop, tablet and phone (all five kinds rendered with the right mark, colour, 12px/400 on wide and 10px on phone)
- [x] Order summary: the "No Tax added" line now carries a small info icon that opens the note "No tax added on this product" (dismisses on outside tap, tax state untouched); verified signed-in on desktop, tablet and phone, with the note nudged clear of the icon on phone
- [x] Order summary: the item name now shows in full (no ellipsis), the course chip sits above the name on every table-order line (grey "No Course" when none picked, otherwise the course colour), and the seat line always shows the chair icon with a dark chip reading the seat number or "All" when no seat is picked (title "This order is for all seats"); takeout orders show neither chip — verified signed-in on desktop and tablet (A no-course → "No Course" + "All", B Dessert → pink chip, C seat 2 → "2", D takeout → no chips) and phone (no-course + "All")
- [x] Order panel header: the table label now sits centred in the Order# row while the server name moves to the right edge just before the notes icon (matching the uploaded reference); the course chip also sits tight against the item name instead of a loose gap — verified signed-in on desktop, tablet and phone (table centred in the row, server name left of the notes button, chip-to-name gap 1px wide / 4px phone)
- [x] Order summary swipe: the row's opaque background now rides on the element that slides, so swiping left reveals red CANCEL and swiping right reveals dark No Tax again (the "only the name moves" restructure had left the background covering them); verified signed-in on desktop and phone — Cancel tap removes the line, No Tax tap adds the "No Tax added" line, and the modifier/seat lines hold still (modX/modY/seatX unchanged while nameX shifts)
- [x] Item options popup: removed the "Search for Add-Ons" bar (and its microphone) plus the sort button from the Add-Ons view, so the popup gives back that row's height and still holds one size from open to close; options keep a stable A-Z order — verified signed-in on desktop, tablet and phone (no search/sort controls anywhere, height steady at 578px desktop/tablet and 596px phone across Item, Add-Ons and Beverage group switches, 13px gap with no leftover band, group pills and option picking still work)
- [x] Totals rows: the Discount and Service Charge lines now carry a count pill instead of an arrow that lists every picked option vertically with its own amount on the right, at a larger size, with discount names and amounts in the red tone — verified signed-in on desktop, tablet and phone (pill reads "2" for two discounts and for two service charges, rows 13.65px wide / 11.7px phone, discount lines red, service-charge lines grey, nothing clipped)
- [x] Item options popup: the dead band between the ITEM / ADD-ONS toggle and "Additional Modifiers" is gone (the Add-Ons search row is no longer held open invisibly on the Item tab, and the heading row is tighter); the options grid takes that space back so the popup still never resizes — verified signed-in on desktop, tablet and phone (gap 7-9px, height identical on both tabs 591/591 and 610/610, search bar and sort still present on Add-Ons)
- [x] Order panel: the Save / Fire / Charge row and the service-type row (Dine-In, Takeout, Delivery, ...) sit a step shorter on a new --ctl-xs height token (42px tablet and desktop, 40px phone, down from 48/44px), leaving every other control on --ctl-sm — verified signed-in on desktop, tablet and phone (all six buttons report the same min-height, icons and labels unclipped and centred)
- [x] Add-Ons search row: the sort button is now a full circle (52px on tablet and desktop, 44px phone — width equals the search field's height, so both share the same top and bottom edges), and the search capsule takes the rest of the row (578px on desktop); verified signed-in on desktop, tablet and phone (button width equals height, icon centred, magnifier/placeholder/mic all visible)
- [x] Item options popup: the empty band above the ADD button is tightened to match the band below it (grid bottom padding 10px -> 4px, footer top padding dropped, the always-reserved picks line trimmed from a 26px block to one 16px line), so the space above the button now reads the same as the space under it — verified signed-in on desktop, tablet and phone (gap above 47px -> 27px against 17px below, popup still 591px with nothing picked and with two add-ons picked, "Add Bacon · Add Truffle" line still shows and is not clipped, no page errors)
- [x] Order summary: only the running total shows by default; the arrow at the right of the total row (up when folded, down when open) reveals Sub Total, Tax, Discount and Service Charge above it and folds them away again — verified signed-in on desktop, tablet and phone (folded: detail rows hidden; open: all four visible with the discount/service-charge count pills still listing each picked item one per line; re-tap refolds; no page errors)
- [x] Order summary: the open/close arrow moved out of the total row to a small handle centred above the totals (down when folded, up when open); once open, every applied discount and service charge lists on its own line with its amount with no extra tap, and the count pills are gone — verified signed-in on desktop and phone (handle centre equals panel centre 1165.5/1165.5 and 195.0/195.0, folded block hidden, open shows Sub Total/Tax/Discount - Employee Shift - Service Charge - Half Payment/Total, zero count pills, no page errors)
- [x] Order summary handle: moved out of the totals block to a centred rounded grey pill sitting just above the footer divider (56x28, radius 9999px, bg-muted) and its arrow inverted — up while folded, down while open — verified signed-in on desktop and phone (chip bottom 697.5 vs divider top 701.5 and 689.3 vs 693.3 so it clears the line, path check reports UP folded / DOWN open / UP refolded, details still fold and list every discount and service charge, no page errors)
- [x] Order options: the three-dot button moved out of the summary panel header to sit right after the search icon in the menu toolbar (wide), and the options now open as a vertical rail on the summary panel's LEFT (rail rendered before the panel; when the panel is dragged left the row reverses so the options still read as being to the panel's left); phones keep the dots in the panel header with a popover — verified signed-in on desktop (more_x 929 vs search_x 891 same row, rail 882-973 vs panel 973-1357), tablet (596 vs 558, rail 549-640 vs panel 640-1024), panel-dragged-left (rail 76-167 vs panel 168-552) and phone (dots at y=165 in the panel header, popover opens), no page errors
- [x] Product details popup: on wide layouts it now fills the screen leaving one even margin on all four sides (--dlg-inset clamp(1.5rem,3vw,3.5rem) → 36px gaps at 1204x796, 56px at 1920x1080, 31px at 1024x768; was 672px wide with 266px side gaps), and its type, controls, option rows and Product Information photo scale with the viewport (option/field/ADD text 19.8px at 1204, 23px at 1920, was 16px flat); phone bottom sheet untouched (390x590, 16px). Height is fixed per open so item/addons/info never resize the popup (722 clientH = scrollH at every size). Verified signed-in on all four viewports, zero page errors, vision-checked item/addons/info for empty bands and clipping — none.
- [x] Stretch the product popup modifier group tabs to fill the row width, sharing spare space evenly without squeezing labels; verified fill, no clipping and unchanged popup height on desktop, tablet and phone
- [x] Shorten the product popup option cards (no longer stretched to fill the panel), widen the gap between modifier group tabs and give the selected-items line clearance above the ADD button; verified card height 151→100 desktop / 147→96 tablet, phone unchanged, popup still one size across tabs on all three layouts
- [x] Increase the menu expand/collapse (burger) icon to 32px and keep the layout-toggle arrow at 24px, using the important flag so the shared Button cannot squash them; verified phone, tablet and desktop
- [x] Show Product Prices now also drives the order screen: with the switch off, an item row in the order summary shows quantity and name only (no amount); with it on the row shows its price and nothing else — verified signed-in on desktop, tablet and phone (enabled line reads "1 CAPRICE SANDWICH $20.00", disabled line reads "1 CAPRICE SANDWICH" with 0 of 29 tile prices showing, totals untouched, no page errors)
- [x] Butter Croissant got a product photo, and photo tiles now show the name below the photo at a smaller wrapping font with the quick-add button overlaid on the photo; tile prices still follow Show Product Prices (hidden off, price under the name when on) — verified signed-in on desktop and phone
- [x] Product prices are hidden by default (Show Product Prices starts off and an older saved "on" preference is reset once on load), and a photo tile's name now shares one line with the quick-add + button — light-weight, cut with "…" when long — verified signed-in on desktop, tablet and phone (0 of 5 tiles priced when off, all 5 priced after turning the switch on, back to 0 after turning it off from Device Settings; BUTTER CROISSANT reports weight 300 with name and + on the same row and an ellipsis at every size)

- [x] BUTTER CROISSANT now shows its price with the amount and its name in full: photo tiles wrap the light-weight name across the lines it needs (no "…") and the price plus the quick-add + share the bottom line, and the fitted name now shrinks by measured word width so no tile clips a long word — verified signed-in on desktop, tablet and phone (croissant reads "BUTTER CROISSANT | $6.00" at every size, 0 of 53 brunch tiles clipped or truncated, uniform tile heights, 15 tests pass)
