import {
  ArrowLeftRight,
  BadgePercent,
  ClipboardList,
  Flame,
  ChevronDown,
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

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import { useLiveTime } from "@/lib/use-live-time";
import { money, type CartLine, type ServiceOrderType } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { ServiceChargeSheet } from "@/components/pos/service-charge-sheet";
import { TransferCheckDialog } from "@/components/pos/transfer-check-dialog";
import { formatPhone, GuestSheet } from "@/components/pos/guest-sheet";
import { OrderTypeStrip } from "@/components/pos/order-type-strip";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AddGuestForm } from "@/components/pos/add-guest-form";
import { GiftCardDialog } from "@/components/pos/gift-card-dialog";

type OptionsLayout = { moreOpen: boolean; onMoreOpenChange: (open: boolean) => void; railHost: HTMLElement | null; docked: boolean; onCustomItem: () => void; customItemOpen: boolean; onEditLine?: (line: CartLine) => void };

function CartHeaderActions({ moreOpen, onMoreOpenChange, railHost, docked, onCustomItem, customItemOpen, onAddGuest }: OptionsLayout & { onAddGuest: () => void }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const {
    cart,
    orderOwner,
    transferCurrentOrder,
    totals,
    orderDiscountPercent,
    noTax,
    setNoTax,
    setOrderDiscountPercent,
    setOrderDiscountName,
    tickets,
    activeTicketId,
    cancelOrder,
    mergeTicket,
    serviceCharge,
    serviceChargePercent,
    serviceChargeName,
    setServiceCharge,
    allergyNote,
    setAllergyNote,
  } = usePos();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyDraft, setAllergyDraft] = useState("");
  const [mergeOpen, setMergeOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

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
    })();
  };

  const secondaryActions = (rail: boolean) => {
    const actions = [
      { label: customItemOpen ? "Menu Item" : "Custom Item", icon: customItemOpen ? Grid2x2 : Tag, run: onCustomItem },
      { label: "Gift Card", icon: Gift, run: () => setGiftOpen(true) },
      { label: "Service Charge", icon: Receipt, active: serviceCharge > 0 || serviceChargePercent > 0, run: () => setChargeOpen(true) },
      { label: "Add Guest", icon: UserPlus, run: onAddGuest },
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
          active={orderDiscountPercent > 0 || totals.discount > 0}
          onPress={() => setDiscountOpen(true)}
        />
        {cart.length > 0 ? <HeaderAction label="Cancel Order" icon={Trash2} destructive onPress={cancelCurrentOrder} /> : null}
        {cart.length > 0 ? <HeaderAction label="Transfer Check" icon={ArrowLeftRight} onPress={() => setTransferOpen(true)} /> : null}
        <HeaderAction
          label={noTax ? "No Tax · On" : "No Tax"}
          icon={Percent}
          active={noTax}
          onPress={() => {
            if (noTax) {
              // Removing the exemption goes straight back to normal taxing.
              setNoTax(false);
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
              setNoTax(true);
              toast.success("Tax removed from this order");
            })();
          }}
        />
        <HeaderAction label="No Sale" icon={Wallet} onPress={() => toast.success("Register opened")} />
        </div>
        <Popover open={moreOpen && !docked} onOpenChange={onMoreOpenChange}>
          <PopoverAnchor asChild>
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
          </PopoverAnchor>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={6}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="no-scrollbar max-h-[min(60vh,26rem)] w-[min(16rem,calc(100vw-1.5rem))] overflow-y-auto rounded-row p-1.5"
          >
            <div className="flex flex-col gap-0.5">{secondaryActions(false)}</div>
          </PopoverContent>
        </Popover>
      </div>

      {docked && moreOpen && railHost ? createPortal(
        <div className="no-scrollbar flex h-full flex-col items-center gap-1 overflow-y-auto py-2" aria-label="More order options panel">
          <Button variant="ghost" size="icon" aria-label="Close order options" title="Close order options" onClick={() => onMoreOpenChange(false)} className="size-8 shrink-0"><X className="size-4" /></Button>
          {secondaryActions(true)}
        </div>, railHost,
      ) : null}
      <GiftCardDialog open={giftOpen} onClose={() => setGiftOpen(false)} />

      <DiscountSheet
        open={discountOpen}
        selected={null}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          setOrderDiscountName(d.name);
          setOrderDiscountPercent(d.percent);
          setDiscountOpen(false);
        }}
      />

      {transferOpen ? <TransferCheckDialog currentOwner={orderOwner} onClose={() => setTransferOpen(false)} onTransfer={(owner) => {
        transferCurrentOrder(owner);
        setTransferOpen(false);
        toast.success(`Check transferred to ${owner}`);
      }} /> : null}

      <ServiceChargeSheet
        open={chargeOpen}
        activeCharge={serviceCharge}
        activePercent={serviceChargePercent}
        activeName={serviceChargeName}
        onClose={() => setChargeOpen(false)}
        onPick={(preset) => {
          setServiceCharge(preset);
          setChargeOpen(false);
          toast.success(
            preset
              ? `${preset.name} service charge applied`
              : "Service charge removed",
          );
        }}
      />

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
export function OrderPanel({
  wide,
  onEditLine,
  dragGrip,
  ...optionsLayout
}: { wide: boolean; dragGrip?: ReactNode } & OptionsLayout) {
  const navigate = useNavigate();
  const liveTime = useLiveTime();
  const {
    guest,
    setGuest,
    arrivedAt,
    activeTable,
    tableGroupLabel,
    orderType,
    setOrderType,
    cart,
    removeLine,
    toggleLineTax,
    totals,
    noTax,
    comped,
    orderNotes,
    setOrderNotes,
    orderOwner,
    activeTicketId,
    currentOrderNumber,
    settings,
    orderDiscountPercent,
    orderDiscountName,
    serviceChargePercent,
    serviceChargeName,
    fireTicket,
  } = usePos();

  const placement = settings.orderTypePlacement;
  const showTypeStrip = placement === "Order screen" || placement === "Both";

  const [guestOpen, setGuestOpen] = useState(false);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [typeForSheet, setTypeForSheet] = useState<ServiceOrderType | undefined>(undefined);
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

  const orderNumber = currentOrderNumber;

  const showTableChip = orderType === "Dine In" && activeTable;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 pb-2 pt-2">
        <div className="flex w-full flex-nowrap items-center gap-x-1 py-1">
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
            className="h-8 min-w-[6.25rem] flex-1 rounded-row border border-transparent bg-transparent px-1 text-fs-sm font-extrabold text-foreground outline-none transition-colors placeholder:text-foreground focus:border-border focus:bg-muted"
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
            className="h-8 min-w-[7.25rem] flex-1 rounded-row border border-transparent bg-transparent px-1 text-fs-xs font-bold text-muted-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-border focus:bg-muted focus:text-foreground"
          />
          <span className="shrink-0 whitespace-nowrap text-[0.6875rem] font-bold text-muted-foreground">
            Arrived at {arrivedAt || liveTime}
          </span>
          {dragGrip ? (
            <span className="shrink-0">{dragGrip}</span>
          ) : null}
        </div>

        <div className="mt-1.5">
          <CartHeaderActions {...optionsLayout} onAddGuest={() => setAddGuestOpen(true)} />
        </div>

        {/* Service type and the table / arrival chip share one scrolling row */}
        {!addGuestOpen && (showTypeStrip || showTableChip) ? (
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
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Order number, notes shortcut and server share one row */}
        {!addGuestOpen ? <div className="mt-1.5 flex items-center justify-between gap-2 text-fs-xs font-bold uppercase text-muted-foreground">
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
            <span className="truncate">{orderOwner}</span>
          </span>
        </div> : null}

        {!addGuestOpen && notesOpen ? (
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
        ) : !addGuestOpen && orderNotes ? (
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


      {addGuestOpen ? <AddGuestForm onClose={() => setAddGuestOpen(false)} /> : <>
      {/* Items: dense receipt rows, the only scrolling area */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(0.5rem+var(--kb-inset,0px))] pt-1.5">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <Utensils className="size-10 text-muted-foreground/50" />
            <p className="text-fs-sm font-bold text-muted-foreground">Let's create an order</p>
          </div>
        ) : (
          <ul>
            {cart.map((l) => (
              <SwipeLine
                key={l.id}
                line={l}
                onCancel={() => removeLine(l.id)}
                onToggleTax={() => toggleLineTax(l.id)}
                onEdit={l.custom || !onEditLine ? undefined : () => onEditLine(l)}
              />
            ))}
          </ul>
        )}

      </div>

      {/* Footer: totals and Save / Fire / Charge. Hidden only when the cart is
          empty AND no discount or service charge is applied. */}
      {cart.length > 0 || totals.discount > 0 || totals.serviceCharge > 0 || orderDiscountPercent > 0 || serviceChargePercent > 0 ? (
      <div
        className={cn(
          "shrink-0 border-t border-border bg-surface px-3 pt-1.5",
          wide
            ? "pb-[calc(0.5rem+var(--kb-inset,0px))]"
            : "pb-[calc(0.5rem+var(--kb-inset,0px)+var(--tabs-h,0px))]",
        )}
      >
        <dl className="text-fs-xs">
          <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground">
            <dt>Sub Total</dt>
            <dd className="tabular-nums">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground">
            <dt>{brand.taxLabel}{noTax ? " (exempt)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.tax)}</dd>
          </div>
          {orderDiscountPercent > 0 || totals.discount > 0 ? (
            <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground">
              <dt>Discount{orderDiscountName ? ` · ${orderDiscountName}` : ""}</dt>
              <dd className="tabular-nums">-{money(totals.discount)}</dd>
            </div>
          ) : null}
          {serviceChargePercent > 0 || totals.serviceCharge > 0 ? (
            <div className="flex items-center justify-between py-0.5 font-bold text-muted-foreground">
              <dt>Service Charge{serviceChargeName ? ` · ${serviceChargeName}` : ""}</dt>
              <dd className="tabular-nums">{money(totals.serviceCharge)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-0.5 text-fs-lg font-extrabold text-foreground">
            <dt>Total{comped ? " (comped)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.total)}</dd>
          </div>
        </dl>

        <div className="mt-1 grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2">
          <button
            type="button"
            disabled={!totals.count}
            aria-label="Save order"
            title="Save order"
            onClick={() => {
              if (!totals.count) return;
              toast.success("Order saved");
            }}
            className="grid min-h-ctl-sm w-12 shrink-0 place-items-center rounded-row bg-muted text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <Save className="size-4.5" />
          </button>
          <button
            type="button"
            disabled={!totals.count}
            onClick={() => {
              fireTicket();
              toast.success("Order fired to the kitchen");
            }}
            className="flex min-h-ctl-sm shrink-0 items-center justify-center gap-1.5 rounded-row bg-tile-orange px-3 text-fs-sm font-extrabold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Flame className="size-4 shrink-0" />
            Fire
          </button>
          <button
            type="button"
            disabled={!totals.count}
            onClick={() => navigate({ to: "/payment/method" })}
            className="min-h-ctl-sm min-w-0 truncate rounded-row bg-accent px-3 text-fs-sm font-extrabold uppercase text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40"
          >
            Charge {money(totals.total)}
          </button>
        </div>
      </div>
      ) : null}
      </>}
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

/** Receipt row: swipe left reveals Cancel, swipe right reveals No VAT. */
function SwipeLine({ line: l, onCancel, onToggleTax, onEdit }: { line: CartLine; onCancel: () => void; onToggleTax: () => void; onEdit?: (() => void) | undefined }) {
  const ACTION = 88;
  const [open, setOpen] = useState(false);
  const [x, setX] = useState(0);
  const [start, setStart] = useState<{ px: number; py: number; base: number; moved: boolean } | null>(null);
  const settle = (v: number) => setX(v <= -ACTION / 2 ? -ACTION : v >= ACTION / 2 ? ACTION : 0);
  return (
    <li className="relative overflow-hidden py-0">
      <button
        type="button"
        onClick={() => { setX(0); onToggleTax(); }}
        aria-label={l.taxExempt ? `Add ${brand.taxLabel} to ${l.name}` : `No ${brand.taxLabel} for ${l.name}`}
        tabIndex={x > 0 ? 0 : -1}
        className="absolute inset-y-0 left-0 grid place-items-center bg-foreground px-2 text-fs-xs font-bold text-background"
        style={{ width: ACTION }}
      >
        {l.taxExempt ? `Add ${brand.taxLabel}` : `No ${brand.taxLabel}`}
      </button>
      <button
        type="button"
        onClick={() => { setX(0); onCancel(); }}
        aria-label={`Cancel ${l.name}`}
        tabIndex={x < 0 ? 0 : -1}
        className="absolute inset-y-0 right-0 grid place-items-center bg-destructive px-2 text-fs-xs font-bold uppercase text-destructive-foreground"
        style={{ width: ACTION }}
      >
        Cancel
      </button>
      <div
        className={cn("relative flex touch-pan-y items-start gap-1.5 bg-surface py-1 pr-0.5", !start && "transition-transform")}
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={(e) => setStart({ px: e.clientX, py: e.clientY, base: x, moved: false })}
        onPointerMove={(e) => {
          if (!start) return;
          const dx = e.clientX - start.px;
          if (!start.moved) {
            if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - start.py)) return;
            setStart({ ...start, moved: true });
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }
          setX(Math.max(-ACTION, Math.min(ACTION, start.base + dx)));
        }}
        onPointerUp={() => { if (start?.moved) settle(x); setStart(null); }}
        onPointerCancel={() => { settle(x); setStart(null); }}
        onClickCapture={(e) => { if (x !== 0) { e.stopPropagation(); e.preventDefault(); setX(0); } }}
      >
        <span className="shrink-0 pt-0.5 text-fs-xs font-extrabold tabular-nums text-foreground">{l.qty}</span>
        <button
          type="button"
          disabled={!onEdit}
          onClick={onEdit}
          aria-label={onEdit ? `Edit ${l.name}` : undefined}
          className="min-w-0 flex-1 rounded-md text-left enabled:hover:bg-muted/60 disabled:cursor-default"
        >
          <div className="flex min-h-6 items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-fs-sm font-bold leading-snug text-foreground">{l.name}</span>
            <span className="flex shrink-0 items-baseline gap-1.5 text-fs-sm font-bold tabular-nums text-foreground">
              {l.discountPercent ? <s className="text-fs-xs text-muted-foreground">{money(l.price * l.qty)}</s> : null}
              {money(l.price * l.qty * (1 - (l.discountPercent ?? 0) / 100))}
            </span>
          </div>
          {l.taxExempt ? <p className="text-fs-xs font-bold leading-snug text-muted-foreground">No {brand.taxLabel} added</p> : null}
          {l.modifiers?.length && !open ? (
            <p className="truncate text-fs-xs font-bold leading-snug text-tile-blue">{l.modifiers.join(" · ")}</p>
          ) : null}
          {l.modifiers?.length && open ? (
            <ul className="mt-0.5 border-l border-border pl-2">
              {l.modifiers.map((m, i) => <li key={i} className="text-fs-xs font-bold leading-snug text-tile-blue">· {m}</li>)}
            </ul>
          ) : null}
          {l.notes ? <p className="truncate text-fs-xs italic leading-snug text-muted-foreground">{l.notes}</p> : null}
        </button>
        {l.modifiers?.length ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} modifiers for ${l.name}`}
            className="grid size-6 shrink-0 place-items-center rounded-pill text-muted-foreground hover:bg-muted"
          >
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </button>
        ) : null}
      </div>
    </li>
  );
}
