import {
  Bike,
  ChevronDown,
  CircleDollarSign,
  NotebookPen,
  Percent,
  Printer,
  Save,

  ReceiptText,
  ShoppingBag,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { usePos } from "@/lib/pos-store";
import { money, serviceOrderTypes, type ServiceOrderType } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { PinSheet } from "@/components/pos/pin-sheet";

/** Quick service types shown as a segmented control, as on the original screen. */
const quickTypes: { type: ServiceOrderType; label: string; icon: React.ReactNode }[] = [
  { type: "Dine In", label: "Dine-In", icon: <Utensils className="size-4" /> },
  { type: "Take Away", label: "Takeout", icon: <ShoppingBag className="size-4" /> },
  { type: "Delivery", label: "Delivery", icon: <Bike className="size-4" /> },
];

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
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountName, setDiscountName] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);

  const orderNumber = activeTicketId
    ? (tickets.find((t) => t.id === activeTicketId)?.number ?? null)
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Guest identity and order level actions */}
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => setGuestOpen(true)}
            aria-label="Edit guest details"
            className="min-w-0 flex-1 rounded-row px-1 py-0.5 text-left transition-colors hover:bg-muted"
          >
            <span className="block truncate text-fs-lg font-extrabold text-foreground">
              {guest.name || activeTable || "Guest Name"}
            </span>
            <span className="block truncate text-fs-sm text-muted-foreground">
              {guest.phone || "(XXX) XXX-XXXX"}
            </span>
            <span className="block truncate text-fs-xs font-bold uppercase text-muted-foreground">
              {arrivedAt ? `Arrived at ${arrivedAt}` : "Not started"}
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <OrderAction
              label="Discount"
              active={totals.discount > 0}
              onPress={() => setDiscountOpen(true)}
            >
              <Percent className="size-4" />
            </OrderAction>
            <OrderAction
              label={noTax ? "Tax exempt on" : "Tax exempt"}
              active={noTax}
              onPress={() => {
                setNoTax(!noTax);
                toast.success(noTax ? "Tax applied" : "Order marked tax exempt");
              }}
            >
              <ReceiptText className="size-4" />
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
              <span className="text-fs-sm font-extrabold leading-none">C</span>
            </OrderAction>
            <OrderAction
              label="Void order"
              onPress={() => {
                if (!cart.length) return;
                cancelOrder();
                toast.success("Order voided");
              }}
            >
              <CircleDollarSign className="size-4" />
            </OrderAction>
          </div>
        </div>

        {/* Service type segmented control */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-pill bg-muted p-1">
          {quickTypes.map((q) => (
            <button
              key={q.type}
              type="button"
              onClick={() => setOrderType(q.type)}
              className={cn(
                "flex min-h-tap items-center justify-center gap-1 rounded-pill px-1 text-fs-xs font-extrabold uppercase tracking-tight transition-colors",
                orderType === q.type
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <span className="hidden shrink-0 xl:inline-flex">{q.icon}</span>
              <span className="whitespace-nowrap">{q.label}</span>
            </button>
          ))}
        </div>
        {!quickTypes.some((q) => q.type === orderType) ? (
          <div className="relative mt-2">
            <select
              aria-label="Order type"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as ServiceOrderType)}
              className="min-h-tap w-full appearance-none rounded-pill border border-border bg-background pl-3 pr-8 text-fs-sm font-extrabold text-foreground outline-none"
            >
              {serviceOrderTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        ) : null}

        {/* Order number and server */}
        <div className="mt-3 flex items-center justify-between text-fs-xs font-bold uppercase text-muted-foreground">
          <span>Order# {orderNumber ?? "--"}</span>
          <span className="truncate">{session.name}</span>
        </div>

        <label className="mt-2 flex items-center gap-2 rounded-row bg-muted px-3">
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

      {/* Items */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(1rem+var(--kb-inset,0px))] pt-3">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <Utensils className="size-10 text-muted-foreground/50" />
            <p className="text-fs-sm font-bold text-muted-foreground">Let&apos;s create an order</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-fs-sm font-extrabold text-foreground">{l.name}</p>
                  <p className="text-fs-xs text-muted-foreground">{money(l.price)}</p>
                  {l.modifiers?.length ? (
                    <p className="truncate text-fs-xs text-muted-foreground">
                      {l.modifiers.join(", ")}
                    </p>
                  ) : null}
                  {l.notes ? (
                    <p className="truncate text-fs-xs text-muted-foreground">{l.notes}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove one ${l.name}`}
                    onClick={() => changeQty(l.id, -1)}
                    className="grid size-11 place-items-center rounded-pill border border-border text-fs-sm font-bold text-foreground"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-fs-sm font-bold text-foreground">
                    {l.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one ${l.name}`}
                    onClick={() => changeQty(l.id, 1)}
                    className="grid size-11 place-items-center rounded-pill border border-border text-fs-sm font-bold text-foreground"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: quick actions, totals, Save / Fire / Charge */}
      <div
        className={cn(
          "shrink-0 space-y-2 border-t border-border bg-surface px-3 pt-2",
          wide
            ? "pb-[calc(0.5rem+var(--kb-inset,0px))]"
            : "pb-[calc(0.5rem+var(--kb-inset,0px)+var(--tabs-h,0px))]",
        )}
      >
        <div className="flex items-center gap-1">
          <OrderAction label="Discount" onPress={() => setDiscountOpen(true)}>
            <Percent className="size-5" />
          </OrderAction>
          <OrderAction label="Guests" onPress={() => setGuestOpen(true)}>
            <Users className="size-5" />
          </OrderAction>
          <OrderAction
            label="Print"
            onPress={() => toast.success("Order ticket sent to printer")}
          >
            <Printer className="size-5" />
          </OrderAction>
          <OrderAction
            label="Void order"
            onPress={() => {
              if (!cart.length) return;
              cancelOrder();
              toast.success("Order voided");
            }}
          >
            <Trash2 className="size-5" />
          </OrderAction>
        </div>

        <dl className="space-y-1 text-fs-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <dt>Sub Total</dt>
            <dd className="tabular-nums">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <dt>Tax{noTax ? " (exempt)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.tax)}</dd>
          </div>
          {totals.discount ? (
            <div className="flex items-center justify-between text-muted-foreground">
              <dt>Discount{discountName ? ` · ${discountName}` : ""}</dt>
              <dd className="tabular-nums">-{money(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-0.5 text-fs-lg font-extrabold text-foreground">
            <dt>Total{comped ? " (comped)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.total)}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!totals.count}
            aria-label="Save order"
            title="Save order"
            onClick={() => toast.success("Order saved")}
            className="grid min-h-ctl-lg w-14 shrink-0 place-items-center rounded-pill border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Save className="size-5" />
          </button>
          <button
            type="button"
            disabled={!totals.count}
            onClick={() => toast.success("Order fired to the kitchen")}
            className="min-h-ctl-lg shrink-0 rounded-pill bg-tile-orange px-5 text-fs-sm font-extrabold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Fire
          </button>
          <button
            type="button"
            disabled={!totals.count}
            onClick={() => navigate({ to: "/payment/method" })}
            className="min-h-ctl-lg min-w-0 flex-1 rounded-pill bg-accent text-fs-sm font-extrabold uppercase text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40"
          >
            Charge
          </button>
        </div>

      </div>

      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
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
        "grid size-10 shrink-0 place-items-center rounded-pill border border-border transition-colors hover:bg-muted",
        active ? "bg-accent text-accent-foreground" : "bg-surface text-foreground",
      )}
    >
      {children}
    </button>
  );
}
