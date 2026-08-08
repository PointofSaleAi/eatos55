import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_TICKET_DATE,
  TAX_RATE,
  initialTickets,
  menu,
  type CartLine,
  type MenuMode,
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
  deviceService: string;
  tableService: boolean;
  language: string;
  taxAlias: string;
  appVersion: string;
  restartApp: boolean;
  restartTime: string;
  paymentPlatform: string;
  clockedInAt: string;
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
  tableService: false,
  language: "English",
  taxAlias: "Tax",
  appVersion: "5.200.27",
  restartApp: true,
  restartTime: "02:30 PM",
  paymentPlatform: "NA",
  clockedInAt: "5:43 PM",
};

export type LastPayment = {
  ticketId: string;
  method: "cash" | "card";
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
  startOrder: () => void;
  openTicket: (id: string) => void;
  addItem: (menuId: string) => void;
  addCustomItem: (name: string, price: number) => void;
  changeQty: (id: string, delta: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  totals: { subtotal: number; tax: number; total: number; count: number };
  commitPayment: (method: "cash" | "card", tendered: number) => string;
  lastPayment: LastPayment;

  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;

  managerUnlocked: boolean;
  unlockManager: () => void;
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
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [sortKey, setSortKey] = useState<SortKey>("time-early-late");
  const [filters, setFilters] = useState<TicketFilters>(emptyFilters);
  const [search, setSearch] = useState("");
  const [ticketDate, setTicketDate] = useState(DEFAULT_TICKET_DATE);
  const [mode, setMode] = useState<MenuMode>("dine-in");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [lastPayment, setLastPayment] = useState<LastPayment>(null);

  const value = useMemo<Store>(() => {
    const total = Math.round(cart.reduce((sum, l) => sum + l.price * l.qty, 0) * 100) / 100;
    const subtotal = Math.round((total / (1 + TAX_RATE)) * 100) / 100;
    const tax = Math.round((total - subtotal) * 100) / 100;

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
      startOrder: () => {
        setCart([]);
        setActiveTicketId(null);
      },
      openTicket: (id) => {
        const ticket = tickets.find((t) => t.id === id);
        if (!ticket) return;
        setActiveTicketId(id);
        setCart(ticket.lines.map((l) => ({ ...l })));
        setMode(ticket.mode);
      },
      addItem: (menuId) => {
        const item = menu.find((m) => m.id === menuId);
        if (!item) return;
        setCart((list) => {
          const found = list.find((l) => l.id === item.id);
          if (found) {
            return list.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
          }
          return [...list, { id: item.id, name: item.name, price: item.price, qty: 1 }];
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
      totals: {
        subtotal,
        tax,
        total,
        count: cart.reduce((n, l) => n + l.qty, 0),
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
            label: "Guest",
            seats: 1,
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
        setCart([]);
        setActiveTicketId(null);
        return id;
      },
      lastPayment,

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
    settings,
    managerUnlocked,
    lastPayment,
  ]);

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}

export function usePos() {
  const ctx = useContext(PosContext);
  if (!ctx) throw new Error("usePos must be used inside PosProvider");
  return ctx;
}
