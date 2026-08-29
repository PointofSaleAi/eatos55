import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { toast } from "sonner";
import { TenderScreen } from "@/components/pos/tender-screen";
import { money } from "@/lib/demo-data";
import { useAnnounce } from "@/components/pos/live-region";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";

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
  const { totals, paidSoFar, commitPayment } = usePos();
  const announce = useAnnounce();
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  return (
    <TenderScreen
      title="Pay by Cash"
      due={due}
      denominations
      actionLabel={(amount) => `Charge ${money(amount || due)}`}
      onCommit={(amount, notes) => {
        if (amount < due) {
          toast.error(`Short ${money(due - amount)} - enter the full amount`);
          return;
        }
        haptic("success");
        announce("Payment complete");
        commitPayment("cash", amount, { tenderId: "cash", ...(notes ? { notes } : {}) });
        const change = Math.round((amount - due) * 100) / 100;
        toast.success(
          change > 0 ? `Paid · change due ${money(change)}` : "Paid in full with cash",
        );
        navigate({ to: "/payment/success" });
      }}
    />
  );
}
