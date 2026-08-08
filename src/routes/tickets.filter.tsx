import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card, SectionLabel, ToggleRow } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { usePos } from "@/lib/pos-store";
import type { MenuMode, TicketStatus } from "@/lib/demo-data";

export const Route = createFileRoute("/tickets/filter")({
  head: () => ({
    meta: [
      { title: "Filter tickets — EATOS Handheld" },
      { name: "description", content: "Operational filters for status, service mode and server." },
      { property: "og:title", content: "Filter tickets — EATOS Handheld" },
      {
        property: "og:description",
        content: "Operational filters for status, service mode and server.",
      },
    ],
  }),
  component: FilterTickets,
});

const statusOptions: { id: TicketStatus; label: string }[] = [
  { id: "ordering", label: "Ordering" },
  { id: "preparing", label: "Preparing" },
  { id: "payment", label: "Awaiting payment" },
  { id: "ready", label: "Ready" },
  { id: "paid", label: "Paid" },
];

const modeOptions: { id: MenuMode; label: string }[] = [
  { id: "dine-in", label: "Dine in" },
  { id: "takeaway", label: "Takeaway" },
  { id: "delivery", label: "Delivery" },
  { id: "bar", label: "Bar" },
];

function FilterTickets() {
  const navigate = useNavigate();
  const { filters, setFilters } = usePos();
  const [draft, setDraft] = useState(filters);

  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <>
      <ScreenHeader eyebrow="Tickets" title="Filter tickets" back />
      <ScreenBody>
        <SectionLabel>Ticket status</SectionLabel>
        <Card className="overflow-hidden">
          {statusOptions.map((s) => (
            <ToggleRow
              key={s.id}
              title={s.label}
              checked={draft.statuses.includes(s.id)}
              onChange={() => setDraft({ ...draft, statuses: toggle(draft.statuses, s.id) })}
            />
          ))}
        </Card>

        <SectionLabel>Service mode</SectionLabel>
        <Card className="overflow-hidden">
          {modeOptions.map((m) => (
            <ToggleRow
              key={m.id}
              title={m.label}
              checked={draft.modes.includes(m.id)}
              onChange={() => setDraft({ ...draft, modes: toggle(draft.modes, m.id) })}
            />
          ))}
        </Card>

        <SectionLabel>Ownership</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            title="Only my tickets"
            detail="Hide tickets owned by other servers"
            checked={draft.mineOnly}
            onChange={(v) => setDraft({ ...draft, mineOnly: v })}
          />
        </Card>
      </ScreenBody>
      <ScreenFooter>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-full font-bold"
            onClick={() => setDraft({ statuses: [], modes: [], mineOnly: false })}
          >
            Clear
          </Button>
          <Button
            className="h-12 flex-1 rounded-full bg-accent font-bold text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              setFilters(draft);
              navigate({ to: "/tickets" });
            }}
          >
            Apply filters
          </Button>
        </div>
      </ScreenFooter>
    </>
  );
}
