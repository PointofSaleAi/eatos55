import { Check } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { discountPresets } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

/** Splits a combined "A, B" discount label back into picked names. */
export const splitPicked = (label: string | null | undefined) =>
  (label ?? "").split(", ").map((s) => s.trim()).filter(Boolean);

/** Multi-select discount picker: each tap toggles a discount; percents add up (max 100%). */
export function DiscountSheet({
  open,
  selected,
  onClose,
  onPick,
}: {
  open: boolean;
  /** Combined label of the applied discounts ("A, B"), or null. */
  selected: string | null;
  onClose: () => void;
  /** Receives the combined discount; name "" and percent 0 when none is picked. */
  onPick: (discount: { name: string; percent: number }) => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const picked = splitPicked(selected);
  const toggle = (name: string) => {
    const next = picked.includes(name) ? picked.filter((n) => n !== name) : [...picked, name];
    const chosen = discountPresets.filter((d) => next.includes(d.name));
    onPick({
      name: chosen.map((d) => d.name).join(", "),
      percent: Math.min(100, chosen.reduce((s, d) => s + d.percent, 0)),
    });
  };
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent side="bottom" style={dragStyle} className="sheet-compact mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]">
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1.5 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            Discount
          </SheetTitle>
          <p className="mt-0.5 text-center text-fs-xs font-bold text-muted-foreground">
            Select one or more discounts
          </p>
        </SheetHeader>
        <div>
          {discountPresets.map((d, i) => {
            const active = picked.includes(d.name);
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(d.name)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left",
                  i % 2 === 0 ? "bg-muted/40" : "bg-surface",
                )}
              >
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                  {d.name}
                </span>
                <span className="shrink-0 text-fs-sm font-bold text-muted-foreground">
                  {d.percent}%
                </span>
                <Check className={cn("size-5 shrink-0 text-success", active ? "" : "invisible")} />
              </button>
            );
          })}
        </div>
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl bg-primary text-fs-sm font-extrabold text-primary-foreground"
          >
            Done
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
