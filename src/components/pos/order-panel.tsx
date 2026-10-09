import {
  BadgePercent,
  Flame,
  Footprints,
  Grid2x2,
  MoreVertical,
  NotebookPen,
  Percent,
  Save,
  Tag,
  Utensils,
  Wallet,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import { money, type ServiceOrderType } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { MoreSheet } from "@/components/pos/more-sheet";
import { OrderTypeStrip } from "@/components/pos/order-type-strip";
import { Button } from "@/components/ui/button";

function CartHeaderActions({ onDiscount }: { onDiscount: (name: string) => void }) {
  const navigate = useNavigate();
  const { totals, noTax, setNoTax, setOrderDiscountPercent } = usePos();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
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
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="More order options"
          title="More order options"
          onClick={() => setMoreOpen(true)}
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
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
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
export function OrderPanel({ wide }: { wide: boolean }) {
  const navigate = useNavigate();
  const {
    guest,
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

  const orderNumber = activeTicketId
    ? (tickets.find((t) => t.id === activeTicketId)?.number ?? null)
    : null;

  const showTableChip = orderType === "Dine In" && activeTable;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 pb-2 pt-2">
        <button
          type="button"
          onClick={() => setGuestOpen(true)}
          aria-label="Edit guest details"
          className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 rounded-row px-1 py-1 text-left transition-colors hover:bg-muted"
        >
          <span className="truncate text-fs-sm font-extrabold leading-tight text-foreground">
            {guest.name || tableGroupLabel(activeTable) || "Guest Name"}
          </span>
          <span className="truncate text-fs-xs font-bold text-muted-foreground">
            {guest.phone || "(XXX) XXX-XXXX"}
          </span>
          <span className="whitespace-nowrap text-fs-xs font-bold text-muted-foreground">
            {arrivedAt ? `Arrived ${arrivedAt}` : "Not started"}
          </span>
        </button>

        <div className="mt-1.5">
          <CartHeaderActions onDiscount={setDiscountName} />
        </div>

        {/* Service type and the table / arrival chip share one scrolling row */}
        {showTypeStrip || showTableChip ? (
          <div className="mt-2 flex items-center gap-2">
            {showTypeStrip ? (
              <OrderTypeStrip
                className="min-w-0 flex-1"
                value={orderType}
                onSelect={(t) => {
                  setOrderType(t);
                  setTypeForSheet(t);
                  setGuestOpen(true);
                }}
              />
            ) : null}
            {showTableChip ? (
              <span className="flex shrink-0 items-center gap-1.5 rounded-pill bg-foreground px-2.5 py-1 text-fs-xs font-extrabold text-background">
                <Grid2x2 className="size-3.5" aria-hidden />
                <span className="max-w-16 truncate">{tableGroupLabel(activeTable) ?? activeTable}</span>
                <Footprints className="size-3.5" aria-hidden />
                {arrivedAt || "--"}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Order number, notes shortcut and server share one row */}
        <div className="mt-1.5 flex items-center justify-between gap-2 text-fs-xs font-bold uppercase text-muted-foreground">
          <span className="shrink-0">Order# {orderNumber ?? "--"}</span>
          <span className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setNotesOpen(true)}
              aria-label="Order notes"
              title="Order notes"
              className="grid size-7 shrink-0 place-items-center rounded-pill bg-muted text-muted-foreground transition-colors hover:bg-secondary"
            >
              <NotebookPen className="size-3.5" />
            </button>
            <span className="truncate">{session.name}</span>
          </span>
        </div>

        {notesOpen ? (
          <label className="mt-1.5 flex items-center gap-2 rounded-row bg-muted px-3">
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
        ) : orderNotes ? (
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            aria-label="Edit order notes"
            className="mt-1.5 flex min-h-ctl-md w-full items-center gap-2 rounded-row bg-muted px-3 text-left"
          >
            <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-fs-xs font-bold text-muted-foreground">
              {orderNotes}
            </span>
          </button>
        ) : null}
      </div>


      {/* Items: dense receipt rows, the only scrolling area */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(0.5rem+var(--kb-inset,0px))] pt-1.5">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <Utensils className="size-10 text-muted-foreground/50" />
            <p className="text-fs-sm font-bold text-muted-foreground">Let&apos;s create an order</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {cart.map((l) => (
              <li key={l.id} className="py-1">
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
        <dl className="text-fs-sm">
          <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground">
            <dt>Sub Total</dt>
            <dd className="tabular-nums">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground">
            <dt>{brand.taxLabel}{noTax ? " (exempt)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.tax)}</dd>
          </div>
          {totals.discount ? (
            <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground">
              <dt>Discount{discountName ? ` · ${discountName}` : ""}</dt>
              <dd className="tabular-nums">-{money(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-0.5 text-fs-lg font-extrabold text-foreground">
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

