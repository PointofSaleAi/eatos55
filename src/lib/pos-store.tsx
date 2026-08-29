import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { brand, formatTime } from "@/lib/brand";
import loginSlide1 from "@/assets/login-1.jpg.asset.json";
import loginSlide2 from "@/assets/login-2.jpg.asset.json";
import loginSlide3 from "@/assets/login-3.jpg.asset.json";
import loginSlide4 from "@/assets/login-4.jpg.asset.json";
import { setHapticsEnabled } from "@/lib/haptics";
import { isResumablePath, readResume, resumeKey, writeResume } from "@/lib/resume";
import {
  DEFAULT_TICKET_DATE,
  TAX_RATE,
  initialTickets,
  liveMenu,
  menu,
  modeOrderType,
  type CartLine,
  type MenuMode,
  type ServiceOrderType,
  type Ticket,
  type TicketStatus,
} from "./demo-data";
import {
  defaultFloorLayout,
  mergeLabel,

  type CustomFloorKind,
  type FloorObject,
  type SavedTemplate,
  type TableMerge,
  type TableState,
} from "./floor-data";

import {
  inRange,
  rangeForPreset,
  shiftRange,
  type RangePreset,
  type TicketRange,
} from "./date-range";

export type RoomState = "available" | "occupied";

export type SortKey = "time-late-early" | "time-early-late" | "orders-z-a" | "orders-a-z";

export type SearchScope = "all" | "order" | "transaction" | "guest" | "employee" | "orderType";



export type TicketFilters = {
  statuses: TicketStatus[];
  modes: MenuMode[];
  revenueCenters: string[];
  employees: string[];
  orderTypes: string[];
  payments: string[];
  mineOnly: boolean;
};

export const emptyFilters: TicketFilters = {
  statuses: [],
  modes: [],
  revenueCenters: [],
  employees: [],
  orderTypes: [],
  payments: [],
  mineOnly: false,
};

export type Session = {
  signedIn: boolean;
  clockedIn: boolean;
  name: string;
  role: string;
  station: string | null;
  /** PIN used at the gate, so "resume where I left off" is per person. */
  pin?: string | null;
};

/** Editable collection item used by list-style settings screens. */
export type SettingsListItem = { id: string; name: string; detail: string };

/** One slide of the landscape sign-in carousel (dashboard-managed later). */
export type LoginSlide = { id: string; image: string; headline: string; enabled: boolean };

/** Tenders that can be switched on or off per venue. */
export type TenderId =
  | "cash"
  | "card-present"
  | "contactless"
  | "apple-pay"
  | "google-pay"
  | "amex"
  | "pay-by-link"
  | "qr"
  | "open-banking"
  | "bank-transfer"
  | "paypal"
  | "klarna"
  | "cheque"
  | "voucher"
  | "staff"
  | "round-up"
  | "deliveroo"
  | "just-eat"
  | "manual-card"
  | "manual-cc"
  | "external"
  | "split"
  | "account"
  | "house"
  | "gift"
  | "loyalty"
  | "in-kind"
  | "room"
  | "uber"
  | "doordash"
  | "grubhub";

export const TENDER_LABELS: Record<TenderId, string> = {
  cash: "Cash",
  "card-present": "Chip and PIN",
  contactless: "Contactless",
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay",
  amex: "Amex",
  "pay-by-link": "Pay by Link",
  qr: "Scan to Pay",
  "open-banking": "Pay by Bank",
  "bank-transfer": "Bank Transfer",
  paypal: "PayPal",
  klarna: "Klarna",
  cheque: "Cheque",
  voucher: "Voucher",
  staff: "Staff Charge",
  "round-up": "Donation Round-up",
  deliveroo: "Deliveroo",
  "just-eat": "Just Eat",
  "manual-card": "Manual Card",
  "manual-cc": "Manual CC",
  external: "External CC",
  split: "Split Check",
  account: "Account",
  house: "House",
  gift: "Gift Card",
  loyalty: "Loyalty",
  "in-kind": "In-kind",
  room: "Room Charge",
  uber: "Uber Eats",
  doordash: "Doordash",
  grubhub: "Grubhub",
};

const defaultTenders: Record<TenderId, boolean> = {
  cash: true,
  "card-present": true,
  contactless: true,
  "apple-pay": true,
  "google-pay": true,
  amex: true,
  "pay-by-link": false,
  qr: false,
  "open-banking": false,
  "bank-transfer": false,
  paypal: false,
  klarna: false,
  cheque: false,
  voucher: false,
  staff: false,
  "round-up": false,
  deliveroo: false,
  "just-eat": false,
  "manual-card": true,
  "manual-cc": true,
  external: true,
  split: true,
  account: true,
  house: true,
  gift: true,
  loyalty: true,
  "in-kind": true,
  room: true,
  uber: true,
  doordash: true,
  grubhub: true,
};

/**
 * Auto Close Payment per tender: when on, the completion card dismisses itself
 * after a successful payment with that method. Defaults keep today's behaviour.
 */
const defaultTenderAutoClose: Record<TenderId, boolean> = {
  cash: true,
  "card-present": false,
  contactless: false,
  "apple-pay": false,
  "google-pay": false,
  amex: false,
  "pay-by-link": true,
  qr: false,
  "open-banking": false,
  "bank-transfer": false,
  paypal: false,
  klarna: false,
  cheque: false,
  voucher: false,
  staff: false,
  "round-up": false,
  deliveroo: false,
  "just-eat": false,
  "manual-card": true,
  "manual-cc": false,
  external: false,
  split: false,
  account: false,
  house: false,
  gift: false,
  loyalty: false,
  "in-kind": false,
  room: true,
  uber: false,
  doordash: false,
  grubhub: false,
};




