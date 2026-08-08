import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreditCard, Heart, QrCode, Wallet } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { toast } from "sonner";

export const Route = createFileRoute("/payment/method")({
  head: () => ({
    meta: [
      { title: "Select Payment Method — eatOS Point of Purchase" },
      { name: "description", content: "Choose card, cash, loyalty or QR code to settle the order." },
      { property: "og:title", content: "Select Payment Method — eatOS Point of Purchase" },
      {
        property: "og:description",
        content: "Choose card, cash, loyalty or QR code to settle the order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentMethod,
});

function PaymentMethod() {
  const navigate = useNavigate();
  const { totals } = usePos();

  const tenders = [
    { id: "card", label: "Card", icon: CreditCard, onPick: () => navigate({ to: "/payment/card" }) },
    { id: "cash", label: "Cash", icon: Wallet, onPick: () => navigate({ to: "/payment/cash" }) },
    {
      id: "loyalty",
      label: "Loyalty",
      icon: Heart,
      onPick: () => toast.info("Scan the guest loyalty card"),
    },
    {
      id: "qr",
      label: "QR Code",
      icon: QrCode,
      onPick: () => toast.info("QR code shown on the guest display"),
    },
  ];

  return (
    <Sheet open onOpenChange={(open) => (open ? null : navigate({ to: "/order/review" }))}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 bg-surface p-0 pb-8">
        <SheetHeader className="px-4 pb-1 pt-5">
          <SheetTitle className="text-center text-2xl font-extrabold text-foreground">
            Select Payment Method
          </SheetTitle>
        </SheetHeader>
        <p className="pb-5 text-center text-lg text-muted-foreground">
          Total due <span className="font-extrabold text-foreground">{money(totals.total)}</span>
        </p>
        <div className="grid grid-cols-4 gap-2 px-3 pb-2">
          {tenders.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={t.onPick}
                className="flex flex-col items-center gap-2"
              >
                <span className="grid size-16 place-items-center rounded-full border border-border bg-muted/50 text-foreground transition-colors active:bg-muted">
                  <Icon className="size-7" />
                </span>
                <span className="text-center text-sm font-medium text-foreground">{t.label}</span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
