import { Delete, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";
import { money } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/**
 * Reference-capture surface shared by the delivery partners, loyalty lookup and
 * in-kind tender. Centred dialog on tablet/web, bottom sheet on phones so the
 * payment grid behind it is never pushed off-screen.
 */
export function ReferenceTenderDialog({
  open,
  title,
  hint,
  due,
  inputLabel,
  placeholder,
  numeric = true,
  reasons,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  hint?: string | undefined;
  due: number;
  inputLabel: string;
  placeholder?: string | undefined;
  numeric?: boolean | undefined;
  /** Optional preset reasons/quick picks shown above the field. */
  reasons?: string[] | undefined;
  confirmLabel?: string | undefined;
  onClose: () => void;
  onConfirm: (value: string) => void;
}) {
  const wide = useWideViewport();
  const [value, setValue] = useState("");
  const { dragStyle, handleProps } = useSheetDrag(onClose);

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  const ready = value.trim().length >= (numeric ? 3 : 2);

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {hint ? <p className="text-fs-xs text-muted-foreground">{hint}</p> : null}

        {reasons?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue(r)}
                aria-pressed={value === r}
                className={cn(
                  "min-h-ctl-sm rounded-pill border px-3 text-fs-sm font-bold transition-colors",
                  value === r
                    ? "border-success bg-success/10 text-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        ) : null}

        <label className="mt-3 block">
          <span className="text-fs-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
            {inputLabel}
          </span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode={numeric ? "numeric" : "text"}
            placeholder={placeholder}
            className="mt-1 min-h-ctl-lg w-full rounded-row border border-border bg-background px-3 text-fs-base font-bold tabular-nums text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus:border-primary"
          />
        </label>

        {numeric ? (
          <div className="mx-auto mt-3 grid w-full max-w-sm grid-cols-3 gap-2">
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setValue((v) => (v + k).slice(0, 18))}
                className={cn(
                  "grid min-h-key place-items-center rounded-card bg-muted text-fs-xl font-extrabold text-foreground transition-transform active:scale-[0.97]",
                  k === "0" && "col-start-2",
                )}
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              aria-label="Delete last digit"
              onClick={() => setValue((v) => v.slice(0, -1))}
              className="grid min-h-key place-items-center rounded-card bg-muted text-foreground transition-transform active:scale-[0.97]"
            >
              <Delete className="size-5" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(0.75rem+var(--kb-inset,0px))] pt-3">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-ctl-lg rounded-row bg-muted px-4 text-fs-sm font-extrabold text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onConfirm(value.trim())}
            className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
          >
            {confirmLabel ?? `Charge ${money(due)}`}
          </button>
        </div>
      </div>
    </div>
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent className="flex max-h-[88vh] w-[min(30rem,92vw)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0">
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
            <DialogTitle className="min-w-0 flex-1 truncate text-fs-lg font-extrabold text-foreground">
              {title}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="grid size-10 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="pt-3">{body}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto flex max-h-[90dvh] w-full max-w-sheet flex-col gap-0 rounded-t-sheet border-0 bg-surface p-0"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="shrink-0 px-4 pb-2 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            {title}
          </SheetTitle>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}
