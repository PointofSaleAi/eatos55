import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { Check, ChevronDown, Circle, CircleDot, LayoutGrid, Map as MapIcon, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusSheet, type StatusOption } from "@/components/pos/status-sheet";
import { StaffListSheet } from "@/components/pos/staff-list-sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { money } from "@/lib/demo-data";
import { rooms } from "@/lib/floor-data";
import { usePos, type RoomState } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rooms/")({
  head: () => ({
    meta: [
      { title: `Rooms - ${brand.appName} Point of Sale` },
      { name: "description", content: "Rooms by floor and section with guests, stays and open balances." },
      { property: "og:title", content: `Rooms - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Rooms by floor and section with guests, stays and open balances.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rooms,
});

const roomOptions: StatusOption<RoomState>[] = [
  { id: "available", label: "Available", dot: "text-muted-foreground" },
  { id: "occupied", label: "Occupied", dot: "text-success" },
];

const FLOOR_KEY = "eatos.rooms.floor";
const floors = [...new Set(rooms.map((r) => r.floor))];

function Rooms() {
  const navigate = useNavigate();
  const { roomStates, setRoomState } = usePos();
  const [statusFor, setStatusFor] = useState<{ name: string; state: RoomState } | null>(null);
  const [floor, setFloor] = useState(floors[0]);
  const [section, setSection] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "layout">("cards");
  const [floorOpen, setFloorOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(FLOOR_KEY);
    if (saved && floors.includes(saved)) setFloor(saved);
  }, []);

  const sections = useMemo(
    () => [...new Set(rooms.filter((r) => r.floor === floor && r.section).map((r) => r.section!))],
    [floor],
  );
  const visible = rooms.filter((r) => r.floor === floor && (!section || r.section === section));

  const pickFloor = (f: string) => {
    setFloor(f);
    setSection(null);
    setFloorOpen(false);
    window.localStorage.setItem(FLOOR_KEY, f);
  };

  const tab = (active: boolean) =>
    cn(
      "shrink-0 border-b-2 px-1 pb-1.5 text-fs-sm font-bold transition-colors",
      active ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-3 px-3 pt-3 sm:px-4">
        <Popover open={floorOpen} onOpenChange={setFloorOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 border-b-2 border-foreground pb-1.5 text-fs-sm font-extrabold uppercase text-foreground"
            >
              {floor}
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-1">
            {floors.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => pickFloor(f)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-fs-sm font-semibold text-foreground hover:bg-muted"
              >
                {f}
                {f === floor ? <Check className="size-4" aria-hidden /> : null}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto [scrollbar-width:none]">
          <button type="button" className={tab(section === null)} onClick={() => setSection(null)}>
            ALL
          </button>
          {sections.map((s) => (
            <button key={s} type="button" className={tab(section === s)} onClick={() => setSection(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center rounded-pill border border-border p-0.5">
          {(
            [
              ["cards", LayoutGrid, "Room cards"],
              ["layout", MapIcon, "Room layout"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={cn(
                "flex size-8 items-center justify-center rounded-pill transition-colors",
                view === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Staff list"
          onClick={() => setStaffOpen(true)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
        >
          <Users className="size-5" aria-hidden />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        {view === "layout" ? (
          <div className="flex h-full min-h-48 items-center justify-center">
            <p className="text-fs-sm text-muted-foreground">Room layout view – coming soon</p>
          </div>
        ) : visible.length === 0 ? (
          <p className="py-12 text-center text-fs-sm text-muted-foreground">No rooms in this section</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
            {visible.map((r) => {
              const state = roomStates[r.name] ?? r.state;
              const occupied = state === "occupied";
              return (
                <div key={r.id} className="flex flex-col overflow-hidden rounded-card border border-border bg-surface">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/tickets", search: { table: r.name } })}
                    className="flex min-h-[5.5rem] flex-1 flex-col items-start justify-center gap-0.5 px-3 py-2.5 text-left transition-transform active:scale-[0.98]"
                  >
                    <p className="text-fs-sm font-extrabold leading-tight text-foreground">{r.name}</p>
                    {occupied && r.guest ? (
                      <p className="text-fs-xs font-semibold text-foreground">{r.guest}</p>
                    ) : null}
                    {occupied && r.stay ? (
                      <p className="text-[0.625rem] text-muted-foreground">
                        {r.stay.stayFrom} – {r.stay.stayTo}
                      </p>
                    ) : null}
                    {occupied && typeof r.amount === "number" ? (
                      <p className="mt-1 text-fs-sm font-bold text-foreground">{money(r.amount)}</p>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFor({ name: r.name, state })}
                    aria-label={`Change status for ${r.name}, currently ${state}`}
                    className={cn(
                      "flex w-full items-center justify-center gap-1 px-2 py-1.5 t-badge transition-opacity active:opacity-80",
                      occupied ? "bg-success/20 text-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {occupied ? (
                      <CircleDot className="size-3 shrink-0" aria-hidden />
                    ) : (
                      <Circle className="size-3 shrink-0" aria-hidden />
                    )}
                    {occupied ? "Occupied" : "Available"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StaffListSheet open={staffOpen} onClose={() => setStaffOpen(false)} />
      <StatusSheet
        open={statusFor !== null}
        title={statusFor ? `${statusFor.name} status` : "Status"}
        options={roomOptions}
        value={statusFor?.state ?? null}
        onClose={() => setStatusFor(null)}
        onPick={(state) => {
          if (statusFor) {
            setRoomState(statusFor.name, state);
            toast.success(`${statusFor.name} · ${state === "occupied" ? "Occupied" : "Available"}`);
          }
          setStatusFor(null);
        }}
      />
    </div>
  );
}
