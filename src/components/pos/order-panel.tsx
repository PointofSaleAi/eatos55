import {
  ArrowLeftRight,
  BadgePercent,
  ChevronRight,
  CircleDollarSign,
  Flame,
  NotebookPen,
  ReceiptText,
  Save,
  Utensils,
} from "lucide-react";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { usePos } from "@/lib/pos-store";
import {
  money,
  serviceOrderTypeLabels,
  serviceOrderTypes,
  type ServiceOrderType,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { GuestSheet, orderTypeIcons } from "@/components/pos/guest-sheet";
import { PinSheet } from "@/components/pos/pin-sheet";

/**
 * Right-hand order area: guest identity, order level actions, service type,
 * order number / server, order notes, the running items and the totals footer.
 * Used both as the landscape sidebar and as the phone "Order" tab.
 */
export function OrderPanel({ wide }: { wide: boolean }) {
  const navigate = useNavigate();
  const {
    guest,
    arrivedAt,
    activeTable,
    orderType,
    setOrderType,
    cart,
    changeQty,
    totals,
    cancelOrder,
    noTax,
    setNoTax,
    comped,
    setComped,
    orderNotes,
    setOrderNotes,
    setOrderDiscountPercent,
    session,
    activeTicketId,
    tickets,
  } = usePos();

  const [guestOpen, setGuestOpen] = useState(false);
  const [typeForSheet, setTypeForSheet] = useState<ServiceOrderType | undefined>(undefined);
  const stripRef = useRef<HTMLDivElement>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountName, setDiscountName] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);

  const orderNumber = activeTicketId
    ? (tickets.find((t) => t.id === activeTicketId)?.number ?? null)
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Guest identity and order level actions */}
      <div className="shrink-0 border-b border-border px-4 pb-2.5 pt-2.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => setGuestOpen(true)}
            aria-label="Edit guest details"
            className="min-w-0 rounded-row px-1 py-0.5 text-left transition-colors hover:bg-muted"
          >
            <span className="block truncate text-fs-lg font-extrabold leading-tight text-foreground">
              {guest.name || activeTable || "Guest Name"}
            </span>
            <span className="block truncate text-fs-sm leading-tight text-muted-foreground">
              {guest.phone || "(XXX) XXX-XXXX"}
            </span>
            <span className="block truncate text-fs-xs font-bold uppercase leading-tight text-muted-foreground">
              {arrivedAt ? `Arrived at ${arrivedAt}` : "Not started"}
            </span>
          </button>
          <div className="grid shrink-0 grid-cols-3 gap-1">
            <OrderAction
              label="Discount"
              active={totals.discount > 0}
              onPress={() => setDiscountOpen(true)}
            >
              <BadgePercent className="size-5" />
            </OrderAction>
            <OrderAction label="Transfer check" onPress={() => setGuestOpen(true)}>
              <ArrowLeftRight className="size-5" />
            </OrderAction>
            <OrderAction
              label={noTax ? "Tax exempt on" : "Tax exempt"}
              active={noTax}
              onPress={() => {
                setNoTax(!noTax);
                toast.success(noTax ? "Tax applied" : "Order marked tax exempt");
              }}
            >
              <ReceiptText className="size-5" />
            </OrderAction>
            <OrderAction
              label={comped ? "Comp on" : "Comp order"}
              active={comped}
              onPress={() => {
                if (comped) {
                  setComped(false);
                  toast.success("Comp removed");
                  return;
                }
                setPinOpen(true);
              }}
            >
              <span className="text-fs-base font-extrabold leading-none">C</span>
            </OrderAction>
            <OrderAction
              label="No charge"
              onPress={() => {
                if (!cart.length) return;
                cancelOrder();
                toast.success("Order voided");
              }}
            >
              <CircleDollarSign className="size-5" />
            </OrderAction>
            <OrderAction
              label="Save order"
              onPress={() => {
                if (!totals.count) return;
                toast.success("Order saved");
              }}
            >
              <Save className="size-5" />
            </OrderAction>
          </div>
        </div>

        {/* Service type strip: full set, scrolls sideways, opens guest info */}
        <div className="relative mt-2.5">
          <div
            ref={stripRef}
            className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth"
          >
            {serviceOrderTypes.map((t) => {
              const Icon = orderTypeIcons[t];
              const active = orderType === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setOrderType(t);
                    setTypeForSheet(t);
                    setGuestOpen(true);
                  }}
                  className={cn(
                    "flex min-h-tap shrink-0 items-center justify-center gap-1.5 rounded-row px-3 text-fs-xs font-extrabold uppercase tracking-[-0.02em] transition-colors",
                    active
                      ? "border-2 border-foreground bg-surface text-foreground shadow-sm"
                      : "border border-transparent bg-muted text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span>{serviceOrderTypeLabels[t]}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="More order types"
            onClick={() =>
              stripRef.current?.scrollBy({ left: stripRef.current.clientWidth * 0.7, behavior: "smooth" })
            }
            className="absolute right-0 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-pill border border-border bg-surface text-foreground shadow-sm"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        {/* Order number and server */}
        <div className="mt-2 flex items-center justify-between text-fs-xs font-bold uppercase text-muted-foreground">
          <span>Order# {orderNumber ?? "--"}</span>
          <span className="truncate">{session.name}</span>
        </div>

        <label className="mt-1.5 flex items-center gap-2 rounded-row bg-muted px-3">
          <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Order Notes"
            aria-label="Order notes"
            className="min-h-tap w-full bg-transparent text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>


      {/* Items: flat receipt rows */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(0.5rem+var(--kb-inset,0px))] pt-2">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <Utensils className="size-10 text-muted-foreground/50" />
            <p className="text-fs-sm font-bold text-muted-foreground">Let&apos;s create an order</p>
          </div>
        ) : (
          <ul>
            {cart.map((l) => (
              <li key={l.id}>
                <div className="grid grid-cols-[3rem_minmax(0,1fr)_auto_1.5rem] items-start gap-2 py-1.5">
                  <span className="pt-0.5 text-fs-xs font-extrabold tabular-nums text-foreground">
                    {l.qty} ea
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(l.id, 1)}
                    aria-label={`Add one ${l.name}`}
                    className="min-w-0 rounded-row text-left transition-colors hover:bg-muted"
                  >
                    <span className="block line-clamp-2 text-fs-sm font-bold text-foreground">
                      {l.name}
                    </span>
                  </button>
                  <span className="min-w-[4.5rem] text-right text-fs-sm font-bold tabular-nums text-foreground">
                    {money(l.price * l.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(l.id, -1)}
                    aria-label={`Remove one ${l.name}`}
                    className="grid size-6 shrink-0 place-items-center rounded-pill text-fs-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    &minus;
                  </button>
                </div>
                {l.modifiers?.length ? (
                  <div className="pl-12">
                    {l.modifiers.map((m) => (
                      <div key={m} className="flex items-start gap-2 pb-1">
                        <span className="text-fs-xs leading-none text-muted-foreground">&#x2514;</span>
                        <span className="min-w-0 flex-1 truncate text-fs-xs font-bold text-tile-blue">
                          - {m}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {l.notes ? (
                  <p className="truncate pl-10 pb-1 text-fs-xs text-muted-foreground">{l.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: totals and Save / Fire / Charge */}
      <div
        className={cn(
          "shrink-0 border-t border-border bg-surface px-3 pt-1.5",
          wide
            ? "pb-[calc(0.5rem+var(--kb-inset,0px))]"
            : "pb-[calc(0.5rem+var(--kb-inset,0px)+var(--tabs-h,0px))]",
        )}
      >
        <dl className="divide-y divide-border text-fs-sm">
          <div className="flex items-center justify-between py-1 font-bold text-foreground">
            <dt>Sub Total</dt>
            <dd className="tabular-nums">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between py-1 font-bold text-foreground">
            <dt>Tax{noTax ? " (exempt)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.tax)}</dd>
          </div>
          {totals.discount ? (
            <div className="flex items-center justify-between py-1 text-muted-foreground">
              <dt>Discount{discountName ? ` · ${discountName}` : ""}</dt>
              <dd className="tabular-nums">-{money(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between py-1 text-fs-lg font-extrabold text-foreground">
            <dt>Total{comped ? " (comped)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.total)}</dd>
          </div>
        </dl>

        <div className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
          <button
            type="button"
            disabled={!totals.count}
            onClick={() => toast.success("Order fired to the kitchen")}
            className="flex min-h-ctl-lg shrink-0 items-center justify-center gap-1.5 rounded-row bg-tile-orange px-3 text-fs-sm font-extrabold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Flame className="size-4 shrink-0" />
            Fire
          </button>
          <button
            type="button"
            disabled={!totals.count}
            onClick={() => navigate({ to: "/payment/method" })}
            className="min-h-ctl-lg min-w-0 truncate rounded-row bg-accent px-3 text-fs-sm font-extrabold uppercase text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40"
          >
            Charge {money(totals.total)}
          </button>
        </div>
      </div>


      <GuestSheet
        open={guestOpen}
        initialType={typeForSheet}
        onClose={() => {
          setGuestOpen(false);
          setTypeForSheet(undefined);
        }}
      />
      <DiscountSheet
        open={discountOpen}
        selected={discountName}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          setDiscountName(d.name);
          setOrderDiscountPercent(d.percent);
          setDiscountOpen(false);
        }}
      />
      <PinSheet
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSubmit={() => {
          setPinOpen(false);
          setComped(true);
          toast.success("Order comped");
        }}
      />
    </div>
  );
}

function OrderAction({
  label,
  active,
  onPress,
  children,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onPress}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-pill transition-colors",
        active ? "bg-accent text-accent-foreground" : "bg-muted text-foreground hover:bg-secondary",
      )}

    >
      {children}
    </button>
  );
}
