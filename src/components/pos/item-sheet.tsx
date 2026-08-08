import { NotebookPen, Pencil, Percent } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { addOnGroups, modifierGroups, money, type MenuItem } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/**
 * Item detail sheet (live app parity): price edit, quantity picker, item notes,
 * Item / Add-Ons tabs with modifier groups, line discount and the ADD button.
 */
export function ItemSheet({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
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

  useEffect(() => {
    if (item) setPrice(item.price);
  }, [item]);

  const groups = tab === "item" ? modifierGroups : addOnGroups;
  const activeGroup = groups.find((g) => g.name === group) ?? groups[0]!;

  const modifierTotal = useMemo(
    () => Object.values(selected).reduce((sum, p) => sum + p, 0),
    [selected],
  );
  const lineTotal =
    (price + modifierTotal) * qty * (1 - (discount?.percent ?? 0) / 100);

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
          className="max-h-[90dvh] overflow-y-auto rounded-t-3xl border-0 bg-surface p-0"
        >
          {item ? (
            <>
              <SheetHeader className="px-4 pb-2 pt-5 text-left">
                <SheetTitle className="text-xl font-extrabold text-foreground">
                  {item.name}
                </SheetTitle>
              </SheetHeader>

              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 pb-3">
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
                      className="h-10 w-24 rounded-full border border-border bg-surface px-3 text-sm font-bold text-foreground outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingPrice(true)}
                      className="flex min-h-[40px] items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-foreground"
                    >
                      {money(price)}
                      <Pencil className="size-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <select
                  aria-label="Quantity"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="h-10 shrink-0 rounded-full border border-border bg-surface px-3 text-sm font-bold text-foreground outline-none"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3">
                  <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Item Notes"
                    aria-label="Item notes"
                    className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
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
                      "min-h-[40px] rounded-full text-sm font-extrabold uppercase transition-colors",
                      t === tab
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {t === "item" ? "Item" : "Add-Ons"}
                  </button>
                ))}
              </div>

              <p className="px-4 pb-2 pt-4 text-sm font-bold text-muted-foreground">
                Additional Modifiers
              </p>
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4">
                {groups.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => setGroup(g.name)}
                    className={cn(
                      "min-h-[36px] shrink-0 rounded-full px-4 text-xs font-bold transition-colors",
                      g.name === activeGroup.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 px-4 py-3 sm:grid-cols-2">
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
                          if (on) delete next[key];
                          else next[key] = o.price;
                          return next;
                        })
                      }
                      className={cn(
                        "flex min-h-[48px] items-center justify-between gap-2 rounded-2xl border px-4 text-left text-sm font-bold transition-colors",
                        on
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-surface text-foreground",
                      )}
                    >
                      <span className="min-w-0 truncate">{o.name}</span>
                      {o.price ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          +{money(o.price)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-surface px-4 pb-6 pt-3">
                <button
                  type="button"
                  onClick={() => setDiscountOpen(true)}
                  aria-label="Apply discount"
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-full border",
                    discount
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-foreground",
                  )}
                >
                  <Percent className="size-5" />
                </button>
                <button
                  type="button"
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
                  className="min-h-[52px] flex-1 rounded-full bg-primary text-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground"
                >
                  Add · {money(lineTotal)}
                </button>
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
