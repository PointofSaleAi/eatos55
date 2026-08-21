import { Delete } from "lucide-react";
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
  const cap = Math.max(1, seats || 1);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    if (open) setEntry("");
  }, [open]);

  const count = entry === "" ? cap : Math.max(0, Number(entry));
  const valid = count >= 1 && count <= Math.max(cap, 20);

  const press = (d: string) => {
    setEntry((prev) => {
      const next = (prev + d).replace(/^0+/, "").slice(0, 2);
      return next;
    });
  };

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        hideClose
        side="bottom"
        style={dragStyle}
        className="mx-auto w-full max-w-[19rem] rounded-t-sheet border-0 bg-surface p-0 pb-[calc(0.75rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-muted-foreground">
            {table ? `Table #${table}` : "Guests"}
          </SheetTitle>
        </SheetHeader>

        <p
          aria-live="polite"
          className="border-b border-border pb-2 text-center text-fs-xl font-extrabold leading-none text-foreground"
        >
          {count}
        </p>
        <p className="pt-1 text-center text-fs-xs text-muted-foreground">
          Seats {cap} · guests seated
        </p>

        <div className="grid grid-cols-3 gap-1.5 px-3 pt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => press(d)}
              className="grid min-h-ctl-sm place-items-center rounded-row bg-muted text-fs-base font-extrabold text-foreground transition-transform active:scale-[0.97]"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEntry("")}
            className="grid min-h-ctl-sm place-items-center rounded-row bg-muted text-fs-xs font-extrabold uppercase text-muted-foreground transition-transform active:scale-[0.97]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => press("0")}
            className="grid min-h-ctl-sm place-items-center rounded-row bg-muted text-fs-base font-extrabold text-foreground transition-transform active:scale-[0.97]"
          >
            0
          </button>
          <button
            type="button"
            aria-label="Backspace"
            onClick={() => setEntry((p) => p.slice(0, -1))}
            className="grid min-h-ctl-sm place-items-center rounded-row bg-muted text-foreground transition-transform active:scale-[0.97]"
          >
            <Delete className="size-4" />
          </button>
        </div>

        <div className="px-3 pt-2">
          <button
            type="button"
            disabled={!valid}
            onClick={() => onStart(count)}
            className={cn(
              "min-h-ctl-sm w-full rounded-row bg-primary text-fs-xs font-extrabold uppercase text-primary-foreground transition-transform active:scale-[0.99]",
              !valid && "opacity-40",
            )}
          >
            Start order
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
