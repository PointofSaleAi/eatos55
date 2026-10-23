import { ArrowDown, Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { money, ticketStatusMeta, type Ticket } from "@/lib/demo-data";
import { floorTables, floors } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { canTransfer, linesTotal, transferTargets } from "@/lib/ticket-transfer";
import { cn } from "@/lib/utils";

type Step = "choice" | "products" | "target" | "review" | "table" | "move-table" | "done";

function MiniTicket({ t, selected, onClick }: { t: Ticket; selected?: boolean; onClick?: () => void }) {
  const meta = ticketStatusMeta(t);
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-card border bg-surface p-2.5 text-left",
        selected ? "border-success ring-1 ring-success" : "border-border",
        onClick && "hover:bg-muted",
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-row bg-muted text-fs-sm font-extrabold">{t.orderNo ?? t.number}</span>
      <span className="min-w-0 flex-1">
        <span className="flex justify-between gap-2">
          <span className={cn("text-fs-xs font-bold", meta.tone)}>{meta.label}</span>
          <span className="truncate text-fs-xs font-bold text-foreground">{t.table ? `Table ${t.table}` : "Guest"}</span>
        </span>
        <span className="flex justify-between gap-2 text-fs-xs text-muted-foreground">
          <span className="truncate">Order No {t.orderNo ?? t.number} · {t.server}</span>
          <span className="font-bold tabular-nums text-foreground">{money(t.total)}</span>
        </span>
      </span>
    </Tag>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">{children}</div>;
}
const outline = "h-11 rounded-row border border-foreground text-fs-sm font-bold text-foreground hover:bg-muted";
const solid = "h-11 rounded-row bg-foreground text-fs-sm font-bold text-background disabled:opacity-40";

export function TransferOrderDialog({ ticket, onClose, onDone }: { ticket: Ticket; onClose: () => void; onDone?: (id: string) => void }) {
  const { tickets, transferProducts, transferTable } = usePos();
  const [step, setStep] = useState<Step>(ticket.table ? "choice" : "products");
  const [picked, setPicked] = useState<string[]>([]);
  const [target, setTarget] = useState<string | "new" | null>(null);
  const [floor, setFloor] = useState<string>(floors[0]);
  const [table, setTable] = useState<string | null>(null);
  const [result, setResult] = useState<{ title: string; body: string; lines?: string[] } | null>(null);
  const [tab, setTab] = useState<"all" | "ordering" | "payment" | "preparing">("all");

  // Only fired (sent) products move; an Ordering check has nothing fired yet.
  const lines = ticket.status === "ordering" ? [] : ticket.lines;
  const targets = transferTargets(tickets, ticket.id);
  const shownTargets = tab === "all" ? targets : targets.filter((t) => t.status === tab);
  const occupied = useMemo(() => new Map(tickets.filter(canTransfer).filter((t) => t.table).map((t) => [t.table!, t])), [tickets]);
  const pickedLines = ticket.lines.filter((l) => picked.includes(l.id));
  const targetTicket = target && target !== "new" ? tickets.find((t) => t.id === target) : null;

  const finish = (id: string | null, r: typeof result) => {
    if (id) onDone?.(id);
    setResult(r);
    setStep("done");
  };

  const title: Record<Step, string> = {
    choice: "Confirm Transfer",
    products: "Transfer Check",
    target: "Select Target Check",
    review: "Transfer Products",
    table: "Select Table",
    "move-table": "Transfer Table",
    done: result?.title ?? "Done",
  };
  const wide = step === "table" || step === "move-table";

  const tablePicker = (
    <>
      <div className="flex items-center gap-4 border-b border-border pb-2">
        <select value={floor} onChange={(e) => setFloor(e.target.value)} aria-label="Floor" className="h-9 rounded-row border border-border bg-surface px-2 text-fs-sm font-bold uppercase">
          {floors.map((f) => <option key={f}>{f}</option>)}
        </select>
        <span className="text-fs-sm font-bold text-foreground underline underline-offset-8">All</span>
      </div>
      <div className="grid flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto py-3 sm:grid-cols-4 lg:grid-cols-7">
        {floorTables.filter((t) => t.floor === floor && t.kind !== "bar-chair").map((ft) => {
          const busy = occupied.get(ft.name);
          const self = ft.name === ticket.table;
          const status = busy ? (busy.status === "ordering" ? "Ordering" : "Ordered") : "Available";
          const disabled = self || (step === "move-table" && !!busy);
          return (
            <button key={ft.id} type="button" disabled={disabled} onClick={() => setTable(ft.name)}
              className={cn("relative overflow-hidden rounded-card border bg-surface text-center disabled:opacity-40",
                table === ft.name ? "border-success ring-1 ring-success" : "border-border")}>
              {table === ft.name ? <Check className="absolute right-1 top-1 size-4 text-success" /> : null}
              <span className="block pt-3 text-fs-xs font-bold text-foreground">Table {ft.name}</span>
              <span className="block pb-2 text-fs-xs text-muted-foreground">{busy?.seats ?? 0} / {ft.seats}</span>
              <span className={cn("block py-1 text-[0.625rem] font-extrabold uppercase",
                status === "Available" ? "bg-success/15 text-success" : status === "Ordering" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning")}>{status}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn("flex max-h-[92dvh] flex-col gap-3 rounded-sheet border-border bg-surface p-4",
        step === "choice" && "pb-0",
        wide ? "h-[92dvh] w-[min(64rem,96vw)] max-w-none" : step === "choice" || step === "done" ? "w-[min(24rem,92vw)]" : "w-[min(40rem,94vw)] max-w-none")}>
        <div className="text-center">
          <DialogTitle className="text-fs-lg font-extrabold text-foreground">{title[step]}</DialogTitle>
          <DialogDescription className="text-fs-xs text-muted-foreground">
            {step === "choice" ? "Choose what you want to transfer"
              : step === "products" ? "Transfer selected product to another order or table"
              : step === "target" ? `Select target check to transfer ${picked.length} product(s)`
              : step === "done" ? result?.body : ""}
          </DialogDescription>
        </div>

        {step === "choice" ? (
          <div className="grid grid-cols-2 divide-x divide-border rounded-b-[inherit] border-t border-border">
            <button type="button" onClick={() => { setTable(null); setStep("move-table"); }} className="py-3 hover:bg-muted">
              <span className="block text-fs-sm font-bold">Table</span>
              <span className="block text-[0.625rem] text-muted-foreground">(All Products)</span>
            </button>
            <button type="button" onClick={() => setStep("products")} className="py-3 text-fs-sm font-bold hover:bg-muted">Select Product</button>
          </div>
        ) : null}

        {step === "products" ? (
          <>
            <MiniTicket t={ticket} />
            {lines.length ? (
              <>
                <div className="flex justify-between text-fs-sm font-bold">
                  <span>Select Products</span>
                  <button type="button" className="text-fs-xs" onClick={() => setPicked(picked.length === lines.length ? [] : lines.map((l) => l.id))}>
                    {picked.length === lines.length ? "Unselect All" : "Select All"}
                  </button>
                </div>
                <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                  {lines.map((l) => {
                    const on = picked.includes(l.id);
                    return (
                      <button key={l.id} type="button" aria-pressed={on}
                        onClick={() => setPicked((p) => (on ? p.filter((x) => x !== l.id) : [...p, l.id]))}
                        className={cn("flex w-full items-center gap-3 rounded-row border px-3 py-2 text-left text-fs-sm", on ? "border-success ring-1 ring-success" : "border-border hover:bg-muted")}>
                        <span className="text-muted-foreground">{l.qty}x</span>
                        <span className="min-w-0 flex-1 truncate font-bold">{l.name}</span>
                        <span className="tabular-nums">{money(l.price * l.qty)}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="py-6 text-center text-fs-sm text-muted-foreground">Only fired products can be transferred</p>
            )}
            <Footer>
              <button type="button" className={outline} onClick={() => {
                if (!picked.length) { toast.error("Please select at least one product to transfer"); return; }
                setTarget(null); setStep("target");
              }}>Transfer to order</button>
              <button type="button" className={solid} onClick={() => {
                if (!picked.length) { toast.error("Please select at least one product to transfer"); return; }
                setTable(null); setStep("table");
              }}>Transfer to table</button>
            </Footer>
          </>
        ) : null}

        {step === "target" ? (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              {([["all", "All", targets.length], ["ordering", "Ordering", targets.filter((t) => t.status === "ordering").length],
                ["payment", "Ordered", targets.filter((t) => t.status === "payment").length], ["preparing", "Preparing", targets.filter((t) => t.status === "preparing").length]] as const).map(([id, label, n]) => (
                <button key={id} type="button" onClick={() => setTab(id)}
                  className={cn("h-9 truncate rounded-row border text-fs-xs font-bold", tab === id ? "border-foreground bg-foreground text-background" : "border-border")}>{label} {n}</button>
              ))}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
              <button type="button" onClick={() => setTarget("new")}
                className={cn("flex w-full items-center gap-3 rounded-card border p-2.5 text-left", target === "new" ? "border-success ring-1 ring-success" : "border-border hover:bg-muted")}>
                <span className="grid size-9 place-items-center rounded-row border border-border"><Plus className="size-4" /></span>
                <span><span className="block text-fs-sm font-bold">Transfer to New Order</span><span className="block text-fs-xs text-muted-foreground">Start a new ticket with transferred items</span></span>
              </button>
              {shownTargets.map((t) => <MiniTicket key={t.id} t={t} selected={target === t.id} onClick={() => setTarget(t.id)} />)}
            </div>
            <Footer>
              <button type="button" className={outline} onClick={() => setStep("products")}>Back</button>
              <button type="button" className={solid} disabled={!target} onClick={() => setStep("review")}>Confirm Transfer</button>
            </Footer>
          </>
        ) : null}

        {step === "review" ? (
          <div className="min-h-0 space-y-2 overflow-y-auto">
            <p className="text-fs-sm font-bold">From</p>
            <MiniTicket t={ticket} />
            <div className="flex justify-between text-fs-xs font-bold"><span>{picked.length} products transferring</span><span>{money(linesTotal(pickedLines))}</span></div>
            <div className="flex flex-wrap gap-1.5">
              {pickedLines.map((l) => <span key={l.id} className="rounded-pill bg-muted px-2 py-0.5 text-fs-xs">{l.qty} · {l.name}</span>)}
            </div>
            <ArrowDown className="mx-auto size-5 rounded-pill border border-border p-0.5" />
            <p className="text-fs-sm font-bold">To</p>
            {targetTicket ? <MiniTicket t={targetTicket} /> : <p className="rounded-card border border-dashed border-border p-3 text-center text-fs-sm">New Order</p>}
            <Footer>
              <button type="button" className={outline} onClick={() => setStep("target")}>Cancel</button>
              <button type="button" className={solid} onClick={() => {
                const id = transferProducts(ticket.id, picked, target === "new" ? { newOrder: true } : { ticketId: target! });
                const to = targetTicket ? `Order #${targetTicket.orderNo ?? targetTicket.number}${targetTicket.table ? ` on Table ${targetTicket.table}` : ""}` : "a new order";
                finish(id, { title: "Products Transferred", body: `From Order #${ticket.orderNo ?? ticket.number} to ${to}`, lines: pickedLines.map((l) => `${l.qty}x ${l.name}`) });
              }}>Confirm Transfer</button>
            </Footer>
          </div>
        ) : null}

        {step === "table" || step === "move-table" ? (
          <>
            {tablePicker}
            <Footer>
              <button type="button" className={outline} onClick={() => setStep(step === "table" ? "products" : "choice")}>Cancel</button>
              <button type="button" className={solid} disabled={!table} onClick={() => {
                if (step === "move-table") {
                  transferTable(ticket.id, table!);
                  finish(ticket.id, { title: "Table Transferred", body: `Order successfully transferred from Table ${ticket.table} to Table ${table}` });
                } else {
                  const id = transferProducts(ticket.id, picked, { table: table! });
                  toast.success("Products transferred successfully");
                  if (id) onDone?.(id);
                  onClose();
                }
              }}>{step === "table" ? "Select Table" : "Confirm"}</button>
            </Footer>
          </>
        ) : null}

        {step === "done" ? (
          <>
            {result?.lines ? <div className="text-center text-fs-xs text-muted-foreground">{result.lines.map((l) => <p key={l}>{l}</p>)}<p className="mt-2 font-bold text-foreground">Products transferred successfully</p></div> : null}
            <button type="button" className={solid} onClick={onClose}>OK</button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
