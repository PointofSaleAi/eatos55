export type TicketStatus = "ordering" | "preparing" | "payment" | "paid" | "ready";

export type MenuMode = "dine-in" | "takeaway" | "delivery" | "bar";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  note?: string;
  /** Tracked inventory count, when the item counts stock. */
  stock?: number;
  /** Threshold at or below which the stock badge switches to low-stock style. */
  lowStockAt?: number;
  /** 86'd item: cannot be added without a manager override. */
  outOfStock?: boolean;
  /** Price is entered by the server at order time. */
  openPrice?: boolean;
};

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  custom?: boolean;
  notes?: string;
  modifiers?: string[];
  discountPercent?: number;
};


export type TicketPayment = {
  no: string;
  method: string;
  amount: number;
  at: string;
};

export type Ticket = {
  id: string;
  number: number;
  label: string;
  seats: number;
  total: number;
  /** ISO day the ticket belongs to (drives the ticket-list date stepper). */
  date: string;
  arrivedAt: string;
  arrivedMinutesAgo: number;
  status: TicketStatus;
  mode: MenuMode;
  lines: CartLine[];
  server: string;
  /** Check number printed on the guest copy. */
  checkNumber?: number;
  /** Tips recorded against the ticket. */
  tips?: number;
  revenueCenter?: string;
  paymentType?: string;
  payments?: TicketPayment[];
  /** Guest-facing order type, when it was chosen explicitly on the order. */
  orderType?: string;
  guestEmail?: string;
  notes?: string;
  vehicle?: { type: string; color: string; brand?: string; plate?: string };



/** Tax is inclusive in the guest-facing totals (20%). */
export const TAX_RATE = 0.2;

export const categories = [
  "Popular",
  "Breakfast",
  "Burgers",
  "Sides",
  "Drinks",
  "Desserts",
] as const;

export const menu: MenuItem[] = [
  { id: "m1", name: "Classic Smash", price: 11.0, category: "Burgers" },
  { id: "m2", name: "Double Smash", price: 14.5, category: "Burgers" },
  { id: "m3", name: "Crispy Chicken", price: 12.25, category: "Burgers" },
  { id: "m4", name: "Garden Burger", price: 10.75, category: "Burgers" },
  { id: "m5", name: "Steak & Eggs", price: 16.0, category: "Breakfast" },
  { id: "m6", name: "Buttermilk Pancakes", price: 9.5, category: "Breakfast" },
  { id: "m7", name: "Breakfast Burrito", price: 10.25, category: "Breakfast" },
  { id: "m8", name: "Skillet Hash", price: 11.5, category: "Breakfast" },
  { id: "m9", name: "Shoestring Fries", price: 4.25, category: "Sides" },
  { id: "m10", name: "Truffle Tots", price: 6.5, category: "Sides" },
  { id: "m11", name: "House Salad", price: 7.0, category: "Sides" },
  { id: "m12", name: "Onion Rings", price: 5.75, category: "Sides" },
  { id: "m13", name: "Cold Brew", price: 4.5, category: "Drinks" },
  { id: "m14", name: "Fresh Lemonade", price: 3.75, category: "Drinks" },
  { id: "m15", name: "Draft Lager", price: 7.0, category: "Drinks" },
  { id: "m16", name: "Espresso", price: 3.25, category: "Drinks" },
  { id: "m17", name: "Salted Brownie", price: 6.0, category: "Desserts" },
  { id: "m18", name: "Soft Serve", price: 4.0, category: "Desserts" },
];

export const popularIds = ["m1", "m9", "m13", "m3", "m10", "m17"];

export const menuModes: { id: MenuMode; name: string; hint: string }[] = [
  { id: "dine-in", name: "Dine in", hint: "Table service menu" },
  { id: "takeaway", name: "Takeaway", hint: "Counter pickup pricing" },
  { id: "delivery", name: "Delivery", hint: "Third party menu" },
  { id: "bar", name: "Bar", hint: "Drinks and late night" },
];

export const stations = [
  { id: "s1", name: "Main dining", hint: "Revenue center · 42 seats" },
  { id: "s2", name: "Patio", hint: "Revenue center · 18 seats" },
  { id: "s3", name: "Bar", hint: "Revenue center · 12 stools" },
  { id: "s4", name: "Counter pickup", hint: "Takeaway and delivery" },
];

const line = (id: string, qty = 1): CartLine => {
  const item = menu.find((m) => m.id === id)!;
  return { id: item.id, name: item.name, price: item.price, qty };
};

/** The business day the ticket list opens on. */
export const DEFAULT_TICKET_DATE = "2026-07-31";

const custom = (price: number): CartLine => ({
  id: `custom-${price}`,
  name: "Custom Item",
  price,
  qty: 1,
  custom: true,
});

export const initialTickets: Ticket[] = [
  {
    id: "t-1042",
    number: 2,
    label: "Guest",
    seats: 2,
    total: 11.0,
    date: DEFAULT_TICKET_DATE,
    arrivedAt: "4:34 PM",
    arrivedMinutesAgo: 71,
    status: "preparing",
    mode: "dine-in",
    lines: [custom(11.0)],
    server: "Elizer Cruz",
    checkNumber: 1042,
    tips: 0,
    revenueCenter: "Main dining",
    paymentType: "Unpaid",
    payments: [],
  },
  {
    id: "t-1043",
    number: 1,
    label: "Guest",
    seats: 1,
    total: 5.76,
    date: DEFAULT_TICKET_DATE,
    arrivedAt: "5:45 PM",
    arrivedMinutesAgo: 20,
    status: "paid",
    mode: "takeaway",
    lines: [custom(5.76)],
    server: "Elizer Cruz",
    checkNumber: 1043,
    tips: 1.0,
    revenueCenter: "Counter pickup",
    paymentType: "Card",
    payments: [{ no: "1", method: "Card", amount: 5.76, at: "5:46 PM" }],
  },
  {
    id: "t-1044",
    number: 4,
    label: "Guest",
    seats: 4,
    total: 42.75,
    date: "2026-08-01",
    arrivedAt: "5:52 PM",
    arrivedMinutesAgo: 13,
    status: "ordering",
    mode: "dine-in",
    lines: [line("m2", 2), line("m10"), line("m15", 2)],
    server: "Dana Whitfield",
    checkNumber: 1044,
    tips: 0,
    revenueCenter: "Main dining",
    paymentType: "Unpaid",
    payments: [],
  },
  {
    id: "t-1045",
    number: 3,
    label: "Guest",
    seats: 3,
    total: 21.0,
    date: "2026-08-01",
    arrivedAt: "6:01 PM",
    arrivedMinutesAgo: 4,
    status: "payment",
    mode: "bar",
    lines: [line("m15", 3)],
    server: "Marcus Lee",
    checkNumber: 1045,
    tips: 0,
    revenueCenter: "Bar",
    paymentType: "Unpaid",
    payments: [{ no: "1", method: "Cash", amount: 10.0, at: "6:03 PM" }],
  },
  {
    id: "t-1046",
    number: 1,
    label: "Guest",
    seats: 1,
    total: 16.5,
    date: "2026-08-01",
    arrivedAt: "6:04 PM",
    arrivedMinutesAgo: 1,
    status: "ready",
    mode: "takeaway",
    lines: [line("m3"), line("m9")],
    server: "Elizer Cruz",
    checkNumber: 1046,
    tips: 2.5,
    revenueCenter: "Patio",
    paymentType: "QR Code",
    payments: [{ no: "1", method: "QR Code", amount: 16.5, at: "6:05 PM" }],
  },
];


export const statusMeta: Record<TicketStatus, { label: string; tone: string }> = {
  ordering: { label: "ORDERING", tone: "text-muted-foreground" },
  preparing: { label: "PREPARING", tone: "text-warning" },
  payment: { label: "PAYMENT PROGRESS", tone: "text-warning" },
  paid: { label: "Paid", tone: "text-success" },
  ready: { label: "READY", tone: "text-success" },
};

export const releaseNotes = [
  {
    version: "4.12",
    date: "July 28",
    title: "Maya on every ticket",
    body: "Maya now suggests upsells and flags slow tickets directly in the live queue.",
  },
  {
    version: "4.11",
    date: "July 14",
    title: "Faster cash tender",
    body: "Quick tender buttons learn your most common bill amounts per station.",
  },
  {
    version: "4.10",
    date: "June 30",
    title: "Offline card capture",
    body: "Card payments queue locally and settle automatically when the network returns.",
  },
];

export const employees = [
  { id: "e1", name: "Elizer Cruz", role: "Manager", state: "Clocked in · 5h 12m" },
  { id: "e2", name: "Dana Whitfield", role: "Server", state: "Clocked in · 3h 40m" },
  { id: "e3", name: "Marcus Lee", role: "Bartender", state: "Clocked in · 1h 05m" },
  { id: "e4", name: "Priya Nair", role: "Line cook", state: "Break · 12m" },
  { id: "e5", name: "Sam Okoye", role: "Host", state: "Clocked out" },
];

export const hardware = [
  { id: "h1", name: "Receipt printer", detail: "Star mC-Print3 · Kitchen", ok: true },
  { id: "h2", name: "Card reader", detail: "EATOS Tap S2 · Paired", ok: true },
  { id: "h3", name: "Cash drawer", detail: "APG Vasario · Closed", ok: true },
  { id: "h4", name: "Kitchen display", detail: "KDS-02 · Reconnecting", ok: false },
  { id: "h5", name: "Barcode scanner", detail: "Not paired", ok: false },
];

export const integrations = [
  { id: "i1", name: "DoorDash", detail: "Orders and menu sync", on: true },
  { id: "i2", name: "Uber Eats", detail: "Orders only", on: true },
  { id: "i3", name: "QuickBooks", detail: "Nightly sales export", on: true },
  { id: "i4", name: "Mailchimp", detail: "Guest marketing", on: false },
  { id: "i5", name: "OpenTable", detail: "Reservations", on: false },
];

export const helpArticles = [
  { id: "a1", title: "Open and close a shift", detail: "6 steps · 3 min read" },
  { id: "a2", title: "Split a check between guests", detail: "4 steps · 2 min read" },
  { id: "a3", title: "Refund a card payment", detail: "5 steps · 3 min read" },
  { id: "a4", title: "Pair a new card reader", detail: "3 steps · 2 min read" },
  { id: "a5", title: "Fix a stuck kitchen ticket", detail: "5 steps · 4 min read" },
];

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Build/version string shown on the sign-in screen. */
export const APP_VERSION = "5.200.27(+11350) / 3.44.2/31.07.26";

/** Restaurant types offered during account creation. */
export const restaurantTypes = [
  "Quick Service (QSR)",
  "Full Service",
  "Fast Casual",
  "Cafe / Bakery",
  "Bar / Nightclub",
  "Food Truck",
  "Ghost Kitchen",
];

export const countries = ["United States", "Canada", "United Kingdom", "Australia", "India"];

/** Order types / device profiles shown on the clock-in keypad strip. */
export const orderTypes = ["Main", "hbjnj", "Online Ordering"];

/** Service order types selectable on a new order. */
export const serviceOrderTypes = [
  "Dine In",
  "Take Away",
  "Delivery",
  "Pickup",
  "Drive Thru",
  "Online",
] as const;
export type ServiceOrderType = (typeof serviceOrderTypes)[number];

/** Vehicle picker options on a Drive Thru order. */
export const vehicleTypes = ["Car", "SUV", "Truck", "Van", "Motorcycle", "Bicycle"];
export const vehicleColors = [
  { name: "Silver", hex: "#b6bcc2" },
  { name: "White", hex: "#f2f4f6" },
  { name: "Black", hex: "#1b1d20" },
  { name: "Grey", hex: "#6b7280" },
  { name: "Blue", hex: "#2f6fd0" },
  { name: "Red", hex: "#d0342c" },
  { name: "Green", hex: "#2f8f5b" },
];


/** Barcode-style category chips on the new order menu. */
export const barcodeCategories = ["B", "C", "A", "TEST BARCODE"];

/** Filter sheet facets on the ticket list. */
export const revenueCenters = ["Main dining", "Patio", "Bar", "Counter pickup"];
export const ticketOrderTypes = [...serviceOrderTypes];

/** Maps the internal menu mode onto the guest-facing order type shown on tickets. */
export const modeOrderType = (m: MenuMode): string =>
  m === "takeaway" ? "Take Away" : m === "delivery" ? "Delivery" : "Dine In";
export const paymentTypes = ["Card", "Cash", "QR Code", "Unpaid"];

/** Quick tender denominations on the cash payment screen. */
export const cashDenominations = [1, 5, 10, 20, 50, 100];

/* ------------------------------------------------------------------ */
/* Live-app menu browsing: menus → categories → items                  */
/* ------------------------------------------------------------------ */

export type MenuDef = { id: string; name: string; categories: string[] };

export const menus: MenuDef[] = [
  {
    id: "bar",
    name: "BAR MENu",
    categories: ["BAR BITES", "COCKTAILS", "BEER", "WINE"],
  },
  {
    id: "brunch",
    name: "BRUNCH",
    categories: ["BRUNCH SANDWICHES", "BRUNCH BEVERAGES", "BRUNCHY DRINKS", "BRUNCH COFFEE"],
  },
  {
    id: "dinner",
    name: "DINNER",
    categories: ["STARTERS", "MAINS", "SIDES", "DESSERTS"],
  },
];

/** Items for the live-app menus, keyed by the category chips above. */
export const liveMenu: MenuItem[] = [
  { id: "bs1", name: "CAPRICE SANDWICH", price: 20, category: "BRUNCH SANDWICHES" },
  { id: "bs2", name: "CHICKEN CREPE", price: 19, category: "BRUNCH SANDWICHES", stock: 12 },
  { id: "bs3", name: "CHICKEN SANDWICH (POULET)", price: 20, category: "BRUNCH SANDWICHES" },
  { id: "bs4", name: "CROQUE MADAME", price: 21, category: "BRUNCH SANDWICHES", stock: 5, lowStockAt: 5 },
  { id: "bs5", name: "CROQUE MONSIEUR", price: 19, category: "BRUNCH SANDWICHES", stock: 0, outOfStock: true },
  { id: "bs6", name: "FIGARO BLT", price: 20, category: "BRUNCH SANDWICHES" },
  { id: "bs7", name: "FROMAGE FONDU", price: 16, category: "BRUNCH SANDWICHES", openPrice: true },
  { id: "bs8", name: "HALF SANDWICH AND SOUP", price: 22, category: "BRUNCH SANDWICHES" },
  { id: "bs9", name: "JAMBON (HAM) SANDWICH", price: 20, category: "BRUNCH SANDWICHES" },
  { id: "bb1", name: "FRESH ORANGE JUICE", price: 9, category: "BRUNCH BEVERAGES" },
  { id: "bb2", name: "GRAPEFRUIT JUICE", price: 9, category: "BRUNCH BEVERAGES" },
  { id: "bb3", name: "SPARKLING WATER", price: 6, category: "BRUNCH BEVERAGES", stock: 24 },
  { id: "bd1", name: "MIMOSA", price: 14, category: "BRUNCHY DRINKS" },
  { id: "bd2", name: "BLOODY MARY", price: 15, category: "BRUNCHY DRINKS", stock: 3, lowStockAt: 4 },
  { id: "bd3", name: "APEROL SPRITZ", price: 16, category: "BRUNCHY DRINKS" },
  { id: "bc1", name: "CAFE AU LAIT", price: 7, category: "BRUNCH COFFEE" },
  { id: "bc2", name: "CAPPUCCINO", price: 6, category: "BRUNCH COFFEE" },
  { id: "bc3", name: "ESPRESSO DOPPIO", price: 5, category: "BRUNCH COFFEE" },
  { id: "ba1", name: "AGENT4450-1785428867507", price: 1, category: "BAR BITES" },
  { id: "ba2", name: "AGENT4450-FS-1785429750548", price: 1, category: "BAR BITES" },
  { id: "ba3", name: "AGENT4450-PRE-1785428033881", price: 1, category: "BAR BITES" },
  { id: "bk1", name: "OLIVES & ALMONDS", price: 9, category: "BAR BITES" },
  { id: "bk2", name: "TRUFFLE FRIES", price: 12, category: "BAR BITES" },
  { id: "ck1", name: "OLD FASHIONED", price: 18, category: "COCKTAILS" },
  { id: "ck2", name: "NEGRONI", price: 17, category: "COCKTAILS", stock: 0, outOfStock: true },
  { id: "be1", name: "DRAFT LAGER", price: 9, category: "BEER" },
  { id: "be2", name: "IPA BOTTLE", price: 10, category: "BEER" },
  { id: "wn1", name: "HOUSE RED GLASS", price: 14, category: "WINE", openPrice: true },
  { id: "wn2", name: "HOUSE WHITE GLASS", price: 14, category: "WINE" },
  { id: "st1", name: "FRENCH ONION SOUP", price: 15, category: "STARTERS" },
  { id: "st2", name: "STEAK TARTARE", price: 24, category: "STARTERS", stock: 6 },
  { id: "mn1", name: "STEAK FRITES", price: 42, category: "MAINS", stock: 8 },
  { id: "mn2", name: "ROASTED CHICKEN", price: 34, category: "MAINS", stock: 2, lowStockAt: 3 },
  { id: "sd1", name: "POMMES PUREE", price: 12, category: "SIDES" },
  { id: "sd2", name: "HARICOTS VERTS", price: 11, category: "SIDES" },
  { id: "ds1", name: "CREME BRULEE", price: 13, category: "DESSERTS" },
  { id: "ds2", name: "PROFITEROLES", price: 14, category: "DESSERTS" },
];

export type ModifierOption = { name: string; price: number };
export type ModifierGroup = {
  name: string;
  options: ModifierOption[];
  /** "single" groups behave like radios, "multi" like checkboxes. */
  select?: "single" | "multi";
  /** Required groups must have a selection before the item can be added. */
  required?: boolean;
};

/** Modifier groups shown on the item sheet (Item tab). */
export const modifierGroups: ModifierGroup[] = [
  {
    name: "Bread",
    select: "single",
    options: [
      { name: "Baguette", price: 0 },
      { name: "Foccacia", price: 0 },
      { name: "Lettuce Wrap", price: 0 },
      { name: "Sourdough", price: 1 },
      { name: "Gluten Free Bun", price: 2 },
    ],
  },
  {
    name: "Course",
    select: "single",
    required: true,
    options: [
      { name: "Appetizer", price: 0 },
      { name: "Main", price: 0 },
      { name: "Dessert", price: 0 },
      { name: "Hold", price: 0 },
    ],
  },
  {
    name: "Temperature",
    select: "single",
    options: [
      { name: "Rare", price: 0 },
      { name: "Medium Rare", price: 0 },
      { name: "Medium", price: 0 },
      { name: "Medium Well", price: 0 },
      { name: "Well Done", price: 0 },
    ],
  },
  {
    name: "Preparation",
    select: "multi",
    options: [
      { name: "No Onion", price: 0 },
      { name: "No Mayo", price: 0 },
      { name: "Extra Sauce", price: 1 },
      { name: "Sauce on Side", price: 0 },
      { name: "Well Toasted", price: 0 },
      { name: "Cut in Half", price: 0 },
    ],
  },
  {
    name: "Allergy",
    select: "multi",
    options: [
      { name: "Gluten Free", price: 0 },
      { name: "Dairy Free", price: 0 },
      { name: "Nut Allergy", price: 0 },
      { name: "Shellfish Allergy", price: 0 },
    ],
  },
  {
    name: "Sandwiches Sides",
    select: "single",
    options: [
      { name: "Side Salad", price: 4 },
      { name: "Fries", price: 5 },
      { name: "Soup", price: 6 },
      { name: "Fruit Cup", price: 5 },
    ],
  },
  {
    name: "Sides",
    select: "multi",
    options: [
      { name: "Pickles", price: 1 },
      { name: "Extra Cheese", price: 2 },
      { name: "Avocado", price: 4 },
      { name: "Bacon", price: 4 },
    ],
  },
];

/** Add-Ons tab on the item sheet. */
export const addOnGroups: ModifierGroup[] = [
  {
    name: "Add-Ons",
    select: "multi",
    options: [
      { name: "Add Egg", price: 3 },
      { name: "Add Bacon", price: 4 },
      { name: "Add Avocado", price: 4 },
      { name: "Add Truffle", price: 6 },
      { name: "Add Chicken", price: 7 },
      { name: "Add Salmon", price: 9 },
    ],
  },
  {
    name: "Beverage",
    select: "single",
    options: [
      { name: "Coffee", price: 5 },
      { name: "Fresh Juice", price: 8 },
      { name: "Sparkling Water", price: 6 },
    ],
  },
];

export const discountPresets = [
  { id: "comp-meal", name: "Comp Meal", percent: 100 },
  { id: "employee-shift", name: "Employee Shift", percent: 50 },
  { id: "police-fire", name: "Police & Fire", percent: 20 },
] as const;
