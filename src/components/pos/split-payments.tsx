import {
  BadgePercent,
  Minus,
  Plus,
  Printer,
  Receipt as ReceiptIcon,
  Save,
  Split as SplitIcon,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { ReceiptCard, ReceiptRow } from "@/components/pos/receipt";
import { PrintSplitSheet, SplitWithSheet } from "@/components/pos/split-sheets";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export type SplitMode = "standard" | "evenly" | "custom";

const letters = "abcdefghij".split("");
const round2 = (n: number) => Math.round(n * 100) / 100;

export type SplitResult = { mode: SplitMode; checks: number; firstTotal: number };

/**
 * Split Payments overlay: parent check on the left, split modes and the
 * resulting child checks on the right. Standard means "no split" and simply
 * returns to the single check.
 */
export function SplitPayments({
  open = true,
  onClose,
  onProceed,
}: {
  open?: boolean;
  onClose: () => void;
  onProceed?: (result: SplitResult) => void;
}) {
  const { cart, totals, tickets, guest, activeTable, orderDiscountPercent, setOrderDiscountPercent } =
    usePos();
  const checkNumber = tickets.length + 1;

  const [arrivedAt] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  );
  const [mode, setMode] = useState<SplitMode>("standard");
  const [checks, setChecks] = useState<string[]>(["a", "b"]);
  const [assign, setAssign] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);

  const count = checks.length;
  const taxRatio = totals.subtotal ? totals.tax / totals.subtotal : 0;
  const serviceCharge = totals.serviceCharge ?? 0;
  const discount = totals.discount ?? 0;

  const breakdown = useMemo(() => {
    if (mode === "standard") return [];

    if (mode === "evenly") {
      const share = 1 / count;
      return checks.map((letter, i) => {
        const lines = cart.map((l) => ({
          id: l.id,
          name: l.name,
          modifiers: l.modifiers ?? [],
          shareLabel: `${l.qty} / ${count} ea`,
          amount: round2(l.price * l.qty * share),
        }));
        // Rounding remainders land on the last check so children match the parent.
        const evenNet = round2(totals.subtotal * share);
        const net = i === count - 1 ? round2(totals.subtotal - evenNet * (count - 1)) : evenNet;
        const tax = round2(net * taxRatio);
        const svc = round2(serviceCharge * share);
        return {
          letter,
          subtotal: net,
          tax,
          serviceCharge: svc,
          discount: round2(discount * share),
          total: round2(net + tax + svc),
          lines,
        };
      });
    }

    return checks.map((letter) => {
      const lines: {
        id: string;
        name: string;
        modifiers: string[];
        shareLabel: string;
        amount: number;
      }[] = [];
      let net = 0;
      for (const line of cart) {
        const on = assign[line.id] ?? [];
        if (!on.includes(letter)) continue;
        const amount = round2((line.price * line.qty) / on.length);
        net += amount;
        lines.push({
          id: line.id,
          name: line.name,
          modifiers: line.modifiers ?? [],
          shareLabel: on.length > 1 ? `${line.qty} / ${on.length} ea` : `${line.qty} ea`,
          amount,
        });
      }
      net = round2(net);
      const ratio = totals.subtotal ? net / totals.subtotal : 0;
      const tax = round2(net * taxRatio);
      const svc = round2(serviceCharge * ratio);
      return {
        letter,
        subtotal: net,
        tax,
        serviceCharge: svc,
        discount: round2(discount * ratio),
        total: round2(net + tax + svc),
        lines,
      };
    });
  }, [mode, count, checks, cart, assign, totals.subtotal, taxRatio, serviceCharge, discount]);

  const assignedAll = mode !== "custom" || cart.every((l) => (assign[l.id] ?? []).length > 0);
  const canPay = mode !== "standard" && cart.length > 0 && assignedAll;

  const addCheck = () => {
    const next = letters.find((l) => !checks.includes(l));
    if (next) setChecks((c) => [...c, next]);
  };
  const removeCheck = (letter: string) => {
    if (count <= 2) return;
    setChecks((c) => c.filter((l) => l !== letter));
    setAssign((a) => {
      const next: Record<string, string[]> = {};
      for (const [id, on] of Object.entries(a)) next[id] = on.filter((l) => l !== letter);
      return next;
    });
  };

  const modes: { id: SplitMode; label: string; icon: typeof ReceiptIcon }[] = [
    { id: "standard", label: "Standard Check", icon: ReceiptIcon },
    { id: "evenly", label: "Split Evenly", icon: Users },
    { id: "custom", label: "Split Custom", icon: SplitIcon },
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent
        className="flex h-[min(92dvh,54rem)] w-[min(96vw,84rem)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-0 bg-surface p-0"
      >
        <div className="shrink-0 border-b border-border px-4 py-3 pr-14">
          <DialogTitle className="text-center text-fs-xl font-extrabold text-foreground">
            Split Payments
          </DialogTitle>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 lg:flex-row">
          {/* Parent check */}
          <div className="min-h-0 shrink-0 lg:w-[19rem]">
            <div className="hidden h-full min-h-0 lg:block">
              <ReceiptCard className="flex h-full min-h-0 flex-col">
                <ParentReceipt
                  checkNumber={checkNumber}
                  guests={guest.partySize || 1}
                  arrivedAt={arrivedAt}
                  table={activeTable ?? ""}
                />
              </ReceiptCard>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-row bg-muted px-3 py-2 lg:hidden">
              <span className="min-w-0 truncate text-fs-sm font-bold text-foreground">
                Check {checkNumber} · Guests: {guest.partySize || 1}
              </span>
              <span className="shrink-0 text-fs-base font-extrabold tabular-nums text-foreground">
                {money(totals.total)}
              </span>
            </div>
          </div>

          {/* Modes, stepper and child checks */}
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div role="tablist" aria-label="Split mode" className="flex min-w-0 flex-1 flex-wrap gap-2">
                {modes.map((m) => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "flex min-h-tap min-w-0 flex-1 items-center justify-center gap-2 rounded-row border px-3 text-fs-sm font-extrabold transition-colors",
                        active
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-surface text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active && "text-accent")} aria-hidden />
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
              {mode !== "standard" ? (
                <div className="flex shrink-0 items-center gap-1 rounded-row border border-border px-1">
                  <button
                    type="button"
                    aria-label="Fewer checks"
                    disabled={count <= 2}
                    onClick={() => removeCheck(checks[count - 1]!)}
                    className="grid size-10 place-items-center rounded-row text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                  >
                    <Minus className="size-5" />
                  </button>
                  <span className="min-w-6 text-center text-fs-base font-extrabold tabular-nums text-foreground">
                    {count}
                  </span>
                  <button
                    type="button"
                    aria-label="More checks"
                    disabled={count >= letters.length}
                    onClick={addCheck}
                    className="grid size-10 place-items-center rounded-row text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
              ) : null}
            </div>

            {mode === "standard" ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center">
                <p className="text-fs-2xl font-extrabold text-muted-foreground/60">Standard Check</p>
                <p className="mt-2 text-fs-base text-muted-foreground">
                  Select a split option
                  <br />
                  or
                  <br />
                  Close to continue with single check
                </p>
              </div>
            ) : (
              <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1 pt-2">
                <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {breakdown.map((c, i) => (
                    <ReceiptCard
                      key={c.letter}
                      watermark={i + 1}
                      topAction={
                        count > 2 ? (
                          <button
                            type="button"
                            aria-label={`Remove check ${checkNumber} ${c.letter}`}
                            onClick={() => removeCheck(c.letter)}
                            className="grid size-8 place-items-center rounded-pill bg-foreground text-background transition-opacity active:opacity-80"
                          >
                            <X className="size-4" />
                          </button>
                        ) : null
                      }
                    >
                      <p className="text-center text-fs-sm font-extrabold text-foreground">
                        Check {checkNumber} {c.letter}
                      </p>
                      <div className="mt-2 space-y-1 border-t border-dashed border-border pt-2">
                        <ReceiptRow label="TOTAL" value={money(c.total)} strong />
                        <ReceiptRow label="Sub Total" value={money(c.subtotal)} />
                        <ReceiptRow label="TAX" value={`(${money(c.tax)})`} />
                        <ReceiptRow label="Service" value={`(${money(c.serviceCharge)})`} />
                        <ReceiptRow label="Discount" value={`(-${money(c.discount)})`} tone="accent" />
                      </div>
                      {c.lines.length ? (
                        <ul className="mt-2 space-y-1.5 border-t border-dashed border-border pt-2">
                          {c.lines.map((l) => (
                            <li key={l.id} className="flex items-start gap-2">
                              <span className="shrink-0 text-fs-xs font-bold text-muted-foreground">
                                {l.shareLabel}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-fs-sm font-bold text-foreground">
                                  {l.name}
                                </span>
                                {l.modifiers.map((m) => (
                                  <span key={m} className="block text-fs-xs text-muted-foreground">
                                    . {m}
                                  </span>
                                ))}
                              </span>
                              <span className="shrink-0 text-fs-sm font-bold tabular-nums text-foreground">
                                {l.amount.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </ReceiptCard>
                  ))}
                </div>

                {mode === "custom" ? (
                  <div className="mt-5">
                    <p className="text-fs-sm font-extrabold text-foreground">
                      Tap an item to choose its checks
                    </p>
                    <ul className="mt-2 divide-y divide-border rounded-row border border-border">
                      {cart.map((line) => {
                        const on = assign[line.id] ?? [];
                        return (
                          <li key={line.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(line.id);
                                setDraft(on);
                              }}
                              className="flex min-h-tap w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                            >
                              <span className="w-6 shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
                                {line.qty}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-fs-sm font-bold text-foreground">
                                  {line.name}
                                </span>
                                <span
                                  className={cn(
                                    "block text-fs-xs font-bold",
                                    on.length ? "text-accent" : "text-muted-foreground",
                                  )}
                                >
                                  {on.length
                                    ? `Split with ${on.map((l) => `${checkNumber}-${l}`).join(", ")}`
                                    : "Not assigned yet"}
                                </span>
                              </span>
                              <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
                                {money(line.price * line.qty)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            {/* Footer */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border pt-3">
              <IconAction label="Discount" onClick={() => setDiscountOpen(true)}>
                <BadgePercent className="size-5" />
              </IconAction>
              <IconAction label="Card brand" onClick={() => toast.info("Card terminal ready")}>
                <span className="text-fs-lg font-black text-destructive">C</span>
              </IconAction>
              <IconAction label="Print" onClick={() => setPrintOpen(true)}>
                <Printer className="size-5" />
              </IconAction>
              <div className="flex-1" />
              <IconAction
                label="Save split"
                onClick={() => toast.success("Split saved to the order")}
              >
                <Save className="size-5" />
              </IconAction>
              <button
                type="button"
                disabled={!canPay}
                onClick={() => setDisclaimer(true)}
                className="h-ctl-lg min-w-[8rem] rounded-row bg-primary px-6 text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      </DialogContent>

      <DiscountSheet
        open={discountOpen}
        selected={null}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          setOrderDiscountPercent(d.percent);
          setDiscountOpen(false);
          toast.success(`${d.name} applied`);
        }}
      />

      <PrintSplitSheet
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        onPrint={(target) => {
          setPrintOpen(false);
          toast.success(
            target === "parent"
              ? "Parent order sent to the printer"
              : "Child orders sent to the printer",
          );
        }}
      />

      <SplitWithSheet
        open={editing !== null}
        itemName={cart.find((l) => l.id === editing)?.name ?? ""}
        checkLabel={`Check ${checkNumber}`}
        checks={checks}
        selected={draft}
        onToggle={(letter) =>
          setDraft((d) => (d.includes(letter) ? d.filter((x) => x !== letter) : [...d, letter]))
        }
        onClose={() => setEditing(null)}
        onSave={() => {
          if (editing) setAssign((a) => ({ ...a, [editing]: draft }));
          setEditing(null);
        }}
      />

      <Dialog open={disclaimer} onOpenChange={(next) => (next ? null : setDisclaimer(false))}>
        <DialogContent
          hideClose
          className="w-[min(92vw,32rem)] max-w-none rounded-sheet border-0 bg-surface p-6 text-center"
        >
          <DialogTitle className="text-fs-2xl font-extrabold text-foreground">Disclaimer</DialogTitle>
          <p className="text-fs-base text-muted-foreground">
            This check is split, so items cannot be added to it. Remerge and save to add items, or
            start a new order.
          </p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setDisclaimer(false);
                onProceed?.({
                  mode,
                  checks: count,
                  firstTotal: breakdown[0]?.total ?? 0,
                });
              }}
              className="h-ctl-lg min-w-[8rem] rounded-row bg-primary px-6 text-fs-base font-extrabold text-primary-foreground"
            >
              Proceed
            </button>
            <button
              type="button"
              onClick={() => setDisclaimer(false)}
              className="h-ctl-lg min-w-[8rem] rounded-row bg-muted px-6 text-fs-base font-extrabold text-foreground"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {orderDiscountPercent ? (
        <span className="sr-only">Discount {orderDiscountPercent}% applied</span>
      ) : null}
    </Dialog>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-12 shrink-0 place-items-center rounded-row border border-border text-foreground transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}

function ParentReceipt({
  checkNumber,
  guests,
  arrivedAt,
  table,
}: {
  checkNumber: number;
  guests: number;
  arrivedAt: string;
  table: string;
}) {
  const { cart, totals } = usePos();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-3 -mt-3 bg-muted px-3 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-fs-lg font-extrabold text-foreground">Check {checkNumber}</span>
          <span className="text-fs-base font-extrabold text-foreground">Guests: {guests}</span>
        </div>
        <div className="mt-1 flex items-end justify-between gap-2 text-fs-xs font-bold uppercase text-muted-foreground">
          <span>
            Arrived at
            <br />
            {arrivedAt}
          </span>
          <span className="normal-case">Table: {table}</span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-fs-lg font-extrabold text-foreground">TOTAL</span>
        <span className="text-fs-lg font-extrabold tabular-nums text-foreground">
          {money(totals.total)}
        </span>
      </div>
      <div className="mt-2 space-y-1 border-t border-border pt-2">
        <ReceiptRow label="Sub Total" value={money(totals.subtotal)} />
        <ReceiptRow label="TAX" value={`(${money(totals.tax)})`} />
        <ReceiptRow
          label="Service Charge (CC Fee)"
          value={`(${money(totals.serviceCharge ?? 0)})`}
        />
      </div>
      <ul className="no-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto border-t border-border pt-3">
        {cart.map((line) => (
          <li key={line.id} className="flex items-start gap-2">
            <span className="shrink-0 text-fs-xs font-bold text-muted-foreground">
              {line.qty} ea
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-fs-sm font-bold text-foreground">{line.name}</span>
              {(line.modifiers ?? []).map((m) => (
                <span key={m} className="block text-fs-xs text-muted-foreground">
                  . {m}
                </span>
              ))}
            </span>
            <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
              {money(line.price * line.qty)}
            </span>
          </li>
        ))}
        {cart.length ? null : (
          <li className="text-center text-fs-sm text-muted-foreground">
            There is nothing on this order yet.
          </li>
        )}
      </ul>
    </div>
  );
}
