import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { brand } from "@/lib/brand";
import { employees, money, statusMeta } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";
import { NumPad } from "@/components/pos/numpad";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/access/clock-out")({
  head: () => ({
    meta: [
      { title: `Close Checks to Clock Out - ${brand.appName}` },
      { name: "description", content: "Charge, transfer, tip and close your checks before clocking out." },
      { property: "og:title", content: `Close Checks to Clock Out - ${brand.appName}` },
      { property: "og:description", content: "Charge, transfer, tip and close your checks before clocking out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClockOut,
});

type Tab = "unpaid" | "open";

function ClockOut() {
  const navigate = useNavigate();
  const { tickets, session, clockOut, openTicket, transferTickets, closeTickets, addTip } = usePos();
  const mine = tickets.filter((t) => t.server === session.name && !t.closed);
  const unpaid = mine.filter((t) => t.status !== "paid");
  const open = mine.filter((t) => t.status === "paid");
  const [tab, setTab] = useState<Tab>(unpaid.length ? "unpaid" : "open");
  const [sel, setSel] = useState<string[]>([]);
  const [tipFor, setTipFor] = useState<string | null>(null);
  const [tipAmt, setTipAmt] = useState("");
  const [xferOpen, setXferOpen] = useState(false);
  const list = tab === "unpaid" ? unpaid : open;
  const others = useMemo(() => employees.filter((e) => e.name !== session.name), [session.name]);
  const one = sel.length === 1 ? list.find((t) => t.id === sel[0]) : undefined;

  const switchTab = (t: Tab) => {
    setTab(t);
    setSel([]);
    setTipFor(null);
  };
  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const btn = "min-h-ctl-lg flex-1 rounded-row px-4 text-fs-sm font-extrabold uppercase transition-opacity disabled:opacity-40";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate({ to: "/access/clock-in" })}
            className="grid size-10 shrink-0 place-items-center rounded-pill bg-muted text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-fs-lg font-extrabold text-foreground">Close checks to clock out</h1>
            <p className="text-fs-xs font-bold text-muted-foreground">
              {mine.length} check{mine.length === 1 ? "" : "s"} remaining
            </p>
          </div>
        </div>
        <div className="mx-auto mt-3 grid w-full max-w-3xl grid-cols-2 gap-1 rounded-pill bg-muted p-1">
          {(["unpaid", "open"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={cn(
                "min-h-ctl-md rounded-pill text-fs-sm font-extrabold",
                tab === t ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {t === "unpaid" ? `Unpaid (${unpaid.length})` : `Open (${open.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mx-auto w-full max-w-3xl space-y-2">
          {list.length === 0 ? (
            <p className="py-10 text-center text-fs-sm font-bold text-muted-foreground">
              No {tab} checks left.
            </p>
          ) : (
            list.map((t) => {
              const on = sel.includes(t.id);
              return (
                <div key={t.id} className={cn("rounded-card border bg-surface", on ? "border-accent" : "border-border")}>
                  <button
                    type="button"
                    onClick={() => toggle(t.id)}
                    className="flex w-full items-center gap-3 p-3 text-left"
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-md border-2",
                        on ? "border-accent bg-accent text-accent-foreground" : "border-border",
                      )}
                    >
                      {on ? <Check className="size-4" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-fs-sm font-extrabold text-foreground">
                        #{t.orderNo ?? t.number} · {t.table ? `Table ${t.table}` : "Guest"}
                      </span>
                      <span className="block truncate text-fs-xs font-bold text-muted-foreground">
                        {t.arrivedAt}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-fs-sm font-extrabold tabular-nums text-foreground">{money(t.total)}</span>
                      {t.tips ? (
                        <span className="block text-fs-xs font-extrabold text-tile-green">Tip {money(t.tips)}</span>
                      ) : (
                        <span className="block text-fs-xs font-bold text-muted-foreground">
                          {tab === "open" ? "Open" : statusMeta[t.status].label}
                        </span>
                      )}
                    </span>
                  </button>
                  {tipFor === t.id ? (
                    <div className="border-t border-border p-3">
                      <div className="mb-2 rounded-row bg-muted px-3 py-2 text-right text-fs-xl font-extrabold tabular-nums text-foreground">
                        {money(Number(tipAmt || 0))}
                      </div>
                      <NumPad
                        className="h-56"
                        onDigit={(d) => setTipAmt((a) => (d === "." && a.includes(".") ? a : (a + d).slice(0, 7)))}
                        onBackspace={() => setTipAmt((a) => a.slice(0, -1))}
                      />
                      <div className="mt-2 flex gap-2">
                        <button type="button" className={cn(btn, "bg-muted text-foreground")} onClick={() => setTipFor(null)}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!Number(tipAmt)}
                          className={cn(btn, "bg-accent text-accent-foreground")}
                          onClick={() => {
                            addTip(t.id, Math.round(Number(tipAmt) * 100) / 100);
                            setTipFor(null);
                            toast.success("Tip added");
                          }}
                        >
                          Add Tip
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
        <div className="mx-auto flex w-full max-w-3xl gap-2">
          {sel.length === 0 ? (
            <button
              type="button"
              disabled={mine.length > 0}
              className={cn(btn, "bg-destructive text-destructive-foreground")}
              onClick={() => {
                clockOut();
                toast.success("Clocked out");
                navigate({ to: "/access/clock-in" });
              }}
            >
              {mine.length ? "Close all checks to clock out" : "Clock Out"}
            </button>
          ) : tab === "unpaid" ? (
            <>
              {one ? (
                <button
                  type="button"
                  className={cn(btn, "bg-accent text-accent-foreground")}
                  onClick={() => {
                    sessionStorage.setItem("pos:return-clock-out", "1");
                    openTicket(one.id);
                    navigate({ to: "/payment/method" });
                  }}
                >
                  Charge {money(one.total)}
                </button>
              ) : null}
              <Popover open={xferOpen} onOpenChange={setXferOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className={cn(btn, "bg-foreground text-background")}>
                    Transfer{sel.length > 1 ? ` (${sel.length})` : ""}
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-64 p-1">
                  <p className="px-3 py-2 text-fs-xs font-bold uppercase text-muted-foreground">Transfer to</p>
                  {others.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        transferTickets(sel, e.name);
                        toast.success(`${sel.length} check${sel.length > 1 ? "s" : ""} transferred to ${e.name}`);
                        setSel([]);
                        setXferOpen(false);
                      }}
                      className="flex w-full flex-col rounded-row px-3 py-2 text-left hover:bg-muted"
                    >
                      <span className="text-fs-sm font-extrabold text-foreground">{e.name}</span>
                      <span className="text-fs-xs text-muted-foreground">{e.role}</span>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <>
              {one && !one.tips ? (
                <button
                  type="button"
                  className={cn(btn, "bg-muted text-foreground")}
                  onClick={() => {
                    setTipAmt("");
                    setTipFor(one.id);
                  }}
                >
                  Add Tip
                </button>
              ) : null}
              <button
                type="button"
                className={cn(btn, "bg-accent text-accent-foreground")}
                onClick={() => {
                  closeTickets(sel);
                  toast.success(`${sel.length} check${sel.length > 1 ? "s" : ""} closed`);
                  setSel([]);
                  setTipFor(null);
                }}
              >
                Close Check{sel.length > 1 ? `s (${sel.length})` : ""}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
