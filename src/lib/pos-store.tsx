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
  setFilters: (f: TicketFilters) => void;
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
    role: "Manager",
    station: null,
  });
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filters, setFilters] = useState<TicketFilters>({
    statuses: [],
    modes: [],
    mineOnly: false,
  });
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<MenuMode>("dine-in");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [lastPayment, setLastPayment] = useState<LastPayment>(null);

  const value = useMemo<Store>(() => {
    const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

    return {
      session,
      signIn: () => setSession((s) => ({ ...s, signedIn: true })),
      signOut: () =>
        setSession({
          signedIn: false,
          clockedIn: false,
          name: "Elizer Cruz",
          role: "Manager",
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
      visibleTickets: (tab) => {
        let list = [...tickets];
        if (tab !== "all") {
          list =
            tab === "payment"
              ? list.filter((t) => t.status === "payment")
              : list.filter((t) => t.status === tab);
        }
        if (filters.statuses.length) {
          list = list.filter((t) => filters.statuses.includes(t.status));
        }
        if (filters.modes.length) {
          list = list.filter((t) => filters.modes.includes(t.mode));
        }
        if (filters.mineOnly) {
          list = list.filter((t) => t.server === session.name);
        }
        const q = search.trim().toLowerCase();
        if (q) {
          list = list.filter(
            (t) =>
              t.label.toLowerCase().includes(q) ||
              t.id.toLowerCase().includes(q) ||
              t.id.replace("t-", "").includes(q),
          );
        }
        list.sort((a, b) => {
          if (sortKey === "newest") return a.arrivedMinutesAgo - b.arrivedMinutesAgo;
          if (sortKey === "oldest") return b.arrivedMinutesAgo - a.arrivedMinutesAgo;
          if (sortKey === "highest") return b.total - a.total;
          return a.total - b.total;
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
        total: Math.round((subtotal + tax) * 100) / 100,
        count: cart.reduce((n, l) => n + l.qty, 0),
      },
      commitPayment: (method, tendered) => {
        const total = Math.round((subtotal + tax) * 100) / 100;
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
            number: cart.reduce((n, l) => n + l.qty, 0),
            label: "Guest order",
            seats: 1,
            total,
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
