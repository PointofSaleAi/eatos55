import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Printer } from "lucide-react";
import { BackButton } from "@/components/pos/shell";
import { GuestBlock } from "@/components/pos/guest-block";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { EmptyState } from "@/components/pos/primitives";
import { TAX_RATE, money } from "@/lib/demo-data";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { useAnnounce } from "@/components/pos/live-region";
import { haptic } from "@/lib/haptics";
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
  const { cart, changeQty, totals, tickets } = usePos();
  const confirm = useConfirm();
  const announce = useAnnounce();
  const orderNumber = tickets.length + 1;
  const [guestOpen, setGuestOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 bg-surface px-2 pt-3">
        <BackButton fallbackTo="/order/new" label="Back to order" />
        <h1 className="truncate text-fs-xl font-extrabold text-foreground">
          Order Number {orderNumber}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <GuestBlock onEdit={() => setGuestOpen(true)} />
        {(
          <button
            type="button"
            aria-label="Print order"
            onClick={() => toast.success("Order ticket sent to printer")}
            className="grid size-11 place-items-center rounded-pill text-foreground hover:bg-muted"
          >
            <Printer className="size-6" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {cart.length ? (
          <div className="divide-y divide-border">
            {cart.map((line) => (
              <div key={line.id} className="flex items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-fs-sm font-bold text-foreground">{line.name}</p>
                  <p className="text-fs-sm text-muted-foreground">{money(line.price)} each</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove one ${line.name}`}
                    onClick={() => {
                      if (line.qty <= 1) {
                        void (async () => {
                          const ok = await confirm({
                            title: `Remove ${line.name}?`,
                            message: "The line is taken off this order.",
                            confirmLabel: "Remove item",
                            destructive: true,
                          });
                          if (ok) {
                            changeQty(line.id, -1);
                            announce(`${line.name} removed`);
                          }
                        })();
                        return;
                      }
                      haptic("light");
                      changeQty(line.id, -1);
                      announce(`${line.name} quantity ${line.qty - 1}`);
                    }}
                    className="grid size-9 tap-safe place-items-center rounded-row border border-border text-foreground"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center text-fs-sm font-bold tabular-nums text-foreground">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one ${line.name}`}
                    onClick={() => {
                      haptic("light");
                      changeQty(line.id, 1);
                      announce(`${line.name} quantity ${line.qty + 1}`);
                    }}
                    className="grid size-9 tap-safe place-items-center rounded-row border border-border text-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="w-20 shrink-0 text-right text-fs-sm font-extrabold tabular-nums text-foreground">
                  {money(line.price * line.qty)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No items yet"
            detail="Add products or a custom item to continue."
            action={{ label: "Browse menu", onPress: () => navigate({ to: "/order/new" }) }}
          />
        )}

        {cart.length ? (
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-fs-sm">
            <Row label="Subtotal" value={money(totals.subtotal)} />
            <Row label={`Tax (${Math.round(TAX_RATE * 100)}%)`} value={money(totals.tax)} />
            <div className="flex items-center justify-between pt-2 text-fs-lg font-extrabold text-foreground">
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
            className="min-h-ctl-lg flex-1 rounded-card border border-border text-fs-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Add More
          </button>
          <button
            type="button"
            onClick={() => toast.success("Receipt printed")}
            className="min-h-ctl-lg flex-1 rounded-card border border-border text-fs-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Print
          </button>
        </div>
        <button
          type="button"
          disabled={!cart.length}
          onClick={() => navigate({ to: "/payment/method" })}
          className="h-12 w-full rounded-pill bg-accent text-fs-base font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40"
        >
          Charge {money(totals.total)}
        </button>
      </div>
      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
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
