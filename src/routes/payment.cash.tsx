import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { toast } from "sonner";
import { TenderScreen } from "@/components/pos/tender-screen";
import { money } from "@/lib/demo-data";
import { useAnnounce } from "@/components/pos/live-region";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { TipSheet } from "@/components/pos/tip-sheet";
import { useState } from "react";

export const Route = createFileRoute("/payment/cash")({
  head: () => ({
    meta: [
      { title: `Pay by Cash - ${brand.appName} Point of Sale` },
      { name: "description", content: "Enter cash received and calculate the change due." },
      { property: "og:title", content: `Pay by Cash - ${brand.appName} Point of Sale` },
      { property: "og:description", content: "Enter cash received and calculate the change due." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PayByCash,
});

function PayByCash() {
  const navigate = useNavigate();
  const { totals, paidSoFar, commitPayment, settings } = usePos();
  const announce = useAnnounce();
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);
  const asksTip = settings.askForTip && Boolean(settings.tipTenders?.cash);
  const [tipOpen, setTipOpen] = useState(asksTip && settings.tipTiming === "Before payment");
  const [tip, setTip] = useState(0);
  const [approved, setApproved] = useState<{ amount: number; notes?: Record<number, number> } | null>(null);

  const finish = (amount: number, gratuity: number, notes?: Record<number, number>) => {
    haptic("success");
    announce("Payment complete");
    commitPayment("cash", Math.max(0, amount - gratuity), {
      tenderId: "cash",
      ...(gratuity > 0 ? { tip: gratuity } : {}),
      ...(notes ? { notes } : {}),
    });
    const change = Math.round((amount - (due + gratuity)) * 100) / 100;
    toast.success(change > 0 ? `Paid · change due ${money(change)}` : "Paid in full with cash");
    navigate({ to: "/payment/success" });
  };

  return (
    <>
    <TenderScreen
      title="Pay by Cash"
      due={due + tip}
      denominations
      actionLabel={(amount) => `Charge ${money(amount || due + tip)}`}
      onCommit={(amount, notes) => {
        if (amount < due + tip) {
          toast.error(`Short ${money(due + tip - amount)} - enter the full amount`);
          return;
        }
        if (asksTip && settings.tipTiming === "After approval") {
          setApproved({ amount, ...(notes ? { notes } : {}) });
          setTipOpen(true);
          return;
        }
        finish(amount, tip, notes);
      }}
    />
      <TipSheet
        open={tipOpen}
        onOpenChange={setTipOpen}
        base={due}
        onConfirm={(amount) => {
          if (approved) {
            finish(approved.amount, amount, approved.notes);
            return;
          }
          setTip(amount);
        }}
      />
    </>
  );
}
