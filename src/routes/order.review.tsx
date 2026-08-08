import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card, EmptyState, SectionLabel } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/order/review")({
  head: () => ({
    meta: [
      { title: "Order review — EATOS Handheld" },
      { name: "description", content: "Review the cart, adjust quantities and send to payment." },
      { property: "og:title", content: "Order review — EATOS Handheld" },
      { property: "og:description", content: "Review the cart, adjust quantities and send to payment." },
    ],
  }),
  component: OrderReview,
});

function OrderReview() {
  const navigate = useNavigate();
  const { cart, setQty, removeLine, totals } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Order" title="Order review" back />
      <ScreenBody>
        {cart.length === 0 ? (
          <EmptyState title="Cart is empty" detail="Add items from the menu to continue." />
        ) : (
          <>
            <SectionLabel>Items</SectionLabel>
            <Card className="overflow-hidden">
              {cart.map((l) => (
                <div key={l.id} className="border-b border-border p-3 last:border-b-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-foreground">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{money(l.price)} each</p>
                    </div>
                    <p className="shrink-0 text-sm font-extrabold text-foreground">
                      {money(l.price * l.qty)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(l.id, l.qty - 1)}
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-muted"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-extrabold tabular-nums">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(l.id, l.qty + 1)}
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-muted"
                    >
                      <Plus className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeLine(l.id)}
                      className="ml-auto grid size-9 shrink-0 place-items-center rounded-full bg-muted text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>

            <SectionLabel>Totals</SectionLabel>
            <Card className="space-y-2 p-4 text-sm">
              <Row label="Subtotal" value={money(totals.subtotal)} />
              <Row label="Tax" value={money(totals.tax)} />
              <div className="border-t border-border pt-2">
                <Row label="Total due" value={money(totals.total)} strong />
              </div>
            </Card>
          </>
        )}
      </ScreenBody>
      <ScreenFooter>
        <Button
          disabled={cart.length === 0}
          className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          onClick={() => navigate({ to: "/payment/method" })}
        >
          Charge {money(totals.total)}
        </Button>
      </ScreenFooter>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-extrabold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={
          strong ? "text-lg font-extrabold text-foreground" : "font-bold text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
