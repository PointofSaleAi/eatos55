import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Minus, Plus, Printer } from "lucide-react";
import { GuestHeader } from "@/components/pos/numpad";
import { EmptyState } from "@/components/pos/primitives";
import { TAX_RATE, money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { toast } from "sonner";

export const Route = createFileRoute("/order/review")({
  head: () => ({
    meta: [
      { title: "Order Review — eatOS Point of Purchase" },
      { name: "description", content: "Review the guest order, adjust quantities and charge." },
      { property: "og:title", content: "Order Review — eatOS Point of Purchase" },
      {
        property: "og:description",
        content: "Review the guest order, adjust quantities and charge.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderReview,
});

function OrderReview() {
  const navigate = useNavigate();
  const router = useRouter();
  const { cart, changeQty, totals, tickets } = usePos();
  const orderNumber = tickets.length + 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 bg-surface px-2 pt-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="grid size-11 place-items-center rounded-full text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="truncate text-xl font-extrabold text-foreground">
          Order Number {orderNumber}
        </h1>
      </div>
      <GuestHeader
        right={
          <button
            type="button"
            aria-label="Print order"
            onClick={() => toast.success("Order ticket sent to printer")}
            className="grid size-11 place-items-center rounded-full text-foreground hover:bg-muted"
          >
            <Printer className="size-6" />
          </button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {cart.length ? (
          <div className="divide-y divide-border">
            {cart.map((line) => (
              <div key={line.id} className="flex items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-foreground">{line.name}</p>
                  <p className="text-sm text-muted-foreground">{money(line.price)} each</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove one ${line.name}`}
                    onClick={() => changeQty(line.id, -1)}
                    className="grid size-9 place-items-center rounded-lg border border-border text-foreground"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center text-lg font-bold tabular-nums text-foreground">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one ${line.name}`}
                    onClick={() => changeQty(line.id, 1)}
                    className="grid size-9 place-items-center rounded-lg border border-border text-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="w-20 shrink-0 text-right text-lg font-extrabold tabular-nums text-foreground">
                  {money(line.price * line.qty)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No items yet" detail="Add products or a custom item to continue." />
        )}

        {cart.length ? (
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-base">
            <Row label="Subtotal" value={money(totals.subtotal)} />
            <Row label={`Tax (${Math.round(TAX_RATE * 100)}%)`} value={money(totals.tax)} />
            <div className="flex items-center justify-between pt-2 text-xl font-extrabold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{money(totals.total)}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 space-y-3 border-t border-border bg-surface p-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/order/new" })}
            className="min-h-[52px] flex-1 rounded-xl border border-border text-base font-bold text-foreground"
          >
            Add More
          </button>
          <button
            type="button"
            onClick={() => toast.success("Receipt printed")}
            className="min-h-[52px] flex-1 rounded-xl border border-border text-base font-bold text-foreground"
          >
            Print
          </button>
        </div>
        <button
          type="button"
          disabled={!cart.length}
          onClick={() => navigate({ to: "/payment/method" })}
          className="min-h-[56px] w-full rounded-xl bg-primary text-base font-extrabold uppercase tracking-wide text-primary-foreground disabled:opacity-40"
        >
          Charge {money(totals.total)}
        </button>
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
