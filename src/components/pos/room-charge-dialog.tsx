import { BedDouble, Check, Search, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 px-4 pb-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-ctl-md min-h-ctl-md shrink-0 items-center gap-1 rounded-row border border-border px-3 text-fs-sm font-bold text-foreground">
              {floor === "All floors" ? "All floors" : floor}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["All floors", ...floors].map((f) => (
                <DropdownMenuItem key={f} onClick={() => setFloor(f)}>
                  {f}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {picked?.stay ? (
          <p className="rounded-row border border-success/40 bg-success/10 px-3 py-2 text-fs-xs font-bold text-foreground">
            Booking No: {picked.stay.bookingNumber} · {picked.stay.stayFrom} - {picked.stay.stayTo} ·
            Credit: {money(left)}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2">
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
                  "min-h-tile rounded-card border p-3 text-left transition-colors",
                  active
                    ? "border-success bg-success/10"
                    : "border-border bg-background hover:bg-muted",
                  blocked && "opacity-45",
                )}
              >
                <p className="text-fs-sm font-extrabold text-foreground">
                  {r.name} - {r.number}
                </p>
                {r.guest ? (
                  <p className="mt-0.5 truncate text-fs-xs text-muted-foreground">{r.guest}</p>
                ) : null}
                <p className="mt-1 text-fs-xs font-bold text-muted-foreground">
                  {blocked
                    ? r.stay
                      ? `No credit left (${money(spare)})`
                      : "No active booking"
                    : `Credit ${money(spare)}`}
                </p>
              </button>
            );
          })}
          {list.length === 0 ? (
            <p className="col-span-full py-8 text-center text-fs-sm text-muted-foreground">
              No rooms match that search.
            </p>
          ) : null}
        </div>

        {picked?.stay ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <BedDouble className="size-5 shrink-0 text-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-fs-sm font-extrabold text-foreground">
                  {picked.name} · {picked.number}
                </p>
                <p className="truncate text-fs-xs text-muted-foreground">
                  Booking: {picked.stay.bookingNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Fact label="Occupancy" value={picked.stay.occupancy} />
              <Fact
                label="Stay Period"
                value={`${picked.stay.nights} Night${picked.stay.nights === 1 ? "" : "s"}`}
              />
              <Fact label="Credit limit" value={money(picked.stay.creditLimit)} />
              <Fact label="Used" value={money(picked.stay.creditUsed)} />
              <Fact label="Food Allowance / day" value={money(picked.stay.foodAllowancePerDay)} />
              <Fact label="Alcohol Allowed" value={picked.stay.alcoholAllowed ? "Yes" : "No"} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-fs-sm font-extrabold text-foreground">Room Setup</p>
                <dl className="mt-1 space-y-1 text-fs-sm">
                  <Line label="Room Type" value={picked.stay.roomType} />
                  <Line label="Bed Type" value={picked.stay.bedType} />
                  <Line label="Max Adults" value={String(picked.stay.maxAdults)} />
                  <Line label="Max Children" value={String(picked.stay.maxChildren)} />
                </dl>
              </div>
              <div>
                <p className="text-fs-sm font-extrabold text-foreground">Meal Entitlements</p>
                <ul className="mt-1 space-y-1">
                  {picked.stay.meals.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-fs-sm text-foreground">
                      <Check className="size-4 shrink-0 text-success" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-fs-sm font-extrabold text-foreground">Entitlements</p>
                <p className="text-fs-xs text-muted-foreground">{picked.stay.entitlements}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-4 pb-[calc(0.75rem+var(--kb-inset,0px))] pt-3">
        <button
          type="button"
          disabled={!canCharge}
          onClick={() => {
            if (picked) onCharge(picked);
          }}
          className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
        >
          {picked ? `Charge to room · ${money(due)}` : "Select a room"}
        </button>
      </div>
    </div>
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent className="flex max-h-[88vh] w-[min(56rem,92vw)] max-w-none flex-col gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0">
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
            <DialogTitle className="min-w-0 flex-1 truncate text-fs-lg font-extrabold text-foreground">
              Select Room
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close room charge"
              className="grid size-10 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
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
        className="mx-auto flex h-[88vh] w-full max-w-sheet flex-col gap-0 rounded-t-sheet border-0 bg-surface p-0"
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
