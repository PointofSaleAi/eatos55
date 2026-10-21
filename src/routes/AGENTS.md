# Screens (`src/routes/*.tsx`, including `settings.*` and `access.*`)

- Guestbook feedback uses original source assets and row-local expansion state so opening one review never expands neighboring reviews.
- Guestbook order history derives summaries and expandable visit, bill and item details from the selected guest's saved tickets; it remains read-only and never loads a ticket into the order draft.
- Guestbook most-ordered item popups derive the complete dish-frequency list from selected-guest tickets; sorting is local and read-only, while reservation legends use a shared Popover for safe dismissal across layouts.
- General settings keeps Language, Currency and Tax Alias as static value rows with no detail screens, while Device Name, Restaurant Information, End Of Day and About stay navigable.
- SubHeader accepts an optional local back callback for inline editors so returning to a list does not leave the current settings destination.
- Network Servers uses a dedicated connection screen with merged shared demo preferences; sync, offline numbering and edgeOS controls never perform real network operations or alter order numbering.
- Hardware printer topics share dedicated screens and merged demo printer preferences; configuration is separate from checkout and receipt execution, and detection/test actions never claim live hardware results.
- Hardware Emulators uses shared flat demo switches with a cancel-only lab notice; it never changes peripheral execution or payment processing.
- Hardware uses shared demo device lists; Cash Management reuses drawers but saves its assignment separately, so selection never connects hardware or changes payments.
- Customer Support embeds the official Crisp support chat with its public website identifier and the official support site in Contact Us; no simulated delivery or agent responses replace the hosted service.
- Sales retains the published /settings/reports URL and uses separate shared demo filter preferences; changing these controls never changes transactions or claims a live report or print operation.
- Products settings are demo-only; only the product-order-options rules affect New Order.
- Public access routes own responsive widths; the shell never constrains account or recovery content.
- Demo password recovery stays in ephemeral route-local step state and never persists passwords or claims real code delivery.
- Demo signup uses transient route-local steps and only enters the demo session after code verification; setup credentials are never persisted or used for employee authentication.
