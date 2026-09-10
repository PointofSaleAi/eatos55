import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { toast } from "sonner";
import { TenderScreen } from "@/components/pos/tender-screen";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { TipSheet } from "@/components/pos/tip-sheet";
import { useState } from "react";

export const Route = createFileRoute("/payment/card")({
  head: () => ({
    meta: [
      { title: `Pay by Card - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content: "Confirm the amount and capture a card payment on the handheld.",
      },
      { property: "og:title", content: `Pay by Card - ${brand.appName} Point of Sale` },
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
  const { totals, paidSoFar, commitPayment, settings } = usePos();
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);
  const asksTip = settings.askForTip && (settings.tipTenders?.["card-present"] ?? true);
  const [tipOpen, setTipOpen] = useState(asksTip && settings.tipTiming === "Before payment");
  const [tip, setTip] = useState(0);
  const [approvedAmount, setApprovedAmount] = useState<number | null>(null);

  const finish = (amount: number, gratuity: number) => {
    commitPayment("card", amount, {
      tenderId: "card-present",
      ...(gratuity > 0 ? { tip: gratuity } : {}),
    });
    toast.success("Card payment approved");
    navigate({ to: "/payment/success" });
  };

  return (
    <>
    <TenderScreen
      title="Pay by Card"
      due={due + tip}
      initialAmount={due ? String(due + tip) : ""}
      actionLabel={(amount) => `Charge ${money(amount || due + tip)}`}
      onCommit={(amount) => {
        const baseAmount = Math.max(0, amount - tip);
        if (asksTip && settings.tipTiming === "After approval") {
          setApprovedAmount(baseAmount);
          setTipOpen(true);
          return;
        }
        finish(baseAmount, tip);
      }}
    />
      <TipSheet
        open={tipOpen}
        onOpenChange={setTipOpen}
        base={due}
        onConfirm={(amount) => {
          if (approvedAmount !== null) {
            finish(approvedAmount, amount);
            return;
          }
          setTip(amount);
        }}
      />
    </>
  );
}
