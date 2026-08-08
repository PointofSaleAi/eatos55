import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, RefreshCcw, Search, SlidersHorizontal, ListFilter, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomTabs, ScreenBody } from "@/components/pos/shell";
import { EmptyState, Pills, TicketCard } from "@/components/pos/primitives";
import { usePos } from "@/lib/pos-store";
import type { TicketStatus } from "@/lib/demo-data";

export const Route = createFileRoute("/tickets/")({
  head: () => ({
    meta: [
      { title: "Live tickets — EATOS Handheld" },
      { name: "description", content: "The operational order queue for the current shift." },
      { property: "og:title", content: "Live tickets — EATOS Handheld" },
      { property: "og:description", content: "The operational order queue for the current shift." },
    ],
  }),
  component: LiveTickets,
});

type Tab = "all" | Extract<TicketStatus, "ordering" | "payment" | "ready">;

function LiveTickets() {
  const navigate = useNavigate();
  const { session, visibleTickets, openTicket, startOrder } = usePos();
  const [tab, setTab] = useState<Tab>("all");
  const list = visibleTickets(tab === "all" ? "all" : tab);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="shrink-0 bg-surface px-4 pb-3 pt-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
              EC
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-foreground">
                {session.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {session.role} · {session.clockedIn ? "Clocked in" : "Clocked out"}
                {session.station ? ` · ${session.station}` : ""}
              </span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="What is new"
              onClick={() => navigate({ to: "/tickets/whats-new" })}
              className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Bell className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Refresh queue"
              onClick={() => toast.success("Ticket queue refreshed")}
              className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCcw className="size-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-muted-foreground">{today}</p>
            <h1 className="truncate text-2xl font-extrabold text-foreground">Live tickets</h1>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Filter tickets"
              onClick={() => navigate({ to: "/tickets/filter" })}
              className="grid size-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
            >
              <ListFilter className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Sort tickets"
              onClick={() => navigate({ to: "/tickets/sort" })}
              className="grid size-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <Pills
            value={tab}
            onChange={setTab}
            options={[
              { id: "all", label: "All" },
              { id: "ordering", label: "Ordering" },
              { id: "payment", label: "Payment" },
              { id: "ready", label: "Ready" },
            ]}
          />
        </div>
      </div>

      <ScreenBody className="relative bg-background">
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
          <EmptyState title="No tickets here" detail="Adjust filters or start a new order." />
        )}

        <div className="pointer-events-none sticky bottom-0 flex justify-end gap-2 pt-6">
          <button
            type="button"
            aria-label="Search tickets"
            onClick={() => navigate({ to: "/tickets/search" })}
            className="pointer-events-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
          >
            <Search className="size-5" />
          </button>
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
      <BottomTabs />
    </>
  );
}
