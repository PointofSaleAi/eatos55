import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeftRight, BadgePercent, ChevronDown, Percent, Plus, Printer, ReceiptText, Trash2 } from "lucide-react";
import { HeaderAction } from "@/components/pos/order-panel";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { TransferCheckDialog } from "@/components/pos/transfer-check-dialog";
import { Fragment, useState } from "react";
import { brand } from "@/lib/brand";
import { toast } from "sonner";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card } from "@/components/pos/primitives";
import { TipSheet } from "@/components/pos/tip-sheet";
import { ClosedPaymentRows, RefundReasonDialog } from "@/components/pos/ticket-refund";
import { RoomTicketActions, roomChargeLabel, roomProofLabel } from "@/components/pos/room-ticket-actions";
import { Button } from "@/components/ui/button";
import { TAX_RATE, modeOrderType, money, ticketStatusMeta } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";
import { useLandscapeWide } from "@/hooks/use-layout-mode";

export const Route = createFileRoute("/tickets/$ticketId")({
  head: () => ({
    meta: [
      { title: `Ticket detail - ${brand.appName} Handheld` },
      { name: "description", content: "Items, status and actions for a single ticket." },
      { property: "og:title", content: `Ticket detail - ${brand.appName} Handheld` },
      { property: "og:description", content: "Items, status and actions for a single ticket." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { table?: string } =>
    typeof s["table"] === "string" && s["table"] ? { table: s["table"] } : {},
  component: TicketDetail,
});

function TicketDetail() {
  const { ticketId } = useParams({ from: "/tickets/$ticketId" });
  const navigate = useNavigate();
  const { tickets, session, openTicket, addTip, cancelTicket, closeTicket, refundTicket, patchTicket, transferTickets } = usePos();
  const confirm = useConfirm();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [tipOpen, setTipOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const landscape = useLandscapeWide();
  const Footer = landscape ? Fragment : ScreenFooter;

  if (!ticket) {
    return (
      <>
        <ScreenHeader eyebrow="Tickets" title="Ticket" back backTo="/tickets" />
        <ScreenBody>
          <Card className="p-6 text-center text-fs-sm text-muted-foreground">
            This ticket is no longer in the queue.
          </Card>
        </ScreenBody>
      </>
    );
  }

  const meta = roomChargeLabel(ticket) ?? ticketStatusMeta(ticket);
  const closed = !!ticket.closed && ticket.status === "paid";
  const refund = ticket.refund;
  const gross = ticket.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const baseTax = Math.round(gross * TAX_RATE * 100) / 100;
  const subTotal = Math.round((gross - baseTax) * 100) / 100;
  const tax = ticket.noTax ? 0 : baseTax;
  const discount = ticket.discountPercent ? Math.round(subTotal * ticket.discountPercent) / 100 : 0;
  const shownTotal = Math.max(0, Math.round((ticket.total - (baseTax - tax) - discount) * 100) / 100);
  const isPaid = ticket.status === "paid";

  const cancelThisTicket = () => {
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
  };

  const toggleNoTax = () => {
    if (ticket.noTax) {
      patchTicket(ticket.id, { noTax: false });
      toast.success("Tax applied");
      return;
    }
    void (async () => {
      const ok = await confirm({
        title: `Are you sure you want to apply NO ${brand.taxLabel.toUpperCase()}?`,
        confirmLabel: "Yes",
        cancelLabel: "No",
        rowButtons: true,
      });
      if (!ok) return;
      patchTicket(ticket.id, { noTax: true });
      toast.success("Tax removed from this ticket");
    })();
  };

  // Ordering tickets get the full set; paid tickets only transfer, receipt and tax exemption.
  const ticketActions = closed ? null : (
    <div className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto" aria-label="Ticket options">
      {!isPaid ? (
        <HeaderAction label="Discount" icon={BadgePercent} active={discount > 0} onPress={() => setDiscountOpen(true)} />
      ) : null}
      {!isPaid ? (
        <HeaderAction label="Add Item" icon={Plus} onPress={() => { openTicket(ticket.id); navigate({ to: "/order/new" }); }} />
      ) : null}
      <HeaderAction label="Transfer Check" icon={ArrowLeftRight} onPress={() => setTransferOpen(true)} />
      <HeaderAction label="Customer Receipt" icon={ReceiptText} onPress={() => toast.success("Customer receipt sent to the printer")} />
      {!isPaid ? <HeaderAction label="Cancel" icon={Trash2} destructive onPress={cancelThisTicket} /> : null}
      <HeaderAction label={ticket.noTax ? "No Service Tax · On" : "No Service Tax"} icon={Percent} active={!!ticket.noTax} onPress={toggleNoTax} />
    </div>
  );
  const payments = ticket.payments ?? [];
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const paymentsSection = closed ? <ClosedPaymentRows ticket={ticket} onRefund={() => setRefundOpen(true)} /> : payments.length ? (
    <div className={cn("overflow-hidden", landscape ? "shrink-0 border-t border-border bg-surface" : "mt-3 rounded-card border border-border bg-surface")}>
      <Button variant="ghost" onClick={() => setPaidOpen((v) => !v)} aria-expanded={paidOpen}
        className="h-auto min-h-row w-full justify-start gap-3 whitespace-normal px-3 py-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block t-row text-foreground">Paid</span>
          <span className="block t-caption text-muted-foreground">{payments[payments.length - 1]?.at} · {money(paid)}</span>
        </span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", paidOpen && "rotate-180")} />
      </Button>
      {paidOpen ? <div className="border-t border-border">
        <div className="grid grid-cols-3 gap-2 px-3 py-2 t-caption uppercase text-muted-foreground">
          <span>Transaction no.</span><span>Method</span><span className="text-right">Amount</span>
        </div>
        {payments.map((p) => <div key={`${p.no}-${p.method}`} className="grid grid-cols-3 gap-2 border-t border-border px-3 py-3 text-fs-sm">
          <span className="break-all font-bold text-foreground">{p.no}</span>
          <span className="break-words text-foreground">{p.method}</span>
          <span className="text-right font-extrabold tabular-nums text-foreground">{money(p.amount)}</span>
        </div>)}
      </div> : null}
    </div>
  ) : null;

  return (
    <>
      {landscape ? (
        <>
          <div data-ticket-cart-header className="shrink-0 border-b border-border bg-surface px-4 pb-2 pt-2">
            <div className="flex flex-nowrap items-center gap-2 py-1">
              <span className="min-w-0 flex-1 truncate text-fs-sm font-extrabold text-foreground" title={ticket.label}>{ticket.label}</span>
              {ticket.guestPhone ? <span className="shrink-0 text-fs-xs font-bold text-muted-foreground">{ticket.guestPhone}</span> : null}
              <span className="shrink-0 whitespace-nowrap text-fs-xs font-bold text-muted-foreground">Arrived at {ticket.arrivedAt}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-fs-xs font-bold uppercase text-muted-foreground">
              <span className="shrink-0">Order# {ticket.orderNo ?? ticket.number} · Check {ticket.checkNumber ?? ticket.number}</span>
              <span className="min-w-0 truncate" title={`${ticket.server} · ${session.role}`}>{ticket.server}</span>
            </div>
            {ticketActions ? <div className="mt-2">{ticketActions}</div> : null}
            {ticket.roomNumber ? <p className="mt-2 text-fs-xs text-muted-foreground">Room {ticket.roomNumber}{ticket.bookingNumber ? ` · Booking ${ticket.bookingNumber}` : ""}{roomProofLabel(ticket) ? ` · ${roomProofLabel(ticket)}` : ticket.signedBill ? " · signed bill posted" : ""}</p> : null}
            {ticket.notes ? <p className="mt-2 whitespace-pre-wrap text-fs-xs italic text-muted-foreground">{ticket.notes}</p> : null}
          </div>
          <div data-ticket-cart-items className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-1.5">
            <ul className="divide-y divide-border/60">
              {ticket.lines.map((l) => <li key={l.id} className="py-1">
                <div className="flex items-start gap-1.5 pr-0.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-fs-xs font-extrabold tabular-nums text-foreground">{l.qty}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className={cn("min-w-0 flex-1 break-words text-fs-sm font-bold leading-snug", refund ? "text-destructive line-through" : "text-foreground")}>{l.name}</span>
                      <span className={cn("shrink-0 text-fs-sm font-bold tabular-nums", refund ? "text-destructive line-through" : "text-foreground")}>{money(l.price * l.qty)}</span>
                    </div>
                    {refund ? <p className="text-fs-xs leading-snug text-muted-foreground"><span className="font-extrabold text-destructive">└ REFUND</span> · {refund.reason}</p> : null}
                    {l.modifiers?.length ? <p className="break-words text-fs-xs font-bold uppercase leading-snug text-tile-blue">{l.modifiers.join(", ")}</p> : null}
                    {l.notes ? <p className="break-words text-fs-xs italic leading-snug text-muted-foreground">{l.notes}</p> : null}
                  </div>
                </div>
              </li>)}
            </ul>
          </div>
          {paymentsSection}
          <div data-ticket-cart-totals className="shrink-0 border-t border-border bg-surface px-3 pt-1.5">
            <dl className="text-fs-sm">
              <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground"><dt>Sub Total</dt><dd className="tabular-nums">{money(subTotal)}</dd></div>
              <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground"><dt>{brand.taxLabel}</dt><dd className="tabular-nums">{money(tax)}</dd></div>
              {discount > 0 ? <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground"><dt>Discount{ticket.discountName ? ` · ${ticket.discountName}` : ""}</dt><dd className="tabular-nums">-{money(discount)}</dd></div> : null}
              {ticket.tips ? <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground"><dt>Tips</dt><dd className="tabular-nums">{money(ticket.tips)}</dd></div> : null}
              <div className="flex items-center justify-between pt-0.5 text-fs-lg font-extrabold text-foreground"><dt>Total</dt><dd className="tabular-nums">{money(shownTotal)}</dd></div>
            </dl>
          </div>
        </>
      ) : <>
      <ScreenHeader
        title={`Order Number ${ticket.number}`}
        back
        backTo="/tickets"
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
        {ticketActions ? <div className="mb-3">{ticketActions}</div> : null}
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
              {roomProofLabel(ticket) ? ` · ${roomProofLabel(ticket)}` : ticket.signedBill ? " · signed bill posted" : ""}
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
                <span className={cn("min-w-0 flex-1 text-fs-sm font-bold", refund ? "text-destructive line-through" : "text-foreground")}>
                  {l.name}
                </span>
                <span className={cn("shrink-0 text-fs-sm font-extrabold", refund ? "text-destructive line-through" : "text-foreground")}>
                  {money(l.price * l.qty)}
                </span>
              </div>
              {refund ? <p className="mt-1 pl-8 text-fs-xs text-muted-foreground"><span className="font-extrabold text-destructive">└ REFUND</span> · {refund.reason}</p> : null}
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

        {paymentsSection}
        <Card className="mt-3 px-4 py-3">
          <Row label="Sub Total" value={money(subTotal)} />
          <Row label={brand.taxLabel} value={money(tax)} />
          {discount > 0 ? <Row label={`Discount${ticket.discountName ? ` · ${ticket.discountName}` : ""}`} value={`-${money(discount)}`} /> : null}
          {ticket.tips ? <Row label="Tips" value={money(ticket.tips)} /> : null}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-fs-sm font-extrabold text-foreground">Total</span>
            <span className="text-fs-lg font-extrabold text-foreground">{money(shownTotal)}</span>
          </div>
        </Card>

      </ScreenBody>
      </>}

      <div data-ticket-cart-actions={landscape ? "true" : undefined} className={landscape ? "shrink-0 bg-surface px-3 pb-2 pt-1.5" : "contents"}>
      <Footer>
        {closed ? (
          <Button
            variant="outline"
            className={cn("h-12 w-full gap-2 font-extrabold uppercase", landscape ? "rounded-row" : "rounded-pill tracking-[0.08em]")}
            onClick={() => toast.success("Receipt sent to the printer")}
          >
            <Printer className="size-5" /> Print receipt
          </Button>
        ) : ticket.roomCharge ? (
          <RoomTicketActions ticket={ticket} />
        ) : (
        <div className={landscape ? "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2" : undefined}>
        <Button
          variant="outline"
          className={cn("font-extrabold uppercase", landscape ? "col-span-2 h-9 rounded-row" : "h-12 w-full rounded-pill tracking-[0.08em]")}
          onClick={() => setTipOpen(true)}
        >
          Add tip
        </Button>
        <div className={cn("flex gap-2", landscape ? "col-span-2" : "mt-2")}>
          <Button
            variant="outline"
            aria-label="Print receipt"
            className={cn("h-12 shrink-0", landscape ? "w-12 rounded-row" : "w-14 rounded-pill")}
            onClick={() => toast.success("Receipt sent to the printer")}
          >
            <Printer className="size-5" />
          </Button>
          {ticket.status === "paid" ? (
            <Button
              className={cn("h-12 flex-1 bg-primary font-extrabold uppercase text-primary-foreground", landscape ? "rounded-row" : "rounded-pill tracking-[0.08em]")}
              onClick={() => {
                closeTicket(ticket.id);
                toast.success("Order closed successfully");
              }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                aria-label="Cancel order"
                className={cn("h-12 shrink-0 border-destructive/40 text-destructive", landscape ? "w-12 rounded-row" : "w-14 rounded-pill")}
                onClick={cancelThisTicket}
              >
                <Trash2 className="size-5" />
              </Button>
              <Button
                className={cn("h-12 min-w-0 flex-1 bg-accent font-extrabold uppercase text-accent-foreground hover:bg-accent/90", landscape ? "rounded-row" : "rounded-pill tracking-[0.08em]")}
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
        </div>
        )}
      </Footer>
      </div>


      <DiscountSheet
        open={discountOpen}
        selected={ticket.discountName ?? null}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          patchTicket(ticket.id, { discountName: d.name || undefined, discountPercent: d.percent });
        }}
      />
      {transferOpen ? <TransferCheckDialog currentOwner={ticket.server} onClose={() => setTransferOpen(false)} onTransfer={(owner) => {
        transferTickets([ticket.id], owner);
        setTransferOpen(false);
        toast.success(`Check transferred to ${owner}`);
      }} /> : null}

      <RefundReasonDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        onDone={(reason) => {
          refundTicket(ticket.id, reason);
          toast.success(`Refund of ${money(ticket.total)} recorded`, { description: "Demo only - no money moved and no printer is connected." });
        }}
      />
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
