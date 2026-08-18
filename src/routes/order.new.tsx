import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Ban, ChevronDown, MoreVertical, Plus, Search, Tag } from "lucide-react";
import { useRef, useState } from "react";
import { GuestBlock } from "@/components/pos/guest-block";
import { MenuButton, useWideLayout } from "@/components/pos/shell";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { ItemSheet } from "@/components/pos/item-sheet";
import { MoreSheet } from "@/components/pos/more-sheet";
import { OrderPanel } from "@/components/pos/order-panel";
import { itemNeedsSheet, liveMenu, menus, money, type MenuItem } from "@/lib/demo-data";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { toast } from "sonner";
import { SearchDock } from "@/components/pos/search-dock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order/new")({
  head: () => ({
    meta: [
      { title: "New Order - eatOS Point of Sale" },
      { name: "description", content: "Add products, scan barcodes and build a guest order." },
      { property: "og:title", content: "New Order - eatOS Point of Sale" },
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
  const { totals, addItem } = usePos();
  const [activeMenu, setActiveMenu] = useState(menus[1]!.id);
  const [category, setCategory] = useState<string>(menus[1]!.categories[0]!);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"menu" | "order">("menu");
  // Landscape shows the menu and the running order side by side, so the
  // Menu/Order switch is phone-only.
  const wide = useWideLayout();
  // Long-press on a tile always opens the item sheet, even for simple items.
  const longPress = useRef<number | null>(null);
  const longFired = useRef(false);
  const clearLongPress = () => {
    if (longPress.current !== null) window.clearTimeout(longPress.current);
    longPress.current = null;
  };
  const showMenu = wide || tab === "menu";
  const showCart = wide || tab === "order";

  const currentMenu = menus.find((m) => m.id === activeMenu) ?? menus[0]!;
  const chips = currentMenu.categories;
  const base = liveMenu.filter((m) => m.category === category);
  const q = query.trim().toLowerCase();
  const items = q ? base.filter((i) => i.name.toLowerCase().includes(q)) : base;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center gap-1">
          <MenuButton className="-ml-2 size-11" />
          {wide ? (
            <span className="min-w-0 flex-1 truncate text-fs-sm font-extrabold text-foreground">
              Menu
            </span>
          ) : (
            <GuestBlock onEdit={() => setGuestOpen(true)} />
          )}

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="Search products"
              title="Search products"
              onClick={() => setSearching((s) => !s)}
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-pill transition-colors hover:bg-muted tap-safe",
                searching ? "bg-muted text-accent" : "text-foreground",
              )}
            >
              <Search className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Add custom item"
              title="Custom item"
              onClick={() => navigate({ to: "/order/custom-item" })}
              className="grid size-10 tap-safe shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <Tag className="size-5" />
            </button>
            <button
              type="button"
              aria-label="More options"
              title="More options"
              onClick={() => setMoreOpen(true)}
              className="-mr-2 grid size-10 tap-safe shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <MoreVertical className="size-5" />
            </button>
          </div>
        </div>

        <div className={cn("mt-3 grid grid-cols-2 gap-2", wide && "hidden")}>
          {(["menu", "order"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "min-h-ctl-lg rounded-pill text-fs-sm font-extrabold uppercase transition-colors",
                t === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary",
              )}
            >
              {t === "menu" ? "Menu" : `Order${totals.count ? ` · ${totals.count}` : ""}`}
            </button>
          ))}
        </div>

        {showMenu ? (
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
                className="h-11 appearance-none rounded-row border border-border bg-surface pl-3 pr-8 text-fs-sm font-bold text-foreground outline-none"
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
                  "min-h-ctl-md shrink-0 rounded-pill px-3.5 text-fs-sm font-bold transition-colors",
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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pt-3",
            searching
              ? "pb-[calc(5rem+var(--kb-inset,0px))]"
              : "pb-[calc(1rem+var(--kb-inset,0px))]",
            showMenu ? "" : "hidden",
          )}
        >
        {items.length === 0 ? (
          <p className="px-4 py-24 text-center text-fs-sm text-muted-foreground">No Active Menu</p>
        ) : (

          <div className="grid grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))] gap-3">
            {items.map((item) => {
              const low =
                typeof item.stock === "number" &&
                !item.outOfStock &&
                item.stock <= (item.lowStockAt ?? 0);
              return (
              <button
                key={item.id}
                type="button"
                aria-label={
                  item.outOfStock
                    ? `${item.name}, out of stock`
                    : itemNeedsSheet(item)
                      ? `${item.name}, choose options`
                      : `Add ${item.name} to the order`
                }
                onPointerDown={() => {
                  longFired.current = false;
                  longPress.current = window.setTimeout(() => {
                    longPress.current = null;
                    longFired.current = true;
                    if (!item.outOfStock) setSheetItem(item);
                  }, 500);
                }}
                onPointerUp={clearLongPress}
                onPointerLeave={clearLongPress}
                onClick={() => {
                  clearLongPress();
                  if (longFired.current) return;
                  if (item.outOfStock) {
                    toast.error(`${item.name} is out of stock`, {
                      action: {
                        label: "Override",
                        onClick: () => navigate({ to: "/access/manager-pin" }),
                      },
                    });
                    return;
                  }
                  if (itemNeedsSheet(item)) {
                    setSheetItem(item);
                    return;
                  }
                  addItem(item.id, { qty: 1 });
                  haptic("success");
                  toast.success(`${item.name} added`);
                }}
                className={cn(
                  "relative flex min-h-tile flex-col justify-between rounded-card border border-border bg-surface p-3 text-left transition-transform active:scale-[0.98]",
                  item.outOfStock && "opacity-50",
                )}
              >

                <span className="flex items-start gap-1.5">
                  <span className="min-w-0 flex-1 text-fs-sm font-extrabold leading-tight text-foreground">
                    {item.name}
                  </span>
                  {item.outOfStock ? (
                    <span
                      title="Out of stock"
                      className="grid size-5 shrink-0 place-items-center rounded-pill bg-destructive/10 text-destructive tap-safe"
                    >
                      <Ban className="size-3.5" />
                    </span>
                  ) : item.openPrice ? (
                    <span
                      title="Open price"
                      className="grid size-5 shrink-0 place-items-center rounded-pill bg-muted text-muted-foreground tap-safe"
                    >
                      <Tag className="size-3.5" />
                    </span>
                  ) : typeof item.stock === "number" ? (
                    <span
                      title={`${item.stock} in stock`}
                      className={cn(
                        "shrink-0 rounded-pill px-1.5 text-fs-xs font-extrabold leading-5",
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
                  <span className="text-fs-sm font-bold text-muted-foreground">
                    {item.outOfStock
                      ? "Out of stock"
                      : item.openPrice
                        ? "Open price"
                        : money(item.price)}
                  </span>
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-pill tap-safe",
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

        <aside
          className={cn(
            "flex min-h-0 flex-col overflow-hidden",
            showCart ? "" : "hidden",
            wide
              ? "w-[21rem] shrink-0 border-l border-border bg-surface lg:w-[24rem]"
              : "min-w-0 flex-1 bg-surface",
          )}
        >
          <OrderPanel wide={wide} />
        </aside>
      </div>

      {/* Phone, menu tab: keep the running total and Charge one tap away. */}
      {!wide && tab === "menu" && totals.count > 0 ? (
        <div className="flex shrink-0 items-center gap-2 border-t border-border bg-surface px-3 pb-[calc(0.5rem+var(--tabs-h,0px))] pt-2">
          <button
            type="button"
            onClick={() => setTab("order")}
            className="min-h-tap min-w-0 flex-1 rounded-pill bg-muted px-3 text-left text-fs-sm font-extrabold text-foreground"
          >
            {totals.count} item{totals.count === 1 ? "" : "s"} · {money(totals.total)}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/payment/method" })}
            className="min-h-tap shrink-0 rounded-pill bg-accent px-5 text-fs-sm font-extrabold text-accent-foreground"
          >
            Charge
          </button>
        </div>
      ) : null}




      <SearchDock
        open={searching}
        value={query}
        onChange={setQuery}
        onClose={() => {
          setQuery("");
          setSearching(false);
        }}
        placeholder="Search products"
      />

      <ItemSheet item={sheetItem} onClose={() => setSheetItem(null)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
    </div>
  );
}
