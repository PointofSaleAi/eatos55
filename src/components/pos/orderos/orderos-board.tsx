import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, CalendarDays, Car, ChevronLeft, ChevronRight, Minus, Plus, Printer, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cancelReasons, orderTotals, type OOItem, type OOrder, type OOStatus } from "@/lib/orderos-data";
import { useOrderOS } from "@/lib/orderos-store";
import { money } from "@/lib/demo-data";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Channel = "online" | "dinein";
type View = "board" | "scheduled" | "cancelled";

const columns: Record<Channel, { id: OOStatus; label: string }[]> = {
  online: [
    { id: "new", label: "New Order" },
    { id: "preparing", label: "Preparing" },
    { id: "ready", label: "Ready" },
    { id: "delivery", label: "Out for Delivery" },
    { id: "completed", label: "Completed" },
  ],
  dinein: [
    { id: "new", label: "New Order" },
    { id: "preparing", label: "Preparing" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ],
};

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const clock = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const mmss = (sec: number) => {
  const s = Math.max(0, Math.floor(Math.abs(sec)));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

function useTimes(o: OOrder, now: number | null) {
  const { baseTime } = useOrderOS();
  const placed = baseTime - o.placedOffset * 60000;
  const ready = baseTime + o.readyOffset * 60000;
  return {
    placed,
    ready,
    waitingSec: now ? (now - placed) / 1000 : 0,
    leftSec: now ? (ready - now) / 1000 : 0,
  };
}

const actionLabel = (o: OOrder) =>
  o.status === "preparing"
    ? "Make Order Ready"
    : o.status === "ready"
      ? o.type === "Delivery"
        ? "Out for Delivery"
        : o.type === "Dine In"
          ? "Mark Served"
          : "Ready for Pick Up"
      : o.status === "delivery"
        ? "Mark Delivered"
        : o.status === "scheduled"
          ? "Active Order"
          : null;

export function OrderOSBoard() {
  const os = useOrderOS();
  const now = useNow();
  const [channel, setChannel] = useState<Channel>("online");
  const [view, setView] = useState<View>("board");
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [asc, setAsc] = useState<Record<string, boolean>>({});
  const [phoneCol, setPhoneCol] = useState<OOStatus>("new");

  const cols = columns[channel];
  const inChannel = os.orders.filter((o) => o.channel === channel);
  const list = (s: OOStatus) =>
    inChannel
      .filter((o) => o.status === s)
      .sort((a, b) => (asc[s] ? a.number - b.number : b.number - a.number));
  const counts = {
    scheduled: inChannel.filter((o) => o.status === "scheduled").length,
    cancelled: inChannel.filter((o) => o.status === "cancelled").length,
  };
  const sel = os.orders.find((o) => o.id === selected) ?? null;
  const reportOrder = os.orders.find((o) => o.id === report) ?? null;

  useEffect(() => {
    if (!cols.some((c) => c.id === phoneCol)) setPhoneCol("new");
  }, [channel, cols, phoneCol]);

  const close = () => {
    setSelected(null);
    setReport(null);
  };
  const doAccept = (o: OOrder, readyIn?: number) => {
    haptic("light");
    os.accept(o.id, readyIn);
    setExpanded(null);
    close();
    toast.success(`Order #${o.number} accepted`);
  };
  const doAdvance = (o: OOrder) => {
    haptic("light");
    if (o.status === "scheduled") {
      os.activate(o.id);
      toast.success(`Order #${o.number} moved to New Order`);
      setView("board");
    } else {
      os.advance(o.id);
      toast.success(`Order #${o.number}: ${actionLabel(o)}`);
    }
    close();
  };
  const cancelOrder = os.orders.find((o) => o.id === cancelId) ?? null;

  const sideStatus: OOStatus | null = sel
    ? view === "scheduled"
      ? "scheduled"
      : view === "cancelled"
        ? "cancelled"
        : sel.status
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-border bg-surface px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex shrink-0 rounded-pill bg-muted p-1">
            {(["dinein", "online"] as Channel[]).map((c) => {
              const badge = os.orders.filter((o) => o.channel === c && o.status === "new").length;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setChannel(c);
                    setView("board");
                    close();
                  }}
                  className={cn(
                    "inline-flex min-h-ctl-sm items-center gap-1.5 rounded-pill px-3 text-fs-sm font-bold transition-colors",
                    c === channel ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {c === "online" ? "ONLINE" : "DINE IN"}
                  {badge > 0 && (
                    <span className={cn("grid min-w-5 place-items-center rounded-pill px-1 text-fs-xs", c === channel ? "bg-primary-foreground text-primary" : "bg-foreground text-background")}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <IconToggle
            label="Scheduled orders"
            active={view === "scheduled"}
            count={counts.scheduled}
            onClick={() => {
              close();
              setView(view === "scheduled" ? "board" : "scheduled");
            }}
          >
            <CalendarDays className="size-5" />
          </IconToggle>
          <IconToggle
            label="Cancelled orders"
            active={view === "cancelled"}
            onClick={() => {
              close();
              setView(view === "cancelled" ? "board" : "cancelled");
            }}
          >
            <XCircle className="size-5" />
          </IconToggle>
          <p className="mx-auto hidden text-fs-xl font-extrabold tabular-nums text-foreground md:block" suppressHydrationWarning>
            {now ? clock(now) : "--:--"}
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-2 md:ml-0">
            <div className="inline-flex items-center gap-1 rounded-pill border border-border px-1">
              <button type="button" aria-label="Decrease prep time" onClick={() => os.setPrepMinutes(Math.max(5, os.prepMinutes - 5))} className="grid size-9 place-items-center rounded-pill hover:bg-muted">
                <Minus className="size-4" />
              </button>
              <span className="text-center text-fs-xs font-bold leading-tight">
                Prep Time
                <br />
                <span className="text-fs-sm">{os.prepMinutes}:00 MIN</span>
              </span>
              <button type="button" aria-label="Increase prep time" onClick={() => os.setPrepMinutes(Math.min(90, os.prepMinutes + 5))} className="grid size-9 place-items-center rounded-pill hover:bg-muted">
                <Plus className="size-4" />
              </button>
            </div>
            <label className="inline-flex min-h-ctl-sm items-center gap-2 rounded-pill border border-border px-3 text-fs-xs font-bold">
              Auto Accept
              <Switch
                checked={os.autoAccept}
                onCheckedChange={(v) => {
                  os.setAutoAccept(v);
                  if (v) inChannel.filter((o) => o.status === "new").forEach((o) => os.accept(o.id));
                  toast.success(v ? "Auto accept on: new orders go straight to Preparing" : "Auto accept off");
                }}
              />
            </label>
            <label className="inline-flex min-h-ctl-sm items-center gap-2 rounded-pill border border-border px-3 text-fs-xs font-bold">
              Pause Order
              <Switch
                checked={os.paused}
                onCheckedChange={(v) => {
                  os.setPaused(v);
                  toast.success(v ? "Incoming online orders paused" : "Accepting online orders again");
                }}
              />
            </label>
          </div>
        </div>
        {os.paused && (
          <p className="mt-2 rounded-card bg-warning px-3 py-1.5 text-center text-fs-xs font-bold text-warning-foreground">
            Orders paused — new online orders are not being received.
          </p>
        )}
      </div>

      {/* Body */}
      {sel ? (
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border lg:flex">
            <ColumnHeader
              label={sideStatus ? labelFor(sideStatus, cols) : ""}
              count={inChannel.filter((o) => o.status === sideStatus).length}
            />
            <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto p-2">
              {inChannel
                .filter((o) => o.status === sideStatus)
                .map((o) => (
                  <OrderCard
                    key={o.id}
                    o={o}
                    now={now}
                    dim={o.id !== sel.id}
                    onOpen={() => {
                      setReport(null);
                      setSelected(o.id);
                    }}
                  />
                ))}
            </div>
          </aside>
          <div className="min-w-0 flex-1 overflow-y-auto">
            {reportOrder ? (
              <ReportIssue
                o={reportOrder}
                onBack={() => setReport(null)}
                onAdjust={(marks) => {
                  os.markItems(reportOrder.id, marks);
                  toast.success("Order adjusted and customer notified");
                  setReport(null);
                }}
              />
            ) : (
              <OrderDetail
                o={sel}
                now={now}
                onClose={close}
                onAction={() => doAdvance(sel)}
                onConfirm={() => doAccept(sel)}
                onCancel={() => setCancelId(sel.id)}
                onReport={() => setReport(sel.id)}
              />
            )}
          </div>
        </div>
      ) : view !== "board" ? (
        <OrderList
          title={view === "scheduled" ? "Scheduled" : "Cancelled"}
          orders={inChannel.filter((o) => o.status === view)}
          onOpen={(id) => setSelected(id)}
          onClose={() => setView("board")}
        />
      ) : (
        <>
          {/* Phone status tabs */}
          <div className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden">
            {cols.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPhoneCol(c.id)}
                className={cn(
                  "inline-flex min-h-ctl-sm shrink-0 items-center gap-1.5 rounded-pill px-3 text-fs-sm font-bold",
                  phoneCol === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {c.label}
                <span className="text-fs-xs">{list(c.id).length}</span>
              </button>
            ))}
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-auto">
            <div className="flex h-full gap-3 p-3 md:min-w-max md:px-4 lg:min-w-0">
              {cols.map((c) => (
                <section
                  key={c.id}
                  className={cn("flex min-h-0 w-full flex-col md:w-[230px] lg:w-auto lg:flex-1 lg:min-w-[180px]", phoneCol === c.id ? "flex" : "hidden md:flex")}
                >
                  <ColumnHeader
                    label={c.label}
                    count={list(c.id).length}
                    onSort={() => setAsc((s) => ({ ...s, [c.id]: !s[c.id] }))}
                  />
                  <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto pb-4">
                    {list(c.id).length === 0 ? (
                      <p className="py-8 text-center text-fs-xs text-muted-foreground">No orders here</p>
                    ) : (
                      list(c.id).map((o) =>
                        o.status === "new" && expanded === o.id ? (
                          <ExpandedNewCard
                            key={o.id}
                            o={o}
                            now={now}
                            prep={os.prepMinutes}
                            onCollapse={() => setExpanded(null)}
                            onAccept={(m) => doAccept(o, m)}
                            onCancel={() => setCancelId(o.id)}
                            onReport={() => {
                              setSelected(o.id);
                              setReport(o.id);
                            }}
                          />
                        ) : (
                          <OrderCard
                            key={o.id}
                            o={o}
                            now={now}
                            onOpen={() => (o.status === "new" ? setExpanded(o.id) : setSelected(o.id))}
                            onAccept={() => doAccept(o)}
                            onCancel={() => setCancelId(o.id)}
                          />
                        ),
                      )
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      )}

      <CancelDialog
        order={cancelOrder}
        onDismiss={() => setCancelId(null)}
        onConfirm={(reason) => {
          if (!cancelOrder) return;
          os.cancel(cancelOrder.id, reason);
          toast.success(`Order #${cancelOrder.number} cancelled${cancelOrder.paid ? " and refunded" : ""}`);
          setCancelId(null);
          setExpanded(null);
          close();
        }}
      />
    </div>
  );
}

function labelFor(s: OOStatus, cols: { id: OOStatus; label: string }[]) {
  return cols.find((c) => c.id === s)?.label ?? (s === "scheduled" ? "Scheduled" : s === "cancelled" ? "Cancelled" : s);
}

function IconToggle({ label, active, count, onClick, children }: { label: string; active: boolean; count?: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-pill border border-border transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
      )}
    >
      {children}
      {!!count && (
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-pill bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

function ColumnHeader({ label, count, onSort }: { label: string; count: number; onSort?: () => void }) {
  return (
    <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-1 py-1">
      <h2 className="inline-flex items-center gap-1.5 text-fs-sm font-extrabold text-foreground">
        {label}
        <span className="grid min-w-5 place-items-center rounded-pill bg-foreground px-1 text-fs-xs text-background">{count}</span>
      </h2>
      {onSort && (
        <button type="button" aria-label={`Sort ${label}`} onClick={onSort} className="grid size-10 place-items-center rounded-pill text-muted-foreground hover:bg-muted">
          <ArrowDownUp className="size-4" />
        </button>
      )}
    </div>
  );
}

function waitTone(sec: number) {
  // Recording: fresh orders red, then blue, then green the longer they wait.
  return sec < 60 ? "bg-tile-red text-white" : sec < 300 ? "bg-tile-blue text-white" : "bg-tile-green text-white";
}

function stripTone(status: OOrder["status"]) {
  switch (status) {
    case "preparing":
    case "cancelled":
      return "bg-tile-red text-white";
    case "ready":
      return "bg-tile-purple text-white";
    case "delivery":
      return "bg-tile-yellow text-foreground";
    case "completed":
      return "bg-tile-pink text-white";
    default:
      return "bg-muted text-foreground";
  }
}

function sourceTone(source: OOrder["source"]) {
  switch (source) {
    case "Grubhub":
      return "text-tile-orange";
    case "Uber Eats":
      return "text-tile-green";
    case "DoorDash":
      return "text-tile-red";
    default:
      return "opacity-80";
  }
}

function OrderCard({ o, now, dim, onOpen, onAccept, onCancel }: { o: OOrder; now: number | null; dim?: boolean; onOpen: () => void; onAccept?: () => void; onCancel?: () => void }) {
  const t = useTimes(o, now);
  const count = o.items.reduce((s, i) => s + i.qty, 0);
  const meta =
    o.status === "new"
      ? { l: "Ordered at", lv: clock(t.placed), r: null }
      : o.status === "scheduled"
        ? { l: "Arrived at", lv: clock(t.placed), r: `Scheduled ${o.scheduledFor}` }
        : o.status === "preparing"
          ? { l: "Ordered at", lv: clock(t.placed), r: `Est. ready ${clock(t.ready)}` }
          : o.status === "ready"
            ? { l: "Ordered at", lv: clock(t.placed), r: `Ready at ${clock(t.ready)}` }
            : o.status === "delivery"
              ? { l: "Ordered at", lv: clock(t.placed), r: `Deliver by ${clock(t.ready + 15 * 60000)}` }
              : { l: "Ordered at", lv: clock(t.placed), r: o.status === "cancelled" ? "Cancelled" : `Done ${clock(t.ready)}` };
  return (
    <div className={cn("overflow-hidden rounded-card border border-border bg-surface transition-opacity", dim && "opacity-50")}>
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex items-center justify-between gap-2 bg-primary px-3 py-1.5 text-primary-foreground">
          <span className="text-fs-xs font-extrabold uppercase tracking-wide">{o.type}</span>
          <span className={cn("text-[10px] font-bold uppercase", sourceTone(o.source))}>{o.source}</span>
        </div>
        <div className="flex items-start justify-between gap-2 px-3 pt-2">
          <div className="min-w-0">
            <p className="truncate text-fs-sm font-extrabold text-foreground">{o.guest}</p>
            <p className="text-fs-xs text-muted-foreground">{count} item{count === 1 ? "" : "s"}</p>
          </div>
          <span className="text-fs-xl font-extrabold tabular-nums text-foreground">{o.number}</span>
        </div>
        <div className="flex items-end justify-between gap-2 px-3 pb-2 pt-1 text-[11px] leading-tight text-muted-foreground">
          <span>
            {meta.l}
            <br />
            <span className="font-bold text-foreground" suppressHydrationWarning>{meta.lv}</span>
          </span>
          {o.status === "new" ? (
            <span className={cn("rounded-pill px-2 py-0.5 text-fs-xs font-extrabold tabular-nums", waitTone(t.waitingSec))} suppressHydrationWarning>
              {now ? mmss(t.waitingSec) : "--:--"}
            </span>
          ) : (
            meta.r && <span className="text-right font-bold text-foreground" suppressHydrationWarning>{meta.r}</span>
          )}
        </div>
        {o.channel === "dinein" && (
          <p className={cn("border-t border-border py-1 text-center text-fs-xs font-extrabold", o.refunded ? "text-destructive" : o.paid ? "text-foreground" : "text-muted-foreground")}>
            {o.refunded ? "REFUNDED" : o.paid ? "PAID" : "UNPAID"}
          </p>
        )}
        {o.status !== "new" && (
          <div className={cn("flex items-center justify-center gap-2 border-t border-border py-2 text-fs-xs font-extrabold uppercase", stripTone(o.status))}>
            {o.status === "preparing" ? (
              <>
                Preparing <span className="tabular-nums" suppressHydrationWarning>{now ? `${t.leftSec < 0 ? "-" : ""}${mmss(t.leftSec)}` : ""}</span>
              </>
            ) : o.status === "delivery" ? (
              "Out for delivery"
            ) : o.status === "scheduled" ? (
              <>
                <Car className="size-4" /> {o.type}
              </>
            ) : (
              o.status
            )}
          </div>
        )}
      </button>
      {o.status === "new" && onAccept && onCancel && (
        <div className="grid grid-cols-2 gap-2 border-t border-border p-2">
          <button type="button" onClick={onCancel} className="min-h-ctl-sm rounded-pill bg-muted text-fs-xs font-bold text-destructive">
            Cancel
          </button>
          <button type="button" onClick={onAccept} className="min-h-ctl-sm rounded-pill bg-primary text-fs-xs font-bold text-primary-foreground">
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

function ItemLines({ items, compact }: { items: OOItem[]; compact?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((i) => (
        <li key={i.id} className={cn(compact ? "py-1.5" : "py-2", i.unavailable && "opacity-50")}>
          <div className={cn("flex justify-between gap-2 font-bold text-foreground", compact ? "text-fs-xs" : "text-fs-sm", i.unavailable && "line-through")}>
            <span>
              {i.qty} x {i.name}
            </span>
            <span className="tabular-nums">{money(i.qty * i.price)}</span>
          </div>
          {i.mods.map((m) => (
            <p key={m.name} className={cn("pl-4", compact ? "text-[11px]" : "text-fs-xs", m.removed ? "text-destructive line-through" : "text-muted-foreground")}>
              {m.removed ? "No " : ""}
              {m.name}
            </p>
          ))}
          {i.note && <p className="pl-4 text-fs-xs italic text-muted-foreground">Note: {i.note}</p>}
          {i.unavailable && <p className="pl-4 text-fs-xs font-bold text-destructive">{i.unavailable === "temporary" ? "Temporarily unavailable" : "Permanently unavailable"}</p>}
        </li>
      ))}
    </ul>
  );
}

function ExpandedNewCard({ o, now, prep, onCollapse, onAccept, onCancel, onReport }: { o: OOrder; now: number | null; prep: number; onCollapse: () => void; onAccept: (m: number) => void; onCancel: () => void; onReport: () => void }) {
  const [mins, setMins] = useState(prep);
  const t = useTimes(o, now);
  const totals = orderTotals(o);
  return (
    <div className="overflow-hidden rounded-card border-2 border-foreground bg-surface">
      <button type="button" onClick={onCollapse} className="block w-full text-left" aria-label="Collapse order">
        <div className="flex items-center justify-between bg-primary px-3 py-1.5 text-primary-foreground">
          <span className="text-fs-xs font-extrabold uppercase">{o.type}</span>
          <span className="text-[10px] font-bold uppercase opacity-80">{o.source}</span>
        </div>
        <div className="flex items-start justify-between px-3 pt-2">
          <p className="truncate text-fs-sm font-extrabold">{o.guest}</p>
          <span className="text-fs-xl font-extrabold">{o.number}</span>
        </div>
        <div className="flex justify-end px-3">
          <span className={cn("rounded-pill px-2 py-0.5 text-fs-xs font-extrabold tabular-nums", waitTone(t.waitingSec))} suppressHydrationWarning>
            {now ? mmss(t.waitingSec) : "--:--"}
          </span>
        </div>
      </button>
      <div className="px-3 pt-2">
        <div className="flex justify-between text-fs-xs font-bold">
          <span>Total due</span>
          <span>{money(totals.total)}</span>
        </div>
        <ItemLines items={o.items} compact />
      </div>
      <div className="space-y-2 p-2">
        <div className="flex items-center justify-between rounded-pill bg-muted px-1">
          <button type="button" aria-label="Earlier" onClick={() => setMins((m) => Math.max(5, m - 5))} className="grid size-9 place-items-center">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-fs-xs font-bold" suppressHydrationWarning>
            Ready at {now ? clock(now + mins * 60000) : "--"}
          </span>
          <button type="button" aria-label="Later" onClick={() => setMins((m) => m + 5)} className="grid size-9 place-items-center">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <button type="button" onClick={() => toast("No printer connected in this demo")} className="inline-flex min-h-ctl-sm w-full items-center justify-center gap-2 rounded-pill border border-border text-fs-xs font-bold">
          <Printer className="size-4" /> Connect Printer
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="min-h-ctl-sm rounded-pill bg-muted text-fs-xs font-bold text-destructive">
            Cancel
          </button>
          <button type="button" onClick={onReport} className="min-h-ctl-sm rounded-pill bg-muted text-fs-xs font-bold">
            Report
          </button>
        </div>
        <button type="button" onClick={() => onAccept(mins)} className="min-h-ctl-md w-full rounded-pill bg-primary text-fs-sm font-bold text-primary-foreground">
          Accept Order
        </button>
      </div>
    </div>
  );
}

function OrderDetail({ o, now, onClose, onAction, onConfirm, onCancel, onReport }: { o: OOrder; now: number | null; onClose: () => void; onAction: () => void; onConfirm: () => void; onCancel: () => void; onReport: () => void }) {
  const t = useTimes(o, now);
  const totals = orderTotals(o);
  const action = actionLabel(o);
  const cancelled = o.status === "cancelled";
  return (
    <div className="mx-auto max-w-5xl p-4">
      <button type="button" onClick={onClose} className="mb-3 inline-flex min-h-ctl-sm items-center gap-1 rounded-pill bg-muted px-3 text-fs-sm font-bold">
        <ChevronLeft className="size-4" /> Back to board
      </button>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-fs-xl font-extrabold text-foreground">{o.guest}</h2>
          <p className="text-fs-sm text-muted-foreground">{o.phone}</p>
          {o.address && <p className="text-fs-sm text-muted-foreground">{o.address}</p>}
          <div className="mt-4 flex items-center justify-between text-fs-xs font-bold uppercase text-muted-foreground">
            <span>Order summary</span>
            <span className={cn("normal-case", o.utensils && "text-foreground")}>{o.utensils ? "● " : "○ "}Add utensils, straws, napkins</span>
          </div>
          <div className={cn("mt-1 rounded-card border border-border bg-surface px-3", cancelled && "line-through opacity-60")}>
            <ItemLines items={o.items} />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-card bg-muted p-3 text-center">
              <p className="text-fs-sm font-bold">Order Number {o.number}</p>
              <p className="text-fs-xs text-muted-foreground">
                {o.items.length} items | {o.type}
              </p>
            </div>
            <div className={cn("grid place-items-center rounded-card p-3 text-center", cancelled ? "bg-muted text-destructive" : "bg-foreground text-background")}>
              {cancelled ? (
                <p className="text-fs-lg font-extrabold">{o.refunded ? "REFUNDED" : "CANCELLED"}</p>
              ) : (
                <>
                  <p className="text-fs-xs">{o.status === "scheduled" ? "Scheduled At" : "Ready At"}</p>
                  <p className="text-fs-lg font-extrabold" suppressHydrationWarning>
                    {o.status === "scheduled" ? o.scheduledFor : clock(o.status === "new" && now ? now + 10 * 60000 : t.ready)}
                  </p>
                </>
              )}
            </div>
          </div>
          {cancelled && o.cancelReason && <p className="mt-2 text-fs-xs text-muted-foreground">Reason: {o.cancelReason}</p>}
          <p className="mt-4 text-fs-xs font-bold uppercase text-muted-foreground">Payment summary</p>
          <dl className="mt-1 space-y-1 rounded-card border border-border bg-surface p-3 text-fs-sm">
            {(
              [
                ["Sub Total", totals.sub],
                ["Discount", totals.discount],
                ["Delivery Fee", totals.delivery],
                ["Service Charge", totals.service],
                ["Tax", totals.tax],
                ["Tip", totals.tip],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular-nums">{money(v)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-1 text-fs-base font-extrabold">
              <dt>Total Due</dt>
              <dd className="tabular-nums">{money(totals.total)}</dd>
            </div>
          </dl>
          {!cancelled && o.status !== "completed" && (
            <div className="mt-3 space-y-2">
              <button type="button" onClick={() => toast("No printer connected in this demo")} className="flex min-h-ctl-md w-full items-center justify-between rounded-card border border-border px-3 text-fs-sm font-bold">
                Connect Printer <span className="inline-flex items-center text-fs-xs text-muted-foreground">Select <ChevronRight className="size-4" /></span>
              </button>
              {o.status === "new" ? (
                <>
                  <button type="button" onClick={onConfirm} className="min-h-ctl-lg w-full rounded-pill bg-primary text-fs-base font-bold text-primary-foreground">
                    Confirm Order
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={onCancel} className="min-h-ctl-md rounded-pill bg-muted text-fs-sm font-bold text-destructive">
                      Cancel Order
                    </button>
                    <button type="button" onClick={onReport} className="min-h-ctl-md rounded-pill bg-muted text-fs-sm font-bold">
                      Report An Issue
                    </button>
                  </div>
                </>
              ) : (
                action && (
                  <button type="button" onClick={onAction} className="min-h-ctl-lg w-full rounded-pill bg-primary text-fs-base font-bold text-primary-foreground">
                    {action}
                  </button>
                )
              )}
              {(o.status === "preparing" || o.status === "scheduled") && (
                <button type="button" onClick={onCancel} className="min-h-ctl-md w-full rounded-pill bg-muted text-fs-sm font-bold text-destructive">
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportIssue({ o, onBack, onAdjust }: { o: OOrder; onBack: () => void; onAdjust: (m: Record<string, OOItem["unavailable"]>) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, OOItem["unavailable"]>>({});
  const any = Object.values(marks).some(Boolean);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4">
      <h2 className="text-center text-fs-lg font-extrabold">Report an Issue</h2>
      <p className="text-fs-xs font-bold uppercase text-muted-foreground">Tap on item to report issue</p>
      <ul className="space-y-2">
        {o.items.map((i) => (
          <li key={i.id} className="overflow-hidden rounded-card border border-border bg-surface">
            <button type="button" onClick={() => setOpen(open === i.id ? null : i.id)} className={cn("flex min-h-ctl-md w-full items-center justify-between gap-2 px-3 text-left text-fs-sm font-bold", open === i.id && "bg-muted")}>
              <span>
                {i.qty} x {i.name}
                {(marks[i.id] ?? i.unavailable) && (
                  <span className="ml-2 text-fs-xs text-destructive">{(marks[i.id] ?? i.unavailable) === "temporary" ? "Temporary unavailable" : "Permanent unavailable"}</span>
                )}
              </span>
              <span className="tabular-nums">{money(i.qty * i.price)}</span>
            </button>
            {open === i.id && (
              <div className="grid grid-cols-2 gap-2 border-t border-border p-2">
                {(["temporary", "permanent"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setMarks((m) => ({ ...m, [i.id]: m[i.id] === k ? undefined : k }));
                      setOpen(null);
                    }}
                    className={cn("min-h-ctl-sm rounded-pill text-fs-xs font-bold", marks[i.id] === k ? "bg-primary text-primary-foreground" : "bg-muted")}
                  >
                    {k === "temporary" ? "Temporary Unavailable" : "Permanent Unavailable"}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" onClick={onBack} className="min-h-ctl-md rounded-pill bg-muted text-fs-sm font-bold">
          Back
        </button>
        <button type="button" disabled={!any} onClick={() => onAdjust(marks)} className="min-h-ctl-md rounded-pill bg-primary text-fs-sm font-bold text-primary-foreground disabled:opacity-40">
          Adjust
        </button>
      </div>
    </div>
  );
}

function OrderList({ title, orders, onOpen, onClose }: { title: string; orders: OOrder[]; onOpen: (id: string) => void; onClose: () => void }) {
  const { baseTime } = useOrderOS();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-fs-base font-extrabold">
          {title}
          <span className="grid min-w-5 place-items-center rounded-pill bg-foreground px-1 text-fs-xs text-background">{orders.length}</span>
        </h2>
        <button type="button" onClick={onClose} className="inline-flex min-h-ctl-sm items-center gap-1 rounded-pill bg-muted px-3 text-fs-sm font-bold">
          <ChevronLeft className="size-4" /> Board
        </button>
      </div>
      {orders.length === 0 ? (
        <p className="py-12 text-center text-fs-sm text-muted-foreground">No {title.toLowerCase()} orders</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <button type="button" onClick={() => onOpen(o.id)} className="grid w-full grid-cols-2 items-center gap-2 rounded-card border border-border bg-surface p-3 text-left hover:bg-muted sm:grid-cols-5">
                <span>
                  <span className="block text-fs-base font-extrabold">#{o.number}</span>
                  <span className="text-fs-xs text-muted-foreground" suppressHydrationWarning>Arrived {clock(baseTime - o.placedOffset * 60000)}</span>
                </span>
                <span>
                  <span className="block text-fs-sm font-bold">{o.guest}</span>
                  <span className="text-fs-xs text-muted-foreground">{o.scheduledFor ? `Scheduled ${o.scheduledFor}` : o.cancelReason}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-fs-sm font-bold uppercase">
                  <Car className="size-4" /> {o.type}
                </span>
                <span className="text-fs-sm">{o.items.length} items</span>
                <span className="text-fs-xs font-bold uppercase text-muted-foreground sm:text-right">{o.refunded ? "Refunded" : o.source}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CancelDialog({ order, onDismiss, onConfirm }: { order: OOrder | null; onDismiss: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState(cancelReasons[0]!);
  const title = useMemo(() => (order ? `Cancel order #${order.number}?` : ""), [order]);
  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onDismiss()}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{order?.paid ? "The customer will be refunded." : "This order has not been paid."}</DialogDescription>
        <div className="flex flex-wrap gap-2">
          {cancelReasons.map((r) => (
            <button key={r} type="button" onClick={() => setReason(r)} className={cn("min-h-ctl-sm rounded-pill px-3 text-fs-xs font-bold", reason === r ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {r}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onDismiss} className="min-h-ctl-md rounded-pill bg-muted text-fs-sm font-bold">
            Keep Order
          </button>
          <button type="button" onClick={() => onConfirm(reason)} className="min-h-ctl-md rounded-pill bg-destructive text-fs-sm font-bold text-destructive-foreground">
            Cancel Order
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
