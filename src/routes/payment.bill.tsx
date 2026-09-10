import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { PaymentBill } from "@/components/pos/payment-bill";
import { BackButton, useWideLayout } from "@/components/pos/shell";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { useEffect } from "react";

export const Route = createFileRoute("/payment/bill")({
  head: () => ({
    meta: [
      { title: `Review the Bill - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content: "Check the order total, tax and every line item before choosing a payment method.",
      },
      { property: "og:title", content: `Review the Bill - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Check the order total, tax and line items before choosing a payment method.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentBillStep,
});

/**
 * Phone step 1: the bill on its own screen. Tablet and desktop show the bill
 * beside the tenders, so this step hands straight over to the method screen.
 */
function PaymentBillStep() {
  const navigate = useNavigate();
  const wide = useWideLayout();
  const { cart, totals, tickets, guest, orderType, activeTable, tableGroupLabel, paidSoFar } =
    usePos();
  const orderNumber = tickets.length + 1;
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  useEffect(() => {
    if (wide) void navigate({ to: "/payment/method", replace: true });
  }, [wide, navigate]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-surface px-2 py-3">
        <BackButton fallbackTo="/order/new" label="Back to order" />
        <div className="min-w-0">
          <h1 className="truncate text-fs-xl font-extrabold text-foreground">
            Total Due <span className="text-accent">{money(due)}</span>
          </h1>
          <p className="truncate text-fs-xs text-muted-foreground">
            Order {orderNumber} · {guest.name || tableGroupLabel(activeTable) || "Guest"} ·{" "}
            {orderType}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--pad-screen)] py-3">
        <PaymentBill />
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-[var(--pad-screen)] pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-3">
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => navigate({ to: "/payment/method", search: { methods: 1 } })}
          className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
        >
          Continue to payment
        </button>
      </div>
    </div>
  );
}
