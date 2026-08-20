import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LayoutGrid, Map, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { FloorCanvas } from "@/components/pos/floor-canvas";
import { GuestsSheet } from "@/components/pos/guests-sheet";
import { StaffPanel } from "@/components/pos/staff-panel";
import { StatusSheet, type StatusOption } from "@/components/pos/status-sheet";

import { MenuButton, ScreenBody } from "@/components/pos/shell";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  floorSections,
  floorTables,
  floors,
  tableStateMeta,
  tableStateOrder,
  type FloorSection,
  type TableState,
} from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/floor/")({
  head: () => ({
    meta: [
      { title: "Floor Plan - eatOS Point of Sale" },
      {
        name: "description",
        content: "Live table status by floor and section, in grid or seating layout view.",
      },
      { property: "og:title", content: "Floor Plan - eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Live table status by floor and section, in grid or seating layout view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FloorPlan,
});

function elapsed(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 60 ? `${mins}M` : `${Math.floor(mins / 60)}H`;
}

const statusOptions: StatusOption<TableState>[] = tableStateOrder.map((id) => ({
  id,
  label: tableStateMeta[id].label.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase()),
  dot: tableStateMeta[id].dot,
}));

function FloorPlan() {
  const navigate = useNavigate();
  const { floor, setFloor, tableStates, tableSince, setTableState, startOrder, settings } = usePos();
  const [section, setSection] = useState<FloorSection>("all");
  const [view, setView] = useState<"grid" | "layout">("grid");
  const [staffOpen, setStaffOpen] = useState(false);
  const [statusFor, setStatusFor] = useState<{ name: string; state: TableState } | null>(null);
  const [guestsFor, setGuestsFor] = useState<{ name: string; seats: number } | null>(null);

  const tables = floorTables
    .filter((t) => t.floor === floor)
    .map((t) => {
      const started = tableSince[t.name];
      return {
        ...t,
        state: (tableStates[t.name] ?? t.state) as TableState,
        since: started ? elapsed(started) : t.since,
      };
    })
    .filter((t) => (section === "all" ? true : t.section === section));

  const openTable = (t: { name: string; seats: number; state: TableState }) => {
    // Occupied tables resume; free tables ask how many are seated first.
    if (t.state === "available" || t.state === "reserved") {
      setGuestsFor({ name: t.name, seats: t.seats });
      return;
    }
    startOrder(t.name);
    navigate({ to: "/order/new" });
  };

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-1">
              <MenuButton className="-ml-2" />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex min-h-tap min-w-0 items-center gap-1 text-fs-xl font-extrabold uppercase text-foreground">
                  <span className="truncate">{floor}</span>
                  <ChevronDown className="size-5 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {floors.map((f) => (
                    <DropdownMenuItem key={f} onClick={() => setFloor(f)}>
                      {f}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Grid or seating-layout view. */}
              <div className="flex items-center gap-1 rounded-pill bg-muted p-1">
                {(
                  [
                    { id: "grid" as const, label: "Grid", Icon: LayoutGrid },
                    { id: "layout" as const, label: "Layout", Icon: Map },
                  ] satisfies { id: "grid" | "layout"; label: string; Icon: typeof Map }[]
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setView(id)}
                    aria-pressed={view === id}
                    aria-label={`${label} view`}
                    className={cn(
                      "grid size-9 place-items-center rounded-pill transition-colors",
                      view === id
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStaffOpen((v) => !v)}
                aria-label="Staff list"
                aria-pressed={staffOpen}
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-pill border border-border transition-colors",
                  staffOpen ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                <Users className="size-5" />
              </button>
              {/* Rooms is a hotel module: only shown when room service is switched on. */}
              {settings.roomService ? (
                <Link
                  to="/rooms"
                  className="inline-flex h-ctl-sm min-h-ctl-sm shrink-0 items-center justify-center rounded-pill border border-border px-3.5 text-fs-sm font-bold leading-none text-foreground transition-colors hover:bg-muted"
                >
                  Rooms
                </Link>
              ) : null}
            </div>
          </div>

          <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
            {floorSections.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={cn(
                  "min-h-ctl-sm shrink-0 rounded-pill px-3.5 text-fs-sm font-bold uppercase transition-colors",
                  s === section
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {view === "layout" ? (
          <div className="min-h-0 flex-1 p-3">
            <FloorCanvas
              tables={tables}
              onOpen={(t) => openTable(t)}
              onStatus={(t) => setStatusFor({ name: t.name, state: t.state })}
            />
          </div>
        ) : (
          <ScreenBody>
            {tables.length === 0 ? (
              <p className="px-4 py-24 text-center text-fs-sm text-muted-foreground">
                No Tables Found
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))] gap-3">
                {tables.map((t) => {
                  const meta = tableStateMeta[t.state];
                  const seated = t.seated ?? 0;
                  return (
                    <div
                      key={t.id}
                      className="overflow-hidden rounded-card border border-border bg-surface text-left"
                    >
                      <button
                        type="button"
                        onClick={() => openTable(t)}
                        className="block w-full transition-transform active:scale-[0.98]"
                      >
                        <div className="relative grid h-tile place-items-center">
                          <div
                            className={cn(
                              "grid size-[70px] place-items-center border-2 text-fs-sm font-bold text-foreground",
                              (t.shape ?? "round") === "round" ? "rounded-full" : "rounded-row",
                              meta.ring,
                            )}
                          >
                            <span className="max-w-[85%] truncate px-1">{t.name}</span>
                          </div>
                          {t.since ? (
                            <span className="absolute bottom-2 right-3 text-fs-xs font-bold text-muted-foreground">
                              {t.since}
                            </span>
                          ) : null}
                          <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 text-fs-xs text-muted-foreground">
                            <Users className="size-3.5 shrink-0" aria-hidden />
                            {seated} / {t.seats}
                          </span>
                        </div>
                      </button>
                      {/* Status strip is its own control so staff can change state without ordering. */}
                      <button
                        type="button"
                        onClick={() => setStatusFor({ name: t.name, state: t.state })}
                        aria-label={`Change status for ${t.name}, currently ${meta.label}`}
                        className={cn(
                          "flex min-h-ctl-sm w-full items-center justify-center gap-1 px-2 py-2 text-center text-fs-xs font-extrabold uppercase transition-opacity active:opacity-80",
                          meta.strip,
                          meta.text,
                        )}
                      >
                        <span className="truncate">{meta.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScreenBody>
        )}

        <GuestsSheet
          open={guestsFor !== null}
          table={guestsFor?.name ?? null}
          seats={guestsFor?.seats ?? 1}
          onClose={() => setGuestsFor(null)}
          onStart={(count) => {
            if (guestsFor) {
              startOrder(guestsFor.name, count);
              setGuestsFor(null);
              navigate({ to: "/order/new" });
            }
          }}
        />

        <StatusSheet
          open={statusFor !== null}
          title={statusFor ? `${statusFor.name} status` : "Status"}
          options={statusOptions}
          value={statusFor?.state ?? null}
          onClose={() => setStatusFor(null)}
          onPick={(state) => {
            if (statusFor) {
              setTableState(statusFor.name, state);
              toast.success(`${statusFor.name} · ${tableStateMeta[state].label}`);
            }
            setStatusFor(null);
          }}
        />
      </div>

      <StaffPanel
        open={staffOpen}
        onClose={() => setStaffOpen(false)}
        onPick={(name) => {
          toast.success(`Assigned to ${name}`);
          setStaffOpen(false);
        }}
      />
    </div>
  );
}
