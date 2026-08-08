import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { EmptyState, TicketCard } from "@/components/pos/primitives";
import { Input } from "@/components/ui/input";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/tickets/search")({
  head: () => ({
    meta: [
      { title: "Search tickets — EATOS Handheld" },
      { name: "description", content: "Look up a ticket by order number, table or guest name." },
      { property: "og:title", content: "Search tickets — EATOS Handheld" },
      {
        property: "og:description",
        content: "Look up a ticket by order number, table or guest name.",
      },
    ],
  }),
  component: SearchTickets,
});

function SearchTickets() {
  const navigate = useNavigate();
  const { search, setSearch, visibleTickets, openTicket } = usePos();
  const results = visibleTickets("all");

  return (
    <>
      <ScreenHeader eyebrow="Tickets" title="Search tickets" back />
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order number, table or guest"
            className="h-12 rounded-xl bg-background pl-9"
          />
        </div>
      </div>
      <ScreenBody>
        {results.length ? (
          <div className="space-y-3">
            {results.map((t) => (
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
          <EmptyState title="No matches" detail="Try a different order number or guest name." />
        )}
      </ScreenBody>
    </>
  );
}