export type AppSettings = {
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
  restaurantPhone: string;
  taxId: string;
  timezone: string;
  currency: string;
  autoPrintReceipts: boolean;
  askForTip: boolean;
  tipPresets: string;
  tipBasis: string;
  customTip: string;
  taxRate: string;
  inclusivePricing: boolean;
  emailReceipts: boolean;
  receiptFooter: string;
  printLogo: boolean;
  trackInventory: boolean;
  lowStockAlerts: boolean;
  showSoldOut: boolean;
  requireManagerVoid: boolean;
  cashRounding: string;
  offlineMode: boolean;
  darkKds: boolean;
  hapticFeedback: boolean;
  deviceName: string;
  deviceService: "Table Service" | "Quick Service";
  /** Rooms / room-service module: hides the Rooms screen when off. */
  roomService: boolean;
  /** Which tenders appear on the payment method screen. */
  tenders: Record<TenderId, boolean>;
  /** Per tender: close the order automatically once payment succeeds. */
  tenderAutoClose: Record<TenderId, boolean>;
  /** Processor that clears card payments for this venue. */
  /** Chosen in Settings from the build's provider catalog; empty until set. */
  paymentProvider: string;
  cardReaderModel: string;
  cardReaderConnection: string;
  cardReaderStatus: string;

  language: string;

  /** Sign-in carousel slides shown beside the form in landscape. */
  loginSlides: LoginSlide[];
  /** Venue + weather panel shown on the clock-in / PIN screen. */
  venueLocation: string;
  weatherTemp: string;
  weatherCondition: string;


  taxAlias: string;
  appVersion: string;
  restartApp: boolean;
  restartTime: string;
  paymentPlatform: string;
  clockedInAt: string;
  sentry: boolean;
  instabug: boolean;
  livePin: string;

  // Service charge
  serviceChargeEnabled: boolean;
  serviceChargeName: string;
  serviceChargeRate: string;
  serviceChargeAppliesTo: string;

  // Cash management
  cashDrawerAssigned: string;
  openRegister: string;
  blindClose: boolean;
  openDrawerOnSale: boolean;

  // Hardware
  printerName: string;
  printerConnection: string;
  paperWidth: string;
  contactless: boolean;
  readerFirmware: string;
  printerEmulator: boolean;
  readerEmulator: boolean;

  // Collections
  discounts: SettingsListItem[];
  serviceCharges: SettingsListItem[];
  timedPricing: SettingsListItem[];
  categories: SettingsListItem[];
  modifierGroups: SettingsListItem[];
  defaultModifiers: SettingsListItem[];
  addOns: SettingsListItem[];
  productGroups: SettingsListItem[];
};

const defaultLoginSlides: LoginSlide[] = [
  {
    id: "slide-1",
    image: loginSlide1.url,
    headline: "Make your staff measurably happy",
    enabled: true,
  },
  { id: "slide-2", image: loginSlide2.url, headline: "Take orders at the table", enabled: true },
  { id: "slide-3", image: loginSlide3.url, headline: "Serve the queue faster", enabled: true },
  { id: "slide-4", image: loginSlide4.url, headline: "Run every service with confidence", enabled: true },
];

const defaultSettings: AppSettings = {
  restaurantName: `${brand.appName} Kitchen · Downtown`,
  restaurantAddress: brand.venue.address,
  restaurantCity: brand.venue.city,
  restaurantPhone: brand.venue.phone,
  taxId: brand.venue.taxId,
  timezone: brand.venue.timezone,
  currency: brand.currency,
  autoPrintReceipts: true,
  askForTip: true,
  tipPresets: "18% · 20% · 25%",
  tipBasis: "Pre-tax",
  customTip: "Allowed",
  taxRate: "0%",
  inclusivePricing: true,
  emailReceipts: false,
  receiptFooter: "Thank you!",
  printLogo: true,
  trackInventory: true,
  lowStockAlerts: true,
  showSoldOut: false,
  requireManagerVoid: true,
  cashRounding: "Nearest cent",
  offlineMode: false,
  darkKds: true,
  hapticFeedback: true,
  deviceName: "aurora 22",
  deviceService: "Table Service",
  roomService: false,
  tenders: defaultTenders,
  tenderAutoClose: defaultTenderAutoClose,
  paymentProvider: "",
  cardReaderModel: "",
  cardReaderConnection: "Bluetooth",
  cardReaderStatus: "Not paired",


  language: "English",

  loginSlides: defaultLoginSlides,
  venueLocation: "New York, NY",
  weatherTemp: "24°",
  weatherCondition: "Partly cloudy",

  // Wording only: the variant decides Tax vs VAT, never the rate.
  taxAlias: brand.taxLabel,
  appVersion: "5.200.27",
  restartApp: true,
  restartTime: "02:30 PM",
  paymentPlatform: "NA",
  clockedInAt: "5:43 PM",
  sentry: false,
  instabug: true,
  livePin: "F179488",

  serviceChargeEnabled: false,
  serviceChargeName: "Service Charge",
  serviceChargeRate: "10%",
  serviceChargeAppliesTo: "All orders",

  cashDrawerAssigned: "Not assigned",
  openRegister: "Manager only",
  blindClose: false,
  openDrawerOnSale: true,

  printerName: "Kitchen Printer",
  printerConnection: "Wi-Fi · 10.0.1.42",
  paperWidth: "80 mm",
  contactless: true,
  readerFirmware: "2.14.0",
  printerEmulator: true,
  readerEmulator: true,

  discounts: [
    { id: "d1", name: "Staff Meal", detail: "50% · whole order" },
    { id: "d2", name: "Happy Hour", detail: "20% · drinks" },
    { id: "d3", name: "Manager Comp", detail: "100% · whole order" },
  ],
  serviceCharges: [{ id: "s1", name: "Large Party", detail: "18% · 6+ guests" }],
  timedPricing: [
    { id: "t1", name: "Happy Hour", detail: "Mon–Fri · 4–6 PM · −20%" },
    { id: "t2", name: "Late Night", detail: "Fri–Sat · 10 PM–1 AM · +10%" },
  ],
  categories: [
    { id: "c1", name: "Breakfast", detail: "12 items" },
    { id: "c2", name: "Sandwiches", detail: "9 items" },
    { id: "c3", name: "Drinks", detail: "14 items" },
    { id: "c4", name: "Desserts", detail: "6 items" },
  ],
  modifierGroups: [
    { id: "m1", name: "Temperature", detail: "Required · pick 1" },
    { id: "m2", name: "Milk", detail: "Optional · pick up to 1" },
    { id: "m3", name: "Course", detail: "Optional · pick up to 1" },
    { id: "m4", name: "Extras", detail: "Optional · pick up to 4" },
  ],
  defaultModifiers: [
    { id: "dm1", name: "No Onion", detail: "Sandwiches" },
    { id: "dm2", name: "Oat Milk", detail: "Coffee" },
  ],
  addOns: [
    { id: "a1", name: "Extra Shot", detail: "$1.00" },
    { id: "a2", name: "Avocado", detail: "$2.50" },
    { id: "a3", name: "Bacon", detail: "$3.00" },
  ],
  productGroups: [
    { id: "g1", name: "Hot Drinks", detail: "18 products" },
    { id: "g2", name: "Cold Drinks", detail: "11 products" },
    { id: "g3", name: "Kitchen", detail: "27 products" },
  ],
};


