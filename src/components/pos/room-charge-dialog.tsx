import { BedDouble, Check, Search, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";
import { money } from "@/lib/demo-data";
import { floors, rooms, type Room } from "@/lib/floor-data";
import { cn } from "@/lib/utils";

/** Remaining credit on the stay; a room with none cannot take a charge. */
function creditLeft(room: Room) {
  if (!room.stay) return 0;
  return Math.max(0, Math.round((room.stay.creditLimit - room.stay.creditUsed) * 100) / 100);
}

/**
 * Room charge picker. Sheet on phones, centred dialog on tablet and desktop,
 * so the payment grid behind it is never pushed off-screen.
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
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState<string>("All floors");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const { dragStyle, handleProps } = useSheetDrag(onClose);

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
            "shrink-0 whitespace-nowrap rounded-pill px-3.5 py-2 text-fs-xs font-extrabold uppercase tracking-[0.06em] transition-colors",
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

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-3 border-b border-border px-4 pb-3">
        <div className={cn(wide && "hidden")}>{floorPills}</div>
        <label className="flex min-w-0 items-center gap-2 rounded-row border border-border bg-background px-3 min-h-ctl-md">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by room number or guest name"
            aria-label="Search rooms"
            className="min-w-0 flex-1 bg-transparent py-2 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="shrink-0 bg-muted/40 px-4 py-3">
        <p className="mb-2 text-fs-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
          Rooms
        </p>
        <div className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
          {list.map((r) => {
            const active = r.id === pickedId;
            const spare = creditLeft(r);
            const blocked = !r.stay || spare < due;
            return (
              <button
                key={r.id}
                type="button"
                disabled={blocked}
                onClick={() => setPickedId(r.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-[10rem] shrink-0 snap-start flex-col justify-between gap-3 rounded-card p-3 text-left transition-colors",
                  active
                    ? "border-2 border-primary bg-surface shadow-md"
                    : "border border-border bg-surface hover:border-muted-foreground/40",
                  blocked && "border-dashed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid min-h-8 min-w-8 shrink-0 place-items-center self-start rounded-row px-2 text-fs-sm font-extrabold",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {r.number}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-fs-xs font-extrabold uppercase tracking-[0.08em]",
                      blocked ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {blocked
                      ? r.stay
                        ? "Low credit"
                        : "No booking"
                      : (r.stay?.roomType ?? r.name)}
                  </span>
                  <span className="mt-0.5 block truncate text-fs-sm font-bold text-foreground">
                    {r.guest ?? "Vacant"}
                  </span>
                  <span className="mt-0.5 block truncate text-fs-xs font-bold text-muted-foreground">
                    {r.stay ? `Credit ${money(spare)}` : r.name}
                  </span>
                </span>
              </button>
            );
          })}
          {list.length === 0 ? (
            <p className="w-full py-6 text-center text-fs-sm text-muted-foreground">
              No rooms match that search.
            </p>
          ) : null}
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {picked?.stay ? (
          <div className="grid gap-4 p-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center gap-2">
                <BedDouble className="size-5 shrink-0 text-foreground" aria-hidden />
                <p className="min-w-0 truncate text-fs-sm font-extrabold text-foreground">
                  {picked.name} · {picked.number}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-card border border-border bg-muted/40 p-3">
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

              <section className="space-y-2">
                <p className="flex items-center gap-2 text-fs-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                  Allowances
                  <span className="h-px flex-1 bg-border" />
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="min-w-0 rounded-card border border-border p-3">
                    <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
                      Daily food
                    </p>
                    <p className="truncate text-fs-sm font-extrabold text-primary">
                      {money(picked.stay.foodAllowancePerDay)}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-card border border-border p-3">
                    <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
                      Alcohol
                    </p>
                    <p
                      className={cn(
                        "truncate text-fs-sm font-extrabold",
                        picked.stay.alcoholAllowed ? "text-success" : "text-destructive",
                      )}
                    >
                      {picked.stay.alcoholAllowed ? "Allowed" : "Not allowed"}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-card border border-border p-3">
                    <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
                      Meals
                    </p>
                    <p className="truncate text-fs-sm font-extrabold text-foreground">
                      {picked.stay.meals.length} included
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <p className="flex items-center gap-2 text-fs-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                  Meal entitlements
                  <span className="h-px flex-1 bg-border" />
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {picked.stay.meals.map((m) => (
                    <li
                      key={m}
                      className="flex items-center gap-1 rounded-pill bg-muted px-2.5 py-1 text-fs-xs font-bold text-foreground"
                    >
                      <Check className="size-3.5 shrink-0 text-success" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
                <p className="text-fs-xs text-muted-foreground">
                  <span className="font-extrabold text-foreground">Entitlements: </span>
                  {picked.stay.entitlements}
                </p>
              </section>
            </div>

            <div className="lg:col-span-5">
              <div className="flex h-full flex-col justify-between gap-4 rounded-card bg-foreground p-4 text-background">
                <div>
                  <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-fs-xs font-extrabold uppercase tracking-[0.14em] text-background/60">
                        Available credit
                      </p>
                      <p className="truncate text-fs-money font-extrabold">{money(left)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-fs-xs font-extrabold uppercase tracking-[0.14em] text-background/60">
                        Limit
                      </p>
                      <p className="text-fs-sm font-bold">{money(picked.stay.creditLimit)}</p>
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

                <div className="border-t border-background/20 pt-3">
                  <div className="mb-1 flex justify-between gap-2 text-fs-xs font-bold text-background/60">
                    <span>Transaction total</span>
                    <span>{money(due)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-fs-base font-extrabold uppercase tracking-[0.06em]">
                    <span>Due today</span>
                    <span>{money(due)}</span>
                  </div>
                  {!canCharge ? (
                    <p className="mt-2 text-fs-xs font-bold text-destructive">
                      Not enough credit left on this stay.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="px-4 py-6 text-fs-sm text-muted-foreground">
            Pick a room to see the booking, credit and entitlements.
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(0.75rem+var(--kb-inset,0px))] pt-3">
        <button
          type="button"
          disabled={!canCharge}
          onClick={() => {
            if (picked) onCharge(picked);
          }}
          className="flex h-ctl-lg w-full items-center justify-center gap-3 rounded-row bg-primary px-4 text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
        >
          <span className="min-w-0 truncate">
            {picked ? `Post charge to room ${picked.number}` : "Select a room"}
          </span>
          <span className="shrink-0 rounded-row bg-primary-foreground/20 px-2.5 py-0.5 text-fs-sm">
            {money(due)}
          </span>
        </button>
      </div>
    </div>
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent hideClose className="flex max-h-[90vh] w-[min(56rem,94vw)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0">
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
            <DialogTitle className="min-w-0 shrink-0 truncate text-fs-lg font-extrabold text-foreground">
              Select Room
            </DialogTitle>
            <div className="min-w-0 flex-1 overflow-hidden">{floorPills}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close room charge"
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
        <SheetHeader className="shrink-0 px-4 pb-2 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            Select Room
          </SheetTitle>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-row border border-border px-3 py-2">
      <p className="truncate text-fs-xs text-muted-foreground">{label}</p>
      <p className="truncate text-fs-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-foreground">{value}</dd>
    </div>
  );
}
