import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { TenderScreen } from "@/components/pos/tender-screen";
import { money } from "@/lib/demo-data";
import { useAnnounce } from "@/components/pos/live-region";
import { haptic } from "@/lib/haptics";
import { type TenderMethod, usePos } from "@/lib/pos-store";

const kinds: Record<
  string,
  { title: string; method: TenderMethod; half?: boolean; success: string }
> = {
  gift: { title: "Gift Card", method: "gift", success: "Gift card applied" },
  house: { title: "House Account", method: "house", success: "Charged to house account" },
  split: { title: "Split Payment", method: "split", half: true, success: "Split payment applied" },
  other: { title: "Other Tender", method: "other", success: "Payment recorded" },
};

export const Route = createFileRoute("/payment/tender/$kind")({
  head: () => ({
    meta: [
      { title: "Tender Amount - eatOS Point of Sale" },
      { name: "description", content: "Enter the amount to tender for this payment method." },
      { property: "og:title", content: "Tender Amount - eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Enter the amount to tender for this payment method.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TenderRoute,
});

function TenderRoute() {
  const { kind } = useParams({ from: "/payment/tender/$kind" });
  const navigate = useNavigate();
  const { totals, paidSoFar, commitPayment, addPartialPayment } = usePos();
  const announce = useAnnounce();
  const cfg = kinds[kind] ?? {
    title: "Other Tender",
    method: "other" as TenderMethod,
    success: "Payment recorded",
  };

  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  return (
    <TenderScreen
      title={cfg.title}
      due={due}
      initialAmount={cfg.half && due ? String(Math.round((due / 2) * 100) / 100) : ""}
      actionLabel={(amount) =>
        amount > 0 && amount < due ? `Pay ${money(amount)} of ${money(due)}` : `Charge ${money(amount || due)}`
      }
      onCommit={(amount, notes) => {
        if (amount < due) {
          haptic("medium");
          announce(`Partial payment applied`);
          addPartialPayment(amount);
          toast.success(`${cfg.success} · ${money(due - amount)} remaining`);
          navigate({ to: "/payment/method" });
          return;
        }
        haptic("success");
        announce("Payment complete");
        commitPayment(cfg.method, amount, notes ? { notes } : undefined);
        toast.success(cfg.success);
        navigate({ to: "/payment/success" });
      }}
    />
  );
}
