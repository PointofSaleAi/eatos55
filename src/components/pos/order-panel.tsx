import {
  BadgePercent,
  ClipboardList,
  Flame,
  Footprints,
  GitMerge,
  Gift,
  Grid2x2,
  NotebookPen,
  MoreHorizontal,
  X,
  Percent,
  Receipt,
  RotateCcw,
  Save,
  Tag,
  Trash2,
  TriangleAlert,
  Utensils,
  UserPlus,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import { money, type ServiceOrderType } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { formatPhone, GuestSheet } from "@/components/pos/guest-sheet";
import { OrderTypeStrip } from "@/components/pos/order-type-strip";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type OptionsLayout = { moreOpen: boolean; onMoreOpenChange: (open: boolean) => void; railHost: HTMLElement | null; docked: boolean; onCustomItem: () => void; customItemOpen: boolean };

function CartHeaderActions({ onDiscount, moreOpen, onMoreOpenChange, railHost, docked, onCustomItem, customItemOpen }: OptionsLayout & { onDiscount: (name: string) => void }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const {
    totals,
    noTax,
    setNoTax,
    setOrderDiscountPercent,
    tickets,
    activeTicketId,
    cancelOrder,
    mergeTicket,
    serviceCharge,
    setServiceCharge,
    allergyNote,
    setAllergyNote,
  } = usePos();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [charge, setCharge] = useState(String(serviceCharge || ""));
  const [guestOpen, setGuestOpen] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyDraft, setAllergyDraft] = useState("");
  const [mergeOpen, setMergeOpen] = useState(false);

  const mergeCandidates = tickets.filter(
    (t) => !t.closed && t.status !== "paid" && t.id !== activeTicketId,
  );

  const cancelCurrentOrder = () => {
    void (async () => {
      const ok = await confirm({
        title: "Cancel this order?",
        message: totals.count
          ? "This cannot be undone — every item on the order is removed."
          : "The order in progress is discarded.",
        confirmLabel: "Cancel order",
        destructive: true,
      });
      if (!ok) return;
      cancelOrder();
      toast.success("Order cancelled");
      navigate({ to: "/tickets" });
    })();
  };

  const secondaryActions = (rail: boolean) => {
    const actions = [
      { label: customItemOpen ? "Menu Item" : "Custom Item", icon: customItemOpen ? Grid2x2 : Tag, run: onCustomItem },
      { label: "Gift Card", icon: Gift, run: () => toast.info("Gift Card is not configured for this location") },
      { label: "Service Charge", icon: Receipt, active: serviceCharge > 0, run: () => { setCharge(String(serviceCharge || "")); setChargeOpen(true); } },
      { label: "Add Guest", icon: UserPlus, run: () => setGuestOpen(true) },
      { label: "Open Orders", icon: ClipboardList, run: () => navigate({ to: "/tickets" }) },
      { label: "Allergy", icon: TriangleAlert, active: Boolean(allergyNote), run: () => { setAllergyDraft(allergyNote); setAllergyOpen(true); } },
      { label: "Merge", icon: GitMerge, run: () => setMergeOpen(true) },
      { label: "Reopen Check", icon: RotateCcw, run: () => toast.info("Reopen Check is not configured for this location") },
    ];
    return actions.map(({ label, icon: Icon, active, run }) => (
      <Button key={label} type="button" variant="ghost" aria-label={label} title={label}
        onClick={() => { onMoreOpenChange(false); run(); }}
        className={cn(rail ? "h-auto min-h-16 w-full shrink-0 flex-col gap-1 rounded-row px-1 py-2 text-fs-xs font-bold" : "min-h-12 w-full shrink-0 justify-start gap-3 rounded-row px-3 text-fs-sm font-bold", active && "bg-accent/10 text-accent hover:bg-accent/20")}>
        <Icon className="size-5 shrink-0" />
        <span className="text-center leading-snug">{rail ? label.split(" ").map((word, index) => <span key={index} className="block">{word}</span>) : label}</span>
      </Button>
    ));
  };

  return (
    <>
      <div className="flex min-w-0 items-center gap-1">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        <HeaderAction
          label="Discount"
          icon={BadgePercent}
          active={totals.discount > 0}
          onPress={() => setDiscountOpen(true)}
        />
        <HeaderAction
          label={noTax ? "No Tax · On" : "No Tax"}
          icon={Percent}
          active={noTax}
          onPress={() => {
            setNoTax(!noTax);
            toast.success(noTax ? "Tax applied" : "Tax removed from this order");
          }}
        />
        <HeaderAction label="Cancel Order" icon={Trash2} destructive onPress={cancelCurrentOrder} />
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
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      {docked && moreOpen && railHost ? createPortal(
        <div className="no-scrollbar flex h-full flex-col items-center gap-1 overflow-y-auto py-2" aria-label="More order options panel">
          <Button variant="ghost" size="icon" aria-label="Close order options" title="Close order options" onClick={() => onMoreOpenChange(false)} className="size-8 shrink-0"><X className="size-4" /></Button>
          {secondaryActions(true)}
        </div>, railHost,
      ) : null}
      <Sheet open={moreOpen && !docked} onOpenChange={onMoreOpenChange}>
        <SheetContent side="right" className="flex h-dvh w-[min(21rem,88vw)] flex-col bg-surface px-3 py-5">
          <SheetHeader><SheetTitle>Order Options</SheetTitle></SheetHeader>
          <div className="no-scrollbar mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">{secondaryActions(false)}</div>
        </SheetContent>
      </Sheet>

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

      <Sheet open={chargeOpen} onOpenChange={setChargeOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-4 pb-[calc(1rem+var(--kb-inset,0px))]"
        >
          <SheetHeader>
            <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
              Service Charge
            </SheetTitle>
          </SheetHeader>
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            value={charge}
            onChange={(event) => setCharge(event.target.value)}
            placeholder="0.00"
            aria-label="Service charge amount"
            className="mt-3 h-12 w-full rounded-row border border-border bg-surface px-4 text-fs-base font-bold text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            type="button"
            onClick={() => {
              setServiceCharge(Number(charge) || 0);
              setChargeOpen(false);
              toast.success("Service charge updated");
            }}
            className="mt-3 min-h-ctl-lg w-full rounded-pill text-fs-sm font-extrabold uppercase"
          >
            Apply
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={allergyOpen} onOpenChange={setAllergyOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-4 pb-[calc(1rem+var(--kb-inset,0px))]"
        >
          <SheetHeader>
            <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
              Allergy Alert
            </SheetTitle>
          </SheetHeader>
          <input
            autoFocus
            type="text"
            value={allergyDraft}
            onChange={(event) => setAllergyDraft(event.target.value)}
            placeholder="e.g. Severe peanut allergy"
            aria-label="Allergy note"
            className="mt-3 h-12 w-full rounded-row border border-border bg-surface px-4 text-fs-base font-bold text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            type="button"
            onClick={() => {
              const note = allergyDraft.trim();
              setAllergyNote(note);
              setAllergyOpen(false);
              toast.success(note ? "Allergy alert added to the order" : "Allergy alert removed");
            }}
            className="mt-3 min-h-ctl-lg w-full rounded-pill text-fs-sm font-extrabold uppercase"
          >
            Save
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={mergeOpen} onOpenChange={setMergeOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-4 pb-[calc(1rem+var(--kb-inset,0px))]"
        >
          <SheetHeader>
            <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
              Merge Checks
            </SheetTitle>
          </SheetHeader>
          <p className="mt-1 text-center text-fs-xs font-bold text-muted-foreground">
            Move every item from another open check into this order.
          </p>
          <div className="no-scrollbar mt-3 max-h-64 overflow-y-auto">
            {mergeCandidates.length === 0 ? (
              <p className="py-6 text-center text-fs-sm font-bold text-muted-foreground">
                No other open checks to merge
              </p>
            ) : (
              mergeCandidates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    mergeTicket(t.id);
                    setMergeOpen(false);
                    toast.success(`Check #${t.number} merged into this order`);
                  }}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-row bg-muted px-3 py-2 text-left transition-colors hover:bg-secondary"
                >
                  <span className="min-w-0 flex-1 truncate text-fs-sm font-extrabold text-foreground">
                    {t.label} · #{t.number}
                  </span>
                  <span className="shrink-0 text-fs-xs font-bold text-muted-foreground">
                    {t.lines.reduce((n, l) => n + l.qty, 0)} items · {money(t.total)}
                  </span>
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
    </>
  );
}

function HeaderAction({
  label,
  icon: Icon,
  active,
  destructive,
  onPress,
}: {
  label: string;
  icon: typeof Tag;
  active?: boolean;
  destructive?: boolean;
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
        destructive && "text-destructive hover:text-destructive",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </Button>
  );
}

/** Running order area shared by phone, tablet and desktop layouts. */
export function OrderPanel({ wide, ...optionsLayout }: { wide: boolean } & OptionsLayout) {
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

  const showTableChip = orderType === "Dine In" && activeTable;

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
          <CartHeaderActions onDiscount={setDiscountName} {...optionsLayout} />
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
            <p className="text-fs-sm font-bold text-muted-foreground">Let's create an order</p>
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
