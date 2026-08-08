import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Ban, ChevronDown, MoreVertical, Plus, Search, Tag, Wifi } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GuestBlock } from "@/components/pos/guest-block";
import { MenuButton } from "@/components/pos/shell";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { ItemSheet } from "@/components/pos/item-sheet";
import { MoreSheet } from "@/components/pos/more-sheet";
import { liveMenu, menus, money, type MenuItem } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { toast } from "sonner";
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

function NewOrder() {
  const navigate = useNavigate();
  const { totals, cart, changeQty } = usePos();
  const [activeMenu, setActiveMenu] = useState(menus[1]!.id);
  const [category, setCategory] = useState<string>(menus[1]!.categories[0]!);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"menu" | "order">("menu");

  const currentMenu = menus.find((m) => m.id === activeMenu) ?? menus[0]!;
  const chips = currentMenu.categories;
  const base = liveMenu.filter((m) => m.category === category);
  const q = query.trim().toLowerCase();
  const items = q ? base.filter((i) => i.name.toLowerCase().includes(q)) : base;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <MenuButton className="-ml-2 size-9" />
          <GuestBlock onEdit={() => setGuestOpen(true)} />

          <button
            type="button"
            aria-label="Search products"
            onClick={() => setSearching((s) => !s)}
            className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            aria-label="More options"
            onClick={() => setMoreOpen(true)}
            className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <MoreVertical className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/order/custom-item" })}
            className="min-h-[32px] shrink-0 rounded-full border border-border px-2.5 text-[12px] font-bold text-foreground transition-colors hover:bg-muted"
          >
            Custom Item
          </button>
          <span
            title="Server connected"
            className="grid size-7 shrink-0 place-items-center rounded-full text-sky-600"
          >
            <Wifi className="size-4" />
          </span>
        </div>

        {searching ? (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="mt-3 h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none"
          />
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["menu", "order"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "min-h-[40px] rounded-full text-sm font-extrabold uppercase transition-colors",
                t === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary",
              )}
            >
              {t === "menu" ? "Menu" : `Order${totals.count ? ` · ${totals.count}` : ""}`}
            </button>
          ))}
        </div>

        {tab === "menu" ? (
          <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
            <div className="relative shrink-0">
              <select
                aria-label="Menu"
                value={activeMenu}
                onChange={(e) => {
                  const next = menus.find((m) => m.id === e.target.value)!;
                  setActiveMenu(next.id);
                  setCategory(next.categories[0]!);
                }}
                className="h-11 appearance-none rounded-xl border border-border bg-surface pl-3 pr-8 text-sm font-bold text-foreground outline-none"
              >
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "min-h-[36px] shrink-0 rounded-full px-3.5 text-[13px] font-bold transition-colors",
                  c === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(1rem+var(--kb-inset,0px))] pt-3">
        {tab === "order" ? (
          cart.length === 0 ? (
            <p className="px-4 py-24 text-center text-sm text-muted-foreground">
              No items yet — add products from the menu
            </p>
          ) : (
            <div className="space-y-3">
              {cart.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{money(l.price)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Remove one ${l.name}`}
                      onClick={() => changeQty(l.id, -1)}
                      className="grid size-9 place-items-center rounded-full border border-border text-sm font-bold text-foreground"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-foreground">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add one ${l.name}`}
                      onClick={() => changeQty(l.id, 1)}
                      className="grid size-9 place-items-center rounded-full border border-border text-sm font-bold text-foreground"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <p className="px-4 py-24 text-center text-sm text-muted-foreground">No Active Menu</p>
        ) : (

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const low =
                typeof item.stock === "number" &&
                !item.outOfStock &&
                item.stock <= (item.lowStockAt ?? 0);
              return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.outOfStock) {
                    toast.error(`${item.name} is out of stock`, {
                      action: {
                        label: "Override",
                        onClick: () => navigate({ to: "/access/manager-pin" }),
                      },
                    });
                    return;
                  }
                  setSheetItem(item);
                }}
                className={cn(
                  "relative flex min-h-[92px] flex-col justify-between rounded-2xl border border-border bg-surface p-3 text-left transition-transform active:scale-[0.98]",
                  item.outOfStock && "opacity-50",
                )}
              >
                <span className="flex items-start gap-1.5">
                  <span className="min-w-0 flex-1 text-sm font-extrabold leading-tight text-foreground">
                    {item.name}
                  </span>
                  {item.outOfStock ? (
                    <span
                      title="Out of stock"
                      className="grid size-5 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive"
                    >
                      <Ban className="size-3.5" />
                    </span>
                  ) : item.openPrice ? (
                    <span
                      title="Open price"
                      className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                    >
                      <Tag className="size-3.5" />
                    </span>
                  ) : typeof item.stock === "number" ? (
                    <span
                      title={`${item.stock} in stock`}
                      className={cn(
                        "shrink-0 rounded-full px-1.5 text-[11px] font-extrabold leading-5",
                        low
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {low ? `- ${item.stock}` : item.stock}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">
                    {item.outOfStock
                      ? "Out of stock"
                      : item.openPrice
                        ? "Open price"
                        : money(item.price)}
                  </span>
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full",
                      item.outOfStock
                        ? "bg-muted text-muted-foreground"
                        : "bg-accent text-accent-foreground",
                    )}
                  >
                    {item.outOfStock ? <Ban className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </span>
              </button>
              );
            })}
          </div>
        )}
      </div>

      {totals.count > 0 ? (
        <div className="shrink-0 border-t border-border bg-surface px-4 pb-2 pt-2">
          <Button
            className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground transition-colors hover:bg-accent/90"
            onClick={() => navigate({ to: "/order/review" })}
          >
            Review order · {totals.count} item{totals.count === 1 ? "" : "s"} ·{" "}
            {money(totals.subtotal)}
          </Button>
        </div>
      ) : null}

      <ItemSheet item={sheetItem} onClose={() => setSheetItem(null)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
    </div>
  );
}
