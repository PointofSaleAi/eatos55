import { Check, Receipt, X } from "lucide-react";
import { useState } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * "Split With" sheet: pick which checks an item is shared between.
 * Mirrors the handheld design - one row per check with a checkbox and SAVE.
 */
export function SplitWithSheet({
  open,
  itemName,
  checkLabel,
  checks,
  selected,
  onToggle,
  onClose,
  onSave,
}: {
  open: boolean;
  itemName: string;
  checkLabel: string;
  checks: string[];
  selected: string[];
  onToggle: (letter: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        hideClose

        side="bottom"
        style={dragStyle}
        className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1 pt-1" {...handleProps}>
          <div className="flex items-center gap-2">
            <SheetTitle className="min-w-0 flex-1 truncate text-left text-fs-base font-extrabold text-foreground">
              {itemName}
            </SheetTitle>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="grid size-9 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>
        </SheetHeader>
        <p className="px-4 pb-2 text-fs-sm text-muted-foreground">Split With</p>
        <div className="max-h-[45vh] space-y-2 overflow-y-auto px-4">
          {checks.map((letter) => {
            const active = selected.includes(letter);
            return (
              <button
                key={letter}
                type="button"
                onClick={() => onToggle(letter)}
                aria-pressed={active}
                className="flex min-h-tap w-full items-center gap-3 rounded-row border border-border px-3 py-3 text-left transition-colors hover:bg-muted"
              >
                <Receipt className="size-5 shrink-0 text-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                  {checkLabel} - {letter}
                </span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-[0.35rem] border",
                    active ? "border-accent bg-accent text-accent-foreground" : "border-border",
                  )}
                >
                  {active ? <Check className="size-4" /> : null}
                </span>
              </button>
            );
          })}
        </div>
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={onSave}
            className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground"
          >
            Save
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Print sheet: parent / child order choice then Print. */
export function PrintSplitSheet({
  open,
  onClose,
  onPrint,
}: {
  open: boolean;
  onClose: () => void;
  onPrint: (target: "parent" | "child") => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const [target, setTarget] = useState<"parent" | "child">("parent");
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            Print
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center gap-3 px-4 pt-2">
          {(
            [
              { id: "parent", label: "Print parent Orders" },
              { id: "child", label: "Print child orders" },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setTarget(o.id)}
              aria-pressed={target === o.id}
              className={cn(
                "min-h-tap rounded-pill px-6 text-fs-sm font-bold transition-colors",
                target === o.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-foreground hover:bg-secondary",
              )}
            >
              {o.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPrint(target)}
            className="mt-2 h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
          >
            Print
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
