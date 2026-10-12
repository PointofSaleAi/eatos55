import { Check } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { money, serviceChargePresets } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export type ServiceChargePreset = {
  name: string;
  /** Resolved charge amount for the current order. */
  charge: number;
};

/** Service-charge picker sheet, styled like the Discount picker. */
export function ServiceChargeSheet({
  open,
  activeCharge,
  baseAmount,
  onClose,
  onPick,
}: {
  open: boolean;
  /** Charge currently applied to the order, or 0. */
  activeCharge: number;
  /** Order gross that percent presets calculate from. */
  baseAmount: number;
  onClose: () => void;
  onPick: (preset: ServiceChargePreset | null) => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const isActive = (percent?: number, amount?: number) => {
    if (activeCharge <= 0) return false;
    const value =
      percent != null ? Math.round(baseAmount * percent) / 100 : (amount ?? 0);
    return Math.abs(value - activeCharge) < 0.01;
  };

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="sheet-compact mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1.5 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            Service Charge
          </SheetTitle>
          <p className="mt-0.5 text-center text-fs-xs font-bold text-muted-foreground">
            Select a service charge to apply to the current order
          </p>
        </SheetHeader>
        <div>
          {serviceChargePresets.map((preset, i) => {
            const active = isActive(preset.percent, preset.amount);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  const charge =
                    preset.percent != null
                      ? Math.round(baseAmount * preset.percent) / 100
                      : (preset.amount ?? 0);
                  onPick({ name: preset.name, charge });
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left",
                  i % 2 === 0 ? "bg-muted/40" : "bg-surface",
                )}
              >
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                  {preset.name}
                </span>
                <span className="shrink-0 text-fs-sm font-bold text-muted-foreground">
                  {preset.percent != null ? `${preset.percent}%` : money(preset.amount ?? 0)}
                </span>
                {active ? <Check className="size-5 shrink-0 text-success" /> : null}
              </button>
            );
          })}
          {activeCharge > 0 ? (
            <button
              type="button"
              onClick={() => onPick(null)}
              className="flex w-full items-center gap-3 bg-surface px-4 py-3.5 text-left"
            >
              <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-destructive">
                Remove service charge
              </span>
            </button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