export type TenderMethod =
  | "cash"
  | "card"
  | "gift"
  | "house"
  | "split"
  | "loyalty"
  | "qr"
  | "other";

/** One tender already taken against the order in progress. */
export type PartialPayment = {
  id: string;
  method: TenderMethod;
  label: string;
  amount: number;
};

export type LastPayment = {
  ticketId: string;
  method: TenderMethod;
  /** Settings tender the payment was taken with, for per-tender auto close. */
  tenderId?: TenderId;
  total: number;
  tendered: number;
  change: number;
  orderNumber: number;
  guestName: string;
  /** Tip taken with the final tender, when any. */
  tip?: number;
  /** Cash notes counted for this tender, keyed by denomination. */
  notes?: Record<number, number>;
} | null;

type Store = {
  session: Session;
  signIn: () => void;
  signOut: () => void;
  clockIn: (pin?: string) => void;
  clockOut: () => void;
  setStation: (name: string) => void;

  /** Remember the current screen and order for whoever is clocked in. */
  saveResume: (path: string) => void;
  /**
   * Put back the order in progress for this PIN and return the screen to open,
   * or null when there is nothing worth resuming.
   */
  resumeAfterUnlock: (pin?: string) => string | null;

  tickets: Ticket[];
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  filters: TicketFilters;
  setFilters: React.Dispatch<React.SetStateAction<TicketFilters>>;
  search: string;
  setSearch: (s: string) => void;
  searchScope: SearchScope;
  setSearchScope: (s: SearchScope) => void;
  searchAllDates: boolean;
  setSearchAllDates: (v: boolean) => void;
  ticketDate: string;
  setTicketDate: (d: string) => void;
  ticketRange: TicketRange;
  setTicketRange: (r: TicketRange) => void;
  applyRangePreset: (p: RangePreset) => void;
  shiftTicketDate: (days: number) => void;
  visibleTickets: (tab: TicketStatus | "all", opts?: { ignoreDate?: boolean }) => Ticket[];

  setTicketStatus: (id: string, status: TicketStatus) => void;
  addTip: (id: string, amount: number) => void;

  mode: MenuMode;
  setMode: (m: MenuMode) => void;
  cart: CartLine[];
  activeTicketId: string | null;
  activeTable: string | null;
  floor: string;
  setFloor: (f: string) => void;
  tableStates: Record<string, TableState>;
  tableSince: Record<string, string>;
  /** Guests currently seated per table, so every view shows the same number. */
  tableSeated: Record<string, number>;
  setTableSeated: (table: string, seated: number) => void;
  setTableState: (table: string, state: TableState) => void;
  /** Merged label for a table ("T1 + T2") so every screen prints the same name. */
  tableGroupLabel: (table: string | null) => string | null;

  /** Saved layouts per floor; falls back to the seeded arrangement. */
  floorLayouts: Record<string, FloorObject[]>;
  getFloorLayout: (floor: string) => FloorObject[];
  saveFloorLayout: (floor: string, objects: FloorObject[]) => void;
  resetFloorLayout: (floor: string) => void;
  /** Layouts the venue saved as reusable templates. */
  floorTemplates: SavedTemplate[];
  saveFloorTemplate: (label: string, objects: FloorObject[]) => void;
  renameFloorTemplate: (id: string, label: string) => void;
  deleteFloorTemplate: (id: string) => void;
  /** Tables pushed together for big parties, per floor. */
  tableMerges: TableMerge[];
  mergeTables: (floor: string, members: string[], seats?: number) => void;
  unmergeTables: (id: string) => void;
  setMergeSeats: (id: string, seats: number) => void;
  /** Object types the venue added to the floor editor palette. */
  customFloorKinds: CustomFloorKind[];
  addCustomFloorKind: (kind: Omit<CustomFloorKind, "id">) => void;
  deleteCustomFloorKind: (id: string) => void;

  roomStates: Record<string, RoomState>;
  setRoomState: (room: string, state: RoomState) => void;
  startOrder: (table?: string, partySize?: number) => void;

  guest: Guest;
  setGuest: (patch: Partial<Guest>) => void;
  orderType: ServiceOrderType;
  setOrderType: (t: ServiceOrderType) => void;
  openTicket: (id: string) => void;

  addItem: (
    menuId: string,
    opts?: {
      qty?: number;
      price?: number;
      notes?: string;
      modifiers?: string[];
      discountPercent?: number;
    },
  ) => void;
  addCustomItem: (name: string, price: number) => void;
  changeQty: (id: string, delta: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  /** Abandon the order in progress: cart, payments and table hold are cleared. */
  cancelOrder: () => void;
  /** Cancel an existing ticket and remove it from the queue. */
  cancelTicket: (id: string) => void;
  noTax: boolean;
  setNoTax: (v: boolean) => void;
  /** Comped order: nothing is charged to the guest. */
  comped: boolean;
  setComped: (v: boolean) => void;
  /** Free-text note attached to the whole order. */
  orderNotes: string;
  setOrderNotes: (v: string) => void;
  /** Wall-clock label for when the guest arrived, e.g. "8:01 AM". */
  arrivedAt: string;
  serviceCharge: number;
  setServiceCharge: (v: number) => void;
  orderDiscountPercent: number;
  setOrderDiscountPercent: (v: number) => void;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    count: number;
    serviceCharge: number;
    discount: number;
  };

  commitPayment: (
    method: TenderMethod,
    tendered: number,
    opts?: {
      label?: string;
      roomNumber?: string;
      bookingNumber?: string;
      signedBill?: boolean;
      tip?: number;
      notes?: Record<number, number>;
      tenderId?: TenderId;
    },
  ) => string;
  lastPayment: LastPayment;
  /** Amount already tendered on the current order through partial payments. */
  paidSoFar: number;
  /** Every tender already taken on the order in progress. */
  partialPayments: PartialPayment[];
  addPartialPayment: (amount: number, method?: TenderMethod, label?: string) => void;
  removePartialPayment: (id: string) => void;
  resetPayments: () => void;

  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  /** True when the signed-in role is allowed to change settings. */
  canManageSettings: boolean;


  managerUnlocked: boolean;
  unlockManager: () => void;

  /** False until the stored session has been read back, so guards don't fire early. */
  sessionReady: boolean;
};

