import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { NumPad } from "@/components/pos/numpad";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";
import { cashDenominations, money } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

/**
 * Inline amount entry for one tender. Stays on the payment screen so a guest
 * can pay part of the balance with one method and the rest with another.
 */
export function AmountEntry({
  open,
  title,
  due,
  denominations = false,
  onClose,
  onCommit,
}: {
  open: boolean;
  title: string;
  /** Balance still outstanding on the check. */
  due: number;
  denominations?: boolean;
  onClose: () => void;
  onCommit: (amount: number) => void;
}) {
  const wide = useWideViewport();
  const [amount, setAmount] = useState("");
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const entered = Number(amount || "0");
  const change = Math.round((entered - due) * 100) / 100;
  const partial = entered > 0 && entered < due;

  useEffect(() => {
    if (open) setAmount("");
  }, [open, title]);

  const body = (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3">
      <div className="shrink-0 text-center">
        <p className="text-fs-money font-extrabold leading-none tabular-nums text-foreground">
          {money(entered)}
        </p>
        <p className="mt-1 text-fs-sm text-muted-foreground">
          Due {money(due)}
          {amount ? (
            change >= 0 ? (
              <span className="font-bold text-success"> · Change {money(change)}</span>
            ) : (
              <span className="font-bold text-destructive">
                {" "}
                · Remaining {money(Math.abs(change))}
              </span>
            )
          ) : null}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setAmount(String(due))}
          className="min-h-tap rounded-pill border border-border bg-surface px-3 text-fs-xs font-extrabold uppercase tracking-[0.06em] text-foreground"
        >
          Full {money(due)}
        </button>
        <button
          type="button"
          onClick={() => setAmount(String(Math.round((due / 2) * 100) / 100))}
          className="min-h-tap rounded-pill border border-border bg-surface px-3 text-fs-xs font-extrabold uppercase tracking-[0.06em] text-foreground"
        >
          Half
        </button>
        {denominations
          ? cashDenominations.slice(0, wide ? 6 : 4).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setAmount(String(Math.round((entered + d) * 100) / 100))}
                className="min-h-tap rounded-pill border border-border bg-surface px-3 text-fs-xs font-extrabold text-foreground"
              >
                ${d}
              </button>
            ))
          : null}
      </div>

      <NumPad
        className="min-h-0 flex-1"
        onDigit={(d) =>
          setAmount((cur) => {
            if (d === "." && cur.includes(".")) return cur;
            const next = `${cur}${d}`;
            return next.length > 9 ? cur : next;
          })
        }
        onBackspace={() => setAmount((cur) => cur.slice(0, -1))}
      />

      <button
        type="button"
        disabled={entered <= 0}
        onClick={() => onCommit(entered)}
        className={cn(
          "h-ctl-lg w-full shrink-0 rounded-row text-fs-base font-extrabold uppercase tracking-[0.06em] transition-colors disabled:opacity-40",
          partial
            ? "bg-foreground text-background"
            : "bg-primary text-primary-foreground",
        )}
      >
        {partial
          ? `Apply ${money(entered)} of ${money(due)}`
          : `Charge ${money(entered || due)}`}
      </button>
    </div>
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent
          hideClose
          className="flex h-[min(38rem,88dvh)] w-[min(26rem,94vw)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
            <DialogTitle className="min-w-0 flex-1 truncate text-fs-lg font-extrabold text-foreground">
              {title}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close amount entry"
              className="grid size-10 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto flex max-h-[92dvh] w-full max-w-sheet flex-col gap-0 rounded-t-sheet border-0 bg-surface p-0"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="shrink-0 px-4 pb-1 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            {title}
          </SheetTitle>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}
