import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { GuestsSheet } from "@/components/pos/guests-sheet";
import { StatusSheet, type StatusOption } from "@/components/pos/status-sheet";

import { MenuButton, ScreenBody } from "@/components/pos/shell";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  floorTables,
  floors,
  tableStateMeta,
  tableStateTabs,
  type TableState,
} from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/floor/")({
  head: () => ({
    meta: [
      { title: "Floor Plan — eatOS Point of Sale" },
      {
        name: "description",
        content: "Live table status by floor: available, ordering, ordered and reserved.",
      },
      { property: "og:title", content: "Floor Plan — eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Live table status by floor: available, ordering, ordered and reserved.",
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

const statusOptions: StatusOption<TableState>[] = [
  { id: "available", label: "Available", dot: "text-success" },
  { id: "ordering", label: "Ordering", dot: "text-accent" },
  { id: "ordered", label: "Ordered", dot: "text-warning" },
  { id: "reserved", label: "Reserved", dot: "text-muted-foreground" },
];

function FloorPlan() {
  const navigate = useNavigate();
  const { floor, setFloor, tableStates, tableSince, setTableState, startOrder, settings } = usePos();
  const [tab, setTab] = useState<TableState | "all">("all");
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

    .filter((t) => (tab === "all" ? true : t.state === tab));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
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


        <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
          {tableStateTabs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={cn(
                "min-h-ctl-sm shrink-0 rounded-pill px-3.5 text-fs-sm font-bold transition-colors",
                s.id === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ScreenBody>
        {tables.length === 0 ? (
          <p className="px-4 py-24 text-center text-fs-sm text-muted-foreground">No Tables Found</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))] gap-3">
            {tables.map((t) => {
              const meta = tableStateMeta[t.state];
              return (
                <div
                  key={t.id}
                  className="overflow-hidden rounded-card border border-border bg-surface text-left"
                >
                  <button
                    type="button"
                    onClick={() => {
                      // Occupied tables resume; free tables ask how many are seated first.
                      if (t.state === "available" || t.state === "reserved") {
                        setGuestsFor({ name: t.name, seats: t.seats });
                        return;
                      }
                      startOrder(t.name);
                      navigate({ to: "/order/new" });
                    }}
                    className="block w-full transition-transform active:scale-[0.98]"
                  >
                    <div className="relative grid h-tile place-items-center">
                      <div className="grid size-[70px] place-items-center rounded-row border border-border text-fs-sm font-bold text-foreground">
                        {t.name}
                      </div>
                      {t.since ? (
                        <span className="absolute bottom-2 right-3 text-fs-xs font-bold text-muted-foreground">
                          {t.since}
                        </span>
                      ) : null}
                      <span className="absolute bottom-2 left-3 text-fs-xs text-muted-foreground">
                        {t.seats} seat{t.seats === 1 ? "" : "s"}
                      </span>
                    </div>
                  </button>
                  {/* Status strip is its own control so staff can change state without ordering. */}
                  <button
                    type="button"
                    onClick={() => setStatusFor({ name: t.name, state: t.state })}
                    aria-label={`Change status for ${t.name}, currently ${meta.label}`}
                    className={cn(
                      "flex min-h-ctl-sm w-full items-center justify-center gap-1 px-3 py-2 text-center text-fs-sm font-extrabold transition-opacity active:opacity-80",
                      meta.strip,
                      meta.text,
                    )}
                  >
                    {meta.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </ScreenBody>

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
  );
}

