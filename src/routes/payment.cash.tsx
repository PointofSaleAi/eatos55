import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NumPad } from "@/components/pos/numpad";
import { cashDenominations, money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/cash")({
  head: () => ({
    meta: [
      { title: "Pay by Cash — eatOS Point of Purchase" },
      { name: "description", content: "Enter cash received and calculate the change due." },
      { property: "og:title", content: "Pay by Cash — eatOS Point of Purchase" },
      { property: "og:description", content: "Enter cash received and calculate the change due." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PayByCash,
});

function PayByCash() {
  const navigate = useNavigate();
  const router = useRouter();
  const { totals, commitPayment } = usePos();
  const [amount, setAmount] = useState("");
  const received = Number(amount || "0");
  const change = Math.round((received - totals.total) * 100) / 100;

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
        <h1 className="truncate text-xl font-extrabold text-foreground">Pay by Cash</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="text-center">
          <p className="text-4xl font-extrabold tabular-nums text-foreground">
            {money(received)}
          </p>
          <p className="mt-1 text-base text-muted-foreground">
            Due {money(totals.total)}
            {amount ? (
              change >= 0 ? (
                <span className="font-bold text-success"> · Change {money(change)}</span>
              ) : (
                <span className="font-bold text-destructive">
                  {" "}
                  · Short {money(Math.abs(change))}
                </span>
              )
            ) : null}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {cashDenominations.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setAmount(String(Math.round((received + d) * 100) / 100))}
              className="min-h-[48px] rounded-xl border border-border bg-surface text-base font-bold text-foreground active:bg-muted"
            >
              ${d}
            </button>
          ))}
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
          disabled={received < totals.total}
          onClick={() => {
            commitPayment("cash", received);
            toast.success(
              change > 0 ? `Paid · change due ${money(change)}` : "Paid in full with cash",
            );
            navigate({ to: "/tickets" });
          }}
          className="min-h-[56px] w-full rounded-xl bg-primary text-base font-extrabold uppercase tracking-wide text-primary-foreground disabled:opacity-40"
        >
          Charge {money(totals.total)}
        </button>
      </div>
    </div>
  );
}
