import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import {
  Ban,
  Check,
  ChevronDown,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
import { useWideLayout } from "@/components/pos/shell";
import { ItemSheet } from "@/components/pos/item-sheet";
import { OpenPricePad } from "@/components/pos/open-price-pad";
import { OrderPanel } from "@/components/pos/order-panel";
import { DragGrip, DropZones, setOrderPanelSide, useOrderPanelSide } from "@/components/pos/drag-grip";
import { liveMenu, menu as baseMenu, menus, money, type CartLine, type MenuItem } from "@/lib/demo-data";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { toast } from "sonner";
import { SearchDock } from "@/components/pos/search-dock";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuSubcategories } from "@/components/pos/menu-subcategories";
import { productPricesVisible } from "@/lib/device-settings";
import { CustomItemWorkspace } from "@/components/pos/custom-item-workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Uploaded menu fold/unfold marks (menu-fold-3-fill / menu-unfold-3-fill). */
function MenuUnfoldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17 4H3V6H17V4ZM13 11H3V13H13V11ZM17 18H3V20H17V18ZM17 17V7L22 11.9996L17 17Z" />
    </svg>
  );
}
function MenuFoldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21 4H7V6H21V4ZM21 11H11V13H21V11ZM21 18H7V20H21V18ZM8 17V7L3 11.9996L8 17Z" />
    </svg>
  );
}
/** Uploaded "Arrow Range" mark: double-headed arrow for the subcategory layout toggle. */
function ArrowRangeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M3 12h18" />
      <path d="M7 8l-4 4 4 4" />
      <path d="M17 8l4 4-4 4" />
    </svg>
  );
}

export const Route = createFileRoute("/order/new")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

// Measure browser-rendered words, not just line counts: a single long word
// must fit horizontally before a larger typography step can be selected.
// The ladder FitName walks up a text-only tile's name: fs-mod is the floor, so a
// long word still fits whole instead of breaking mid-word, and fs-lg is the
// ceiling — the largest step whose lines actually fit the box (see
// availableNameHeight), so a short name fills the tile instead of staying tiny.
const nameSizes = ["text-fs-mod", "text-fs-xs", "text-fs-sm", "text-fs-base", "text-fs-lg"] as const;

// Room the tile has for the name: its rendered height minus padding and the price
// row. Read from the box, never from the name itself, so choosing a bigger step can
// never feed back into its own measurement and grow the tile.
function availableNameHeight(el: HTMLElement) {
  const tile = el.closest("button");
  if (!tile) return Number.POSITIVE_INFINITY;
  const ts = getComputedStyle(tile);
  const pad = (parseFloat(ts.paddingTop) || 0) + (parseFloat(ts.paddingBottom) || 0);
  const box = Math.max(tile.getBoundingClientRect().height, parseFloat(ts.minHeight) || 0);
  if (!(box > 0)) return Number.POSITIVE_INFINITY;
  const price = tile.lastElementChild as HTMLElement | null;
  const priceH = price
    ? price.getBoundingClientRect().height + (parseFloat(getComputedStyle(price).marginTop) || 0)
    : 0;
  return Math.max(0, box - pad - priceH);
}

