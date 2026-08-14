import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CreditCard,
  Heart,
  Landmark,
  MoreHorizontal,
  QrCode,
  Split,
  Ticket as TicketIcon,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/pos/shell";
import { TAX_RATE, money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/method")({
  head: () => ({
    meta: [
      { title: "Select Payment Method — eatOS Point of Sale" },
      {
        name: "description",
        content: "Review the order and choose card, cash, gift card, loyalty, QR or split payment.",
      },
      { property: "og:title", content: "Select Payment Method — eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Review the order and choose card, cash, gift card, loyalty, QR or split payment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentMethod,
});

function PaymentMethod() {
  const navigate = useNavigate();
  const { cart, totals, tickets, guest, orderType, activeTable, paidSoFar } = usePos();
  const orderNumber = tickets.length + 1;
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);
  const nothingToPay = cart.length === 0;

  useEffect(() => {
    if (!nothingToPay) return;
    toast.info("Add items to the order before tendering");
    navigate({ to: "/order/new" });
  }, [nothingToPay, navigate]);

  const tenders = [
    { id: "card", label: "Card", icon: CreditCard, onPick: () => navigate({ to: "/payment/card" }) },
    { id: "cash", label: "Cash", icon: Wallet, onPick: () => navigate({ to: "/payment/cash" }) },
    {
      id: "loyalty",
      label: "Loyalty",
      icon: Heart,
      onPick: () => toast.info("Scan the guest loyalty card"),
    },
    {
      id: "qr",
      label: "QR Code",
      icon: QrCode,
      onPick: () => toast.info("QR code shown on the guest display"),
    },
    {
      id: "gift",
      label: "Gift Card",
      icon: TicketIcon,
      onPick: () => navigate({ to: "/payment/tender/$kind", params: { kind: "gift" } }),
    },
    {
      id: "split",
      label: "Split",
      icon: Split,
      onPick: () => navigate({ to: "/payment/split" }),
    },
    {
      id: "house",
      label: "House",
      icon: Landmark,
      onPick: () => navigate({ to: "/payment/tender/$kind", params: { kind: "house" } }),
    },
    {
      id: "other",
      label: "Other",
      icon: MoreHorizontal,
      onPick: () => navigate({ to: "/payment/tender/$kind", params: { kind: "other" } }),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-2 py-3">
        <BackButton fallbackTo="/order/review" label="Back to order review" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-fs-xl font-extrabold text-foreground">Payment</h1>
          <p className="truncate text-fs-xs text-muted-foreground">
            Order {orderNumber} · {guest.name || activeTable || "Guest"} · {orderType}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {cart.length ? (
          <>
            <div className="divide-y divide-border">
              {cart.map((line) => (
                <div key={line.id} className="flex items-center gap-3 py-3">
                  <span className="w-7 shrink-0 text-fs-sm font-extrabold tabular-nums text-muted-foreground">
                    {line.qty}×
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-fs-sm font-bold text-foreground">{line.name}</p>
                    <p className="text-fs-xs text-muted-foreground">{money(line.price)} each</p>
                  </div>
                  <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
                    {money(line.price * line.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-fs-sm">
              <Row label="Subtotal" value={money(totals.subtotal)} />
              <Row label={`Tax (${Math.round(TAX_RATE * 100)}%)`} value={money(totals.tax)} />
              {totals.serviceCharge ? (
                <Row label="Service charge" value={money(totals.serviceCharge)} />
              ) : null}
              {totals.discount ? <Row label="Discount" value={`-${money(totals.discount)}`} /> : null}
              <div className="flex items-center justify-between pt-1.5 text-fs-base font-extrabold text-foreground">
                <span>Total</span>
                <span className="tabular-nums">{money(totals.total)}</span>
              </div>
              {paidSoFar > 0 ? (
                <>
                  <Row label="Paid so far" value={money(paidSoFar)} />
                  <div className="flex items-center justify-between text-fs-base font-extrabold text-accent">
                    <span>Balance due</span>
                    <span className="tabular-nums">{money(due)}</span>
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <div className="shrink-0 rounded-t-sheet border-t border-border bg-surface px-3 pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-4">
        <p className="text-center text-fs-lg font-extrabold text-foreground">Select Payment Method</p>
        <p className="pb-3 text-center text-fs-sm text-muted-foreground">
          Total due <span className="tap-safe font-extrabold text-foreground">{money(due)}</span>
        </p>
        <div className="grid grid-cols-4 gap-x-2 gap-y-3">
          {tenders.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!cart.length}
                onClick={t.onPick}
                className="flex flex-col items-center gap-1.5 disabled:opacity-40"
              >
                <span className="grid size-14 place-items-center rounded-pill border border-border bg-muted/50 text-foreground transition-colors active:bg-muted">
                  <Icon className="size-6" />
                </span>
                <span className="text-center text-fs-xs font-medium text-foreground">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
