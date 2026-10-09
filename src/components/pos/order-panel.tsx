import {
  BadgePercent,
  ChevronDown,
  Flame,
  MoreVertical,
  NotebookPen,
  Percent,
  Save,
  Tag,
  Utensils,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import { money, type ServiceOrderType } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { formatPhone, GuestSheet } from "@/components/pos/guest-sheet";
import { OrderTypeStrip } from "@/components/pos/order-type-strip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orderTypeIcons } from "@/components/pos/guest-sheet";
import { serviceOrderTypeLabels, serviceOrderTypes } from "@/lib/demo-data";

function CartHeaderActions({
  onDiscount,
  moreOpen,
  onMoreOpenChange,
}: {
  onDiscount: (name: string) => void;
  moreOpen: boolean;
  onMoreOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { totals, noTax, setNoTax, setOrderDiscountPercent } = usePos();
  const [discountOpen, setDiscountOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 items-center gap-1">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        <HeaderAction label="Custom Item" icon={Tag} onPress={() => navigate({ to: "/order/custom-item" })} />
        <HeaderAction label="Discount" icon={BadgePercent} active={totals.discount > 0} onPress={() => setDiscountOpen(true)} />
        <HeaderAction
          label={noTax ? "No Tax · On" : "No Tax"}
          icon={Percent}
          active={noTax}
          onPress={() => {
            setNoTax(!noTax);
            toast.success(noTax ? "Tax applied" : "Tax removed from this order");
          }}
        />
        <HeaderAction label="No Sale" icon={Wallet} onPress={() => toast.success("Register opened")} />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="More order options"
          title="More order options"
          aria-expanded={moreOpen}
          onClick={() => onMoreOpenChange(!moreOpen)}
          className="size-8 shrink-0 rounded-pill"
        >
          <MoreVertical className="size-4" />
        </Button>
      </div>

      <DiscountSheet
        open={discountOpen}
        selected={null}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          onDiscount(d.name);
          setOrderDiscountPercent(d.percent);
          setDiscountOpen(false);
        }}
      />
    </>
  );
}

