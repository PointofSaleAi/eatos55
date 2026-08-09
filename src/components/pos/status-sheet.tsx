import { Check, Circle } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type StatusOption<T extends string> = {
  id: T;
  label: string;
  /** Colour swatch class for the leading dot; never the only status signal. */
  dot: string;
};

/** Status picker sheet used by the floor plan tiles and the rooms list. */
export function StatusSheet<T extends string>({
  open,
  title,
  options,
  value,
  onClose,
  onPick,
}: {
  open: boolean;
  title: string;
  options: StatusOption<T>[];
  value: T | null;
  onClose: () => void;
  onPick: (id: T) => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1.5 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div>
          {options.map((o, i) => {
            const active = value === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onPick(o.id)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-tap w-full items-center gap-3 px-4 py-3.5 text-left",
                  i % 2 === 0 ? "bg-muted/40" : "bg-surface",
                )}
              >
                <Circle className={cn("size-3.5 shrink-0 fill-current", o.dot)} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                  {o.label}
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
