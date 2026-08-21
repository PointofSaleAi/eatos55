import { Printer, X } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";
import { money, type CartLine } from "@/lib/demo-data";
import type { Room } from "@/lib/floor-data";
import { cn } from "@/lib/utils";

export type RoomBillTotals = {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

/**
 * The paper bill the guest signs before a charge posts to their room.
 * Deliberately printed-ticket looking: narrow column, torn edges, ruled rows
 * and a fixed money column so figures line up like a real till slip.
 */
export function RoomBillSheet({
  open,
  room,
  lines,
  totals,
  orderNumber,
  venue,
  onPrint,
  onClose,
}: {
  open: boolean;
  room: Room | null;
  lines: CartLine[];
  totals: RoomBillTotals;
  orderNumber: number;
  venue: string;
  onPrint: () => void;
  onClose: () => void;
}) {
  const wide = useWideViewport();
  const { dragStyle, handleProps } = useSheetDrag(onClose);

  const stay = room?.stay;
  const stamp = new Date().toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const paper = room ? (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3">
      <div className="mx-auto flex min-h-0 w-full max-w-[26rem] flex-1 flex-col overflow-hidden drop-shadow-sm">
        {/* Paper tears sit above and below the printed area, cut out of the sheet. */}
        <TornEdge />

        <div className="min-h-0 flex-1 overflow-hidden bg-background px-4">
          <div className="text-center">

            <p className="truncate text-fs-sm font-extrabold uppercase tracking-[0.22em] text-foreground">
              {venue}
            </p>
            <p className="mt-0.5 truncate text-fs-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Room bill for signature
            </p>
          </div>

          <dl className="mt-3 space-y-1 border-y border-dashed border-border py-2.5 text-fs-xs">
            <BillFact label="Room" value={`${room.name} · ${room.number}`} />
            <BillFact label="Guest" value={room.guest ?? room.name} />
            {stay ? (
              <BillFact label="Stay" value={`${stay.stayFrom} - ${stay.stayTo}`} />
            ) : null}
            <BillFact label="Order" value={`#${orderNumber}`} />
            <BillFact label="Printed" value={stamp} />
          </dl>

          {/* Items get the only inner scroll, so the header and totals stay put. */}
          <div className="mt-2.5 max-h-[38dvh] min-h-0 overflow-y-auto pr-0.5">
            <p className="mb-1 text-fs-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Items ordered
            </p>
            <ul className="space-y-1">
              {lines.length === 0 ? (
                <li className="text-fs-xs text-muted-foreground">No items on this check.</li>
              ) : (
                lines.map((l) => (
                  <li
                    key={l.id}
                    className="grid grid-cols-[1.75rem_minmax(0,1fr)_5.5rem] items-baseline gap-1 text-fs-xs"
                  >
                    <span className="font-extrabold tabular-nums text-muted-foreground">
                      {l.qty}x
                    </span>
                    <span className="min-w-0 truncate font-bold text-foreground">{l.name}</span>
                    <span className="text-right font-extrabold tabular-nums text-foreground">
                      {money(l.price * l.qty)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="mt-2.5 space-y-1 border-t border-dashed border-border pt-2.5">
            <BillRow label="Sub total" value={money(totals.subtotal)} />
            <BillRow label="Tax" value={money(totals.tax)} />
            <BillRow label="Tip" value={money(totals.tip)} />
            <div className="mt-1 flex items-baseline justify-between gap-2 border-t border-border pt-1.5">
              <span className="text-fs-sm font-extrabold uppercase tracking-[0.06em] text-foreground">
                Total due
              </span>
              <span className="text-fs-lg font-extrabold tabular-nums text-foreground">
                {money(totals.total)}
              </span>
            </div>
          </div>

          <div className="mt-3 border-t border-dashed border-border pt-3">
            <p className="text-fs-xs text-muted-foreground">
              Charge to room {room.number}
              {stay ? ` · booking ${stay.bookingNumber}` : ""}
            </p>
            <div className="mt-4 h-px w-full bg-foreground/70" />
            <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <p className="truncate text-fs-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Guest signature
              </p>
              <p className="shrink-0 truncate text-fs-xs text-muted-foreground">
                {room.guest ?? room.name}
              </p>
            </div>
          </div>

          <p className="mt-2.5 pb-1 text-center text-fs-xs text-muted-foreground">
            Tips can be added later from the ticket.
          </p>
        </div>

        <TornEdge flip />
      </div>
    </div>
  ) : null;

  const actions = (
    <div className="shrink-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-2 border-t border-border bg-surface px-4 pb-[calc(0.75rem+var(--kb-inset,0px))] pt-3">
      <button
        type="button"
        onClick={onClose}
        className="flex h-ctl-lg items-center justify-center rounded-row border border-border bg-surface px-3 text-fs-sm font-extrabold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-muted"
      >
        Close
      </button>
      <button
        type="button"
        onClick={onPrint}
        className="flex h-ctl-lg items-center justify-center gap-2 rounded-row bg-primary px-3 text-fs-sm font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-opacity active:opacity-90"
      >
        <Printer className="size-4 shrink-0" aria-hidden />
        <span className="min-w-0 truncate">Print bill</span>
      </button>
    </div>
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent
          hideClose
          className="flex max-h-[92dvh] w-[min(30rem,94vw)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
            <DialogTitle className="min-w-0 flex-1 truncate text-fs-lg font-extrabold text-foreground">
              Room bill
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close room bill"
              className="grid size-10 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>
          {paper}
          {actions}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto flex max-h-[94dvh] w-full max-w-sheet flex-col gap-0 rounded-t-sheet border-0 bg-surface p-0"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="shrink-0 px-4 pb-2 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            Room bill
          </SheetTitle>
        </SheetHeader>
        {paper}
        {actions}
      </SheetContent>
    </Sheet>
  );
}

/** Scalloped paper tear, so the bill reads as a printed slip and not a card. */
function TornEdge({ flip }: { flip?: boolean }) {
  const mask =
    "repeating-radial-gradient(circle at 0.35rem 100%, transparent 0 0.3rem, #000 0.31rem 0.7rem)";
  return (
    <div
      aria-hidden
      className={cn("h-2 w-full shrink-0 bg-background", flip && "rotate-180")}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

function BillFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-baseline gap-2">
      <dt className="shrink-0 font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right font-extrabold text-foreground">{value}</dd>
    </div>
  );
}

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-fs-xs">
      <span className="truncate font-bold text-muted-foreground">{label}</span>
      <span className="shrink-0 font-extrabold tabular-nums text-foreground">{value}</span>
    </div>
  );
}
