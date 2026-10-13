import { Plus } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { money, statusMeta, type Ticket } from "@/lib/demo-data";
import { tableStateMeta, type TableState } from "@/lib/floor-data";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet listing every ticket a floor-plan table owns: open tickets first,
 * paid ones after. Tapping a ticket resumes it; New Order starts a fresh one.
 */
export function TableTicketsSheet({
  open,
  label,
  seats,
  state,
  tickets,
  onClose,
  onOpenTicket,
  onNewOrder,
}: {
  open: boolean;
  label: string;
  seats: number;
  state: TableState;
  tickets: Ticket[];
  onClose: () => void;
  onOpenTicket: (id: string) => void;
  onNewOrder: () => void;
}) {
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const openRows = tickets.filter((t) => t.status !== "paid");
  const paidRows = tickets.filter((t) => t.status === "paid");
  const rows = [...openRows, ...paidRows];

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto w-full max-w-[26rem] rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-1.5 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            Table {label}
          </SheetTitle>
          <p className="text-center text-fs-xs font-bold text-muted-foreground">
            {seats} seats · {tableStateMeta[state].label}
          </p>
        </SheetHeader>
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
          {rows.length === 0 ? (
            <p className="px-4 py-6 text-center text-fs-sm text-muted-foreground">
              No tickets yet
            </p>
          ) : (
            rows.map((t, i) => {
              const meta = statusMeta[t.status];
              const items = t.lines.reduce((n, l) => n + l.qty, 0);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onOpenTicket(t.id)}
                  className={cn(
                    "flex min-h-tap w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-secondary",
                    i % 2 === 0 ? "bg-muted/40" : "bg-surface",
                  )}
                >
                  <span className={cn("shrink-0 t-badge", meta.tone)}>{meta.label}</span>
                  <span className="block min-w-0 flex-1">
                    <span className="block truncate text-fs-sm font-bold text-foreground">
                      {t.label}
                    </span>
                    <span className="block text-fs-xs font-bold text-muted-foreground">
                      {items} {items === 1 ? "item" : "items"} · Arrived At {t.arrivedAt}
                    </span>
                  </span>
                  <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
                    {money(t.total)}
                  </span>
                </button>
              );
            })
          )}
        </div>
        <div className="px-4 pt-2">
          <button
            type="button"
            onClick={onNewOrder}
            className="flex min-h-ctl-lg w-full items-center justify-center gap-1.5 rounded-row bg-accent px-3 text-fs-sm font-extrabold uppercase text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            New Order
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
