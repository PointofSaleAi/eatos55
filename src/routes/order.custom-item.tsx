import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { GuestBlock } from "@/components/pos/guest-block";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { NumPad } from "@/components/pos/numpad";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/order/custom-item")({
  head: () => ({
    meta: [
      { title: "Custom Item - eatOS Point of Sale" },
      { name: "description", content: "Ring in an open priced item with a custom name and amount." },
      { property: "og:title", content: "Custom Item - eatOS Point of Sale" },
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
  const [guestOpen, setGuestOpen] = useState(false);
  const price = Number(amount || "0");

  const addLine = () => {
    if (price <= 0) return false;
    addCustomItem(name.trim() || "Custom Item", price);
    setName("");
    setAmount("");
    return true;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center gap-2 bg-surface px-2 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="grid size-11 place-items-center rounded-pill text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="truncate text-fs-xl font-extrabold text-foreground">Custom Item</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <GuestBlock onEdit={() => setGuestOpen(true)} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 pb-[calc(0.75rem+var(--kb-inset,0px))]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Item name"
          placeholder="Item Name"
          className="h-11 w-full shrink-0 rounded-row border border-border bg-surface px-4 text-fs-sm text-foreground outline-none focus:border-accent placeholder:text-muted-foreground"
        />
        <div className="shrink-0 rounded-row border border-border bg-surface px-4 py-3 text-center">
          <p className="text-fs-xl font-extrabold tabular-nums text-foreground">
            {amount ? money(price) : money(0)}
          </p>
        </div>

        <NumPad
          variant="order"
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

      <div className="shrink-0 border-t border-border bg-surface px-3 pb-[calc(0.5rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-2">
        <button
          type="button"
          disabled={price <= 0 && totals.count === 0}
          onClick={() => {
            addLine();
            navigate({ to: "/order/new" });
          }}
          className="h-11 w-full rounded-pill bg-accent text-fs-base font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40"
        >
          Add to order
        </button>
      </div>

      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
    </div>
  );
}
