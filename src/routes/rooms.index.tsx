import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { money } from "@/lib/demo-data";
import { rooms } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
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

function Rooms() {
  const navigate = useNavigate();
  const { startOrder } = usePos();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <SubHeader title="Rooms" backLabel="Floor plan" />
      <ScreenBody>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))] gap-3">
          {rooms.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                startOrder(r.name);
                navigate({ to: "/order/new" });
              }}
              className="overflow-hidden rounded-card border border-border bg-surface text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex h-tile flex-col items-center justify-center gap-1 px-3 text-center">
                <p className="text-fs-sm font-extrabold leading-tight text-foreground">{r.name}</p>
                {r.guest ? <p className="text-fs-xs text-muted-foreground">{r.guest}</p> : null}
                {typeof r.amount === "number" ? (
                  <p className="mt-1 text-fs-sm font-bold text-foreground">{money(r.amount)}</p>
                ) : null}
              </div>
              <div
                className={cn(
                  "px-3 py-2 text-center text-fs-sm font-extrabold",
                  r.state === "occupied"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {r.state === "occupied" ? "Occupied" : "Available"}
              </div>
            </button>
          ))}
        </div>
      </ScreenBody>
    </div>
  );
}
