import { Check } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { discountPresets } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

/** Discount picker sheet: Comp Meal 100%, Employee Shift 50%, Police & Fire 20%. */
export function DiscountSheet({
  open,
  selected,
  onClose,
  onPick,
}: {
  open: boolean;
  selected: string | null;
  onClose: () => void;
  onPick: (discount: { name: string; percent: number }) => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent side="bottom" style={dragStyle} className="mx-auto w-full max-w-[420px] rounded-t-3xl border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]">
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1.5 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-base font-extrabold text-foreground">
            Discount
          </SheetTitle>
        </SheetHeader>
        <div>
          {discountPresets.map((d, i) => {
            const active = selected === d.name;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onPick({ name: d.name, percent: d.percent })}
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
                {active ? <Check className="size-5 shrink-0 text-success" /> : null}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
