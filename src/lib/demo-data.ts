export type TicketStatus = "ordering" | "preparing" | "payment" | "paid" | "ready";

export type MenuMode = "dine-in" | "takeaway" | "delivery" | "bar";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  note?: string;
};

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  custom?: boolean;
};

export type Ticket = {
  id: string;
  number: number;
  label: string;
  seats: number;
  total: number;
  arrivedAt: string;
  arrivedMinutesAgo: number;
  status: TicketStatus;
  mode: MenuMode;
  lines: CartLine[];
  server: string;
};

export const TAX_RATE = 0.0875;

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

export const initialTickets: Ticket[] = [
  {
    id: "t-1042",
    number: 2,
    label: "Guest order",
    seats: 2,
    total: 11.0,
    arrivedAt: "4:34 PM",
    arrivedMinutesAgo: 71,
    status: "preparing",
    mode: "dine-in",
    lines: [line("m1")],
    server: "Elizer Cruz",
  },
  {
    id: "t-1043",
    number: 1,
    label: "Guest order",
    seats: 1,
    total: 5.76,
    arrivedAt: "5:45 PM",
    arrivedMinutesAgo: 20,
    status: "paid",
    mode: "takeaway",
    lines: [line("m14"), line("m18")],
    server: "Elizer Cruz",
  },
  {
    id: "t-1044",
    number: 4,
    label: "Patio 12",
    seats: 4,
    total: 42.75,
    arrivedAt: "5:52 PM",
    arrivedMinutesAgo: 13,
    status: "ordering",
    mode: "dine-in",
    lines: [line("m2", 2), line("m10"), line("m15", 2)],
    server: "Dana Whitfield",
  },
  {
    id: "t-1045",
    number: 3,
    label: "Bar tab",
    seats: 3,
    total: 21.0,
    arrivedAt: "6:01 PM",
    arrivedMinutesAgo: 4,
    status: "payment",
    mode: "bar",
    lines: [line("m15", 3)],
    server: "Marcus Lee",
  },
  {
    id: "t-1046",
    number: 1,
    label: "Pickup · Ana R.",
    seats: 1,
    total: 16.5,
    arrivedAt: "6:04 PM",
    arrivedMinutesAgo: 1,
    status: "ready",
    mode: "takeaway",
    lines: [line("m3"), line("m9")],
    server: "Elizer Cruz",
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
export const APP_VERSION = "Version 5.200.27(+11350)   FL 3.44.2   BD 31.07.26";

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

/** Barcode-style category chips on the new order menu. */
export const barcodeCategories = ["B", "C", "A", "TEST BARCODE"];
