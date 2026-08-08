import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { GuestHeader, NumPad } from "@/components/pos/numpad";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/order/custom-item")({
  head: () => ({
    meta: [
      { title: "Custom Item — eatOS Point of Purchase" },
      { name: "description", content: "Ring in an open priced item with a custom name and amount." },
      { property: "og:title", content: "Custom Item — eatOS Point of Purchase" },
      {
        property: "og:description",
        content: "Ring in an open priced item with a custom name and amount.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomItem,
});

function CustomItem() {
  const navigate = useNavigate();
  const router = useRouter();
  const { addCustomItem, totals } = usePos();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const price = Number(amount || "0");

  const addLine = () => {
    if (price <= 0) return false;
    addCustomItem(name.trim() || "Custom Item", price);
    setName("");
    setAmount("");
    return true;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 bg-surface px-2 pt-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="grid size-11 place-items-center rounded-full text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="truncate text-xl font-extrabold text-foreground">Custom Item</h1>
      </div>
      <GuestHeader />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item Name"
            className="h-14 w-full rounded-xl border border-border bg-surface px-4 text-lg text-foreground outline-none focus:border-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-5 text-center">
          <p className="text-4xl font-extrabold tabular-nums text-foreground">
            {amount ? money(price) : money(0)}
          </p>
        </div>

        <NumPad
          variant="order"
          className="mt-auto"
          onDigit={(d) =>
            setAmount((cur) => {
              if (d === "." && cur.includes(".")) return cur;
              const next = `${cur}${d}`;
              return next.length > 9 ? cur : next;
            })
          }
          onBackspace={() => setAmount((cur) => cur.slice(0, -1))}
          onPlus={() => addLine()}
        />
      </div>

      <div className="shrink-0 border-t border-border bg-surface p-4">
        <button
          type="button"
          disabled={price <= 0 && totals.count === 0}
          onClick={() => {
            addLine();
            navigate({ to: "/order/review" });
          }}
          className="min-h-[56px] w-full rounded-xl bg-primary text-base font-extrabold uppercase tracking-wide text-primary-foreground disabled:opacity-40"
        >
          Add to order
        </button>
      </div>
    </div>
  );
}
