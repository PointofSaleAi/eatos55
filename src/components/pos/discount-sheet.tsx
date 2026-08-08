import { Check } from "lucide-react";
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
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 bg-surface p-0 pb-8">
        <SheetHeader className="px-4 pb-2 pt-5">
          <SheetTitle className="text-center text-xl font-extrabold text-foreground">
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
                  "flex w-full items-center gap-4 px-4 py-5 text-left",
                  i % 2 === 0 ? "bg-muted/40" : "bg-surface",
                )}
              >
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                  {d.name}
                </span>
                <span className="shrink-0 text-sm font-bold text-muted-foreground">
                  {d.percent}%
                </span>
                {active ? <Check className="size-6 shrink-0 text-success" /> : null}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
