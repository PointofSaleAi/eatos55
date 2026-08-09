import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setHapticsEnabled } from "@/lib/haptics";
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
import type { TableState } from "./floor-data";

export type RoomState = "available" | "occupied";

export type SortKey = "time-late-early" | "time-early-late" | "orders-z-a" | "orders-a-z";


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
};

/** Editable collection item used by list-style settings screens. */
export type SettingsListItem = { id: string; name: string; detail: string };

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
  language: string;

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

const defaultSettings: AppSettings = {
  restaurantName: "EATOS Kitchen · Downtown",
  restaurantAddress: "418 W 25th St",
  restaurantCity: "New York, NY 10001",
  restaurantPhone: "(212) 555-0148",
  taxId: "88-4102397",
  timezone: "America/New_York",
  currency: "USD",
  autoPrintReceipts: true,
  askForTip: true,
  tipPresets: "18% · 20% · 25%",
  tipBasis: "Pre-tax",
  customTip: "Allowed",
  taxRate: "8.75%",
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

  language: "English",
  taxAlias: "Tax",
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

export type LastPayment = {
  ticketId: string;
  method: TenderMethod;
  total: number;
  tendered: number;
  change: number;
  orderNumber: number;
  guestName: string;
} | null;

type Store = {
  session: Session;
  signIn: () => void;
  signOut: () => void;
  clockIn: () => void;
  clockOut: () => void;
  setStation: (name: string) => void;

  tickets: Ticket[];
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  filters: TicketFilters;
  setFilters: React.Dispatch<React.SetStateAction<TicketFilters>>;
  search: string;
  setSearch: (s: string) => void;
  ticketDate: string;
  setTicketDate: (d: string) => void;
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
  setTableState: (table: string, state: TableState) => void;
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

  commitPayment: (method: TenderMethod, tendered: number) => string;
  lastPayment: LastPayment;
  /** Amount already tendered on the current order through split payments. */
  paidSoFar: number;
  addPartialPayment: (amount: number) => void;
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
export type Guest = {
  name: string;
  phone: string;
  partySize: number;
  email?: string | undefined;
  notes?: string | undefined;
  vehicle?: GuestVehicle | undefined;
};

const PosContext = createContext<Store | null>(null);

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
  const [ticketDate, setTicketDate] = useState(DEFAULT_TICKET_DATE);
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
  const [floorReady, setFloorReady] = useState(false);

  const [noTax, setNoTax] = useState(false);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);

  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [lastPayment, setLastPayment] = useState<LastPayment>(null);
  const [paidSoFar, setPaidSoFar] = useState(0);

  // Settings are device-local: read them back, then persist every change.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("eatos.pos.settings");
      if (raw)
        setSettings((s) => ({ ...s, ...(JSON.parse(raw) as Partial<AppSettings>) }));
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
          roomStates?: Record<string, RoomState>;
        };
        if (saved.tableStates) setTableStates(saved.tableStates);
        if (saved.tableSince) setTableSince(saved.tableSince);
        if (saved.roomStates) setRoomStates(saved.roomStates);
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
        JSON.stringify({ tableStates, tableSince, roomStates }),
      );
    } catch {
      /* ignore unwritable storage */
    }
  }, [tableStates, tableSince, roomStates, floorReady]);



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
    const total = net;

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
      clockIn: () => setSession((s) => ({ ...s, signedIn: true, clockedIn: true })),
      clockOut: () => setSession((s) => ({ ...s, clockedIn: false })),
      setStation: (name) => setSession((s) => ({ ...s, station: name })),

      tickets,
      sortKey,
      setSortKey,
      filters,
      setFilters,
      search,
      setSearch,
      ticketDate,
      setTicketDate,
      shiftTicketDate: (days) =>
        setTicketDate((d) => {
          const next = new Date(`${d}T12:00:00`);
          next.setDate(next.getDate() + days);
          return next.toISOString().slice(0, 10);
        }),
      visibleTickets: (tab, opts) => {
        let list = [...tickets];
        if (!opts?.ignoreDate) {
          list = list.filter((t) => t.date === ticketDate);
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
          list = list.filter(
            (t) =>
              t.label.toLowerCase().includes(q) ||
              String(t.number).includes(q) ||
              t.id.toLowerCase().includes(q) ||
              t.id.replace("t-", "").includes(q),
          );
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
                      at: new Date().toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      }),
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
      setTableState: (table, state) => {
        setTableStates((s) => ({ ...s, [table]: state }));
        setTableSince((s) => {
          const next = { ...s };
          if (state === "available" || state === "reserved") delete next[table];
          else next[table] = new Date().toISOString();
          return next;
        });
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
        if (partySize && partySize > 0) {
          setGuestState((g) => ({ ...g, partySize }));
        }
        if (table) {
          setTableStates((s) => ({ ...s, [table]: "ordering" }));
          setTableSince((s) => ({ ...s, [table]: new Date().toISOString() }));
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
        setPaidSoFar(0);
        if (activeTable) {
          setTableStates((s) => ({ ...s, [activeTable]: "available" }));
          setTableSince((s) => {
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
        }
        if (activeTicketId === id) {
          setCart([]);
          setActiveTicketId(null);
          setPaidSoFar(0);
          setActiveTable(null);
        }
      },
      noTax,
      setNoTax,
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

      commitPayment: (method, tendered) => {
        const change = Math.max(0, Math.round((tendered - total) * 100) / 100);
        const paymentLabel =
          method === "cash" ? "Cash" : method === "qr" ? "QR Code" : "Card";
        const at = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
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
                payments: [
                  ...(t.payments ?? []),
                  {
                    no: String((t.payments?.length ?? 0) + 1),
                    method: paymentLabel,
                    amount: total,
                    at,
                  },
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
            arrivedAt: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }),
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
            payments: [{ no: "1", method: paymentLabel, amount: total, at }],
          };
          setTickets((list) => [created, ...list]);
        }
        setLastPayment({
          ticketId: id,
          method,
          total,
          tendered,
          change,
          orderNumber,
          guestName,
        });

        setPaidSoFar(0);
        setCart([]);
        setActiveTicketId(null);
        return id;
      },
      lastPayment,
      paidSoFar,
      addPartialPayment: (amount) =>
        setPaidSoFar((p) => Math.round((p + amount) * 100) / 100),
      resetPayments: () => setPaidSoFar(0),

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
    ticketDate,
    mode,
    cart,
    activeTicketId,
    activeTable,
    floor,
    tableStates,
    tableSince,
    roomStates,

    guest,
    orderType,
    noTax,
    serviceCharge,
    orderDiscountPercent,

    settings,
    managerUnlocked,
    lastPayment,
    paidSoFar,
  ]);

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}

export function usePos() {
  const ctx = useContext(PosContext);
  if (!ctx) throw new Error("usePos must be used inside PosProvider");
  return ctx;
}
