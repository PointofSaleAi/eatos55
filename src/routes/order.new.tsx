import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, MoreVertical, Plus, Search } from "lucide-react";
import { useState } from "react";
import { BottomTabs } from "@/components/pos/shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { barcodeCategories, categories, menu, money, popularIds } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order/new")({
  head: () => ({
    meta: [
      { title: "New Order — eatOS Point of Purchase" },
      { name: "description", content: "Add products, scan barcodes and build a guest order." },
      { property: "og:title", content: "New Order — eatOS Point of Purchase" },
      {
        property: "og:description",
        content: "Add products, scan barcodes and build a guest order.",
      },
    ],
  }),
  component: NewOrder,
});

const chips = [...barcodeCategories, ...categories];

function NewOrder() {
  const navigate = useNavigate();
  const { addItem, totals } = usePos();
  const [category, setCategory] = useState<string>(chips[0]!);
  const [scanMode, setScanMode] = useState("Barcode");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const base =
    category === "Popular"
      ? popularIds.map((id) => menu.find((m) => m.id === id)!)
      : menu.filter((m) => m.category === category);
  const q = query.trim().toLowerCase();
  const items = q ? base.filter((i) => i.name.toLowerCase().includes(q)) : base;

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-muted-foreground">Guest Name</p>
            <p className="truncate text-base font-bold text-muted-foreground">(XXX) XXX-XXXX</p>
          </div>
          <button
            type="button"
            aria-label="Search products"
            onClick={() => setSearching((s) => !s)}
            className="grid size-11 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Search className="size-6" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="More options"
              className="grid size-11 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <MoreVertical className="size-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: "/order/menu" })}>
                Change menu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/order/review" })}>
                Review order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/tickets" })}>
                Back to tickets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => navigate({ to: "/order/custom-item" })}
            className="min-h-[44px] shrink-0 rounded-md border border-input px-3 text-sm text-foreground"
          >
            Custom Item
          </button>
        </div>

        {searching ? (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none"
          />
        ) : null}

        <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
          <div className="relative shrink-0">
            <select
              aria-label="Scan mode"
              value={scanMode}
              onChange={(e) => setScanMode(e.target.value)}
              className="h-11 appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-base text-foreground outline-none"
            >
              <option value="Barcode">Barcode</option>
              <option value="SKU">SKU</option>
              <option value="PLU">PLU</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "min-h-[44px] shrink-0 rounded-md px-5 text-sm font-bold uppercase transition-colors",
                c === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {items.length === 0 ? (
          <p className="px-4 py-24 text-center text-2xl font-medium text-foreground">
            No products found for this category
          </p>
        ) : (
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
                  <span className="text-sm font-bold text-muted-foreground">
                    {money(item.price)}
                  </span>
                  <span className="grid size-7 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Plus className="size-4" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {totals.count > 0 ? (
        <div className="shrink-0 border-t border-border bg-surface px-4 pb-3 pt-3">
          <Button
            className="h-12 w-full rounded-xl bg-primary text-base font-extrabold text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate({ to: "/order/review" })}
          >
            Review order · {totals.count} item{totals.count === 1 ? "" : "s"} ·{" "}
            {money(totals.subtotal)}
          </Button>
        </div>
      ) : null}

      <BottomTabs />
    </div>
  );
}
