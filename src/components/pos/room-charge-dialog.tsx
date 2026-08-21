import { BedDouble, Check, ChevronLeft, ChevronRight, Printer, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { RoomBillSheet } from "@/components/pos/room-bill-sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";
import { money } from "@/lib/demo-data";
import { floors, rooms, type Room } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/** Remaining credit on the stay; a room with none cannot take a charge. */
function creditLeft(room: Room) {
  if (!room.stay) return 0;
  return Math.max(0, Math.round((room.stay.creditLimit - room.stay.creditUsed) * 100) / 100);
}

/** Column and row count for the room grid so it never needs a scrollbar. */
function useGridShape(wide: boolean, picked: boolean) {
  const [shape, setShape] = useState({ cols: 2, rows: 3 });
  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const narrowPane = wide && picked;
      const cols = narrowPane ? 2 : w >= 1024 ? 3 : w >= 640 ? 3 : 2;
      const rows = h >= 900 ? 3 : 2;
      setShape((prev) => (prev.cols === cols && prev.rows === rows ? prev : { cols, rows }));
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [wide, picked]);
  return shape;
}

/**
 * Room charge picker. Rooms on the left, the picked stay on the right for tablet
 * and desktop; a two step flow on phones. The guest signs a printed paper bill
 * before the charge can post.
 */
