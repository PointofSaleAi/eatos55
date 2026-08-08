import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote, CreditCard, Link2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel } from "@/components/pos/primitives";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/method")({
  head: () => ({
    meta: [
      { title: "Payment method — EATOS Handheld" },
      { name: "description", content: "Choose how the guest wants to pay for this ticket." },
      { property: "og:title", content: "Payment method — EATOS Handheld" },
      { property: "og:description", content: "Choose how the guest wants to pay for this ticket." },
    ],
  }),
  component: PaymentMethod,
});

function PaymentMethod() {
  const navigate = useNavigate();
  const { totals } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Payment" title="Payment method" back />
      <ScreenBody>
        <Card className="p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Amount due
          </p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-foreground">
            {money(totals.total)}
          </p>
        </Card>

        <SectionLabel>Tender</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            icon={CreditCard}
            title="Card"
            detail="Tap, chip or swipe on the handheld reader"
            onClick={() => navigate({ to: "/payment/card" })}
          />
          <ActionRow
            icon={Banknote}
            title="Cash"
            detail="Enter the amount received"
            onClick={() => navigate({ to: "/payment/cash" })}
          />
          <ActionRow
            icon={QrCode}
            title="Scan to pay"
            detail="Show a QR code to the guest"
            onClick={() => toast.info("QR code shown on the guest display")}
          />
          <ActionRow
            icon={Link2}
            title="Send payment link"
            detail="Text or email a secure link"
            onClick={() => toast.success("Payment link sent to the guest")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
