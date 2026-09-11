import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgePercent, ChevronRight, NotebookPen, X } from "lucide-react";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { OrderTypeStrip } from "@/components/pos/order-type-strip";
import { ReceiptCard, ReceiptRow } from "@/components/pos/receipt";
import { TAX_RATE, money } from "@/lib/demo-data";
import type { Room } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";

/**
 * The check itself. Shared by the phone bill step and the tablet / desktop
 * left pane so both render exactly the same receipt. The guest, order type,
 * quantities, discount and note stay editable here until a partial payment
 * has been taken.
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
    changeQty,
    orderNotes,
    setOrderNotes,
    setOrderDiscountPercent,
  } = usePos();
  const orderNumber = tickets.length + 1;
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  const [guestOpen, setGuestOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountName, setDiscountName] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  const editable = partialPayments.length === 0;

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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <p className="truncate text-fs-sm font-extrabold text-foreground">Order #{orderNumber}</p>
        {editable ? (
          <button
            type="button"
            onClick={() => setTypeOpen((v) => !v)}
            aria-expanded={typeOpen}
            className="flex shrink-0 items-center gap-1 rounded-pill bg-muted px-2 py-0.5 text-fs-xs font-extrabold uppercase text-foreground transition-colors hover:bg-secondary"
          >
            {orderType}
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        ) : (
          <p className="shrink-0 text-fs-sm font-extrabold uppercase text-foreground">{orderType}</p>
        )}
        {editable ? (
          <button
            type="button"
            onClick={() => setGuestOpen(true)}
            aria-label="Edit guest details"
            className="flex min-w-0 items-center gap-1 text-left"
          >
            <span className="truncate text-fs-xs text-muted-foreground">
              {guest.name || tableGroupLabel(activeTable) || "Guest Name"}
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        ) : (
          <p className="truncate text-fs-xs text-muted-foreground">
            {guest.name || tableGroupLabel(activeTable) || "Guest Name"}
          </p>
        )}
        <p className="shrink-0 text-fs-xs text-muted-foreground">
          Ticket No. {orderNumber} · Amount Due {money(due)}
        </p>
      </div>

      {editable && typeOpen ? (
        <OrderTypeStrip
          className="mt-3"
          value={orderType}
          onSelect={(t) => {
            setOrderType(t);
            setTypeOpen(false);
          }}
        />
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
            <div className="flex items-center gap-2 text-fs-sm text-accent">
              <span className="min-w-0 flex-1 truncate">
                Discount{discountName ? ` · ${discountName}` : ""}
              </span>
              <span className="shrink-0 tabular-nums">-{money(totals.discount)}</span>
              {editable ? (
                <button
                  type="button"
                  aria-label="Remove discount"
                  onClick={() => {
                    setOrderDiscountPercent(0);
                    setDiscountName(null);
                  }}
                  className="grid size-7 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
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

      {editable ? (
        <div className="mt-3 flex items-center gap-2 border-t border-dashed border-border pt-3">
          <button
            type="button"
            onClick={() => setDiscountOpen(true)}
            className="flex min-h-ctl-md flex-1 items-center justify-center gap-1.5 rounded-row bg-muted px-3 text-fs-xs font-extrabold uppercase text-foreground transition-colors hover:bg-secondary"
          >
            <BadgePercent className="size-4 shrink-0" aria-hidden />
            Discount
          </button>
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className="flex min-h-ctl-md flex-1 items-center justify-center gap-1.5 rounded-row bg-muted px-3 text-fs-xs font-extrabold uppercase text-foreground transition-colors hover:bg-secondary"
          >
            <NotebookPen className="size-4 shrink-0" aria-hidden />
            Notes
          </button>
        </div>
      ) : (
        <p className="mt-3 border-t border-dashed border-border pt-3 text-fs-xs text-muted-foreground">
          A payment has been taken on this check, so the items can no longer be edited here.
        </p>
      )}

      {editable && (notesOpen || orderNotes) ? (
        <label className="mt-2 flex items-center gap-2 rounded-row bg-muted px-3">
          <NotebookPen className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Order Notes"
            aria-label="Order notes"
            autoFocus={notesOpen}
            className="min-h-ctl-md w-full bg-transparent text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      ) : null}

      <ul className="mt-3 space-y-1.5 border-t border-dashed border-border pt-3">
        {cart.map((line) => (
          <li key={line.id} className="flex items-start gap-2">
            {editable ? (
              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={`Remove one ${line.name}`}
                  onClick={() => changeQty(line.id, -1)}
                  className="grid size-8 place-items-center rounded-pill bg-muted text-fs-sm font-extrabold text-foreground transition-colors hover:bg-secondary"
                >
                  &minus;
                </button>
                <span className="min-w-4 text-center text-fs-xs font-bold tabular-nums text-muted-foreground">
                  {line.qty}
                </span>
                <button
                  type="button"
                  aria-label={`Add one ${line.name}`}
                  onClick={() => changeQty(line.id, 1)}
                  className="grid size-8 place-items-center rounded-pill bg-muted text-fs-sm font-extrabold text-foreground transition-colors hover:bg-secondary"
                >
                  +
                </button>
              </span>
            ) : (
              <span className="shrink-0 text-fs-xs font-bold text-muted-foreground">
                {line.qty} ea
              </span>
            )}
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

      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
      <DiscountSheet
        open={discountOpen}
        selected={discountName}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          setOrderDiscountPercent(d.percent);
          setDiscountName(d.name);
          setDiscountOpen(false);
        }}
      />
    </ReceiptCard>
  );
}