export type GuestVehicle = { type: string; color: string; brand?: string; plate?: string };
export type GuestEvent = {
  type?: string | undefined;
  date?: string | undefined;
  time?: string | undefined;
  guests?: number | undefined;
};
export type Guest = {
  name: string;
  phone: string;
  partySize: number;
  email?: string | undefined;
  notes?: string | undefined;
  vehicle?: GuestVehicle | undefined;
  address?: string | undefined;
  event?: GuestEvent | undefined;
  scheduledAt?: string | undefined;
  customLabel?: string | undefined;
};

// Keep one context instance per browser session. A hot update to this module
// otherwise creates a second context object, so consumers that still hold the
// old one read null and throw "usePos must be used inside PosProvider".
const contextRegistry = globalThis as typeof globalThis & {
  __posContext?: ReturnType<typeof createContext<Store | null>>;
};
const PosContext =
  contextRegistry.__posContext ??
  (contextRegistry.__posContext = createContext<Store | null>(null));

export function PosProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    signedIn: false,
    clockedIn: false,
    name: "Elizer Cruz",
    role: "Supervisor",
    station: null,
  });

  const [sessionReady, setSessionReady] = useState(false);

  // Keep the shift/session across page reloads so navigation never disappears.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("eatos.pos.session");
      if (raw)
        setSession((s) => ({
          ...s,
          ...(JSON.parse(raw) as Partial<Session>),
        }));
    } catch {
      /* ignore unreadable storage */
    }
    setSessionReady(true);
  }, []);
  useEffect(() => {
    if (!sessionReady) return;
    try {
      window.localStorage.setItem("eatos.pos.session", JSON.stringify(session));
    } catch {
      /* ignore unwritable storage */
    }
  }, [session, sessionReady]);

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [sortKey, setSortKey] = useState<SortKey>("time-early-late");
  const [filters, setFilters] = useState<TicketFilters>(emptyFilters);
  const [search, setSearch] = useState("");
  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [searchAllDates, setSearchAllDates] = useState(true);
  const [ticketRange, setTicketRange] = useState<TicketRange>({
    start: DEFAULT_TICKET_DATE,
    end: DEFAULT_TICKET_DATE,
    preset: "day",
  });
  const ticketDate = ticketRange.start;
  const [mode, setMode] = useState<MenuMode>("dine-in");


  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [floor, setFloor] = useState<string>("Ground Floor");
  const [guest, setGuestState] = useState<Guest>({ name: "", phone: "", partySize: 1 });
  const [orderType, setOrderType] = useState<ServiceOrderType>("Dine In");
  const [tableStates, setTableStates] = useState<Record<string, TableState>>({});
  const [tableSince, setTableSince] = useState<Record<string, string>>({});
  const [roomStates, setRoomStates] = useState<Record<string, RoomState>>({});
  const [floorLayouts, setFloorLayouts] = useState<Record<string, FloorObject[]>>({});
  const [tableSeated, setTableSeatedMap] = useState<Record<string, number>>({});
  const [floorTemplates, setFloorTemplates] = useState<SavedTemplate[]>([]);
  const [tableMerges, setTableMerges] = useState<TableMerge[]>([]);
  const [customFloorKinds, setCustomFloorKinds] = useState<CustomFloorKind[]>([]);

  const [floorReady, setFloorReady] = useState(false);

  const [noTax, setNoTax] = useState(false);
  const [comped, setComped] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [arrivedAt, setArrivedAt] = useState("");
  const [serviceCharge, setServiceCharge] = useState(0);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);

  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [lastPayment, setLastPayment] = useState<LastPayment>(null);
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const paidSoFar =
    Math.round(partialPayments.reduce((n, p) => n + p.amount, 0) * 100) / 100;

  // Settings are device-local: read them back, then persist every change.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("eatos.pos.settings");
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppSettings>;
        setSettings((s) => ({
          ...s,
          ...saved,
          tenders: { ...defaultTenders, ...(saved.tenders ?? {}) },
          tenderAutoClose: {
            ...defaultTenderAutoClose,
            ...(saved.tenderAutoClose ?? {}),
          },
        }));
      }

    } catch {
      /* ignore unreadable storage */
    }
    setSettingsReady(true);
  }, []);
  useEffect(() => {
    if (!settingsReady) return;
    try {
      window.localStorage.setItem("eatos.pos.settings", JSON.stringify(settings));
    } catch {
      /* ignore unwritable storage */
    }
  }, [settings, settingsReady]);

  // Table/room statuses are device-local so a table stays Reserved across screens.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("eatos.pos.floor");
      if (raw) {
        const saved = JSON.parse(raw) as {
          tableStates?: Record<string, TableState>;
          tableSince?: Record<string, string>;
          tableSeated?: Record<string, number>;
          roomStates?: Record<string, RoomState>;
          floorLayouts?: Record<string, FloorObject[]>;
          floorTemplates?: SavedTemplate[];
          tableMerges?: TableMerge[];
          customFloorKinds?: CustomFloorKind[];
        };
        if (saved.tableStates) setTableStates(saved.tableStates);
        if (saved.tableSince) setTableSince(saved.tableSince);
        if (saved.tableSeated) setTableSeatedMap(saved.tableSeated);
        if (saved.roomStates) setRoomStates(saved.roomStates);
        if (saved.floorLayouts) setFloorLayouts(saved.floorLayouts);
        if (saved.floorTemplates) setFloorTemplates(saved.floorTemplates);
        if (saved.tableMerges) setTableMerges(saved.tableMerges);
        if (saved.customFloorKinds) setCustomFloorKinds(saved.customFloorKinds);
      }
    } catch {
      /* ignore unreadable storage */
    }
    setFloorReady(true);
  }, []);
  useEffect(() => {
    if (!floorReady) return;
    try {
      window.localStorage.setItem(
        "eatos.pos.floor",
        JSON.stringify({
          tableStates,
          tableSince,
          tableSeated,
          roomStates,
          floorLayouts,
          floorTemplates,
          tableMerges,
          customFloorKinds,
        }),
      );
    } catch {
      /* ignore unwritable storage */
    }
  }, [
    tableStates,
    tableSince,
    tableSeated,
    roomStates,
    floorLayouts,
    floorTemplates,
    tableMerges,
    customFloorKinds,

    floorReady,
  ]);



  // Keep real device haptics in step with the user's setting.
  useEffect(() => {
    setHapticsEnabled(settings.hapticFeedback);
  }, [settings.hapticFeedback]);





  const value = useMemo<Store>(() => {
    const round = (n: number) => Math.round(n * 100) / 100;
    const gross = round(
      cart.reduce(
        (sum, l) => sum + l.price * l.qty * (1 - (l.discountPercent ?? 0) / 100),
        0,
      ),
    );
    const discount = round((gross * orderDiscountPercent) / 100);
    const net = round(gross - discount + serviceCharge);
    const subtotal = noTax ? net : round(net / (1 + TAX_RATE));
    const tax = round(net - subtotal);
    const total = comped ? 0 : net;

    return {
      session,
      sessionReady,
      signIn: () => setSession((s) => ({ ...s, signedIn: true })),
      signOut: () =>
        setSession({
          signedIn: false,
          clockedIn: false,
          name: "Elizer Cruz",
          role: "Supervisor",
          station: null,
        }),
      clockIn: (pin) =>
        setSession((s) => ({
          ...s,
          signedIn: true,
          clockedIn: true,
          pin: pin ?? s.pin ?? null,
        })),
      clockOut: () => setSession((s) => ({ ...s, clockedIn: false })),
      setStation: (name) => setSession((s) => ({ ...s, station: name })),

      saveResume: (path) => {
        if (!isResumablePath(path)) return;
        writeResume(resumeKey(session.pin), {
          path,
          order: {
            cart,
            guest,
            orderType,
            orderNotes,
            arrivedAt,
            activeTicketId,
            activeTable,
            floor,
            noTax,
            comped,
            serviceCharge,
            orderDiscountPercent,
            partialPayments,
            mode,
          },
          savedAt: Date.now(),
        });
      },
      resumeAfterUnlock: (pin) => {
        const entry = readResume(resumeKey(pin ?? session.pin));
        if (!entry || !isResumablePath(entry.path)) return null;
        const o = entry.order;
        if (o) {
          setCart((o.cart as CartLine[]) ?? []);
          setGuestState((g) => ({ ...g, ...(o.guest as Partial<Guest>) }));
          setOrderType(o.orderType as ServiceOrderType);
          setOrderNotes(o.orderNotes ?? "");
          setArrivedAt(o.arrivedAt ?? "");
          setActiveTicketId(o.activeTicketId ?? null);
          setActiveTable(o.activeTable ?? null);
          if (o.floor) setFloor(o.floor);
          setNoTax(Boolean(o.noTax));
          setComped(Boolean(o.comped));
          setServiceCharge(o.serviceCharge ?? 0);
          setOrderDiscountPercent(o.orderDiscountPercent ?? 0);
          setPartialPayments((o.partialPayments as PartialPayment[]) ?? []);
          if (o.mode) setMode(o.mode as MenuMode);
        }
        return entry.path;
      },


      tickets,
      sortKey,
      setSortKey,
      filters,
      setFilters,
      search,
      setSearch,
      searchScope,
      setSearchScope,
      searchAllDates,
      setSearchAllDates,
      ticketDate,
      setTicketDate: (d) => setTicketRange({ start: d, end: d, preset: "day" }),
      ticketRange,
      setTicketRange,
      applyRangePreset: (p) => setTicketRange(rangeForPreset(p, DEFAULT_TICKET_DATE)),
      shiftTicketDate: (days) =>
        setTicketRange((r) => shiftRange(r, days > 0 ? 1 : -1)),
      visibleTickets: (tab, opts) => {
        let list = [...tickets];
        if (!opts?.ignoreDate) {
          list = list.filter((t) => inRange(t.date, ticketRange));
        }

        if (tab !== "all") {
          list = list.filter((t) => t.status === tab);
        }
        if (filters.statuses.length) {
          list = list.filter((t) => filters.statuses.includes(t.status));
        }
        if (filters.modes.length) {
          list = list.filter((t) => filters.modes.includes(t.mode));
        }
        if (filters.employees.length) {
          list = list.filter((t) => filters.employees.includes(t.server));
        }
        if (filters.revenueCenters.length) {
          list = list.filter((t) =>
            filters.revenueCenters.includes(t.revenueCenter ?? "Main dining"),
          );
        }
        if (filters.orderTypes.length) {
          list = list.filter((t) => filters.orderTypes.includes(modeOrderType(t.mode)));
        }
        if (filters.payments.length) {
          list = list.filter((t) =>
            filters.payments.includes(t.paymentType ?? (t.status === "paid" ? "Card" : "Unpaid")),
          );
        }

        if (filters.mineOnly) {
          list = list.filter((t) => t.server === session.name);
        }
        const q = search.trim().toLowerCase();
        if (q) {
          const has = (v: string | number | undefined) =>
            v !== undefined && String(v).toLowerCase().includes(q);
          const matchOrder = (t: Ticket) =>
            has(t.orderNo) ||
            has(t.checkNumber) ||
            has(t.number) ||
            has(t.id) ||
            has(t.id.replace("t-", ""));
          const matchTxn = (t: Ticket) =>
            (t.payments ?? []).some((p) => has(p.ref) || has(p.no) || has(p.method));
          const matchGuest = (t: Ticket) => has(t.label) || has(t.guestEmail) || has(t.notes);
          const matchEmployee = (t: Ticket) => has(t.server);
          const matchOrderType = (t: Ticket) =>
            has(t.orderType) || has(modeOrderType(t.mode)) || has(t.revenueCenter);
          list = list.filter((t) => {
            switch (searchScope) {
              case "order":
                return matchOrder(t);
              case "transaction":
                return matchTxn(t);
              case "guest":
                return matchGuest(t);
              case "employee":
                return matchEmployee(t);
              case "orderType":
                return matchOrderType(t);
              default:
                return (
                  matchOrder(t) ||
                  matchTxn(t) ||
                  matchGuest(t) ||
                  matchEmployee(t) ||
                  matchOrderType(t)
                );
            }
          });
        }

        list.sort((a, b) => {
          if (sortKey === "time-late-early") return a.arrivedMinutesAgo - b.arrivedMinutesAgo;
          if (sortKey === "time-early-late") return b.arrivedMinutesAgo - a.arrivedMinutesAgo;
          if (sortKey === "orders-z-a") return b.number - a.number;
          return a.number - b.number;
        });
        return list;
      },
      setTicketStatus: (id, status) =>
        setTickets((list) => list.map((t) => (t.id === id ? { ...t, status } : t))),
      addTip: (id, amount) =>
        setTickets((list) =>
          list.map((t) =>
            t.id === id
              ? {
                  ...t,
                  tips: Math.round(((t.tips ?? 0) + amount) * 100) / 100,
                  total: Math.round((t.total + amount) * 100) / 100,
                  payments: [
                    ...(t.payments ?? []),
                    {
                      no: String((t.payments?.length ?? 0) + 1),
                      method: "Tip",
                      amount,
                      at: formatTime(),
                    },
                  ],
                }
              : t,
          ),
        ),

      mode,
      setMode,
      cart,
      activeTicketId,
      activeTable,
      floor,
      setFloor,
      tableStates,
      tableSince,
      floorLayouts,
      getFloorLayout: (f) => floorLayouts[f] ?? defaultFloorLayout(f),
      saveFloorLayout: (f, objects) => setFloorLayouts((m) => ({ ...m, [f]: objects })),
      floorTemplates,
      saveFloorTemplate: (label, objects) =>
        setFloorTemplates((list) => [
          ...list,
          { id: `tpl-${Date.now()}`, label, objects: objects.map((o) => ({ ...o })) },
        ]),
      renameFloorTemplate: (id, label) =>
        setFloorTemplates((list) => list.map((t) => (t.id === id ? { ...t, label } : t))),
      deleteFloorTemplate: (id) => setFloorTemplates((list) => list.filter((t) => t.id !== id)),

      tableMerges,
      // Merging drops any existing merges the picked tables belonged to, so a table
      // can only ever be part of one group.
      mergeTables: (f, members, seats) =>
        setTableMerges((list) => [
          ...list.filter((m) => m.floor !== f || !m.members.some((n) => members.includes(n))),
          { id: `mg-${Date.now()}`, floor: f, members, ...(seats ? { seats } : {}) },
        ]),
      unmergeTables: (id) => setTableMerges((list) => list.filter((m) => m.id !== id)),
      setMergeSeats: (id, seats) =>
        setTableMerges((list) => list.map((m) => (m.id === id ? { ...m, seats } : m))),

      customFloorKinds,
      addCustomFloorKind: (kind) =>
        setCustomFloorKinds((list) => [...list, { ...kind, id: `ck-${Date.now()}` }]),
      deleteCustomFloorKind: (id) =>
        setCustomFloorKinds((list) => list.filter((k) => k.id !== id)),

      resetFloorLayout: (f) =>
        setFloorLayouts((m) => {
          const next = { ...m };
          delete next[f];
          return next;
        }),
      tableSeated,
      setTableSeated: (table, seated) =>
        setTableSeatedMap((s) => ({ ...s, [table]: Math.max(0, seated) })),
      // A merged party is one table to staff, so a status change fans out to every
      // member: nobody is left on a stale state after leaving the floor or unmerging.
      setTableState: (table, state) => {
        const merge = tableMerges.find((m) => m.members.includes(table));
        const names = merge ? merge.members : [table];
        const free = state === "available" || state === "reserved";
        setTableStates((s) => {
          const next = { ...s };
          for (const n of names) next[n] = state;
          return next;
        });
        setTableSince((s) => {
          const next = { ...s };
          const stamp = new Date().toISOString();
          for (const n of names) {
            if (free) delete next[n];
            else next[n] = stamp;
          }
          return next;
        });
        // Freeing a table clears its party, so seated counts never linger.
        if (free) {
          setTableSeatedMap((s) => {
            const next = { ...s };
            for (const n of names) delete next[n];
            return next;
          });
        }
      },
      tableGroupLabel: (table) => {
        if (!table) return table;
        const merge = tableMerges.find((m) => m.members.includes(table));
        return merge ? mergeLabel(merge.members) : table;
      },

      roomStates,
      setRoomState: (room, state) => setRoomStates((s) => ({ ...s, [room]: state })),

      guest,
      setGuest: (patch) => setGuestState((g) => ({ ...g, ...patch })),
      orderType,
      setOrderType,
      startOrder: (table, partySize) => {
        setCart([]);
        setActiveTicketId(null);
        setActiveTable(table ?? null);
        setOrderNotes("");
        setComped(false);
        setArrivedAt(
          formatTime(),
        );
        if (partySize && partySize > 0) {
          setGuestState((g) => ({ ...g, partySize }));
        }
        if (table) {
          setTableStates((s) => ({ ...s, [table]: "ordering" }));
          setTableSince((s) => ({ ...s, [table]: new Date().toISOString() }));
          if (partySize && partySize > 0) {
            setTableSeatedMap((s) => ({ ...s, [table]: partySize }));
          }
        }
      },


      openTicket: (id) => {
        const ticket = tickets.find((t) => t.id === id);
        if (!ticket) return;
        setActiveTicketId(id);
        setCart(ticket.lines.map((l) => ({ ...l })));
        setMode(ticket.mode);
      },
      addItem: (menuId, opts) => {
        const item = [...menu, ...liveMenu].find((m) => m.id === menuId);
        if (!item) return;
        setArrivedAt((a) =>
          a || formatTime(),
        );
        const qty = opts?.qty ?? 1;
        const price = opts?.price ?? item.price;
        const mods = opts?.modifiers ?? [];
        const lineId = mods.length || opts?.notes ? `${item.id}-${Date.now()}` : item.id;
        setCart((list) => {
          const found = list.find((l) => l.id === lineId);
          if (found) {
            return list.map((l) => (l.id === lineId ? { ...l, qty: l.qty + qty } : l));
          }
          const created: CartLine = { id: lineId, name: item.name, price, qty };
          if (opts?.notes) created.notes = opts.notes;
          if (mods.length) created.modifiers = mods;
          if (opts?.discountPercent) created.discountPercent = opts.discountPercent;
          return [...list, created];
        });
      },
      addCustomItem: (name, price) =>
        setCart((list) => [
          ...list,
          { id: `custom-${Date.now()}`, name, price, qty: 1, custom: true },
        ]),
      changeQty: (id, delta) =>
        setCart((list) =>
          list
            .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
            .filter((l) => l.qty > 0),
        ),
      removeLine: (id) => setCart((list) => list.filter((l) => l.id !== id)),
      clearCart: () => setCart([]),
      cancelOrder: () => {
        setCart([]);
        setActiveTicketId(null);
        setPartialPayments([]);
        setOrderNotes("");
        setComped(false);
        setNoTax(false);
        setArrivedAt("");
        if (activeTable) {
          setTableStates((s) => ({ ...s, [activeTable]: "available" }));
          setTableSince((s) => {
            const next = { ...s };
            delete next[activeTable];
            return next;
          });
          setTableSeatedMap((s) => {
            const next = { ...s };
            delete next[activeTable];
            return next;
          });
        }
        setActiveTable(null);
      },
      cancelTicket: (id) => {
        const ticket = tickets.find((t) => t.id === id);
        setTickets((list) => list.filter((t) => t.id !== id));
        const table = ticket?.table ? String(ticket.table) : null;
        if (table) {
          setTableStates((s) => ({ ...s, [table]: "available" }));
          setTableSince((s) => {
            const next = { ...s };
            delete next[table];
            return next;
          });
          setTableSeatedMap((s) => {
            const next = { ...s };
            delete next[table];
            return next;
          });
        }
        if (activeTicketId === id) {
          setCart([]);
          setActiveTicketId(null);
          setPartialPayments([]);
          setActiveTable(null);
        }
      },
      noTax,
      setNoTax,
      comped,
      setComped,
      orderNotes,
      setOrderNotes,
      arrivedAt,
      serviceCharge,
      setServiceCharge,
      orderDiscountPercent,
      setOrderDiscountPercent,
      totals: {
        subtotal,
        tax,
        total,
        count: cart.reduce((n, l) => n + l.qty, 0),
        serviceCharge,
        discount,
      },

      commitPayment: (method, tendered, opts) => {
        const change = Math.max(0, Math.round((tendered - (total - paidSoFar)) * 100) / 100);
        const paymentLabel =
          opts?.label ?? (method === "cash" ? "Cash" : method === "qr" ? "QR Code" : "Card");
        const at = formatTime();
        const finalAmount = Math.max(0, Math.round((total - paidSoFar) * 100) / 100);
        // Every tender taken on this order, earlier partials first.
        const rows = [
          ...partialPayments.map((p) => ({ method: p.label, amount: p.amount, at })),
          { method: paymentLabel, amount: finalAmount, at },
        ];
        const extra = {
          ...(opts?.roomNumber ? { roomNumber: opts.roomNumber } : {}),
          ...(opts?.bookingNumber ? { bookingNumber: opts.bookingNumber } : {}),
          ...(opts?.signedBill ? { signedBill: true } : {}),
        };
        let id = activeTicketId;
        let orderNumber = 0;
        let guestName = guest.name;
        if (id) {
          const ticketId = id;
          setTickets((list) =>
            list.map((t) => {
              if (t.id !== ticketId) return t;
              orderNumber = t.number;
              guestName = guest.name || t.label;
              const base = t.payments?.length ?? 0;
              return {
                ...t,
                status: "paid",
                total,
                lines: cart.map((l) => ({ ...l })),
                paymentType: paymentLabel,
                checkNumber: t.checkNumber ?? Number(t.id.replace("t-", "")),
                revenueCenter: t.revenueCenter ?? session.station ?? "Main dining",
                orderType,
                ...(guest.email ? { guestEmail: guest.email } : {}),
                ...(guest.notes ? { notes: guest.notes } : {}),
                ...(guest.vehicle ? { vehicle: guest.vehicle } : {}),
                ...extra,
                payments: [
                  ...(t.payments ?? []),
                  ...rows.map((r, i) => ({ no: String(base + i + 1), ...r })),
                ],
              };
            }),
          );
          const existing = tickets.find((t) => t.id === ticketId);
          if (existing) {
            orderNumber = existing.number;
            guestName = guest.name || existing.label;
          }
        } else {
          id = `t-${1047 + tickets.length}`;
          orderNumber = tickets.length + 1;
          const created: Ticket = {
            id,
            number: tickets.length + 1,
            label: guest.name || "Guest",
            seats: guest.partySize || 1,
            total,
            date: ticketDate,
            arrivedAt: formatTime(),
            arrivedMinutesAgo: 0,
            status: "paid",
            mode,
            lines: cart.map((l) => ({ ...l })),
            server: session.name,
            checkNumber: 1047 + tickets.length,
            tips: 0,
            revenueCenter: session.station ?? "Main dining",
            paymentType: paymentLabel,
            orderType,
            ...(guest.email ? { guestEmail: guest.email } : {}),
            ...(guest.notes ? { notes: guest.notes } : {}),
            ...(guest.vehicle ? { vehicle: guest.vehicle } : {}),
            ...extra,
            payments: rows.map((r, i) => ({ no: String(i + 1), ...r })),
          };
          setTickets((list) => [created, ...list]);
        }
        setLastPayment({
          ticketId: id,
          method,
          ...(opts?.tenderId ? { tenderId: opts.tenderId } : {}),
          total,
          tendered,
          change,
          orderNumber,
          guestName,
          ...(opts?.tip ? { tip: opts.tip } : {}),
          ...(opts?.notes && Object.keys(opts.notes).length ? { notes: opts.notes } : {}),
        });

        setPartialPayments([]);
        setCart([]);
        setActiveTicketId(null);
        return id;
      },
      lastPayment,
      paidSoFar,
      partialPayments,
      addPartialPayment: (amount, method = "other", label = "Payment") =>
        setPartialPayments((list) => [
          ...list,
          { id: `pp-${Date.now()}-${list.length}`, method, label, amount },
        ]),
      removePartialPayment: (id) =>
        setPartialPayments((list) => list.filter((p) => p.id !== id)),
      resetPayments: () => setPartialPayments([]),

      settings,
      updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
      canManageSettings:
        managerUnlocked ||
        ["Manager", "Supervisor", "Owner", "Admin"].includes(session.role),


      managerUnlocked,
      unlockManager: () => setManagerUnlocked(true),
    };
  }, [
    session,
    sessionReady,

    tickets,
    sortKey,
    filters,
    search,
    searchScope,
    searchAllDates,
    ticketDate,
    ticketRange,

    mode,
    cart,
    activeTicketId,
    activeTable,
    floor,
    tableStates,
    tableSince,
    tableSeated,
    roomStates,
    floorLayouts,
    floorTemplates,
    tableMerges,
    customFloorKinds,


    guest,
    orderType,
    noTax,
    comped,
    orderNotes,
    arrivedAt,
    serviceCharge,
    orderDiscountPercent,

    settings,
    managerUnlocked,
    lastPayment,
    paidSoFar,
    partialPayments,
  ]);

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}

export function usePos() {
  const ctx = useContext(PosContext);
  if (!ctx) throw new Error("usePos must be used inside PosProvider");
  return ctx;
}
