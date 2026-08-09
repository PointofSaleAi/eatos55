import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_TICKET_DATE,
  TAX_RATE,
  initialTickets,
  liveMenu,
  menu,
  type CartLine,
  type MenuMode,
  type ServiceOrderType,
  type Ticket,
  type TicketStatus,
} from "./demo-data";

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

export type AppSettings = {
  restaurantName: string;
  timezone: string;
  currency: string;
  autoPrintReceipts: boolean;
  askForTip: boolean;
  tipPresets: string;
  taxRate: string;
  emailReceipts: boolean;
  trackInventory: boolean;
  showSoldOut: boolean;
  requireManagerVoid: boolean;
  offlineMode: boolean;
  darkKds: boolean;
  hapticFeedback: boolean;
  deviceName: string;
  deviceService: "Table Service" | "Quick Service";
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
};

const defaultSettings: AppSettings = {
  restaurantName: "EATOS Kitchen · Downtown",
  timezone: "America/New_York",
  currency: "USD",
  autoPrintReceipts: true,
  askForTip: true,
  tipPresets: "18% · 20% · 25%",
  taxRate: "8.75%",
  emailReceipts: false,
  trackInventory: true,
  showSoldOut: false,
  requireManagerVoid: true,
  offlineMode: false,
  darkKds: true,
  hapticFeedback: true,
  deviceName: "aurora 22",
  deviceService: "Table Service",
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

  mode: MenuMode;
  setMode: (m: MenuMode) => void;
  cart: CartLine[];
  activeTicketId: string | null;
  activeTable: string | null;
  floor: string;
  setFloor: (f: string) => void;
  tableStates: Record<string, "ordering">;
  startOrder: (table?: string) => void;
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

  managerUnlocked: boolean;
  unlockManager: () => void;
};

export type Guest = { name: string; phone: string; partySize: number };

const PosContext = createContext<Store | null>(null);

export function PosProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    signedIn: false,
    clockedIn: false,
    name: "Elizer Cruz",
    role: "Supervisor",
    station: null,
  });

  // Keep the shift/session across page reloads so navigation never disappears.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("eatos.pos.session");
      if (raw) setSession((s) => ({ ...s, ...(JSON.parse(raw) as Partial<Session>) }));
    } catch {
      /* ignore unreadable storage */
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem("eatos.pos.session", JSON.stringify(session));
    } catch {
      /* ignore unwritable storage */
    }
  }, [session]);

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
  const [tableStates, setTableStates] = useState<Record<string, "ordering">>({});
  const [noTax, setNoTax] = useState(false);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);

  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [lastPayment, setLastPayment] = useState<LastPayment>(null);
  const [paidSoFar, setPaidSoFar] = useState(0);

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
        if (filters.payments.length) {
          list = list.filter((t) =>
            filters.payments.includes(t.status === "paid" ? "Card" : "Unpaid"),
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

      mode,
      setMode,
      cart,
      activeTicketId,
      activeTable,
      floor,
      setFloor,
      tableStates,
      guest,
      setGuest: (patch) => setGuestState((g) => ({ ...g, ...patch })),
      orderType,
      setOrderType,
      startOrder: (table) => {
        setCart([]);
        setActiveTicketId(null);
        setActiveTable(table ?? null);
        if (table) setTableStates((s) => ({ ...s, [table]: "ordering" }));
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
        let id = activeTicketId;
        if (id) {
          const ticketId = id;
          setTickets((list) =>
            list.map((t) =>
              t.id === ticketId
                ? { ...t, status: "paid", total, lines: cart.map((l) => ({ ...l })) }
                : t,
            ),
          );
        } else {
          id = `t-${1047 + tickets.length}`;
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
          };
          setTickets((list) => [created, ...list]);
        }
        setLastPayment({ ticketId: id, method, total, tendered, change });
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

      managerUnlocked,
      unlockManager: () => setManagerUnlocked(true),
    };
  }, [
    session,
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
