import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card, Keypad } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/cash")({
  head: () => ({
    meta: [
      { title: "Pay by cash — EATOS Handheld" },
      { name: "description", content: "Enter cash received and calculate change due." },
      { property: "og:title", content: "Pay by cash — EATOS Handheld" },
      { property: "og:description", content: "Enter cash received and calculate change due." },
    ],
  }),
  component: PayByCash,
});

function PayByCash() {
  const navigate = useNavigate();
  const { totals, commitPayment } = usePos();
  const [digits, setDigits] = useState("");
  const received = Number(digits || "0") / 100;
  const change = received - totals.total;
  const quick = [totals.total, Math.ceil(totals.total / 5) * 5, Math.ceil(totals.total / 10) * 10];

  return (
    <>
      <ScreenHeader eyebrow="Payment" title="Pay by cash" back />
      <ScreenBody>
        <Card className="p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Cash received
          </p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-foreground">
            {money(received)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Due {money(totals.total)} ·{" "}
            {change >= 0 ? (
              <span className="font-bold text-success">Change {money(change)}</span>
            ) : (
              <span className="font-bold text-destructive">
                Short {money(Math.abs(change))}
              </span>
            )}
          </p>
        </Card>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {Array.from(new Set(quick)).map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setDigits(String(Math.round(amount * 100)))}
              className="min-h-[44px] rounded-xl border border-border bg-surface text-sm font-bold text-foreground"
            >
              {money(amount)}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <Keypad
            onDigit={(d) => setDigits((cur) => (cur + d).replace(/^0+/, "").slice(0, 7))}
            onBackspace={() => setDigits((cur) => cur.slice(0, -1))}
          />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button
          disabled={change < 0}
          className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          onClick={() => {
            commitPayment("cash", received);
            toast.success(
              change > 0 ? `Paid · change due ${money(change)}` : "Paid in full with cash",
            );
            navigate({ to: "/tickets" });
          }}
        >
          Complete cash payment
        </Button>
      </ScreenFooter>
    </>
  );
}
