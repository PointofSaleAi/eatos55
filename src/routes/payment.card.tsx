import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NumPad } from "@/components/pos/numpad";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/card")({
  head: () => ({
    meta: [
      { title: "Pay by Card — eatOS Point of Purchase" },
      { name: "description", content: "Confirm the amount and capture a card payment on the handheld." },
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
  const router = useRouter();
  const { totals, commitPayment } = usePos();
  const [amount, setAmount] = useState(totals.total ? String(totals.total) : "");
  const charged = Number(amount || "0");

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-2 py-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="grid size-11 place-items-center rounded-full text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="truncate text-2xl font-extrabold text-foreground">Pay by Card</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="py-6 text-center">
          <p className="text-5xl font-extrabold tabular-nums text-foreground">{money(charged)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Total due {money(totals.total)}</p>
        </div>

        <NumPad
          className="mt-auto"
          onDigit={(d) =>
            setAmount((cur) => {
              if (d === "." && cur.includes(".")) return cur;
              const next = `${cur}${d}`;
              return next.length > 9 ? cur : next;
            })
          }
          onBackspace={() => setAmount((cur) => cur.slice(0, -1))}
        />
      </div>

      <div className="shrink-0 border-t border-border bg-surface p-4">
        <button
          type="button"
          disabled={charged <= 0}
          onClick={() => {
            commitPayment("card", charged);
            toast.success("Card payment approved");
            navigate({ to: "/tickets" });
          }}
          className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40"
        >
          Charge {money(charged)}
        </button>
      </div>
    </div>
  );
}
