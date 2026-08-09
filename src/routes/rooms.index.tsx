import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Circle, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { StatusSheet, type StatusOption } from "@/components/pos/status-sheet";

import { money } from "@/lib/demo-data";
import { rooms } from "@/lib/floor-data";
import { usePos, type RoomState } from "@/lib/pos-store";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/rooms/")({
  head: () => ({
    meta: [
      { title: "Rooms — eatOS Point of Purchase" },
      { name: "description", content: "Room service areas with guest names and open balances." },
      { property: "og:title", content: "Rooms — eatOS Point of Purchase" },
      {
        property: "og:description",
        content: "Room service areas with guest names and open balances.",
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

function Rooms() {
  const navigate = useNavigate();
  const { startOrder, roomStates, setRoomState, settings, sessionReady } = usePos();
  const [statusFor, setStatusFor] = useState<{ name: string; state: RoomState } | null>(null);

  // Rooms is a hotel module: without it switched on there is nothing to show here.
  useEffect(() => {
    if (sessionReady && !settings.roomService) navigate({ to: "/floor", replace: true });
  }, [sessionReady, settings.roomService, navigate]);


  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <SubHeader title="Rooms" backLabel="Floor plan" />
      <ScreenBody>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))] gap-3">
          {rooms.map((r) => {
            const state = roomStates[r.name] ?? r.state;
            return (
              <div
                key={r.id}
                className="overflow-hidden rounded-card border border-border bg-surface text-left"
              >
                <button
                  type="button"
                  onClick={() => {
                    startOrder(r.name);
                    navigate({ to: "/order/new" });
                  }}
                  className="block w-full transition-transform active:scale-[0.98]"
                >
                  <div className="flex h-tile flex-col items-center justify-center gap-1 px-3 text-center">
                    <p className="text-fs-sm font-extrabold leading-tight text-foreground">
                      {r.name}
                    </p>
                    {r.guest ? <p className="text-fs-xs text-muted-foreground">{r.guest}</p> : null}
                    {typeof r.amount === "number" ? (
                      <p className="mt-1 text-fs-sm font-bold text-foreground">{money(r.amount)}</p>
                    ) : null}
                  </div>
                </button>
                {/* Status strip is tappable so staff can flip occupancy without ordering. */}
                <button
                  type="button"
                  onClick={() => setStatusFor({ name: r.name, state })}
                  aria-label={`Change status for ${r.name}, currently ${state}`}
                  className={cn(
                    "flex min-h-ctl-sm w-full items-center justify-center gap-1 px-3 py-2 text-center t-badge transition-opacity active:opacity-80",
                    state === "occupied"
                      ? "bg-success/20 text-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {/* Status never relies on colour alone. */}
                  {state === "occupied" ? (
                    <>
                      <CircleDot className="size-3.5 shrink-0" aria-hidden />
                      Occupied
                    </>
                  ) : (
                    <>
                      <Circle className="size-3.5 shrink-0" aria-hidden />
                      Available
                    </>
                  )}
                  <ChevronDown className="size-3.5 shrink-0" aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      </ScreenBody>

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

