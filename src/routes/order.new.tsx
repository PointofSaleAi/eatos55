import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import openPriceIcon from "@/assets/open-price.svg";
import outOfStockIcon from "@/assets/out-of-stock.svg";
import {
  ArrowLeftRight,
  ArrowUpDown,
  Ban,
  Check,
  ChevronDown,
  MoreVertical,
  PanelLeftOpen,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GuestBlock } from "@/components/pos/guest-block";
import { useWideLayout } from "@/components/pos/shell";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { ItemSheet } from "@/components/pos/item-sheet";
import { MoreSheet } from "@/components/pos/more-sheet";
import { OrderActionButtons, OrderPanel } from "@/components/pos/order-panel";
import { itemNeedsSheet, liveMenu, menus, money, type MenuItem } from "@/lib/demo-data";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { toast } from "sonner";
import { SearchDock } from "@/components/pos/search-dock";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/order/new")({
  head: () => ({
    meta: [
      { title: `New Order - ${brand.appName} Point of Sale` },
      { name: "description", content: "Add products, scan barcodes and build a guest order." },
      { property: "og:title", content: `New Order - ${brand.appName} Point of Sale` },
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
  const { totals, addItem, settings } = usePos();
  const initialMenu = menus[0];
  const initialCategory = initialMenu?.categories[1] ?? initialMenu?.categories[0];
  const [activeMenu, setActiveMenu] = useState(initialMenu?.id ?? "");
  const [activeCategory, setActiveCategory] = useState(initialCategory?.id ?? "");
  const [subcategory, setSubcategory] = useState(initialCategory?.subcategories[0] ?? "");
  const [menuToolsOpen, setMenuToolsOpen] = useState(false);
  const [categoryLayout, setCategoryLayout] = useState<"horizontal" | "vertical">("vertical");
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
  const menuToolsRef = useRef<HTMLDivElement | null>(null);
  const longFired = useRef(false);
  const clearLongPress = () => {
    if (longPress.current !== null) window.clearTimeout(longPress.current);
    longPress.current = null;
  };
  const showMenu = wide || tab === "menu";
  const showCart = wide || tab === "order";

  const currentMenu = menus.find((m) => m.id === activeMenu) ?? initialMenu;
  if (!currentMenu) return null;
  const currentCategory =
    currentMenu.categories.find((entry) => entry.id === activeCategory) ??
    currentMenu.categories[0];
  const subcategories = currentCategory?.subcategories ?? [];
  const base = liveMenu.filter((m) => m.category === subcategory);
  const q = query.trim().toLowerCase();
  const items = q ? base.filter((i) => i.name.toLowerCase().includes(q)) : base;

  const chooseMenu = (menuId: string) => {
    const nextMenu = menus.find((entry) => entry.id === menuId);
    const nextCategory = nextMenu?.categories[0];
    if (!nextMenu || !nextCategory) return;
    setActiveMenu(nextMenu.id);
    setActiveCategory(nextCategory.id);
    setSubcategory(nextCategory.subcategories[0] ?? "");
  };

  const chooseCategory = (categoryId: string) => {
    const nextCategory = currentMenu.categories.find((entry) => entry.id === categoryId);
    if (!nextCategory) return;
    setActiveCategory(nextCategory.id);
    setSubcategory(nextCategory.subcategories[0] ?? "");
  };

  useEffect(() => {
    if (!menuToolsOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || menuToolsRef.current?.contains(target)) return;
      setMenuToolsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [menuToolsOpen]);

  const menuSelector = (
    <div ref={menuToolsRef} className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={menuToolsOpen ? "Close menu controls" : "Open menu controls"}
        aria-expanded={menuToolsOpen}
        onClick={() => setMenuToolsOpen((open) => !open)}
        className="min-h-tap min-w-tap rounded-card"
      >
        {menuToolsOpen ? <X className="size-5" /> : <PanelLeftOpen className="size-5" />}
      </Button>
      {menuToolsOpen ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={
              categoryLayout === "horizontal"
                ? "Show subcategories vertically"
                : "Show subcategories horizontally"
            }
            title={
              categoryLayout === "horizontal"
                ? "Show subcategories vertically"
                : "Show subcategories horizontally"
            }
            onClick={() =>
              setCategoryLayout((layout) =>
                layout === "horizontal" ? "vertical" : "horizontal",
              )
            }
            className="min-h-tap min-w-tap rounded-card"
          >
            {categoryLayout === "horizontal" ? (
              <ArrowUpDown className="size-5" />
            ) : (
              <ArrowLeftRight className="size-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="min-h-tap max-w-[11rem] gap-1 rounded-card px-3 text-fs-xs font-extrabold"
              >
                <span className="truncate">{currentMenu.name}</span>
                <ChevronDown className="size-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[12rem] rounded-card">
              {menus.map((entry) => (
                <DropdownMenuItem
                  key={entry.id}
                  onSelect={() => chooseMenu(entry.id)}
                  className="min-h-tap text-fs-sm font-bold"
                >
                  <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                  {entry.id === activeMenu ? <Check className="size-4 shrink-0" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
    </div>
  );

  const categoryButtons = currentMenu.categories.map((entry) => (
    <button
      key={entry.id}
      type="button"
      onClick={() => chooseCategory(entry.id)}
      className={cn(
        "flex h-9 shrink-0 items-center justify-center rounded-pill px-3 text-center text-[0.6875rem] font-extrabold uppercase leading-[1.05] tracking-tight transition-colors",
        entry.id === activeCategory
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted text-muted-foreground hover:bg-secondary",
      )}
    >
      {entry.name}
    </button>
  ));

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 overflow-hidden bg-background",
        wide ? "flex-row" : "flex-col",
      )}
    >
      {/* Left column: header (menu + category pills) and the product grid. */}
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden",
          wide ? "min-w-0 flex-1" : showMenu ? "min-h-0 flex-1" : "shrink-0",
        )}
      >
      <div className="shrink-0 border-b border-border bg-surface px-3 pb-2 pt-2.5">

        <div className={cn("flex items-center", showMenu ? "gap-2" : "gap-1")}>
          {/* Phone: the Menu / Order switch owns the top row. */}
          {!wide ? (
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5">
              {(["menu", "order"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "h-9 rounded-pill text-fs-xs font-extrabold uppercase transition-colors",
                    t === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {t === "menu" ? "Menu" : `Order${totals.count ? ` · ${totals.count}` : ""}`}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
              {menuSelector}
              {categoryButtons}
            </div>
          )}

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="Search products"
              title="Search products"
              onClick={() => setSearching((s) => !s)}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-pill transition-colors hover:bg-muted tap-safe",
                searching ? "bg-muted text-accent" : "text-foreground",
              )}
            >
              <Search className="size-5" />
            </button>
            <button
              type="button"
              aria-label="More options"
              title="More options"
              onClick={() => setMoreOpen(true)}
              className="-mr-1 grid size-9 tap-safe shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <MoreVertical className="size-5" />
            </button>
          </div>
        </div>

        {/* Phone: menu selector and categories stay directly above subcategories. */}
        {!wide ? (
          showMenu ? (
            <div className="no-scrollbar mt-1.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto">
              {menuSelector}
              {categoryButtons}
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-1">
              <GuestBlock onEdit={() => setGuestOpen(true)} />
              <OrderActionButtons compact />
            </div>
          )
        ) : null}

        {showMenu ? (
          <div
            className={cn(
              "mt-2 gap-1.5",
              categoryLayout === "vertical"
                ? "flex flex-wrap"
                : "no-scrollbar flex flex-nowrap overflow-x-auto",
            )}
          >
            {subcategories.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setSubcategory(entry)}
                className={cn(
                  "flex h-10 items-center justify-center rounded-card px-2 text-center text-[0.625rem] font-extrabold uppercase leading-[1.1] tracking-tight transition-colors",
                  "w-[7.25rem] shrink-0",
                  entry === subcategory
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                <span className="line-clamp-2 whitespace-normal">{entry}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>



        <div
          className={cn(
            "no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pt-2.5",
            searching
              ? "pb-[calc(5rem+var(--kb-inset,0px))]"
              : "pb-[calc(1rem+var(--kb-inset,0px))]",
            showMenu ? "" : "hidden",
          )}
        >
        {items.length === 0 ? (
          <p className="px-4 py-24 text-center text-fs-sm text-muted-foreground">No Active Menu</p>
        ) : (

          <div className="grid grid-cols-[repeat(auto-fill,minmax(7.25rem,1fr))] gap-2">
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
                    : itemNeedsSheet(item, settings.productModifierRules)
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
                  if (itemNeedsSheet(item, settings.productModifierRules)) {
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

                <span className="flex flex-wrap items-start gap-x-1.5 gap-y-1">
                  <span className="min-w-min max-w-full flex-1 text-fs-sm font-extrabold leading-tight text-foreground">
                    {item.name}
                  </span>
                  {typeof item.stock === "number" && !item.outOfStock ? (
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
                  {item.outOfStock || item.openPrice ? (
                    <img
                      src={item.outOfStock ? outOfStockIcon : openPriceIcon}
                      alt={item.outOfStock ? "Out of stock" : "Open price"}
                      title={item.outOfStock ? "Out of stock" : "Open price"}
                      className="size-9 shrink-0 md:size-11 lg:size-12"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-fs-sm font-bold text-muted-foreground">
                      {money(item.price)}
                    </span>
                  )}
                  <span
                    role="button"
                    tabIndex={item.outOfStock ? -1 : 0}
                    aria-label={`Quick add ${item.name} to the order`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearLongPress();
                      if (item.outOfStock) return;
                      addItem(item.id, { qty: 1 });
                      haptic("success");
                      toast.success(`${item.name} added`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      e.stopPropagation();
                      if (item.outOfStock) return;
                      addItem(item.id, { qty: 1 });
                      haptic("success");
                      toast.success(`${item.name} added`);
                    }}
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
      </div>

      <aside
        className={cn(
          "flex min-h-0 flex-col overflow-hidden",
          showCart ? "" : "hidden",
          wide
            ? "w-[21rem] shrink-0 border-l border-border bg-surface lg:w-[24rem] 2xl:w-[26rem]"
            : "min-w-0 flex-1 bg-surface",

        )}
      >
        <OrderPanel wide={wide} />
      </aside>


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
