import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mic,
  Pencil,
  Percent,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { ItemNotesField } from "@/components/pos/item-notes-field";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { itemAddOnGroups, itemModifierGroups, money, type MenuItem } from "@/lib/demo-data";
import { useAnnounce } from "@/components/pos/live-region";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { cn } from "@/lib/utils";

type SpeechRecognitionLike = {
  lang: string;
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

const SORT_LABELS = {
  az: "Name A-Z",
  za: "Name Z-A",
  lohi: "Price Low-High",
  hilo: "Price High-Low",
} as const;

/**
 * Item detail sheet (live app parity): price edit, quantity picker, item notes,
 * Item / Add-Ons tabs with modifier groups, line discount and the ADD button.
 * Compact portrait-phone scale: pinned header + footer, single scroll area.
 */
export function ItemSheet({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  useBackDismiss(!!item, onClose);
  const { addItem, settings } = usePos();
  const announce = useAnnounce();
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(item?.price ?? 0);
  const [editingPrice, setEditingPrice] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [tab, setTab] = useState<"item" | "addons">("item");
  const [group, setGroup] = useState<string>("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState<{ name: string; percent: number } | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"az" | "za" | "lohi" | "hilo">("az");
  const [sortOpen, setSortOpen] = useState(false);
  const { dragStyle, handleProps } = useSheetDrag(() => {
    reset();
    onClose();
  });

  useEffect(() => {
    if (!item) return;
    setPrice(item.openPrice ? 0 : item.price);
    setEditingPrice(Boolean(item.openPrice));
  }, [item]);

  const itemGroups = useMemo(
    () => (item ? itemModifierGroups(item, settings.productModifierRules) : []),
    [item, settings.productModifierRules],
  );
  const addOns = useMemo(
    () => (item ? itemAddOnGroups(item, settings.productModifierRules) : []),
    [item, settings.productModifierRules],
  );
  const groups = tab === "item" ? itemGroups : addOns;
  const activeGroup = groups.find((g) => g.name === group) ?? groups[0];

  // Options are paged instead of scrolled so the sheet always fits its height.
  const perPage = 8;
  const query = search.trim().toLowerCase();
  const baseOptions = useMemo(() => {
    // On Add-Ons, searching looks across every add-on group at once.
    const pool =
      tab === "addons" && query
        ? addOns.flatMap((g) => g.options.map((o) => ({ ...o, group: g.name })))
        : (activeGroup?.options ?? []).map((o) => ({ ...o, group: activeGroup?.name ?? "" }));
    const filtered = query
      ? pool.filter((o) => o.name.toLowerCase().includes(query))
      : pool;
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "za") return b.name.localeCompare(a.name);
      if (sort === "lohi") return a.price - b.price || a.name.localeCompare(b.name);
      return b.price - a.price || a.name.localeCompare(b.name);
    });
    return sorted;
  }, [tab, query, addOns, activeGroup, sort]);
  const pages = Math.max(1, Math.ceil(baseOptions.length / perPage));
  const pageIndex = Math.min(page, pages - 1);
  const visibleOptions = baseOptions.slice(pageIndex * perPage, pageIndex * perPage + perPage);

  const modifierTotal = useMemo(
    () => Object.values(selected).reduce((sum, p) => sum + p, 0),
    [selected],
  );
  const lineTotal =
    (price + modifierTotal) * qty * (1 - (discount?.percent ?? 0) / 100);

  const requiredMissing = itemGroups
    .filter((g) => g.required)
    .filter((g) => !Object.keys(selected).some((k) => k.startsWith(`${g.name} · `)))
    .map((g) => g.name);
  const openPriceMissing = Boolean(item?.openPrice) && price <= 0;
  const selectedList = Object.keys(selected).map((k) => k.split(" · ")[1] ?? k);

  const reset = () => {
    setQty(1);
    setNotes([]);
    setSelected({});
    setDiscount(null);
    setTab("item");
    setPage(0);
    setGroup("");
    setEditingPrice(false);
    setSearch("");
    setSort("az");
    setSortOpen(false);
  };

  const startVoiceSearch = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.info("Voice search is not available on this device");
      return;
    }
    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) setSearch(text);
    };
    rec.onerror = () => toast.info("Could not hear anything, try again");
    rec.start();
    toast.info("Listening…");
  };

  return (
    <>
      <Sheet
        open={item !== null}
        onOpenChange={(open) => {
          if (!open) {
            reset();
            onClose();
          }
        }}
      >
        <SheetContent
        hideClose
          side="bottom"
          style={dragStyle}
          className="mx-auto flex max-h-[min(78dvh,42rem)] w-full max-w-sheet flex-col rounded-t-sheet border-0 bg-surface p-0"
        >
          {item ? (
            <>
              <SheetGrabber handleProps={handleProps} />
              <SheetHeader className="shrink-0 px-4 pb-1.5 pt-0.5 text-left" {...handleProps}>
                <div className="flex items-center gap-2">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="size-11 shrink-0 rounded-card border border-border object-cover sm:size-14"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid size-11 shrink-0 place-items-center rounded-card border border-border bg-muted text-muted-foreground sm:size-14"
                    >
                      <UtensilsCrossed className="size-5" />
                    </span>
                  )}
                  <SheetTitle className="line-clamp-2 min-w-0 flex-1 leading-tight text-fs-base font-extrabold uppercase tracking-[0.02em] text-foreground">
                    {item.name}
                  </SheetTitle>
                  {/* Cost and quantity sit at the right end of the name row. */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {editingPrice ? (
                      <input
                        autoFocus
                        type="number"
                        inputMode="decimal"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                        onBlur={() => setEditingPrice(false)}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label="Item price"
                        className="h-ctl-sm w-20 rounded-pill border border-border bg-surface px-3 text-fs-sm font-bold text-foreground outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingPrice(true)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="flex h-ctl-sm items-center gap-1 rounded-pill border border-border px-2.5 text-fs-sm font-bold text-foreground sm:gap-1.5 sm:px-3"
                      >
                        {money(price)}
                        <Pencil className="size-3.5 text-muted-foreground" />
                      </button>
                    )}
                    <span className="relative w-[3.25rem] shrink-0">
                      <select
                        aria-label="Quantity"
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="h-ctl-sm w-full appearance-none rounded-pill border border-border bg-surface pl-2.5 pr-5 text-left text-fs-sm font-bold text-foreground outline-none"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                      />
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex min-h-0 flex-1 flex-col">

                <div className="relative z-10 px-4 pb-2">
                  <ItemNotesField notes={notes} onChange={setNotes} />
                </div>

                {itemGroups.length && addOns.length ? (
                  <div className="grid shrink-0 grid-cols-2 gap-2 px-4">
                    {(["item", "addons"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTab(t);
                          setPage(0);
                          setGroup((t === "item" ? itemGroups : addOns)[0]?.name ?? "");
                        }}
                        className={cn(
                          "h-ctl-sm rounded-pill text-fs-xs font-extrabold uppercase transition-colors",
                          t === tab
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-secondary",
                        )}
                      >
                        {t === "item" ? "Item" : "Add-Ons"}
                      </button>
                    ))}
                  </div>
                ) : null}

                {tab === "addons" ? (
                  <div className="flex shrink-0 items-center gap-2 px-4 pt-2.5">
                    <div className="flex h-ctl-md min-w-0 flex-1 items-center gap-2 rounded-pill border border-border bg-surface px-3">
                      <Search className="size-4 shrink-0 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(0);
                        }}
                        placeholder="Search for Add-Ons"
                        aria-label="Search add-ons"
                        className="h-full min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none"
                      />
                      <button
                        type="button"
                        onClick={startVoiceSearch}
                        aria-label="Voice search"
                        className="grid size-7 shrink-0 place-items-center rounded-pill text-muted-foreground hover:text-foreground"
                      >
                        <Mic className="size-4" />
                      </button>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setSortOpen((o) => !o)}
                        aria-label={`Sort add-ons, currently ${SORT_LABELS[sort]}`}
                        aria-expanded={sortOpen}
                        className={cn(
                          "grid size-ctl-md place-items-center rounded-pill border transition-colors",
                          sortOpen || sort !== "az"
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <ArrowUpDown className="size-4" />
                      </button>
                      {sortOpen ? (
                        <>
                          <button
                            type="button"
                            aria-label="Close sort menu"
                            className="fixed inset-0 z-10 cursor-default"
                            onClick={() => setSortOpen(false)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1.5 w-40 overflow-hidden rounded-card border border-border bg-surface shadow-lg">
                            {(Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map(
                              (key) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setSort(key);
                                    setSortOpen(false);
                                    setPage(0);
                                  }}
                                  className={cn(
                                    "block w-full px-3 py-2 text-left text-fs-sm font-bold transition-colors",
                                    key === sort
                                      ? "bg-accent/10 text-foreground"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                  )}
                                >
                                  {SORT_LABELS[key]}
                                </button>
                              ),
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {activeGroup ? (
                  <>
                    <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-1.5 pt-3">
                      <p className="text-fs-xs font-bold text-muted-foreground">
                        Additional Modifiers
                      </p>
                      {pages > 1 ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label="Previous options"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={pageIndex === 0}
                            className="grid size-7 place-items-center rounded-pill border border-border text-foreground disabled:opacity-40"
                          >
                            <ChevronLeft className="size-3.5" />
                          </button>
                          <span className="text-fs-xs font-bold text-muted-foreground">
                            {pageIndex + 1} / {pages}
                          </span>
                          <button
                            type="button"
                            aria-label="More options"
                            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                            disabled={pageIndex >= pages - 1}
                            className="grid size-7 place-items-center rounded-pill border border-border text-foreground disabled:opacity-40"
                          >
                            <ChevronRight className="size-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {query ? null : (
                    <div className="no-scrollbar flex shrink-0 items-center gap-1.5 overflow-x-auto px-4">
                      {groups.map((g) => (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => {
                            setGroup(g.name);
                            setPage(0);
                          }}
                          className={cn(
                            "h-ctl-sm shrink-0 rounded-pill px-3 text-fs-xs font-bold transition-colors",
                            g.name === activeGroup.name
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-secondary",
                          )}
                        >
                          {g.name}
                          {g.required ? <span className="text-accent"> *</span> : null}
                        </button>
                      ))}
                    </div>
                    )}

                    <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-2 px-4 py-2.5 sm:grid-cols-3 lg:grid-cols-4">
                      {visibleOptions.map((o) => {
                        const optGroup = groups.find((g) => g.name === o.group) ?? activeGroup;
                        const key = `${o.group} · ${o.name}`;
                        const on = key in selected;
                        return (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={on}
                            onClick={() =>
                              setSelected((s) => {
                                const next = { ...s };
                                if (on) {
                                  delete next[key];
                                  return next;
                                }
                                if ((optGroup?.select ?? "multi") === "single") {
                                  for (const existing of Object.keys(next)) {
                                    if (existing.startsWith(`${o.group} · `))
                                      delete next[existing];
                                  }
                                }
                                next[key] = o.price;
                                return next;
                              })
                            }
                            className={cn(
                              "flex min-h-11 flex-wrap items-center justify-between gap-x-2 gap-y-0.5 rounded-row border px-3 py-2 text-left text-fs-sm font-bold transition-colors",
                              on
                                ? "border-accent bg-accent/10 text-foreground"
                                : "border-border bg-surface text-foreground",
                            )}
                          >
                            {/* Full modifier name on one line; when it cannot fit beside the price, the whole name wraps to its own second line (never split mid-word). */}
                            <span className="max-w-full shrink-0 whitespace-normal leading-tight">
                              {o.name}
                            </span>
                            {o.price ? (
                              <span className="shrink-0 text-fs-xs text-muted-foreground">
                                +{money(o.price)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                      {visibleOptions.length === 0 ? (
                        <p className="col-span-full grid place-items-center py-6 text-fs-sm font-bold text-muted-foreground">
                          No add-ons match “{search.trim()}”
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : null}

              </div>

              <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(1rem+var(--kb-inset,0px))] pt-2.5">
                {selectedList.length || requiredMissing.length || openPriceMissing ? (
                  <p className="pb-1.5 text-fs-xs font-bold text-muted-foreground">
                    {openPriceMissing
                      ? "Enter a price for this open-price item"
                      : requiredMissing.length
                        ? `Select ${requiredMissing.join(", ")}`
                        : selectedList.join(" · ")}
                  </p>
                ) : null}
                <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountOpen(true)}
                  aria-label="Apply discount"
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-pill border tap-safe",
                    discount
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-foreground",
                  )}
                >
                  <Percent className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={openPriceMissing || requiredMissing.length > 0}
                  onClick={() => {
                    addItem(item.id, {
                      qty,
                      price: price + modifierTotal,
                      ...(notes.length ? { notes: notes.join(", ") } : {}),
                      modifiers: Object.keys(selected),
                      ...(discount ? { discountPercent: discount.percent } : {}),
                    });
                    haptic("success");
                    announce(`${item.name} added to the order`);
                    toast.success(`${item.name} added`);
                    reset();
                    onClose();
                  }}
                  className="h-ctl-lg flex-1 rounded-pill bg-primary text-fs-sm font-extrabold uppercase tracking-[0.06em] text-primary-foreground disabled:opacity-40"
                >
                  Add · {money(lineTotal)}
                </button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <DiscountSheet
        open={discountOpen}
        selected={discount?.name ?? null}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          setDiscount(d);
          setDiscountOpen(false);
        }}
      />
    </>
  );
}