function FitName({
  name,
  steps = nameSizes,
  maxLines = 2,
}: {
  name: string;
  steps?: readonly [string, ...string[]];
  maxLines?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [sizeClass, setSizeClass] = useState<string>(steps[0]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let disposed = false;
    let lastWidth = 0;
    const probe = document.createElement("span");
    probe.textContent = name;
    probe.setAttribute("aria-hidden", "true");
    Object.assign(probe.style, {
      position: "fixed",
      visibility: "hidden",
      pointerEvents: "none",
      display: "block",
      whiteSpace: "normal",
      overflowWrap: "normal",
      wordBreak: "normal",
      fontFamily: getComputedStyle(el).fontFamily,
      fontWeight: getComputedStyle(el).fontWeight,
      letterSpacing: "0px",
    });
    document.body.appendChild(probe);
    const measure = () => {
      if (disposed) return;
      // Content-box width, not the border box: the name carries right padding to
      // clear the corner stock badge, and measuring that padding in lets a word
      // be judged to fit when it would actually break mid-word.
      const width = parseFloat(getComputedStyle(el).width) || el.getBoundingClientRect().width;
      if (!(width > 0) || width === lastWidth) return;
      lastWidth = width;
      const ceil = Math.ceil(width);
      // Words are measured unwrapped: a wrapped block probe reports no overflow
      // for a single long word, so a tile would silently clip the widest one.
      const fitsWords = (step: string) => {
        probe.className = `${step} leading-tight`;
        probe.style.display = "inline-block";
        probe.style.whiteSpace = "nowrap";
        probe.style.width = "auto";
        for (const word of name.split(/\s+/)) {
          probe.textContent = word;
          if (probe.getBoundingClientRect().width > ceil) return false;
        }
        return true;
      };
      const lines = (step: string) => {
        probe.className = `${step} leading-tight`;
        probe.style.display = "block";
        probe.style.whiteSpace = "normal";
        probe.style.width = `${width}px`;
        probe.textContent = name;
        return Math.round(probe.getBoundingClientRect().height / parseFloat(getComputedStyle(probe).lineHeight));
      };
      // The box's spare room is the ceiling, not the smallest step's line count: a
      // name that reads on one tiny line may grow to two larger lines while they
      // still fit the tile, so text-only tiles use the space they already have.
      const available = availableNameHeight(el);
      const fits = (step: string) => {
        const needed = lines(step);
        const lineHeight = parseFloat(getComputedStyle(probe).lineHeight) || 0;
        return needed <= maxLines && needed * lineHeight <= available && fitsWords(step);
      };
      let chosen = steps[0];
      for (const step of steps) if (fits(step)) chosen = step;
      probe.textContent = name;
      setSizeClass(chosen);
    };
    const schedule = (force = false) => {
      if (disposed) return;
      if (force) lastWidth = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    schedule();
    document.fonts?.ready.then(() => schedule(true)).catch(() => {});
    const ro = new ResizeObserver(() => schedule());
    ro.observe(el);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      probe.remove();
    };
  }, [name, steps]);

  return (
    <span
      ref={ref}
      className={cn("block w-full min-w-0 max-w-full leading-tight break-words", sizeClass)}
    >
      {name}
    </span>
  );
}

// Photo tiles show the name on one line at the smallest size; when it is too
// long it slowly runs sideways so the whole name stays readable.
function RunName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const outer = ref.current;
    if (!outer) return;
    let raf = 0;
    let disposed = false;
    let lastWidth = 0;
    const measure = () => {
      if (disposed) return;
      const width = outer.getBoundingClientRect().width;
      if (!(width > 0) || width === lastWidth) return;
      lastWidth = width;
      const inner = outer.firstElementChild;
      if (!(inner instanceof HTMLElement)) return;
      const overflow = Math.ceil(inner.scrollWidth) - Math.ceil(width);
      inner.style.setProperty("--run-shift", `-${Math.max(0, overflow)}px`);
      setRunning(overflow > 0);
    };
    const schedule = (force = false) => {
      if (force) lastWidth = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    schedule();
    document.fonts?.ready.then(() => schedule(true)).catch(() => {});
    const ro = new ResizeObserver(() => schedule());
    ro.observe(outer);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [name]);

  return (
    <span
      ref={ref}
      className="block w-full min-w-0 overflow-hidden text-fs-xs font-light leading-tight whitespace-nowrap"
    >
      <span className={cn("inline-block whitespace-nowrap", running && "run-name")}>
        {name}
      </span>
    </span>
  );
}

// Quick-add control shared by photo and text tiles: it sits on the price line so
// the product name can use the full tile width and show in full.
function TileAddButton({
  name,
  outOfStock,
  onAdd,
}: {
  name: string;
  outOfStock: boolean | undefined;
  onAdd: () => void;


}) {
  return (
    <span
      role="button"
      tabIndex={outOfStock ? -1 : 0}
      aria-label={`Quick add ${name} to the order`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (!outOfStock) onAdd();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        e.stopPropagation();
        if (!outOfStock) onAdd();
      }}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-pill tap-safe",
        outOfStock ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground",
      )}
    >
      {outOfStock ? <Ban className="size-4" /> : <Plus className="size-4" />}
    </span>
  );
}

// Remaining-stock pill shared by photo and text tiles.
function StockBadge({
  stock,
  outOfStock,
  low,
  corner,
}: {
  stock: number | undefined;
  outOfStock: boolean | undefined;
  low: boolean;
  corner?: boolean;


}) {
  if (typeof stock !== "number" || outOfStock) return null;
  return (
    <span
      title={`${stock} in stock`}
      className={cn(
        // Photo tiles pin the badge to the top-right corner so it never
        // steals a line from the marquee name; text tiles show it inline
        // after the name, as before.
        corner
          ? "absolute right-2 top-2 z-10 rounded-pill px-1 text-fs-xs font-extrabold leading-4 ring-1 ring-surface"
          : "inline-block shrink-0 rounded-pill px-1 text-fs-xs font-extrabold leading-4",
        low ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
      )}
    >
      {low ? `- ${stock}` : stock}
    </span>
  );
}

