import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ScreenBody } from "@/components/pos/shell";
import { EmptyState, Pills, TicketCard } from "@/components/pos/primitives";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — EATOS Handheld" },
      { name: "description", content: "Every order taken this shift with totals and status." },
      { property: "og:title", content: "Orders — EATOS Handheld" },
      {
        property: "og:description",
        content: "Every order taken this shift with totals and status.",
      },
    ],
  }),
  component: Orders,
});

type Scope = "all" | "open" | "closed";

function Orders() {
  const navigate = useNavigate();
  const { tickets, openTicket, startOrder } = usePos();
  const [scope, setScope] = useState<Scope>("all");

  const list = tickets.filter((t) =>
    scope === "all" ? true : scope === "open" ? t.status !== "paid" : t.status === "paid",
  );
  const sales = tickets.filter((t) => t.status === "paid").reduce((s, t) => s + t.total, 0);

  return (
    <>
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              This shift
            </p>
            <h1 className="truncate text-2xl font-extrabold text-foreground">Orders</h1>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground">Net sales</p>
            <p className="text-lg font-extrabold text-foreground">{money(sales)}</p>
          </div>
        </div>
        <div className="mt-3">
          <Pills
            value={scope}
            onChange={setScope}
            options={[
              { id: "all", label: `All ${tickets.length}` },
              { id: "open", label: "Open" },
              { id: "closed", label: "Closed" },
            ]}
          />
        </div>
      </div>
      <ScreenBody className="relative">
        {list.length ? (
          <div className="space-y-3">
            {list.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                onClick={() => {
                  openTicket(t.id);
                  navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing here yet" detail="Orders appear as soon as they are opened." />
        )}
        <div className="pointer-events-none sticky bottom-0 flex justify-end pt-6">
          <button
            type="button"
            aria-label="New order"
            onClick={() => {
              startOrder();
              navigate({ to: "/order/new" });
            }}
            className="pointer-events-auto grid size-12 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform active:scale-95"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </ScreenBody>
    </>
  );
}
