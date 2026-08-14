import { Minus, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Asks how many guests are seated before an order is started on a table. */
export function GuestsSheet({
  open,
  table,
  seats,
  onClose,
  onStart,
}: {
  open: boolean;
  table: string | null;
  seats: number;
  onClose: () => void;
  onStart: (count: number) => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const [count, setCount] = useState(seats || 1);

  useEffect(() => {
    if (open) setCount(Math.max(1, seats || 1));
  }, [open, seats]);

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        hideClose
        side="bottom"
        style={dragStyle}
        className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1.5 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            {table ? `${table} · Guests` : "Guests"}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pt-2">
          <div className="flex items-center gap-2 rounded-row border border-border bg-surface px-3">
            <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 text-fs-sm text-muted-foreground">Guests seated</span>
            <button
              type="button"
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              aria-label="Fewer guests"
              className="grid size-11 shrink-0 place-items-center text-foreground disabled:opacity-40"
              disabled={count <= 1}
            >
              <Minus className="size-4" />
            </button>
            <span
              aria-live="polite"
              className="min-w-[2rem] text-center text-fs-base font-extrabold text-foreground"
            >
              {count}
            </span>
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(20, c + 1))}
              aria-label="More guests"
              className="grid size-11 shrink-0 place-items-center text-foreground"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={n === count}
                onClick={() => setCount(n)}
                className={cn(
                  "min-h-tap rounded-row text-fs-sm font-bold transition-colors",
                  n === count
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onStart(count)}
            className="mt-4 min-h-ctl-lg w-full rounded-row bg-primary text-fs-sm font-extrabold text-primary-foreground transition-transform active:scale-[0.99]"
          >
            Start order
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