function NewOrder() {

  const navigate = useNavigate();
  const { totals, addItem, settings } = usePos();
  const showProductPrices = productPricesVisible(settings.devicePreferences);
  const [openPriceItem, setOpenPriceItem] = useState<MenuItem | null>(null);
  const quickAdd = (item: MenuItem) => {
    // Open-price products always ask for a price before joining the order.
    if (item.openPrice) {
      setOpenPriceItem(item);
      return;
    }
    addItem(item.id, { qty: 1 });
    haptic("success");
    toast.success(`${item.name} added`);
  };
  const priceLabel = (item: MenuItem) =>
    item.outOfStock
      ? "Out of stock"
      : showProductPrices
        ? item.openPrice
          ? "Open price"
          : money(item.price)
        : null;

  const initialMenu = menus[0];
  const initialCategory = initialMenu?.categories[0];
  const [activeMenu, setActiveMenu] = useState(initialMenu?.id ?? "");
  const [activeCategory, setActiveCategory] = useState(initialCategory?.id ?? "");
  const [subcategory, setSubcategory] = useState(initialCategory?.subcategories[0] ?? "");
  const [menuToolsOpen, setMenuToolsOpen] = useState(false);
  const [categoryLayout, setCategoryLayout] = useState<"horizontal" | "vertical">("vertical");
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [editingLine, setEditingLine] = useState<CartLine | null>(null);
  const editCartLine = (line: CartLine) => {
    const found = [...baseMenu, ...liveMenu].find((m) => line.id === m.id || line.id.startsWith(`${m.id}-`));
    if (!found) return;
    setEditingLine(line);
    setSheetItem(found);
  };
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"menu" | "order">("menu");
  // Landscape shows the menu and the running order side by side, so the
  // Menu/Order switch is phone-only.
  const wide = useWideLayout();
  const landscape = useLandscapeWide();
  const [moreOpen, setMoreOpen] = useState(false);
  const [customItemOpen, setCustomItemOpen] = useState(false);
  const [railHost, setRailHost] = useState<HTMLElement | null>(null);
  const [moreHost, setMoreHost] = useState<HTMLElement | null>(null);
  const panelLeft = useOrderPanelSide() === "left";
  const [panelDragX, setPanelDragX] = useState<number | null>(null);
  const docked = wide && landscape;
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
  // Custom Item takes over the product area, so menu browsing tools step out.
  const customActive = customItemOpen && showMenu;

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
        className="h-10 min-w-tap rounded-card"
      >
        {menuToolsOpen ? <MenuFoldIcon className="size-7!" /> : <MenuUnfoldIcon className="size-7!" />}
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
            className="h-9 min-w-tap rounded-card"
          >
            {categoryLayout === "horizontal" ? (
              <ArrowRangeIcon className="size-6! rotate-90" />
            ) : (
              <ArrowRangeIcon className="size-6!" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-9 max-w-[12rem] gap-1 rounded-card px-3 text-fs-sm font-extrabold"
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
        "flex h-9 shrink-0 items-center justify-center rounded-pill px-3 text-center text-[0.8125rem] font-extrabold uppercase leading-[1.05] tracking-tight transition-colors",
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
        wide ? (panelLeft ? "flex-row-reverse" : "flex-row") : "flex-col",
      )}
    >
      {wide ? <DropZones x={panelDragX} /> : null}
      {/* Left column: header (menu + category pills) and the product grid. */}
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden",
          wide ? "min-w-0 flex-1" : showMenu ? "min-h-0 flex-1" : "shrink-0",
        )}
      >
      {wide && customActive ? null : (
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

          {customActive ? null : (
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
              {/* The three-dot order options sit right after the search field. */}
              {wide ? <span ref={setMoreHost} className="contents" /> : null}
            </div>
          )}
        </div>

        {/* Phone: menu selector and categories stay directly above subcategories. */}
        {!wide && showMenu && !customActive ? (
          <div className="no-scrollbar mt-1.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto">
            {menuSelector}
            {categoryButtons}
          </div>
        ) : null}

        {showMenu && !customActive ? <MenuSubcategories entries={subcategories} selected={subcategory} onSelect={setSubcategory} layout={categoryLayout} /> : null}
      </div>
      )}

        {customActive ? (
          <CustomItemWorkspace onClose={() => setCustomItemOpen(false)} />
        ) : (
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
                    : `${item.name}, choose options`
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
                  // Open-price products ask for a price first; everything else
                  // opens the item sheet with its options.
                  if (item.openPrice) {
                    setOpenPriceItem(item);
                    return;
                  }
                  setSheetItem(item);
                }}
                className={cn(
                  item.image
                    ? // Photo tiles keep the compact top-down flow: image,
                      // name, then the price row.
                      "relative flex min-h-tile min-w-0 flex-col justify-start overflow-hidden rounded-card border border-border bg-surface p-3 text-left transition-transform active:scale-[0.98]"
                    : // Text tiles align the name at the top; the name block
                      // absorbs the slack so the price row still rests at the
                      // bottom and prices line up across tiles.
                      "relative flex min-h-tile min-w-0 flex-col justify-between overflow-hidden rounded-card border border-border bg-surface p-3 text-left transition-transform active:scale-[0.98]",
                  item.outOfStock && "opacity-50",
                )}
              >
                {item.image ? (
                  <span className="relative -mx-3 -mt-3 mb-1.5 block aspect-[2/1] w-bleed-x max-w-none overflow-hidden">
                    <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                  </span>
                ) : null}
                <span
                  className={cn(
                    "flex min-h-0 flex-col",
                    item.image
                      ? "justify-start"
                      : // Text tiles top-align the name: the block absorbs the
                        // slack and reserves two name lines, so every tile in a
                        // text-only category ends at the same height.
                        "flex-1 justify-start",
                    !item.image && "min-h-[calc(var(--fs-sm)*2.5)]",
                  )}
                >
                  <span
                    className={cn(
                      "block w-full min-w-0 max-w-full leading-tight text-foreground",
                      item.image ? "font-light" : "font-extrabold",
                      // The corner stock badge sits over the photo tile's top
                      // line, so reserve room for it there.
                      item.image && typeof item.stock === "number" && !item.outOfStock && "pr-6",
                    )}
                  >
                    {item.image ? <RunName name={item.name} /> : <FitName name={item.name} steps={nameSizes} />}
                    <StockBadge stock={item.stock} outOfStock={item.outOfStock} low={low} corner={!!item.image} />
                  </span>
                </span>
                <span className="mt-1 flex min-w-0 items-center justify-between gap-2">
                  {item.openPrice && !item.outOfStock && showProductPrices ? (
                    <span className="rounded-pill bg-muted px-1.5 py-0.5 text-[0.6875rem] font-bold leading-4 whitespace-nowrap text-foreground">
                      Open price
                    </span>
                  ) : (
                    <span className="text-fs-sm font-bold leading-none text-muted-foreground">
                      {priceLabel(item)}
                    </span>
                  )}
                  <TileAddButton
                    name={item.name}
                    outOfStock={item.outOfStock}
                    onAdd={() => quickAdd(item)}
                  />
                </span>

              </button>
              );
            })}
          </div>
        )}
        </div>
        )}
      </div>

      {/* The order options rail sits on the menu side of the summary panel. */}
      {moreOpen && docked && !panelLeft ? (
        <aside ref={setRailHost} className="w-[5.75rem] shrink-0 overflow-hidden border-border bg-surface border-l" />
      ) : null}

      <aside
        className={cn(
          "relative flex min-h-0 flex-col overflow-hidden transition-[width] duration-300",
          showCart ? "" : "hidden",
          wide
            ? moreOpen && docked
              ? cn("w-[24rem] shrink-0 border-border bg-surface lg:w-[24rem]", panelLeft ? "border-r" : "border-l")
              : cn("w-[24rem] shrink-0 border-border bg-surface 2xl:w-[26rem]", panelLeft ? "border-r" : "border-l")
            : "min-w-0 flex-1 bg-surface",

        )}
      >
        <OrderPanel
          wide={wide}
          dragGrip={
            wide ? (
              <DragGrip
                label="order panel"
                onMove={setOrderPanelSide}
                onDragPosition={setPanelDragX}
                className="size-5 shrink-0 rounded-full"
              />
            ) : null
          }
          onEditLine={editCartLine}
          customItemOpen={customItemOpen}
          moreOpen={moreOpen}
          onMoreOpenChange={setMoreOpen}
          railHost={railHost}
          moreHost={moreHost}
          docked={docked}
          onCustomItem={() => {
            setMoreOpen(false);
            // While the workspace is open the option reads "Menu Item": tapping it
            // hands the product area back to the menu and its products.
            if (customItemOpen) {
              setCustomItemOpen(false);
              setTab("menu");
              return;
            }
            setSearching(false);
            setQuery("");
            setCustomItemOpen(true);
            setTab("menu");
          }}
        />
      </aside>



      {moreOpen && docked && panelLeft ? (
        <aside ref={setRailHost} className="w-[5.75rem] shrink-0 overflow-hidden border-border bg-surface border-r" />
      ) : null}

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

      <ItemSheet
        item={sheetItem}
        editLine={editingLine}
        onClose={() => {
          setSheetItem(null);
          setEditingLine(null);
        }}
      />
      <OpenPricePad
        item={openPriceItem}
        onClose={() => setOpenPriceItem(null)}
        onSave={(item, price) => {
          addItem(item.id, { qty: 1, price });
          haptic("success");
          toast.success(`${item.name} added at ${money(price)}`);
        }}
      />
    </div>
  );
}
