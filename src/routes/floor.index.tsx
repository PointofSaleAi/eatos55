import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ScreenBody } from "@/components/pos/shell";
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
      { title: "Floor Plan — eatOS Point of Purchase" },
      {
        name: "description",
        content: "Live table status by floor: available, ordering, ordered and reserved.",
      },
      { property: "og:title", content: "Floor Plan — eatOS Point of Purchase" },
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

function FloorPlan() {
  const navigate = useNavigate();
  const { floor, setFloor, tableStates, startOrder } = usePos();
  const [tab, setTab] = useState<TableState | "all">("all");

  const tables = floorTables
    .filter((t) => t.floor === floor)
    .map((t) => ({ ...t, state: (tableStates[t.name] ?? t.state) as TableState }))
    .filter((t) => (tab === "all" ? true : t.state === tab));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
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
          <Link
            to="/rooms"
            className="min-h-ctl-sm shrink-0 rounded-full border border-border px-3.5 text-fs-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Rooms
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
          {tableStateTabs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={cn(
                "min-h-ctl-sm shrink-0 rounded-full px-3.5 text-fs-sm font-bold transition-colors",
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
          <p className="px-4 py-24 text-center text-sm text-muted-foreground">No Tables Found</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3">
            {tables.map((t) => {
              const meta = tableStateMeta[t.state];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    startOrder(t.name);
                    navigate({ to: "/order/new" });
                  }}
                  className="overflow-hidden rounded-2xl border border-border bg-surface text-left transition-transform active:scale-[0.98]"
                >
                  <div className="relative grid h-tile place-items-center">
                    <div className="grid size-[70px] place-items-center rounded-xl border border-border text-sm font-bold text-foreground">
                      {t.name}
                    </div>
                    {t.since ? (
                      <span className="absolute bottom-2 right-3 text-xs font-bold text-muted-foreground">
                        {t.since}
                      </span>
                    ) : null}
                    <span className="absolute bottom-2 left-3 text-xs text-muted-foreground">
                      {t.seats} seat{t.seats === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-2 text-center text-sm font-extrabold",
                      meta.strip,
                      meta.text,
                    )}
                  >
                    {meta.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScreenBody>
    </div>
  );
}