function HeaderAction({
  label,
  icon: Icon,
  active,
  onPress,
}: {
  label: string;
  icon: typeof Tag;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onPress}
      className={cn(
        "h-8 shrink-0 rounded-pill px-2.5 text-fs-xs font-extrabold",
        active && "bg-accent text-accent-foreground hover:bg-accent/90",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </Button>
  );
}

/** Running order area shared by phone, tablet and desktop layouts. */
export function OrderPanel({
  wide,
  moreOpen,
  onMoreOpenChange,
}: {
  wide: boolean;
  moreOpen: boolean;
  onMoreOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const {
    guest,
    setGuest,
    arrivedAt,
    activeTable,
    tableGroupLabel,
    orderType,
    setOrderType,
    cart,
    changeQty,
    totals,
    noTax,
    comped,
    orderNotes,
    setOrderNotes,
    session,
    activeTicketId,
    tickets,
    settings,
  } = usePos();

  const placement = settings.orderTypePlacement;
  const showTypeStrip = placement === "Order screen" || placement === "Both";

  const [guestOpen, setGuestOpen] = useState(false);
  const [typeForSheet, setTypeForSheet] = useState<ServiceOrderType | undefined>(undefined);
  const [discountName, setDiscountName] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [guestName, setGuestName] = useState(guest.name);
  const [guestPhone, setGuestPhone] = useState(guest.phone);

  useEffect(() => {
    setGuestName(guest.name);
    setGuestPhone(guest.phone);
  }, [guest.name, guest.phone]);

  const saveGuestName = () => {
    const name = guestName.trim();
    setGuest({ name });
    setGuestName(name);
  };

  const saveGuestPhone = () => {
    const phone = formatPhone(guestPhone);
    setGuest({ phone });
    setGuestPhone(phone);
  };

  const orderNumber = activeTicketId
    ? (tickets.find((t) => t.id === activeTicketId)?.number ?? null)
    : null;

  const OrderTypeIcon = orderTypeIcons[orderType];
  const selectOrderType = (type: ServiceOrderType) => {
    setOrderType(type);
    setTypeForSheet(type);
    setGuestOpen(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 pb-2 pt-2">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 py-1">
          <input
            type="text"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            onBlur={saveGuestName}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              saveGuestName();
              event.currentTarget.blur();
            }}
            placeholder={tableGroupLabel(activeTable) || "Guest Name"}
            aria-label="Guest name"
            className="h-8 min-w-0 rounded-row border border-transparent bg-transparent px-1 text-fs-sm font-extrabold text-foreground outline-none transition-colors placeholder:text-foreground focus:border-border focus:bg-muted"
          />
          <input
            type="tel"
            inputMode="tel"
            value={guestPhone}
            onChange={(event) => setGuestPhone(formatPhone(event.target.value))}
            onBlur={saveGuestPhone}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              saveGuestPhone();
              event.currentTarget.blur();
            }}
            placeholder="(XXX) XXX-XXXX"
            aria-label="Guest mobile number"
            className="h-8 min-w-0 rounded-row border border-transparent bg-transparent px-1 text-fs-xs font-bold text-muted-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-border focus:bg-muted focus:text-foreground"
          />
          <span className="whitespace-nowrap text-fs-xs font-bold text-muted-foreground">
            {arrivedAt ? `Arrived ${arrivedAt}` : "Not started"}
          </span>
        </div>

        <div className="mt-1.5">
          <CartHeaderActions
            onDiscount={setDiscountName}
            moreOpen={moreOpen}
            onMoreOpenChange={onMoreOpenChange}
          />
        </div>

        {/* Order type, check number and server share one compact information row. */}
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-row bg-muted/60 p-2">
          {showTypeStrip ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 min-w-0 justify-start gap-1.5 rounded-row px-2.5 text-fs-xs font-extrabold uppercase"
                >
                  <OrderTypeIcon className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0 truncate">{serviceOrderTypeLabels[orderType]}</span>
                  <ChevronDown className="ml-auto size-4 shrink-0" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[12rem] rounded-card">
                {serviceOrderTypes.map((type) => {
                  const Icon = orderTypeIcons[type];
                  return (
                    <DropdownMenuItem
                      key={type}
                      onSelect={() => selectOrderType(type)}
                      className="min-h-tap gap-2 text-fs-sm font-bold"
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {serviceOrderTypeLabels[type]}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="min-w-0 truncate px-1 text-fs-xs font-extrabold uppercase text-foreground">
              {serviceOrderTypeLabels[orderType]}
            </span>
          )}

          <span className="grid h-10 min-w-12 shrink-0 place-items-center rounded-row bg-background px-2 text-fs-base font-extrabold tabular-nums text-foreground">
            {orderNumber ?? "--"}
          </span>

          <span className="flex min-w-0 items-center justify-end gap-1.5 px-1 text-fs-xs font-bold text-muted-foreground">
            <Utensils className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{session.name}</span>
          </span>
        </div>

        {/* Notes remain directly below order information, including the empty state. */}
        {notesOpen ? (
          <label className="mt-2 flex items-center gap-2 rounded-row bg-muted px-3">
            <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Order Notes"
              aria-label="Order notes"
              autoFocus
              onBlur={() => setNotesOpen(false)}
              className="min-h-ctl-md w-full bg-transparent text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        ) : (
          <Button
            type="button"
            onClick={() => setNotesOpen(true)}
            aria-label={orderNotes ? "Edit order notes" : "Add order notes"}
            variant="secondary"
            className="mt-2 min-h-ctl-md w-full justify-start gap-2 rounded-row px-3 text-left"
          >
            <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-fs-xs font-bold text-muted-foreground">
              {orderNotes || "Order notes"}
            </span>
          </Button>
        )}
      </div>


      {/* Items: dense receipt rows, the only scrolling area */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(0.5rem+var(--kb-inset,0px))] pt-1.5">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <Utensils className="size-10 text-muted-foreground/50" />
            <p className="text-fs-sm font-bold text-muted-foreground">Let&apos;s create an order</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {cart.map((l) => (
              <li key={l.id} className="rounded-row border-l-2 border-primary bg-muted/45 px-2.5 py-2.5">
                <div className="flex items-start gap-1.5 pr-0.5">

                  <button
                    type="button"
                    onClick={() => changeQty(l.id, 1)}
                    aria-label={`Add one ${l.name}`}
                    title={`Add one ${l.name}`}
                    className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-fs-xs font-extrabold tabular-nums text-foreground transition-colors hover:bg-secondary"
                  >
                    {l.qty}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1 truncate text-fs-sm font-bold leading-snug text-foreground">
                        {l.name}
                      </span>
                      <span className="shrink-0 text-fs-sm font-bold tabular-nums text-foreground">
                        {money(l.price * l.qty)}
                      </span>
                    </div>
                    {l.modifiers?.length ? (
                      <p className="truncate text-fs-xs font-bold uppercase leading-snug text-tile-blue">
                        {l.modifiers.join(", ")}
                      </p>
                    ) : null}
                    {l.notes ? (
                      <p className="truncate text-fs-xs italic leading-snug text-muted-foreground">
                        {l.notes}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => changeQty(l.id, -1)}
                    aria-label={`Remove one ${l.name}`}
                    className="grid size-6 shrink-0 place-items-center rounded-pill text-fs-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    &minus;
                  </button>
                </div>
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
        <dl className="rounded-row bg-muted/70 px-3 py-2 text-fs-xs">
          <div className="grid grid-cols-2 gap-3 font-bold text-muted-foreground">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <dt className="truncate">Sub Total</dt>
              <dd className="shrink-0 tabular-nums text-foreground">{money(totals.subtotal)}</dd>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <dt className="truncate">{brand.taxLabel}{noTax ? " (exempt)" : ""}</dt>
              <dd className="shrink-0 tabular-nums text-foreground">{money(totals.tax)}</dd>
            </div>
          </div>
          {totals.discount ? (
            <div className="mt-1 flex items-center justify-between font-bold text-muted-foreground">
              <dt>Discount{discountName ? ` · ${discountName}` : ""}</dt>
              <dd className="tabular-nums">-{money(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-1 text-fs-sm font-extrabold text-foreground">
            <dt>Total{comped ? " (comped)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.total)}</dd>
          </div>
        </dl>

        <div className="mt-1.5 grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2">
          <button
            type="button"
            disabled={!totals.count}
            aria-label="Save order"
            title="Save order"
            onClick={() => {
              if (!totals.count) return;
              toast.success("Order saved");
            }}
            className="grid min-h-ctl-lg w-12 shrink-0 place-items-center rounded-row bg-muted text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Save className="size-5" />
          </button>
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
    </div>
  );
}

