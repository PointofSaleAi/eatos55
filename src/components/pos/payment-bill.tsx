import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { OrderTypeStrip } from "@/components/pos/order-type-strip";
import { ReceiptCard, ReceiptRow } from "@/components/pos/receipt";
import { TAX_RATE, money } from "@/lib/demo-data";
import type { Room } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";

/**
 * The check itself. Shared by the phone bill step and the tablet / desktop
 * left pane so both render exactly the same receipt.
 */
export function PaymentBill({ room }: { room?: Room | null }) {
  const {
    cart,
    totals,
    tickets,
    guest,
    orderType,
    activeTable,
    tableGroupLabel,
    paidSoFar,
    partialPayments,
    removePartialPayment,
    setOrderType,
    settings,
  } = usePos();
  const placement = settings.orderTypePlacement;
  const showTypeStrip = placement === "Charge screen" || placement === "Both";
  const orderNumber = tickets.length + 1;
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  if (cart.length === 0) {
    return (
      <ReceiptCard className="mx-auto w-full max-w-md xl:max-w-none">
        <p className="text-fs-base font-extrabold text-foreground">Nothing to tender yet</p>
        <p className="mt-1 text-fs-sm text-muted-foreground">
          This check has no items, so there is no balance to take payment for. Add products to the
          order and come back to choose a payment method.
        </p>
        <Link
          to="/order/new"
          className="mt-3 inline-flex h-ctl-lg items-center justify-center rounded-row bg-primary px-4 text-fs-sm font-extrabold uppercase tracking-[0.06em] text-primary-foreground"
        >
          Back to order
        </Link>
      </ReceiptCard>
    );
  }

  return (
    <ReceiptCard className="mx-auto w-full max-w-md xl:max-w-none">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <p className="truncate text-fs-sm font-extrabold text-foreground">Order #{orderNumber}</p>
        <p className="shrink-0 text-fs-sm font-extrabold uppercase text-foreground">{orderType}</p>
        <p className="truncate text-fs-xs text-muted-foreground">
          {guest.name || tableGroupLabel(activeTable) || "Guest Name"}
        </p>
        <p className="shrink-0 text-fs-xs text-muted-foreground">
          Ticket No. {orderNumber} · Amount Due {money(due)}
        </p>
      </div>

      {showTypeStrip ? (
        <OrderTypeStrip className="mt-3" value={orderType} onSelect={setOrderType} />
      ) : null}

      <div className="mt-3 border-t border-dashed border-border pt-3">
        <div className="flex items-center justify-between text-fs-base font-extrabold text-foreground">
          <span>Total Due</span>
          <span className="tabular-nums">{money(due)}</span>
        </div>
        <div className="mt-2 space-y-1">
          <ReceiptRow label="TOTAL" value={money(totals.total)} strong />
          <ReceiptRow label="Sub Total" value={money(totals.subtotal)} />
          <ReceiptRow label={`TAX (${Math.round(TAX_RATE * 100)}%)`} value={money(totals.tax)} />
          {totals.serviceCharge ? (
            <ReceiptRow label="Service Charge" value={money(totals.serviceCharge)} />
          ) : null}
          {totals.discount ? (
            <ReceiptRow label="Discount" value={`-${money(totals.discount)}`} tone="accent" />
          ) : null}
          {paidSoFar > 0 ? <ReceiptRow label="Paid so far" value={money(paidSoFar)} /> : null}
        </div>
      </div>

      {partialPayments.length ? (
        <ul className="mt-3 space-y-1.5 border-t border-dashed border-border pt-3">
          {partialPayments.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                {p.label}
              </span>
              <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-success">
                {money(p.amount)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${p.label} payment`}
                onClick={() => removePartialPayment(p.id)}
                className="grid size-8 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-3 space-y-1.5 border-t border-dashed border-border pt-3">
        {cart.map((line) => (
          <li key={line.id} className="flex items-start gap-2">
            <span className="shrink-0 text-fs-xs font-bold text-muted-foreground">
              {line.qty} ea
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-fs-sm font-bold text-foreground">{line.name}</span>
              {line.modifiers?.map((m) => (
                <span key={m} className="block text-fs-xs text-muted-foreground">
                  - {m}
                </span>
              ))}
            </span>
            <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">
              {money(line.price * line.qty)}
            </span>
          </li>
        ))}
      </ul>

      {room?.stay ? (
        <div className="mt-3 border-t border-dashed border-border pt-3">
          <p className="text-fs-sm font-extrabold text-foreground">
            {room.name} · {room.number}
          </p>
          <p className="text-fs-xs text-muted-foreground">Booking: {room.stay.bookingNumber}</p>
        </div>
      ) : null}
    </ReceiptCard>
  );
}
