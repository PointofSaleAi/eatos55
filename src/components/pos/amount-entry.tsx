import { Minus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { NumPad } from "@/components/pos/numpad";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";
import { cashDenominations, money } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type NoteCounts = Record<number, number>;

const round = (n: number) => Math.round(n * 100) / 100;

function notesTotal(counts: NoteCounts) {
  return cashDenominations.reduce((sum, d) => sum + d * (counts[d] ?? 0), 0);
}

/**
 * Shared cash / tender amount panel: money summary, note counter for cash,
 * a full-height keypad and one charge bar. Used by the payment screen dialog
 * and by the full-screen tender routes so cash looks the same everywhere.
 */
export function AmountEntryPanel({
  due,
  denominations = false,
  initialAmount = "",
  actionLabel,
  onCommit,
  wide,
  className,
}: {
  due: number;
  denominations?: boolean;
  initialAmount?: string;
  actionLabel?: (amount: number) => string;
  onCommit: (amount: number) => void;
  /** Two-column composition for landscape tablet / desktop. */
  wide?: boolean;
  className?: string;
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [notes, setNotes] = useState<NoteCounts>({});
  const entered = Number(amount || "0");
  const change = round(entered - due);
  const short = entered > 0 && entered < due;
  const counted = cashDenominations.filter((d) => (notes[d] ?? 0) > 0);

  const type = (d: string) => {
    setNotes({});
    setAmount((cur) => {
      if (d === "." && cur.includes(".")) return cur;
      const next = `${cur}${d}`;
      return next.length > 9 ? cur : next;
    });
  };

  const bumpNote = (d: number, delta: number) => {
    setNotes((cur) => {
      const next = { ...cur, [d]: Math.max(0, (cur[d] ?? 0) + delta) };
      setAmount(() => {
        const total = notesTotal(next);
        return total > 0 ? String(total) : "";
      });
      return next;
    });
  };

  const quick = (value: number) => {
    setNotes({});
    setAmount(String(round(value)));
  };

  const summary = (
    <div className="shrink-0 space-y-2 text-center">
      <p className="text-fs-money font-extrabold leading-none tabular-nums text-foreground">
        {money(entered)}
      </p>
      <p className="text-fs-sm text-muted-foreground">Due {money(due)}</p>
      <p
        className={cn(
          "text-fs-base font-extrabold",
          !amount && "text-muted-foreground",
          amount && short && "text-destructive",
          amount && !short && "text-success",
        )}
      >
        {!amount
          ? "Enter amount tendered"
          : short
            ? `Remaining ${money(Math.abs(change))}`
            : `Change due ${money(change)}`}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => quick(due)}
          className="min-h-tap rounded-pill border border-border bg-surface px-4 text-fs-xs font-extrabold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-muted"
        >
          Exact {money(due)}
        </button>
        <button
          type="button"
          onClick={() => quick(due / 2)}
          className="min-h-tap rounded-pill border border-border bg-surface px-4 text-fs-xs font-extrabold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-muted"
        >
          Half
        </button>
      </div>
    </div>
  );

  const noteCounter = denominations ? (
    <div className="shrink-0 space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
          Notes counted
        </p>
        <button
          type="button"
          onClick={() => {
            setNotes({});
            setAmount("");
          }}
          disabled={counted.length === 0}
          className="min-h-ctl-sm rounded-pill px-2 text-fs-xs font-extrabold uppercase tracking-[0.06em] text-destructive disabled:opacity-40"
        >
          Clear notes
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cashDenominations.map((d) => {
          const count = notes[d] ?? 0;
          return (
            <div key={d} className="relative">
              <button
                type="button"
                onClick={() => bumpNote(d, 1)}
                aria-label={`Add one $${d} note`}
                className={cn(
                  "min-h-tap w-full rounded-card border text-fs-base font-extrabold tabular-nums transition-colors",
                  count > 0
                    ? "border-success bg-success/10 text-foreground shadow-sm"
                    : "border-border bg-surface text-muted-foreground hover:bg-muted",
                )}
              >
                ${d}
              </button>
              {count > 0 ? (
                <>
                  <span className="pointer-events-none absolute -right-1 -top-1 grid size-5 place-items-center rounded-pill bg-success text-[0.65rem] font-extrabold text-success-foreground">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => bumpNote(d, -1)}
                    aria-label={`Remove one $${d} note`}
                    className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-pill bg-destructive text-destructive-foreground"
                  >
                    <Minus className="size-3" />
                  </button>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      {counted.length > 0 ? (
        <p className="px-1 text-fs-xs text-muted-foreground">
          {counted.map((d) => `${notes[d]} x $${d}`).join(", ")}
        </p>
      ) : null}
    </div>
  ) : null;

  const pad = (
    <NumPad
      className={cn("min-h-0 flex-1", wide && "h-full self-stretch")}
      onDigit={type}
      onBackspace={() => setAmount((cur) => cur.slice(0, -1))}
    />
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3", className)}>
      {wide ? (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
          <div className="flex min-h-0 flex-col justify-center gap-4">
            {summary}
            {noteCounter}
          </div>
          <div className="flex min-h-0 flex-col">{pad}</div>
        </div>
      ) : (
        <>
          {summary}
          {noteCounter}
          {pad}
        </>
      )}

      <button
        type="button"
        disabled={entered <= 0}
        onClick={() => onCommit(entered)}
        className="h-ctl-lg w-full shrink-0 rounded-row bg-shell text-fs-base font-extrabold uppercase tracking-[0.06em] text-shell-foreground transition-colors disabled:opacity-40"
      >
        {actionLabel
          ? actionLabel(entered)
          : short
            ? `Apply ${money(entered)} of ${money(due)}`
            : `Charge ${money(entered || due)}`}
      </button>
    </div>
  );
}

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
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    if (open) setSeq((s) => s + 1);
  }, [open, title]);

  const body = (
    <AmountEntryPanel
      key={seq}
      due={due}
      denominations={denominations}
      onCommit={onCommit}
      wide={wide}
    />
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent
          hideClose
          className="flex h-[min(34rem,88dvh)] w-[min(46rem,94vw)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0"
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