export function RoomChargeDialog({
  open,
  due,
  onClose,
  onCharge,
}: {
  open: boolean;
  due: number;
  onClose: () => void;
  onCharge: (room: Room) => void;
}) {
  const wide = useWideViewport();
  const { cart, totals, tickets, settings } = usePos();
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState<string>("All floors");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  /** Time the guest bill was printed for signature; posting waits for it. */
  const [printedAt, setPrintedAt] = useState<string | null>(null);
  const [billOpen, setBillOpen] = useState(false);
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const { cols, rows } = useGridShape(wide, pickedId !== null);
  const pageSize = cols * rows;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => {
      if (floor !== "All floors" && r.floor !== floor) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.number.includes(q) ||
        (r.guest ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, floor]);

  useEffect(() => {
    setPage(0);
  }, [query, floor, pageSize]);

  useEffect(() => {
    if (!open) {
      setPickedId(null);
      setPage(0);
      setQuery("");
      setFloor("All floors");
      setPrintedAt(null);
      setBillOpen(false);
    }
  }, [open]);

  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visible = list.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const picked = rooms.find((r) => r.id === pickedId) ?? null;
  const left = picked ? creditLeft(picked) : 0;
  const canCharge = Boolean(picked && picked.stay && left >= due);

  const pct = picked?.stay
    ? Math.min(
        100,
        Math.round((picked.stay.creditUsed / Math.max(1, picked.stay.creditLimit)) * 100),
      )
    : 0;

  const floorPills = (
    <div className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto rounded-pill bg-muted p-1">
      {["All floors", ...floors].map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => setFloor(f)}
          aria-pressed={f === floor}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-fs-xs font-extrabold uppercase tracking-[0.06em] transition-colors",
            f === floor
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {f}
        </button>
      ))}
    </div>
  );

  const roomGrid = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 px-3 pb-2.5">
        <div className={cn(wide && "hidden")}>{floorPills}</div>
        <label className="flex min-w-0 items-center gap-2 rounded-row border border-border bg-background px-3 min-h-ctl-md">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search room or guest"
            aria-label="Search rooms"
            className="min-w-0 flex-1 bg-transparent py-2 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="shrink-0 text-fs-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
            {list.length}
          </span>
        </label>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 pb-3">
        {list.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-fs-sm text-muted-foreground">
            No rooms match that search.
          </p>
        ) : (
          <div
            className="grid min-h-0 flex-1 content-start gap-2"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridAutoRows: "max-content",
            }}
          >
            {visible.map((r) => {
              const spare = creditLeft(r);
              const blocked = !r.stay || spare < due;
              const active = r.id === pickedId;
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={blocked}
                  onClick={() => {
                    setPickedId(r.id);
                    setPrintedAt(null);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-ctl-lg min-w-0 flex-col gap-1 rounded-card border bg-surface px-2.5 py-2 text-left transition-colors",
                    active
                      ? "border-foreground bg-muted/40"
                      : "border-border hover:border-muted-foreground/40",
                    blocked && "border-dashed opacity-60",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "grid min-h-7 min-w-7 shrink-0 place-items-center rounded-row px-1.5 text-fs-xs font-extrabold",
                        active
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {r.number}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 truncate text-fs-xs font-extrabold uppercase tracking-[0.06em]",
                        blocked ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {blocked
                        ? r.stay
                          ? "Low credit"
                          : "No booking"
                        : (r.stay?.roomType ?? r.name)}
                    </span>
                  </span>
                  <span className="block truncate text-fs-sm font-bold text-foreground">
                    {r.guest ?? "Vacant"}
                  </span>
                  <span className="block truncate text-fs-xs font-bold text-muted-foreground">
                    {r.stay ? `Credit ${money(spare)}` : r.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {pages > 1 ? (
          <div className="flex shrink-0 items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              aria-label="Previous rooms"
              className="grid size-10 place-items-center rounded-pill border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="size-5" />
            </button>
            <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Page {safePage + 1} of {pages}
            </p>
            <button
              type="button"
              onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
              disabled={safePage >= pages - 1}
              aria-label="More rooms"
              className="grid size-10 place-items-center rounded-pill border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const footer =
    picked && picked.stay ? (
      <div className="shrink-0 space-y-2 border-t border-border bg-surface px-4 pb-[calc(0.75rem+var(--kb-inset,0px))] pt-3">
        <button
          type="button"
          disabled={!canCharge}
          onClick={() => setBillOpen(true)}
          className={cn(
            "flex h-ctl-lg w-full items-center justify-center gap-2 rounded-row border px-4 text-fs-sm font-extrabold uppercase tracking-[0.06em] transition-colors disabled:opacity-40",
            printedAt
              ? "border-success bg-success/10 text-foreground"
              : "border-border bg-surface text-foreground hover:bg-muted",
          )}
        >
          {printedAt ? (
            <Check className="size-4 shrink-0" aria-hidden />
          ) : (
            <Printer className="size-4 shrink-0" aria-hidden />
          )}
          <span className="min-w-0 truncate">
            {printedAt ? `Bill printed ${printedAt} · view again` : "Print bill for signature"}
          </span>
        </button>
        <button
          type="button"
          disabled={!canCharge || !printedAt}
          onClick={() => onCharge(picked)}
          className="flex h-ctl-lg w-full items-center justify-center gap-3 rounded-row bg-primary px-4 text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
        >
          <span className="min-w-0 truncate">Post charge to room {picked.number}</span>
          <span className="shrink-0 rounded-row bg-primary-foreground/20 px-2.5 py-0.5 text-fs-sm">
            {money(due)}
          </span>
        </button>
        <p className="truncate text-center text-fs-xs text-muted-foreground">
          {printedAt
            ? "Tips are added later from the ticket."
            : "Guest signs the printed bill before it posts."}
        </p>
      </div>
    ) : (
      <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(0.75rem+var(--kb-inset,0px))] pt-3">
        <p className="truncate text-center text-fs-xs text-muted-foreground">
          Pick a room to see the stay, credit and bill.
        </p>
      </div>
    );

  const review =
    picked && picked.stay ? (
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-3">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPickedId(null);
              setPrintedAt(null);
            }}
            aria-label="Back to room list"
            title="Back to room list"
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted",
              wide && "hidden",
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
          <BedDouble className="size-4 shrink-0 text-foreground" aria-hidden />
          <p className="min-w-0 truncate text-fs-sm font-extrabold text-foreground">
            {picked.guest ?? picked.name} · {picked.number}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 rounded-card border border-border bg-muted/40 p-2.5">
          <Fact label="Booking number" value={picked.stay.bookingNumber} />
          <Fact
            label="Stay dates"
            value={`${picked.stay.stayFrom} - ${picked.stay.stayTo} (${picked.stay.nights} Night${picked.stay.nights === 1 ? "" : "s"})`}
          />
          <Fact
            label="Occupancy"
            value={`${picked.stay.occupancy} (Max ${picked.stay.maxAdults}A, ${picked.stay.maxChildren}C)`}
          />
          <Fact
            label="Room / bed type"
            value={`${picked.stay.roomType} / ${picked.stay.bedType}`}
          />
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-2">
          <Allowance label="Daily food" value={money(picked.stay.foodAllowancePerDay)} tone="primary" />
          <Allowance
            label="Alcohol"
            value={picked.stay.alcoholAllowed ? "Allowed" : "Not allowed"}
            tone={picked.stay.alcoholAllowed ? "success" : "destructive"}
          />
          <Allowance label="Meals" value={`${picked.stay.meals.length} included`} />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col justify-between gap-2.5 rounded-card bg-foreground p-3 text-background">
            <div>
              <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                <div className="min-w-0">
                  <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.14em] text-background/60">
                    Available credit
                  </p>
                  <p className="truncate text-fs-xl font-extrabold tabular-nums">{money(left)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-fs-xs font-extrabold uppercase tracking-[0.14em] text-background/60">
                    Limit
                  </p>
                  <p className="text-fs-sm font-bold tabular-nums">
                    {money(picked.stay.creditLimit)}
                  </p>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-pill bg-background/20">
                <div className="h-full bg-success" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between gap-2 text-fs-xs font-bold text-background/60">
                <span className="truncate">Used {money(picked.stay.creditUsed)}</span>
                <span className="shrink-0">{pct}% used</span>
              </div>
            </div>

            <div className="border-t border-background/20 pt-2">
              <div className="mb-1 flex justify-between gap-2 text-fs-xs font-bold text-background/60">
                <span>Transaction total</span>
                <span className="tabular-nums">{money(due)}</span>
              </div>
              <div className="flex justify-between gap-2 text-fs-base font-extrabold uppercase tracking-[0.06em]">
                <span>Due today</span>
                <span className="tabular-nums">{money(due)}</span>
              </div>
              <p className="mt-1 truncate text-fs-xs font-bold text-background/60">
                {canCharge
                  ? `${money(Math.max(0, left - due))} credit left after this bill`
                  : "Not enough credit left on this stay."}
              </p>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  const title = "Select Room";

  const billSheet = (
    <RoomBillSheet
      open={billOpen}
      room={picked}
      lines={cart}
      totals={{
        subtotal: totals.subtotal,
        tax: totals.tax,
        tip: 0,
        total: due,
      }}
      orderNumber={tickets.length + 1}
      venue={settings.venueName ?? "eatOS"}
      onClose={() => setBillOpen(false)}
      onPrint={() => {
        const at = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        setPrintedAt(at);
        setBillOpen(false);
        toast.success(`Bill printed for signature at ${at}`);
      }}
    />
  );

  if (wide) {
    return (
      <>
        <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
          <DialogContent
            hideClose
            className="flex h-[min(44rem,90dvh)] max-h-[90dvh] w-[min(60rem,95vw)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0"
          >
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <DialogTitle className="shrink-0 truncate text-fs-lg font-extrabold text-foreground">
                  {title}
                </DialogTitle>
                <div className="min-w-0 overflow-hidden">{floorPills}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close room charge"
                className="grid size-10 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] overflow-hidden">
              <div className="flex min-h-0 flex-col overflow-hidden border-r border-border pt-3">
                {roomGrid}
              </div>
              <div className="flex min-h-0 flex-col overflow-hidden">
                {review ?? (
                  <p className="flex flex-1 items-center justify-center px-6 text-center text-fs-sm text-muted-foreground">
                    Pick a room on the left to review the stay, credit and printed bill.
                  </p>
                )}
                {footer}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {billSheet}
      </>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <SheetContent
          side="bottom"
          style={dragStyle}
          className="mx-auto flex max-h-[92dvh] w-full max-w-sheet flex-col gap-0 rounded-t-sheet border-0 bg-surface p-0"
        >
          <SheetGrabber handleProps={handleProps} />
          <SheetHeader className="shrink-0 px-4 pb-2 pt-1" {...handleProps}>
            <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
              {picked ? `Room ${picked.number}` : title}
            </SheetTitle>
          </SheetHeader>
          {review ?? roomGrid}
          {footer}
        </SheetContent>
      </Sheet>
      {billSheet}
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-fs-sm font-bold text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

function Allowance({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary" | "success" | "destructive";
}) {
  return (
    <div className="min-w-0 rounded-card border border-border px-2.5 py-2">
      <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "truncate text-fs-sm font-extrabold",
          tone === "primary" && "text-primary",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive",
          !tone && "text-foreground",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
