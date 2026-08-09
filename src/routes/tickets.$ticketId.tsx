import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card, SectionLabel } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { money, statusMeta } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tickets/$ticketId")({
  head: () => ({
    meta: [
      { title: "Ticket detail — EATOS Handheld" },
      { name: "description", content: "Items, status and actions for a single ticket." },
      { property: "og:title", content: "Ticket detail — EATOS Handheld" },
      { property: "og:description", content: "Items, status and actions for a single ticket." },
    ],
  }),
  component: TicketDetail,
});

function TicketDetail() {
  const { ticketId } = useParams({ from: "/tickets/$ticketId" });
  const navigate = useNavigate();
  const { tickets, openTicket, setTicketStatus } = usePos();
  const ticket = tickets.find((t) => t.id === ticketId);

  if (!ticket) {
    return (
      <>
        <ScreenHeader eyebrow="Tickets" title="Ticket" back />
        <ScreenBody>
          <Card className="p-6 text-center text-fs-sm text-muted-foreground">
            This ticket is no longer in the queue.
          </Card>
        </ScreenBody>
      </>
    );
  }

  const meta = statusMeta[ticket.status];

  return (
    <>
      <ScreenHeader eyebrow={`Ticket #${ticket.id.replace("t-", "")}`} title={ticket.label} back />
      <ScreenBody>
        <Card className="p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-fs-sm font-extrabold text-foreground">
                {ticket.seats} guest{ticket.seats > 1 ? "s" : ""} · {ticket.mode.replace("-", " ")}
              </p>
              <p className="truncate text-fs-xs text-muted-foreground">
                Arrived {ticket.arrivedAt} · {ticket.server}
              </p>
            </div>
            <span className={cn("shrink-0 text-fs-xs font-bold", meta.tone)}>{meta.label}</span>
          </div>
        </Card>

        <SectionLabel>Items</SectionLabel>
        <Card className="overflow-hidden">
          {ticket.lines.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-row bg-muted text-fs-xs font-extrabold">
                {l.qty}
              </span>
              <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                {l.name}
              </span>
              <span className="shrink-0 text-fs-sm font-extrabold text-foreground">
                {money(l.price * l.qty)}
              </span>
            </div>
          ))}
        </Card>

        <SectionLabel>Total</SectionLabel>
        <Card className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-fs-sm font-bold text-foreground">Ticket total</span>
            <span className="text-fs-lg font-extrabold text-foreground">{money(ticket.total)}</span>
          </div>
        </Card>
      </ScreenBody>
      <ScreenFooter>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-pill font-bold"
            onClick={() => {
              openTicket(ticket.id);
              navigate({ to: "/order/new" });
            }}
          >
            Add items
          </Button>
          {ticket.status === "paid" ? (
            <Button
              className="h-12 flex-1 rounded-pill bg-primary font-bold text-primary-foreground"
              onClick={() => {
                setTicketStatus(ticket.id, "ready");
                toast.success("Ticket marked ready for pickup");
                navigate({ to: "/tickets" });
              }}
            >
              Mark ready
            </Button>
          ) : (
            <Button
              className="h-12 flex-1 rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90"
              onClick={() => {
                openTicket(ticket.id);
                navigate({ to: "/order/review" });
              }}
            >
              Take payment
            </Button>
          )}
        </div>
      </ScreenFooter>
    </>
  );
}
