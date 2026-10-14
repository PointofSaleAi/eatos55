import { useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { pinnedContext } from "@/lib/pinned-context";
import { seedOrders, type OOrder, type OOItem } from "@/lib/orderos-data";

type Ctx = {
  orders: OOrder[];
  baseTime: number;
  prepMinutes: number;
  autoAccept: boolean;
  paused: boolean;
  setPrepMinutes: (m: number) => void;
  setAutoAccept: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  accept: (id: string, readyInMinutes?: number) => void;
  advance: (id: string) => void;
  cancel: (id: string, reason: string) => void;
  activate: (id: string) => void;
  markItems: (id: string, marks: Record<string, OOItem["unavailable"]>) => void;
};

const OrderOSContext = pinnedContext<Ctx | null>("eatos.orderos", null);

export function OrderOSProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OOrder[]>(seedOrders);
  const [baseTime] = useState(() => Date.now());
  const [prepMinutes, setPrepMinutes] = useState(10);
  const [autoAccept, setAutoAccept] = useState(false);
  const [paused, setPaused] = useState(false);

  const minsSinceBase = () => (Date.now() - baseTime) / 60000;
  const patch = useCallback((id: string, f: (o: OOrder) => OOrder) => {
    setOrders((list) => list.map((o) => (o.id === id ? f(o) : o)));
  }, []);

  const accept = useCallback(
    (id: string, readyIn?: number) =>
      patch(id, (o) => ({ ...o, status: "preparing", readyOffset: minsSinceBase() + (readyIn ?? prepMinutes) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patch, prepMinutes],
  );
  const advance = useCallback(
    (id: string) =>
      patch(id, (o) => {
        const next =
          o.status === "preparing"
            ? "ready"
            : o.status === "ready"
              ? o.type === "Delivery"
                ? "delivery"
                : "completed"
              : o.status === "delivery"
                ? "completed"
                : o.status;
        return { ...o, status: next, readyOffset: o.status === "preparing" ? minsSinceBase() : o.readyOffset };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patch],
  );
  const cancel = useCallback(
    (id: string, reason: string) =>
      patch(id, (o) => ({ ...o, status: "cancelled", refunded: o.paid, cancelReason: reason })),
    [patch],
  );
  const activate = useCallback(
    (id: string) => patch(id, (o) => ({ ...o, status: "new", placedOffset: -minsSinceBase() })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patch],
  );
  const markItems = useCallback(
    (id: string, marks: Record<string, OOItem["unavailable"]>) =>
      patch(id, (o) => ({ ...o, items: o.items.map((i) => (marks[i.id] ? { ...i, unavailable: marks[i.id] } : i)) })),
    [patch],
  );

  const value = useMemo(
    () => ({ orders, baseTime, prepMinutes, autoAccept, paused, setPrepMinutes, setAutoAccept, setPaused, accept, advance, cancel, activate, markItems }),
    [orders, baseTime, prepMinutes, autoAccept, paused, accept, advance, cancel, activate, markItems],
  );
  return <OrderOSContext.Provider value={value}>{children}</OrderOSContext.Provider>;
}

export function useOrderOS() {
  const ctx = useContext(OrderOSContext);
  if (!ctx) throw new Error("useOrderOS must be used inside OrderOSProvider");
  return ctx;
}
