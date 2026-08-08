import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Pills } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { categories, menu, menuModes, money, popularIds } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/order/new")({
  head: () => ({
    meta: [
      { title: "New order — EATOS Handheld" },
      { name: "description", content: "Menu and product selection for a new guest order." },
      { property: "og:title", content: "New order — EATOS Handheld" },
      { property: "og:description", content: "Menu and product selection for a new guest order." },
    ],
  }),
  component: NewOrder,
});

function NewOrder() {
  const navigate = useNavigate();
  const { addItem, totals, mode } = usePos();
  const [category, setCategory] = useState<(typeof categories)[number]>("Popular");

  const items =
    category === "Popular"
      ? popularIds.map((id) => menu.find((m) => m.id === id)!)
      : menu.filter((m) => m.category === category);
  const modeName = menuModes.find((m) => m.id === mode)?.name ?? "Dine in";

  return (
    <>
      <ScreenHeader
        eyebrow="Order"
        title="New order"
        back
        right={
          <button
            type="button"
            onClick={() => navigate({ to: "/order/menu" })}
            className="flex min-h-[40px] items-center gap-1 rounded-full bg-muted px-3 text-xs font-bold text-foreground"
          >
            {modeName}
            <Pencil className="size-3" />
          </button>
        }
      />
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3">
        <Pills
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ id: c, label: c }))}
        />
      </div>
      <ScreenBody>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addItem(item.id)}
              className="flex min-h-[92px] flex-col justify-between rounded-2xl border border-border bg-surface p-3 text-left transition-transform active:scale-[0.98]"
            >
              <span className="text-sm font-extrabold leading-tight text-foreground">
                {item.name}
              </span>
              <span className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">{money(item.price)}</span>
                <span className="grid size-7 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Plus className="size-4" />
                </span>
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/order/custom-item" })}
          className="mt-3 flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-sm font-bold text-accent"
        >
          Add custom item
        </button>
      </ScreenBody>
      <ScreenFooter>
        <Button
          disabled={totals.count === 0}
          className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          onClick={() => navigate({ to: "/order/review" })}
        >
          Review order · {totals.count} item{totals.count === 1 ? "" : "s"} ·{" "}
          {money(totals.subtotal)}
        </Button>
      </ScreenFooter>
    </>
  );
}
