import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Nfc } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/card")({
  head: () => ({
    meta: [
      { title: "Pay by card — EATOS Handheld" },
      { name: "description", content: "Hand the reader to the guest and capture a card payment." },
      { property: "og:title", content: "Pay by card — EATOS Handheld" },
      {
        property: "og:description",
        content: "Hand the reader to the guest and capture a card payment.",
      },
    ],
  }),
  component: PayByCard,
});

type Stage = "waiting" | "processing" | "approved";

function PayByCard() {
  const navigate = useNavigate();
  const { totals, commitPayment } = usePos();
  const [stage, setStage] = useState<Stage>("waiting");

  useEffect(() => {
    if (stage !== "processing") return;
    const timer = setTimeout(() => {
      setStage("approved");
      commitPayment("card", totals.total);
    }, 1600);
    return () => clearTimeout(timer);
  }, [stage, commitPayment, totals.total]);

  return (
    <>
      <ScreenHeader eyebrow="Payment" title="Pay by card" back />
      <ScreenBody>
        <Card className="p-8 text-center">
          {stage === "waiting" && (
            <Nfc className="mx-auto size-10 text-accent" />
          )}
          {stage === "processing" && (
            <Loader2 className="mx-auto size-10 animate-spin text-accent" />
          )}
          {stage === "approved" && <CheckCircle2 className="mx-auto size-10 text-success" />}
          <p className="mt-4 text-2xl font-extrabold tabular-nums text-foreground">
            {money(totals.total)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {stage === "waiting" && "Present card to the reader"}
            {stage === "processing" && "Authorising with the processor"}
            {stage === "approved" && "Approved · receipt options below"}
          </p>
        </Card>
      </ScreenBody>
      <ScreenFooter>
        {stage === "approved" ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-full font-bold"
              onClick={() => toast.success("Receipt sent")}
            >
              Email receipt
            </Button>
            <Button
              className="h-12 flex-1 rounded-full bg-accent font-bold text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate({ to: "/tickets" })}
            >
              Done
            </Button>
          </div>
        ) : (
          <Button
            disabled={stage === "processing"}
            className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
            onClick={() => setStage("processing")}
          >
            {stage === "processing" ? "Processing…" : "Simulate card tap"}
          </Button>
        )}
      </ScreenFooter>
    </>
  );
}
