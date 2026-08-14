import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgePercent,
  Minus,
  Plus,
  Printer,
  Receipt,
  Save,
  Split as SplitIcon,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { ReceiptCard, ReceiptRow } from "@/components/pos/receipt";
import { BackButton } from "@/components/pos/shell";
import { PrintSplitSheet, SplitWithSheet } from "@/components/pos/split-sheets";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payment/split")({
  head: () => ({
    meta: [
      { title: "Split Check - eatOS Point of Sale" },
      {
        name: "description",
        content:
          "Split a check evenly or item by item, review each child check and take payment on the handheld.",
      },
      { property: "og:title", content: "Split Check - eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Split a check evenly or item by item and take payment on the handheld.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SplitCheck,
});

type Mode = "standard" | "evenly" | "custom";

const letters = "abcdefghij".split("");

function SplitCheck() {
  const navigate = useNavigate();
  const {
    cart,
    totals,
    tickets,
    orderDiscountPercent,
    setOrderDiscountPercent,
  } = usePos();
  const checkNumber = tickets.length + 1;

  const [mode, setMode] = useState<Mode>("standard");
  const [count, setCount] = useState(2);
  const [assign, setAssign] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  const checks = letters.slice(0, count);
  const taxRatio = totals.subtotal ? totals.tax / totals.subtotal : 0;

  /** Per-check totals plus the item lines that make them up. */
  const breakdown = useMemo(() => {
    if (mode === "standard") return [];
    const money2 = (n: number) => Math.round(n * 100) / 100;

    if (mode === "evenly") {
      const share = 1 / count;
      return checks.map((letter, i) => {
        const lines = cart.map((l) => ({
          id: l.id,
          name: l.name,
          modifiers: l.modifiers ?? [],
          shareLabel: `${l.qty} / ${count} ea`,
          amount: money2((l.price * l.qty) * share),
        }));
        let net = money2(totals.subtotal * share);
        if (i === count - 1) net = money2(totals.subtotal - money2(totals.subtotal * share) * (count - 1));
        const tax = money2(net * taxRatio);
        return {
          letter,
          items: cart.reduce((n, l) => n + l.qty, 0),
          subtotal: net,
          tax,
          serviceCharge: money2((totals.serviceCharge ?? 0) * share),
          discount: money2((totals.discount ?? 0) * share),
          total: money2(net + tax + (totals.serviceCharge ?? 0) * share),
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
      let items = 0;
      for (const line of cart) {
        const on = assign[line.id] ?? [];
        if (!on.includes(letter)) continue;
        const amount = money2((line.price * line.qty) / on.length);
        net += amount;
        items += line.qty / on.length;
        lines.push({
          id: line.id,
          name: line.name,
          modifiers: line.modifiers ?? [],
          shareLabel: on.length > 1 ? `${line.qty} / ${on.length} ea` : `${line.qty} ea`,
          amount,
        });
      }
      const tax = money2(net * taxRatio);
      return {
        letter,
        items: money2(items),
        subtotal: money2(net),
        tax,
        serviceCharge: 0,
        discount: 0,
        total: money2(net + tax),
        lines,
      };
    });
  }, [
    mode,
    count,
    cart,
    assign,
    totals.subtotal,
    totals.serviceCharge,
    totals.discount,
    taxRatio,
    checks,
  ]);

  const assignedAll =
    mode !== "custom" || cart.every((l) => (assign[l.id] ?? []).length > 0);
  const canPay = cart.length > 0 && assignedAll;

  const modes: { id: Mode; label: string; icon: typeof Receipt }[] = [
    { id: "standard", label: "Standard Check", icon: Receipt },
    { id: "evenly", label: "Split Evenly", icon: Users },
    { id: "custom", label: "Split Custom", icon: SplitIcon },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-surface px-2 py-3">
        <BackButton fallbackTo="/payment/method" label="Back to payment methods" />
        <h1 className="min-w-0 flex-1 truncate text-fs-xl font-extrabold text-foreground">
          Split Check
        </h1>
        <button
          type="button"
          aria-label="Apply a discount"
          title="Discount"
          onClick={() => setDiscountOpen(true)}
          className="grid size-11 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
        >
          <BadgePercent className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Print checks"
          title="Print"
          onClick={() => setPrintOpen(true)}
          className="grid size-11 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
        >
          <Printer className="size-5" />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Split mode"
        className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-border bg-surface px-3 py-2"
      >
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
                "flex min-h-tap shrink-0 items-center gap-2 rounded-row px-4 text-fs-sm font-extrabold uppercase tracking-[0.04em] transition-colors",
                active
                  ? "border border-foreground/70 bg-secondary text-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {m.label}
            </button>
          );
        })}
      </div>

      {mode !== "standard" ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
          <span className="min-w-0 truncate text-fs-base font-extrabold text-foreground">
            Number of Checks
          </span>
          <div className="flex shrink-0 items-center gap-1 rounded-pill bg-primary px-2 py-1 text-primary-foreground">
            <button
              type="button"
              aria-label="Fewer checks"
              disabled={count <= 2}
              onClick={() => setCount((c) => Math.max(2, c - 1))}
              className="grid size-9 place-items-center rounded-pill disabled:opacity-40"
            >
              <Minus className="size-5" />
            </button>
            <span className="min-w-6 text-center text-fs-base font-extrabold tabular-nums">
              {count}
            </span>
            <button
              type="button"
              aria-label="More checks"
              disabled={count >= letters.length}
              onClick={() => setCount((c) => Math.min(letters.length, c + 1))}
              className="grid size-9 place-items-center rounded-pill disabled:opacity-40"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {cart.length ? (
          <div className="divide-y divide-border">
            {cart.map((line) => {
              const on = assign[line.id] ?? [];
              const row = (
                <>
                  <span className="w-6 shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
                    {line.qty}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-fs-sm font-bold text-foreground">{line.name}</span>
                    {line.modifiers?.map((m) => (
                      <span key={m} className="block text-fs-xs text-muted-foreground">
                        - {m}
                      </span>
                    ))}
                    {mode === "custom" && on.length ? (
                      <span className="mt-0.5 block text-fs-xs font-bold text-accent">
                        Split with {on.map((l) => `${checkNumber}-${l}`).join(", ")}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
                    {money(line.price * line.qty)}
                  </span>
                </>
              );
              return mode === "custom" ? (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => {
                    setEditing(line.id);
                    setDraft(on);
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  {row}
                </button>
              ) : (
                <div key={line.id} className="flex items-start gap-3 px-4 py-3">
                  {row}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-8 text-center text-fs-sm text-muted-foreground">
            There is nothing on this order to split yet.
          </p>
        )}

        <div className="space-y-1.5 border-t border-border px-4 py-3 text-fs-sm">
          <SumRow label="Sub Total" value={money(totals.subtotal)} />
          <SumRow label="Tax" value={money(totals.tax)} />
          <div className="flex items-center justify-between border-t border-border pt-2 text-fs-base font-extrabold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{money(totals.total)}</span>
          </div>
        </div>

        {breakdown.length ? (
          <div className="grid grid-cols-1 gap-x-3 gap-y-5 px-4 pb-6 sm:grid-cols-2 xl:grid-cols-3">
            {breakdown.map((c, i) => (
              <ReceiptCard
                key={c.letter}
                watermark={i + 1}
                topAction={
                  count > 2 ? (
                    <button
                      type="button"
                      aria-label={`Remove check ${checkNumber} ${c.letter}`}
                      onClick={() => setCount((n) => Math.max(2, n - 1))}
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
                  <ReceiptRow label="Service Charge" value={`(${money(c.serviceCharge)})`} />
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
                              - {m}
                            </span>
                          ))}
                        </span>
                        <span className="shrink-0 text-fs-sm font-bold tabular-nums text-foreground">
                          {l.amount.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 border-t border-dashed border-border pt-2 text-center text-fs-xs text-muted-foreground">
                    No items assigned yet
                  </p>
                )}
              </ReceiptCard>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-surface px-3 pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-3">
        <button
          type="button"
          aria-label="Save split"
          title="Save split"
          onClick={() => toast.success("Split saved to the order")}
          className="grid size-12 shrink-0 place-items-center rounded-row bg-muted text-foreground transition-colors hover:bg-secondary"
        >
          <Save className="size-5" />
        </button>
        <button
          type="button"
          disabled={!canPay}
          onClick={() => {
            if (mode === "standard") {
              navigate({ to: "/payment/method" });
              return;
            }
            const first = breakdown[0];
            toast.info(
              first
                ? `Check ${checkNumber}-${first.letter} · ${money(first.total)} - choose a tender`
                : "Choose a tender",
            );
            navigate({ to: "/payment/method" });
          }}
          className="h-12 min-w-0 flex-1 rounded-row bg-primary text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
        >
          Pay
        </button>
      </div>

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
            target === "parent" ? "Parent order sent to the printer" : "Child orders sent to the printer",
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

      {orderDiscountPercent ? (
        <span className="sr-only">Discount {orderDiscountPercent}% applied</span>
      ) : null}
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
