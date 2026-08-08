import { NotebookPen, Pencil, Percent } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { addOnGroups, modifierGroups, money, type MenuItem } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { cn } from "@/lib/utils";

/**
 * Item detail sheet (live app parity): price edit, quantity picker, item notes,
 * Item / Add-Ons tabs with modifier groups, line discount and the ADD button.
 * Compact portrait-phone scale: pinned header + footer, single scroll area.
 */
export function ItemSheet({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  useBackDismiss(!!item, onClose);
  const { addItem } = usePos();
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(item?.price ?? 0);
  const [editingPrice, setEditingPrice] = useState(false);
  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState<"item" | "addons">("item");
  const [group, setGroup] = useState(modifierGroups[0]!.name);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState<{ name: string; percent: number } | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const { dragStyle, handleProps } = useSheetDrag(() => {
    reset();
    onClose();
  });

  useEffect(() => {
    if (!item) return;
    setPrice(item.openPrice ? 0 : item.price);
    setEditingPrice(Boolean(item.openPrice));
  }, [item]);

  const groups = tab === "item" ? modifierGroups : addOnGroups;
  const activeGroup = groups.find((g) => g.name === group) ?? groups[0]!;

  const modifierTotal = useMemo(
    () => Object.values(selected).reduce((sum, p) => sum + p, 0),
    [selected],
  );
  const lineTotal =
    (price + modifierTotal) * qty * (1 - (discount?.percent ?? 0) / 100);

  const requiredMissing = modifierGroups
    .filter((g) => g.required)
    .filter((g) => !Object.keys(selected).some((k) => k.startsWith(`${g.name} · `)))
    .map((g) => g.name);
  const openPriceMissing = Boolean(item?.openPrice) && price <= 0;
  const selectedList = Object.keys(selected).map((k) => k.split(" · ")[1] ?? k);

  const reset = () => {
    setQty(1);
    setNotes("");
    setSelected({});
    setDiscount(null);
    setTab("item");
    setEditingPrice(false);
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
          side="bottom"
          style={dragStyle}
          className="mx-auto flex max-h-[78dvh] w-full max-w-[420px] flex-col rounded-t-3xl border-0 bg-surface p-0"
        >
          {item ? (
            <>
              <SheetGrabber handleProps={handleProps} />
              <SheetHeader className="shrink-0 px-4 pb-1 pt-1 text-left" {...handleProps}>
                <SheetTitle className="truncate text-base font-extrabold uppercase tracking-[0.02em] text-foreground">
                  {item.name}
                </SheetTitle>
              </SheetHeader>

              <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 pb-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {editingPrice ? (
                      <input
                        autoFocus
                        type="number"
                        inputMode="decimal"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                        onBlur={() => setEditingPrice(false)}
                        aria-label="Item price"
                        className="h-9 w-20 rounded-full border border-border bg-surface px-3 text-[13px] font-bold text-foreground outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingPrice(true)}
                        className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-bold text-foreground"
                      >
                        {money(price)}
                        <Pencil className="size-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <select
                    aria-label="Quantity"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="h-9 shrink-0 rounded-full border border-border bg-surface px-2.5 text-[13px] font-bold text-foreground outline-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3">
                    <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Item Notes"
                      aria-label="Item notes"
                      className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 px-4">
                  {(["item", "addons"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTab(t);
                        setGroup((t === "item" ? modifierGroups : addOnGroups)[0]!.name);
                      }}
                      className={cn(
                        "h-9 rounded-full text-xs font-extrabold uppercase transition-colors",
                        t === tab
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {t === "item" ? "Item" : "Add-Ons"}
                    </button>
                  ))}
                </div>

                <p className="px-4 pb-1.5 pt-3 text-xs font-bold text-muted-foreground">
                  Additional Modifiers
                </p>
                <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-4">
                  {groups.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setGroup(g.name)}
                      className={cn(
                        "h-8 shrink-0 rounded-full px-3 text-[11px] font-bold transition-colors",
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

                <div className="grid grid-cols-2 gap-2 px-4 py-2.5">
                  {activeGroup.options.map((o) => {
                    const key = `${activeGroup.name} · ${o.name}`;
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
                            if ((activeGroup.select ?? "multi") === "single") {
                              for (const existing of Object.keys(next)) {
                                if (existing.startsWith(`${activeGroup.name} · `)) delete next[existing];
                              }
                            }
                            next[key] = o.price;
                            return next;
                          })
                        }
                        className={cn(
                          "flex h-10 items-center justify-between gap-1.5 rounded-xl border px-3 text-left text-[13px] font-bold transition-colors",
                          on
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-surface text-foreground",
                        )}
                      >
                        <span className="min-w-0 truncate">{o.name}</span>
                        {o.price ? (
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            +{money(o.price)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(1rem+var(--kb-inset,0px))] pt-2.5">
                {selectedList.length || requiredMissing.length || openPriceMissing ? (
                  <p className="pb-1.5 text-[11px] font-bold text-muted-foreground">
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
                    "grid size-10 shrink-0 place-items-center rounded-full border",
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
                      ...(notes ? { notes } : {}),
                      modifiers: Object.keys(selected),
                      ...(discount ? { discountPercent: discount.percent } : {}),
                    });
                    toast.success(`${item.name} added`);
                    reset();
                    onClose();
                  }}
                  className="h-11 flex-1 rounded-full bg-primary text-[13px] font-extrabold uppercase tracking-[0.06em] text-primary-foreground disabled:opacity-40"
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
