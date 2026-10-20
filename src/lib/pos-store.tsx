import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { brand, formatTime } from "@/lib/brand";
import loginSlide1 from "@/assets/login-1.jpg.asset.json";
import loginSlide2 from "@/assets/login-2.jpg.asset.json";
import loginSlide3 from "@/assets/login-3.jpg.asset.json";
import loginSlide4 from "@/assets/login-4.jpg.asset.json";
import { setHapticsEnabled } from "@/lib/haptics";
import { referenceSchedules, type RestaurantSchedule } from "@/lib/restaurant-schedules";
import { referenceTimedPricing, type TimedPricingRule } from "@/lib/timed-pricing";
import { referenceTaxes, type TaxRule } from "@/lib/tax-settings";
import { referenceDiscounts, type DiscountRule } from "@/lib/discount-settings";
import { referenceServiceCharges, type ServiceChargeRule } from "@/lib/service-charge-settings";
import { defaultDevicePreferences, type DevicePreferences } from "@/lib/device-settings";
import { defaultPeripheralPreferences, type PeripheralPreferences } from "@/lib/peripheral-settings";
import { defaultPrinterPreferences, type PrinterPreferences } from "@/lib/printer-settings";
import { defaultHardwareConnections, type HardwareConnections } from "@/lib/hardware-connections";
import { defaultSalesPreferences, type SalesPreferences } from "@/lib/sales-settings";
import { defaultServerConnection, migrateServerConnection, type ServerConnectionPreferences } from "@/lib/server-connection";
import { migrateWorkforceEmployee, referenceEmployees, type WorkforceEmployee } from "@/lib/workforce-employees";
import { isResumablePath, readResume, resumeKey, writeResume } from "@/lib/resume";
import {
  DEFAULT_TICKET_DATE,
  TAX_RATE,
  initialTickets,
  liveMenu,
  menu,
  modeOrderType,
  defaultProductModifierRules,
  giftCards,
  type CartLine,
  type MenuMode,
  type ProductModifierRules,
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
  onBreak?: boolean;
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
  | "grubhub"
  | "tap-to-pay";

export const TENDER_LABELS: Record<TenderId, string> = {
  cash: "Cash",
  "tap-to-pay": "Tap to Pay on iPhone",
  "card-present": "Card",
  contactless: "Tap to Pay",
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
  room: "Rooms",
  uber: "Uber Eats",
  doordash: "Doordash",
  grubhub: "Grubhub",
};

const defaultTenders: Record<TenderId, boolean> = {
  cash: true,
  "tap-to-pay": true,
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
  "tap-to-pay": false,
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




/** Per-device Tap to Pay on iPhone status. */
export type TapToPayState =
  | "notSetUp"
  | "configuring"
  | "ready"
  | "needsAttention"
  | "ineligible";

export type AppSettings = {
  salesPreferences: SalesPreferences;
  hardwareConnections: HardwareConnections;
  printerPreferences: PrinterPreferences;
  serverConnection: ServerConnectionPreferences;
  workforceEmployees: WorkforceEmployee[];
  devicePreferences: DevicePreferences;
  peripheralPreferences: PeripheralPreferences;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
  restaurantPhone: string;
  restaurantType: string;
  restaurantEmail: string;
  restaurantDescription: string;
  restaurantAddress2: string;
  restaurantPostCode: string;
  restaurantCountry: string;
  restaurantStartTime: string;
  restaurantEndTime: string;
  restaurantDayBoundary: string;
  eodReminder: boolean;
  eodReminderTime: string;
  eodTasks: boolean;
  eodAutoTime: string;
  eodClockOut: boolean;
  eodCloseDrawer: boolean;
  eodPrintReport: boolean;
  eodPrintEmployees: boolean;
  eodClosePaid: boolean;
  eodCancelUnpaid: boolean;
  eodRecipients: string[];
  taxId: string;
  timezone: string;
  currency: string;
  autoPrintReceipts: boolean;
  askForTip: boolean;
  /** Print the gratuity line on receipts. */
  printTipOnReceipt: boolean;
  /** Whether gratuity is chosen before tender or after an approval. */
  tipTiming: "Before payment" | "After approval";
  /** Direct tenders that may prompt for gratuity. Delivery and split are excluded. */
  tipTenders: Record<TenderId, boolean>;
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
  /** Where the service type row appears: order screen, charge screen, both, off. */
  orderTypePlacement: "Order screen" | "Charge screen" | "Both" | "Off";
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

  /**
   * Tap to Pay on iPhone. Apple requirement 3.3 needs proof that the awareness
   * screen was shown, so in production these belong server side per merchant,
   * never in device storage that a reinstall can wipe.
   */
  tapToPayState: TapToPayState;
  tapToPayDeviceLabel: string;
  tapToPayAwarenessShownAt: string;
  tapToPayDismissedAt: string;
  tapToPayTermsAcceptedAt: string;
  /**
   * Hidden developer switch: allows the Tap to Pay screens on a non iPhone so
   * the flow can be reviewed and recorded. Never on by default.
   */
  tapToPayDevOverride: boolean;



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
  /** Manager switch: lets servers see sale, tip and hour totals on the dashboard. */
  serverShiftTotals: boolean;
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
  cashDrawerEmulator: boolean;
  scannerEmulator: boolean;

  // Collections
  restaurantSchedules: RestaurantSchedule[];
  timedPricingRules: TimedPricingRule[];
  taxRules: TaxRule[];
  discountRules: DiscountRule[];
  serviceChargeRules: ServiceChargeRule[];
  discounts: SettingsListItem[];
  serviceCharges: SettingsListItem[];
  timedPricing: SettingsListItem[];
  categories: SettingsListItem[];
  modifierGroups: SettingsListItem[];
  defaultModifiers: SettingsListItem[];
  addOns: SettingsListItem[];
  productGroups: SettingsListItem[];
  /** Per-product visibility and requiredness for modifier and add-on groups. */
  productModifierRules: ProductModifierRules;
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
  salesPreferences: defaultSalesPreferences,
  hardwareConnections: defaultHardwareConnections,
  printerPreferences: defaultPrinterPreferences,
  serverConnection: defaultServerConnection,
  workforceEmployees: referenceEmployees,
  devicePreferences: defaultDevicePreferences,
  peripheralPreferences: defaultPeripheralPreferences,
  restaurantName: `${brand.appName} Kitchen · Downtown`,
  restaurantAddress: brand.venue.address,
  restaurantCity: brand.venue.city,
  restaurantPhone: brand.venue.phone,
  restaurantType: "",
  restaurantEmail: "",
  restaurantDescription: "",
  restaurantAddress2: "",
  restaurantPostCode: "",
  restaurantCountry: brand.venue.phone.startsWith("+44") ? "United Kingdom" : "United States",
  restaurantStartTime: "00:00",
  restaurantEndTime: "23:59",
  restaurantDayBoundary: "Same Day",
  taxId: brand.venue.taxId,
  timezone: brand.venue.timezone,
  currency: brand.currency,
  autoPrintReceipts: true,
  askForTip: true,
  printTipOnReceipt: true,
  tipTiming: "After approval",
  tipTenders: {
    cash: false,
    "card-present": true,
    contactless: false,
    "tap-to-pay": false,
    "manual-card": false,
    "manual-cc": false,
    external: false,
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
    account: false,
    house: false,
    gift: false,
    loyalty: false,
    "in-kind": false,
    room: false,
    "apple-pay": false,
    "google-pay": false,
    amex: false,
    split: false,
    deliveroo: false,
    "just-eat": false,
    uber: false,
    doordash: false,
    grubhub: false,
  },
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
  eodReminder: true,
  eodReminderTime: "08:45",
  eodTasks: true,
  eodAutoTime: "12:38",
  eodClockOut: true,
  eodCloseDrawer: true,
  eodPrintReport: true,
  eodPrintEmployees: true,
  eodClosePaid: true,
  eodCancelUnpaid: true,
  eodRecipients: ["e1", "e2", "e3", "e4"],
  deviceService: "Table Service",
  orderTypePlacement: "Order screen",
  roomService: false,
  tenders: defaultTenders,
  tenderAutoClose: defaultTenderAutoClose,
  paymentProvider: "",
  cardReaderModel: "",
  cardReaderConnection: "Bluetooth",
  cardReaderStatus: "Not paired",

  tapToPayState: "notSetUp",
  tapToPayDeviceLabel: "iPhone 15 · Front counter",
  tapToPayAwarenessShownAt: "",
  tapToPayDismissedAt: "",
  tapToPayTermsAcceptedAt: "",
  tapToPayDevOverride: false,




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
  serverShiftTotals: false,
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
  printerEmulator: false,
  readerEmulator: false,
  cashDrawerEmulator: false,
  scannerEmulator: false,

  restaurantSchedules: referenceSchedules,
  timedPricingRules: referenceTimedPricing,
  taxRules: referenceTaxes,
  discountRules: referenceDiscounts,
  serviceChargeRules: referenceServiceCharges,
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
  productModifierRules: defaultProductModifierRules,
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

/** One child check of a split, paid in sequence. */
export type SplitCheck = {
  id: string;
  label: string;
  total: number;
  paid: boolean;
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
  /** Ends a shift only when the current employee owns no outstanding checks. */
  clockOut: () => boolean;
  startBreak: () => void;
  setStation: (name: string) => void;
  setRole: (role: string) => void;
  setName: (name: string) => void;

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
  transferTickets: (ids: string[], server: string) => void;
  closeTickets: (ids: string[]) => void;
  /** Close a paid check: it stays in the list as Completed. */
  closeTicket: (id: string) => void;
  /** Record a demo refund against a closed check. */
  refundTicket: (id: string, reason: string) => void;

  mode: MenuMode;
  setMode: (m: MenuMode) => void;
  cart: CartLine[];
  activeTicketId: string | null;
  orderOwner: string;
  transferCurrentOrder: (owner: string) => void;
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
  /** Fire the current order to the kitchen: create or refresh its ticket. */
  fireTicket: () => void;
  /** Prints the room bill for signature: saves the order as a room-charge ticket. */
  printRoomBill: (room: { id: string; name: string; number: string; bookingNumber?: string }) => {
    id: string;
    number: number;
  } | null;
  markRoomSigned: (ticketId: string, proofName?: string) => void;
  /** Posts (or re-posts with a new tip) the ticket's charge to its room. */
  postToRoom: (ticketId: string, tip: number) => void;
  /** Extra credit used per room id from charges posted this session. */
  roomCreditUsed: Record<string, number>;

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
  /** Gift cards: balance lookup, loading funds, and spending balance. */
  giftCardBalance: (number: string) => number | null;
  loadGiftCard: (number: string, amount: number) => void;
  chargeGiftCard: (number: string, amount: number) => boolean;
  /** Adds a no-tax "Gift Card - XXXX" cart line for a funds load. */
  addGiftCardLine: (number: string, amount: number) => void;
  changeQty: (id: string, delta: number) => void;
  removeLine: (id: string) => void;
  toggleLineTax: (id: string) => void;
  /** Rewrites an existing cart line from the product window (never adds a copy). */
  updateLine: (
    id: string,
    opts: { qty: number; price: number; notes?: string; modifiers?: string[]; discountPercent?: number },
  ) => void;
  clearCart: () => void;
  /** Abandon the order in progress: cart, payments and table hold are cleared. */
  cancelOrder: () => void;
  /** Cancel an existing ticket and remove it from the queue. */
  cancelTicket: (id: string) => void;
  /** Pull another open check's items into the current order and retire that check. */
  mergeTicket: (id: string) => void;
  noTax: boolean;
  setNoTax: (v: boolean) => void;
  /** Comped order: nothing is charged to the guest. */
  comped: boolean;
  setComped: (v: boolean) => void;
  /** Free-text note attached to the whole order. */
  orderNotes: string;
  setOrderNotes: (v: string) => void;
  /** Allergy alert attached to the whole order. */
  allergyNote: string;
  setAllergyNote: (v: string) => void;
  /** Wall-clock label for when the guest arrived, e.g. "8:01 AM". */
  arrivedAt: string;
  /** Applied service charge: percent share of the cart plus any flat amount. */
  serviceCharge: number;
  /** Percent part of the service charge; recomputed as the cart changes. */
  serviceChargePercent: number;
  /** Name of the applied service-charge preset, "" when none. */
  serviceChargeName: string;
  setServiceCharge: (
    opts: { percent?: number; amount?: number; name?: string } | null,
  ) => void;
  orderDiscountPercent: number;
  setOrderDiscountPercent: (v: number) => void;
  /** Label of the chosen order-level discount, e.g. "Happy Hour". */
  orderDiscountName: string;
  setOrderDiscountName: (v: string) => void;
  /** Order number shown on cart/payment: the active ticket's number, or the next number for a new order. */
  currentOrderNumber: number | null;
  totals: {
    gross: number;
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

  /** Child checks of a split, paid one after the other. Empty when not split. */
  splitChecks: SplitCheck[];
  activeSplitCheckId: string | null;
  setSplitChecks: (checks: { label: string; total: number }[]) => void;
  setActiveSplitCheck: (id: string) => void;
  clearSplitChecks: () => void;
  /** Take one child check as a part payment and move to the next unpaid one. */
  paySplitCheck: (
    id: string,
    amount: number,
    method: TenderMethod,
    opts?: {
      label?: string;
      tenderId?: TenderId;
      tip?: number;
      notes?: Record<number, number>;
    },
  ) => void;

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
  firstName?: string | undefined;
  middleName?: string | undefined;
  lastName?: string | undefined;
  customerSince?: string | undefined;
  dateOfBirth?: string | undefined;
  anniversary?: string | undefined;
  photo?: string | undefined;
  phone: string;
  partySize: number;
  email?: string | undefined;
  notes?: string | undefined;
  vehicle?: GuestVehicle | undefined;
  address?: string | undefined;
  addressStreet?: string | undefined;
  addressUnit?: string | undefined;
  addressCity?: string | undefined;
  addressState?: string | undefined;
  addressZipCode?: string | undefined;
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
  const [giftCardBalances, setGiftCardBalances] = useState<Record<string, number>>(() =>
    Object.fromEntries(giftCards.map((c) => [c.number, c.balance])),
  );
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [draftOwner, setDraftOwner] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [floor, setFloor] = useState<string>("Ground Floor");
  const [guest, setGuestState] = useState<Guest>({ name: "", phone: "", partySize: 1 });
  const [orderType, setOrderType] = useState<ServiceOrderType>("Dine In");
  const [tableStates, setTableStates] = useState<Record<string, TableState>>({});
  const [tableSince, setTableSince] = useState<Record<string, string>>({});
  const [roomStates, setRoomStates] = useState<Record<string, RoomState>>({});
  const [roomCreditUsed, setRoomCreditUsed] = useState<Record<string, number>>({});
  const [floorLayouts, setFloorLayouts] = useState<Record<string, FloorObject[]>>({});
  const [tableSeated, setTableSeatedMap] = useState<Record<string, number>>({});
  const [floorTemplates, setFloorTemplates] = useState<SavedTemplate[]>([]);
  const [tableMerges, setTableMerges] = useState<TableMerge[]>([]);
  const [customFloorKinds, setCustomFloorKinds] = useState<CustomFloorKind[]>([]);

  const [floorReady, setFloorReady] = useState(false);

  const [noTax, setNoTax] = useState(false);
  const [comped, setComped] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [allergyNote, setAllergyNote] = useState("");
  const [arrivedAt, setArrivedAt] = useState("");
  const [serviceChargeFlat, setServiceChargeFlat] = useState(0);
  const [serviceChargePercent, setServiceChargePercent] = useState(0);
  const [serviceChargeName, setServiceChargeName] = useState("");
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);
  const [orderDiscountName, setOrderDiscountName] = useState("");

  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [lastPayment, setLastPayment] = useState<LastPayment>(null);
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [splitChecks, setSplitChecksState] = useState<SplitCheck[]>([]);
  const [activeSplitCheckId, setActiveSplitCheckId] = useState<string | null>(null);
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
          salesPreferences: { ...defaultSalesPreferences, ...saved.salesPreferences },
          hardwareConnections: { ...defaultHardwareConnections, ...saved.hardwareConnections },
          printerPreferences: { ...defaultPrinterPreferences, ...saved.printerPreferences },
          serverConnection: migrateServerConnection(saved.serverConnection),
          workforceEmployees: (saved.workforceEmployees ?? referenceEmployees).map(migrateWorkforceEmployee),
          peripheralPreferences: { ...defaultPeripheralPreferences, ...saved.peripheralPreferences },
          devicePreferences: {
            ...defaultDevicePreferences,
            ...saved.devicePreferences,
            toggles: { ...defaultDevicePreferences.toggles, ...saved.devicePreferences?.toggles },
          },
          tenders: { ...defaultTenders, ...(saved.tenders ?? {}) },
          tenderAutoClose: {
            ...defaultTenderAutoClose,
            ...(saved.tenderAutoClose ?? {}),
          },
          tipTenders: {
            ...defaultSettings.tipTenders,
            ...(saved.tipTenders ?? {}),
          },
          productModifierRules: {
            ...defaultProductModifierRules,
            ...(saved.productModifierRules ?? {}),
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
          roomCreditUsed?: Record<string, number>;
          floorLayouts?: Record<string, FloorObject[]>;
          floorTemplates?: SavedTemplate[];
          tableMerges?: TableMerge[];
          customFloorKinds?: CustomFloorKind[];
        };
        if (saved.tableStates) setTableStates(saved.tableStates);
        if (saved.tableSince) setTableSince(saved.tableSince);
        if (saved.tableSeated) setTableSeatedMap(saved.tableSeated);
        if (saved.roomStates) setRoomStates(saved.roomStates);
        if (saved.roomCreditUsed) setRoomCreditUsed(saved.roomCreditUsed);
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
          roomCreditUsed,
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
    roomCreditUsed,
    floorLayouts,
    floorTemplates,
    tableMerges,
    customFloorKinds,
    giftCardBalances,

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
    const serviceCharge = round(
      (gross * serviceChargePercent) / 100 + serviceChargeFlat,
    );
    const net = round(gross - discount + serviceCharge);
    // Tax-exempt lines (gift card loads) stay out of the tax base.
    const exempt = round(
      cart.reduce(
        (sum, l) =>
          l.taxExempt ? sum + l.price * l.qty * (1 - (l.discountPercent ?? 0) / 100) : sum,
        0,
      ),
    );
    const taxBase = noTax ? 0 : round(Math.max(0, net - exempt));
    const subtotal = round(net - taxBase + taxBase / (1 + TAX_RATE));
    const tax = round(net - subtotal);
    const total = comped ? 0 : net;
    // Numbers are assigned only when an order is fired or charged; an unsaved
    // order has none yet.
    const currentOrderNumber = activeTicketId
      ? (tickets.find((t) => t.id === activeTicketId)?.number ?? null)
      : null;
    const nextTicketNumber = () => tickets.reduce((m, t) => Math.max(m, t.number ?? 0), 0) + 1;

    return {
      currentOrderNumber,
      session,
      // Ready only once every saved slice (session, settings, floor) is applied,
      // so no screen renders defaults and then redraws.
      sessionReady: sessionReady && settingsReady && floorReady,
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
          onBreak: false,
          pin: pin ?? s.pin ?? null,
        })),
      clockOut: () => {
        if (tickets.some((t) => t.server === session.name && !t.closed)) return false;
        setSession((s) => ({ ...s, clockedIn: false, onBreak: false }));
        return true;
      },
      startBreak: () => setSession((s) => ({ ...s, onBreak: true })),
      setStation: (name) => setSession((s) => ({ ...s, station: name })),
      setRole: (role) => setSession((s) => ({ ...s, role })),
      setName: (name) => setSession((s) => ({ ...s, name })),

      saveResume: (path) => {
        if (!isResumablePath(path)) return;
        writeResume(resumeKey(session.pin), {
          path,
          order: {
            cart,
            guest,
            orderType,
            orderNotes,
            allergyNote,
            arrivedAt,
            activeTicketId,
            draftOwner,
            activeTable,
            floor,
            noTax,
            comped,
            serviceCharge,
            serviceChargeFlat,
            serviceChargePercent,
            serviceChargeName,
            orderDiscountPercent,
            orderDiscountName,
            partialPayments,
            splitChecks,
            activeSplitCheckId,
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
          setAllergyNote(o.allergyNote ?? "");
          setArrivedAt(o.arrivedAt ?? "");
          setActiveTicketId(o.activeTicketId ?? null);
          setDraftOwner(o.draftOwner ?? null);
          setActiveTable(o.activeTable ?? null);
          if (o.floor) setFloor(o.floor);
          setNoTax(Boolean(o.noTax));
          setComped(Boolean(o.comped));
          setServiceChargeFlat(o.serviceChargeFlat ?? 0);
          setServiceChargePercent(o.serviceChargePercent ?? 0);
          setServiceChargeName(o.serviceChargeName ?? "");
          setOrderDiscountPercent(o.orderDiscountPercent ?? 0);
          setOrderDiscountName(o.orderDiscountName ?? "");
          setPartialPayments((o.partialPayments as PartialPayment[]) ?? []);
          setSplitChecksState((o.splitChecks as SplitCheck[]) ?? []);
          setActiveSplitCheckId(o.activeSplitCheckId ?? null);
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
      transferTickets: (ids, server) =>
        setTickets((list) =>
          list.map((t) =>
            ids.includes(t.id)
              ? { ...t, transferOrigin: t.transferOrigin ?? t.server, server }
              : t,
          ),
        ),
      closeTicket: (id) =>
        setTickets((list) => list.map((t) => (t.id === id ? { ...t, closed: true } : t))),
      refundTicket: (id, reason) =>
        setTickets((list) =>
          list.map((t) =>
            t.id === id && !t.refund
              ? {
                  ...t,
                  closed: true,
                  refund: {
                    reason,
                    amount: t.total,
                    at: new Date().toLocaleString("en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" }),
                  },
                }
              : t,
          ),
        ),
      closeTickets: (ids) =>
        setTickets((list) => list.map((t) => (ids.includes(t.id) ? { ...t, closed: true } : t))),
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
      orderOwner: tickets.find((ticket) => ticket.id === activeTicketId)?.server ?? draftOwner ?? session.name,
      transferCurrentOrder: (owner) => {
        if (!cart.length) return;
        if (activeTicketId) {
          setTickets((list) => list.map((ticket) => ticket.id === activeTicketId
            ? { ...ticket, transferOrigin: ticket.transferOrigin ?? ticket.server, server: owner }
            : ticket));
        } else {
          setDraftOwner(owner);
        }
      },
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
        setDraftOwner(null);
        setActiveTable(table ?? null);
        setOrderNotes("");
        setAllergyNote("");
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
        setDraftOwner(null);
        setCart(ticket.lines.map((l) => ({ ...l })));
        setMode(ticket.mode);
        setOrderNotes(ticket.notes ?? "");
        // Keep charging against the table the check belongs to.
        setActiveTable(ticket.table ?? null);
      },
      /** Fire sends the cart to the kitchen as (or onto) a ticket tied to its table. */
      roomCreditUsed,
      printRoomBill: (room) => {
        if (!cart.length) return null;
        const lines = cart.map((l) => ({ ...l }));
        const roomFields = {
          status: "payment" as const,
          paymentType: "Room Charge",
          table: room.name,
          roomNumber: room.number,
          ...(room.bookingNumber ? { bookingNumber: room.bookingNumber } : {}),
          signedBill: false,
          roomCharge: { roomId: room.id, roomName: room.name, stage: "printed" as const },
        };
        let id = activeTicketId;
        let number: number;
        const existing = id ? tickets.find((t) => t.id === id) : undefined;
        if (existing) {
          number = existing.number;
          setTickets((list) =>
            list.map((t) => (t.id === existing.id ? { ...t, lines, total, ...roomFields } : t)),
          );
        } else {
          id = `t-${1047 + tickets.length}`;
          number = nextTicketNumber();
          const created: Ticket = {
            id,
            number,
            label: guest.name || "Guest",
            seats: guest.partySize || 1,
            total,
            date: ticketDate,
            arrivedAt: formatTime(),
            arrivedMinutesAgo: 0,
            mode,
            lines,
            server: draftOwner ?? session.name,
            checkNumber: 1047 + tickets.length,
            tips: 0,
            revenueCenter: session.station ?? "Main dining",
            payments: [],
            orderType,
            ...((orderNotes || guest.notes) ? { notes: (orderNotes || guest.notes) as string } : {}),
            ...roomFields,
          };
          setTickets((list) => [created, ...list]);
        }
        setCart([]);
        setActiveTicketId(null);
        setDraftOwner(null);
        return { id: id as string, number };
      },
      markRoomSigned: (ticketId, proofName) =>
        setTickets((list) =>
          list.map((t) =>
            t.id === ticketId && t.roomCharge
              ? {
                  ...t,
                  signedBill: true,
                  roomCharge: {
                    ...t.roomCharge,
                    stage: t.roomCharge.stage === "posted" ? "posted" : "signed",
                    ...(proofName ? { proofName } : {}),
                  },
                }
              : t,
          ),
        ),
      postToRoom: (ticketId, tip) => {
        const t = tickets.find((x) => x.id === ticketId);
        if (!t?.roomCharge) return;
        const base = Math.round((t.total - (t.tips ?? 0)) * 100) / 100;
        const amount = Math.round((base + tip) * 100) / 100;
        const delta = Math.round((amount - (t.roomCharge.postedAmount ?? 0)) * 100) / 100;
        const roomId = t.roomCharge.roomId;
        setRoomCreditUsed((m) => ({ ...m, [roomId]: Math.round(((m[roomId] ?? 0) + delta) * 100) / 100 }));
        setTickets((list) =>
          list.map((x) =>
            x.id === ticketId && x.roomCharge
              ? {
                  ...x,
                  status: "paid",
                  tips: tip,
                  total: amount,
                  payments: [
                    {
                      no: "1",
                      method: "Room Charge",
                      amount,
                      at: formatTime(),
                    },
                  ],
                  roomCharge: { ...x.roomCharge, stage: "posted", postedAmount: amount },
                }
              : x,
          ),
        );
      },
      fireTicket: () => {
        if (!cart.length) return;
        const lines = cart.map((l) => ({ ...l }));
        const server = draftOwner ?? session.name;
        if (activeTicketId) {
          setTickets((list) =>
            list.map((t) =>
              t.id === activeTicketId
                ? {
                    ...t,
                    lines,
                    total,
                    status: "preparing",
                    ...(activeTable ? { table: activeTable } : {}),
                  }
                : t,
            ),
          );
        } else {
          const id = `t-${1047 + tickets.length}`;
          const created: Ticket = {
            id,
            number: nextTicketNumber(),
            label: guest.name || "Guest",
            seats: guest.partySize || 1,
            total,
            date: ticketDate,
            arrivedAt: formatTime(),
            arrivedMinutesAgo: 0,
            status: "preparing",
            mode,
            lines,
            server,
            checkNumber: 1047 + tickets.length,
            tips: 0,
            revenueCenter: session.station ?? "Main dining",
            paymentType: "Unpaid",
            payments: [],
            orderType,
            ...(activeTable ? { table: activeTable } : {}),
            ...((orderNotes || guest.notes) ? { notes: (orderNotes || guest.notes) as string } : {}),
          };
          setTickets((list) => [created, ...list]);
          setActiveTicketId(id);
        }
        if (activeTable) {
          // A fired order moves the table from Ordering to Ordered.
          setTableStates((s) => ({ ...s, [activeTable]: "ordered" }));
          setTableSince((s) =>
            s[activeTable] ? s : { ...s, [activeTable]: new Date().toISOString() },
          );
        }
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
      addCustomItem: (name, price) => {
        setArrivedAt((a) => a || formatTime());
        setCart((list) => [
          ...list,
          { id: `custom-${Date.now()}`, name, price, qty: 1, custom: true },
        ]);
      },
      giftCardBalance: (number) => giftCardBalances[number] ?? null,
      loadGiftCard: (number, amount) =>
        setGiftCardBalances((map) => ({
          ...map,
          [number]: Math.round(((map[number] ?? 0) + amount) * 100) / 100,
        })),
      chargeGiftCard: (number, amount) => {
        const balance = giftCardBalances[number];
        if (balance == null || amount <= 0 || amount > balance) return false;
        setGiftCardBalances((map) => ({
          ...map,
          [number]: Math.round(((map[number] ?? 0) - amount) * 100) / 100,
        }));
        return true;
      },
      addGiftCardLine: (number, amount) => {
        setArrivedAt((a) => a || formatTime());
        setCart((list) => [
          ...list,
          {
            id: `giftcard-${Date.now()}`,
            name: `Gift Card - ${number.slice(-4)}`,
            price: amount,
            qty: 1,
            custom: true,
            taxExempt: true,
            notes: "No Tax added",
          },
        ]);
      },
      changeQty: (id, delta) =>
        setCart((list) =>
          list
            .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
            .filter((l) => l.qty > 0),
        ),
      removeLine: (id) => setCart((list) => list.filter((l) => l.id !== id)),
      toggleLineTax: (id) => setCart((list) => list.map((l) => (l.id === id ? { ...l, taxExempt: !l.taxExempt } : l))),
      updateLine: (id, opts) =>
        setCart((list) =>
          list.map((l) => {
            if (l.id !== id) return l;
            const next: CartLine = { id: l.id, name: l.name, price: opts.price, qty: Math.max(1, opts.qty) };
            if (opts.notes) next.notes = opts.notes;
            if (opts.modifiers?.length) next.modifiers = opts.modifiers;
            if (opts.discountPercent) next.discountPercent = opts.discountPercent;
            return next;
          }),
        ),
      clearCart: () => setCart([]),
      cancelOrder: () => {
        setDraftOwner(null);
        setServiceChargeFlat(0);
        setServiceChargePercent(0);
        setServiceChargeName("");
        setOrderDiscountPercent(0);
        setOrderDiscountName("");
        setCart([]);
        setActiveTicketId(null);
        setPartialPayments([]);
        setSplitChecksState([]);
        setActiveSplitCheckId(null);
        setOrderNotes("");
        setAllergyNote("");
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
      /** Pull another open check's items into this order and retire that check. */
      mergeTicket: (id) => {
        const ticket = tickets.find((t) => t.id === id);
        if (!ticket) return;
        setArrivedAt((a) => a || formatTime());
        setCart((list) => {
          const next = list.map((l) => ({ ...l }));
          for (const line of ticket.lines) {
            const existing = next.find((l) => l.id === line.id);
            if (existing) existing.qty += line.qty;
            else next.push({ ...line });
          }
          return next;
        });
        setTickets((list) => list.filter((t) => t.id !== id));
        const table = ticket.table ? String(ticket.table) : null;
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
      },
      noTax,
      setNoTax,
      comped,
      setComped,
      orderNotes,
      setOrderNotes,
      allergyNote,
      setAllergyNote,
      arrivedAt,
      serviceCharge,
      serviceChargePercent,
      serviceChargeName,
      setServiceCharge: (opts) => {
        setServiceChargeFlat(opts?.amount ?? 0);
        setServiceChargePercent(opts?.percent ?? 0);
        setServiceChargeName(opts?.name ?? "");
      },
      orderDiscountPercent,
      setOrderDiscountPercent,
      orderDiscountName,
      setOrderDiscountName,
      totals: {
        gross,
        subtotal,
        tax,
        total,
        count: cart.reduce((n, l) => n + l.qty, 0),
        serviceCharge,
        discount,
      },

      commitPayment: (method, tendered, opts) => {
        const tip = Math.max(0, opts?.tip ?? 0);
        const grandTotal = Math.round((total + tip) * 100) / 100;
        const effectiveTendered = Math.round((tendered + tip) * 100) / 100;
        const change = Math.max(
          0,
          Math.round((effectiveTendered - (grandTotal - paidSoFar)) * 100) / 100,
        );
        const paymentLabel =
          opts?.label ?? (method === "cash" ? "Cash" : method === "qr" ? "QR Code" : "Card");
        const at = formatTime();
        const finalAmount = Math.max(0, Math.round((grandTotal - paidSoFar) * 100) / 100);
        // Every tender taken on this order, earlier partials first.
        const rows = [
          ...partialPayments.map((p) => ({ method: p.label, amount: p.amount, at })),
          { method: paymentLabel, amount: finalAmount, at },
        ];
        const extra = {
          ...(opts?.roomNumber ? { roomNumber: opts.roomNumber } : {}),
          ...(opts?.bookingNumber ? { bookingNumber: opts.bookingNumber } : {}),
          ...(opts?.signedBill ? { signedBill: true } : {}),
          // Charged orders stay attached to the table they were opened on.
          ...(activeTable ? { table: activeTable } : {}),
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
                total: grandTotal,
                tips: Math.round(((t.tips ?? 0) + tip) * 100) / 100,
                lines: cart.map((l) => ({ ...l })),
                paymentType: paymentLabel,
                checkNumber: t.checkNumber ?? Number(t.id.replace("t-", "")),
                revenueCenter: t.revenueCenter ?? session.station ?? "Main dining",
                orderType,
                ...(guest.email ? { guestEmail: guest.email } : {}),
                ...(guest.phone ? { guestPhone: guest.phone } : {}),
                ...((orderNotes || guest.notes) ? { notes: (orderNotes || guest.notes) as string } : {}),
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
          orderNumber = nextTicketNumber();
          const created: Ticket = {
            id,
            number: orderNumber,
            label: guest.name || "Guest",
            seats: guest.partySize || 1,
            total: grandTotal,
            date: ticketDate,
            arrivedAt: formatTime(),
            arrivedMinutesAgo: 0,
            status: "paid",
            mode,
            lines: cart.map((l) => ({ ...l })),
            server: draftOwner ?? session.name,
            checkNumber: 1047 + tickets.length,
            tips: tip,
            revenueCenter: session.station ?? "Main dining",
            paymentType: paymentLabel,
            orderType,
            ...(guest.email ? { guestEmail: guest.email } : {}),
                ...(guest.phone ? { guestPhone: guest.phone } : {}),
            ...((orderNotes || guest.notes) ? { notes: (orderNotes || guest.notes) as string } : {}),
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
          total: grandTotal,
          tendered: effectiveTendered,
          change,
          orderNumber,
          guestName,
          ...(opts?.tip ? { tip: opts.tip } : {}),
          ...(opts?.notes && Object.keys(opts.notes).length ? { notes: opts.notes } : {}),
        });

        setPartialPayments([]);
        setSplitChecksState([]);
        setActiveSplitCheckId(null);
        setCart([]);
        setActiveTicketId(null);
        setDraftOwner(null);
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

      splitChecks,
      activeSplitCheckId,
      setSplitChecks: (checks) => {
        const rows = checks.map((c, i) => ({
          id: `sc-${i}`,
          label: c.label,
          total: c.total,
          paid: false,
        }));
        setSplitChecksState(rows);
        setActiveSplitCheckId(rows[0]?.id ?? null);
      },
      setActiveSplitCheck: (id) => setActiveSplitCheckId(id),
      clearSplitChecks: () => {
        setSplitChecksState([]);
        setActiveSplitCheckId(null);
      },
      paySplitCheck: (id, amount, method, opts) => {
        const tip = Math.max(0, opts?.tip ?? 0);
        const label = opts?.label ?? (method === "cash" ? "Cash" : "Card");
        const check = splitChecks.find((c) => c.id === id);
        setPartialPayments((list) => [
          ...list,
          {
            id: `pp-${Date.now()}-${list.length}`,
            method,
            label: check ? `${label} · ${check.label}` : label,
            amount: Math.round((amount + tip) * 100) / 100,
          },
        ]);
        const next = splitChecks.map((c) => (c.id === id ? { ...c, paid: true } : c));
        setSplitChecksState(next);
        setActiveSplitCheckId(next.find((c) => !c.paid)?.id ?? null);
        setLastPayment({
          ticketId: activeTicketId ?? "",
          method,
          ...(opts?.tenderId ? { tenderId: opts.tenderId } : {}),
          total: Math.round((amount + tip) * 100) / 100,
          tendered: Math.round((amount + tip) * 100) / 100,
          change: 0,
          orderNumber: currentOrderNumber ?? nextTicketNumber(),
          guestName: guest.name,
          ...(tip ? { tip } : {}),
          ...(opts?.notes && Object.keys(opts.notes).length ? { notes: opts.notes } : {}),
        });
      },

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
    settingsReady,
    floorReady,

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
    draftOwner,
    activeTable,
    floor,
    tableStates,
    tableSince,
    tableSeated,
    roomStates,
    roomCreditUsed,
    floorLayouts,
    floorTemplates,
    tableMerges,
    customFloorKinds,


    guest,
    orderType,
    noTax,
    comped,
    orderNotes,
    allergyNote,
    arrivedAt,
    serviceChargeFlat,
    serviceChargePercent,
    serviceChargeName,
    orderDiscountPercent,
    orderDiscountName,

    settings,
    managerUnlocked,
    lastPayment,
    paidSoFar,
    partialPayments,
    splitChecks,
    activeSplitCheckId,
  ]);

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}

export function usePos() {
  const ctx = useContext(PosContext);
  if (!ctx) throw new Error("usePos must be used inside PosProvider");
  return ctx;
}
