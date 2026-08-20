import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PaymentCompleteCard } from "@/components/pos/payment-complete-dialog";

export const Route = createFileRoute("/payment/success")({
  head: () => ({
    meta: [
      { title: "Payment Successful - eatOS Point of Sale" },
      {
        name: "description",
        content: "Payment confirmation with change due, receipt sharing and printing options.",
      },
      { property: "og:title", content: "Payment Successful - eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Payment confirmation with change due, receipt sharing and printing options.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-background p-3">
      <div className="max-h-full w-full max-w-[40rem] overflow-hidden rounded-sheet bg-surface">
        <PaymentCompleteCard onDone={() => navigate({ to: "/order/new" })} />
      </div>
    </div>
  );
}
