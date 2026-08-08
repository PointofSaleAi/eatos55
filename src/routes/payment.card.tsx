import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { TenderScreen } from "@/components/pos/tender-screen";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/card")({
  head: () => ({
    meta: [
      { title: "Pay by Card — eatOS Point of Purchase" },
      {
        name: "description",
        content: "Confirm the amount and capture a card payment on the handheld.",
      },
      { property: "og:title", content: "Pay by Card — eatOS Point of Purchase" },
      {
        property: "og:description",
        content: "Confirm the amount and capture a card payment on the handheld.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PayByCard,
});

function PayByCard() {
  const navigate = useNavigate();
  const { totals, paidSoFar, commitPayment } = usePos();
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  return (
    <TenderScreen
      title="Pay by Card"
      due={due}
      initialAmount={due ? String(due) : ""}
      actionLabel={(amount) => `Charge ${money(amount || due)}`}
      onCommit={(amount) => {
        commitPayment("card", amount);
        toast.success("Card payment approved");
        navigate({ to: "/tickets" });
      }}
    />
  );
}
