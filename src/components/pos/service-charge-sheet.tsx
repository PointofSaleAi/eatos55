import { Check } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { money, serviceChargePresets } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export type ServiceChargePreset = {
  name: string;
  /** Percent presets recompute as the cart changes. */
  percent?: number;
  /** Flat-fee presets keep their amount. */
  amount?: number;
};

/** Service-charge picker sheet, styled like the Discount picker. */
export function ServiceChargeSheet({
  open,
  activeCharge,
  activePercent,
  activeName,
  onClose,
  onPick,
}: {
  open: boolean;
  /** Charge currently applied to the order, or 0. */
  activeCharge: number;
  /** Percent part of the applied charge, or 0. */
  activePercent: number;
  /** Name of the applied preset, "" when none. */
  activeName: string;
  onClose: () => void;
  onPick: (preset: ServiceChargePreset | null) => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const isActive = (percent?: number, amount?: number) => {
    if (!activeName) return false;
    return percent != null
      ? activePercent === percent
      : activePercent === 0 && Math.abs(activeCharge - (amount ?? 0)) < 0.01;
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
                onClick={() => onPick({ name: preset.name, percent: preset.percent, amount: preset.amount })}
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
          {activeCharge > 0 || activePercent > 0 ? (
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
