import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronDown, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { toast } from "sonner";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card } from "@/components/pos/primitives";
import { TipSheet } from "@/components/pos/tip-sheet";
import { Button } from "@/components/ui/button";
import { TAX_RATE, modeOrderType, money, statusMeta } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tickets/$ticketId")({
  head: () => ({
    meta: [
      { title: "Ticket detail - EATOS Handheld" },
      { name: "description", content: "Items, status and actions for a single ticket." },
      { property: "og:title", content: "Ticket detail - EATOS Handheld" },
      { property: "og:description", content: "Items, status and actions for a single ticket." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TicketDetail,
});

function TicketDetail() {
  const { ticketId } = useParams({ from: "/tickets/$ticketId" });
  const navigate = useNavigate();
  const { tickets, session, openTicket, setTicketStatus, addTip, cancelTicket } = usePos();
  const confirm = useConfirm();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [tipOpen, setTipOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);

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
  const gross = ticket.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = Math.round(gross * TAX_RATE * 100) / 100;
  const subTotal = Math.round((gross - tax) * 100) / 100;
  const payments = ticket.payments ?? [];
  const paid = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <ScreenHeader
        title={`Order Number ${ticket.number}`}
        back
        right={
          <span className="text-right">
            <span className="block t-row text-foreground">{ticket.label}</span>
            <span className="block t-caption text-muted-foreground">
              {ticket.server} · {session.role}
            </span>
          </span>
        }
      />
      <ScreenBody hug>
        <Card className="p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-fs-sm font-extrabold text-foreground">
                Arrived At {ticket.arrivedAt}
              </p>
              <p className="truncate text-fs-xs text-muted-foreground">
                {ticket.seats} guest{ticket.seats > 1 ? "s" : ""} ·{" "}
                {modeOrderType(ticket.mode)} · {ticket.revenueCenter ?? "Main dining"} · Check{" "}
                {ticket.checkNumber ?? ticket.number}
              </p>
            </div>
            <span className={cn("shrink-0 text-fs-xs font-bold", meta.tone)}>{meta.label}</span>
          </div>
          {ticket.roomNumber ? (
            <p className="mt-2 truncate border-t border-border pt-2 text-fs-xs text-muted-foreground">
              <span className="font-extrabold text-foreground">Room {ticket.roomNumber}</span>
              {ticket.bookingNumber ? ` · Booking ${ticket.bookingNumber}` : ""}
              {ticket.signedBill ? " · signed bill posted" : ""}
            </p>
          ) : null}
        </Card>

        <Card className="mt-3 overflow-hidden">
          {ticket.lines.map((l) => (
            <div key={l.id} className="border-b border-border px-4 py-3 last:border-b-0">
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-fs-sm font-extrabold text-muted-foreground">
                  {l.qty.toFixed(1)}
                </span>
                <span className="min-w-0 flex-1 text-fs-sm font-bold text-foreground">
                  {l.name}
                </span>
                <span className="shrink-0 text-fs-sm font-extrabold text-foreground">
                  {money(l.price * l.qty)}
                </span>
              </div>
              {l.modifiers?.length ? (
                <ul className="mt-1 pl-8">
                  {l.modifiers.map((m) => (
                    <li key={m} className="truncate text-fs-xs font-bold text-accent">
                      - {m}
                    </li>
                  ))}
                </ul>
              ) : null}
              {l.notes ? (
                <p className="mt-1 pl-8 text-fs-xs text-muted-foreground">{l.notes}</p>
              ) : null}
            </div>
          ))}
        </Card>

        <Card className="mt-3 px-4 py-3">
          <Row label="Sub Total" value={money(subTotal)} />
          <Row label={brand.taxLabel} value={money(tax)} />
          {ticket.tips ? <Row label="Tips" value={money(ticket.tips)} /> : null}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-fs-sm font-extrabold text-foreground">Total</span>
            <span className="text-fs-lg font-extrabold text-foreground">{money(ticket.total)}</span>
          </div>
        </Card>

        {payments.length ? (
          <Card className="mt-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setPaidOpen((v) => !v)}
              aria-expanded={paidOpen}
              className="flex min-h-row w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block t-row text-foreground">Paid</span>
                <span className="block t-caption text-muted-foreground">
                  {payments[payments.length - 1]?.at} · {money(paid)}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-muted-foreground transition-transform",
                  paidOpen && "rotate-180",
                )}
              />
            </button>
            {paidOpen ? (
              <div className="border-t border-border">
                <div className="grid grid-cols-3 gap-2 px-4 py-2">
                  <span className="t-caption uppercase text-muted-foreground">Transaction no.</span>
                  <span className="t-caption uppercase text-muted-foreground">Method</span>
                  <span className="t-caption text-right uppercase text-muted-foreground">
                    Amount
                  </span>
                </div>
                {payments.map((p) => (
                  <div
                    key={`${p.no}-${p.method}`}
                    className="grid grid-cols-3 gap-2 border-t border-border px-4 py-3"
                  >
                    <span className="truncate text-fs-sm font-bold text-foreground">{p.no}</span>
                    <span className="truncate text-fs-sm text-foreground">{p.method}</span>
                    <span className="text-right text-fs-sm font-extrabold text-foreground">
                      {money(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        ) : null}
      </ScreenBody>

      <ScreenFooter>
        <Button
          variant="outline"
          className="h-12 w-full rounded-pill font-extrabold uppercase tracking-[0.08em]"
          onClick={() => setTipOpen(true)}
        >
          Add tip
        </Button>
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            aria-label="Print receipt"
            className="h-12 w-14 shrink-0 rounded-pill"
            onClick={() => toast.success("Receipt sent to the printer")}
          >
            <Printer className="size-5" />
          </Button>
          {ticket.status === "paid" ? (
            <Button
              className="h-12 flex-1 rounded-pill bg-primary font-extrabold uppercase tracking-[0.08em] text-primary-foreground"
              onClick={() => {
                setTicketStatus(ticket.id, "ready");
                toast.success("Ticket closed");
                navigate({ to: "/tickets" });
              }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                aria-label="Cancel order"
                className="h-12 w-14 shrink-0 rounded-pill border-destructive/40 text-destructive"
                onClick={() => {
                  void (async () => {
                    const ok = await confirm({
                      title: `Cancel order ${ticket.number}?`,
                      message: "This cannot be undone - the ticket leaves the queue.",
                      confirmLabel: "Cancel order",
                      destructive: true,
                    });
                    if (!ok) return;
                    cancelTicket(ticket.id);
                    toast.success(`Order ${ticket.number} cancelled`);
                    navigate({ to: "/tickets" });
                  })();
                }}
              >
                <Trash2 className="size-5" />
              </Button>
              <Button
                className="h-12 flex-1 rounded-pill bg-accent font-extrabold uppercase tracking-[0.08em] text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  openTicket(ticket.id);
                  navigate({ to: "/order/new" });
                }}
              >
                Take payment
              </Button>
            </>
          )}
        </div>
      </ScreenFooter>


      <TipSheet
        open={tipOpen}
        onOpenChange={setTipOpen}
        base={gross}
        onConfirm={(amount) => {
          if (amount > 0) {
            addTip(ticket.id, amount);
            toast.success(`${money(amount)} tip added`);
          }
        }}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-fs-sm text-muted-foreground">{label}</span>
      <span className="text-fs-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
