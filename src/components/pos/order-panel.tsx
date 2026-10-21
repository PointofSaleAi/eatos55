import {
  Armchair,
  ArrowLeftRight,
  BadgePercent,
  ClipboardList,
  Flame,
  GitMerge,
  Gift,
  Grid2x2,
  Info,
  NotebookPen,
  MoreHorizontal,
  X,
  Percent,
  Receipt,
  RotateCcw,
  Save,
  Share2,
  Tag,
  Trash2,
  TriangleAlert,
  Utensils,
  UserPlus,
  Wallet,
} from "lucide-react";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import { useLiveTime } from "@/lib/use-live-time";
import { addOnGroups, money, type CartLine, type ServiceOrderType } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { ServiceChargeSheet } from "@/components/pos/service-charge-sheet";
import { TransferCheckDialog } from "@/components/pos/transfer-check-dialog";
import { formatPhone, GuestSheet } from "@/components/pos/guest-sheet";
import { OrderTypeStrip } from "@/components/pos/order-type-strip";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

export function HeaderAction({
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
            placeholder="Guest Name"
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

        {/* Service type strip; the table number now sits with the order number */}
        {!addGuestOpen && showTypeStrip ? (
          <div className="mt-2 flex items-center gap-2">
            <OrderTypeStrip
              className="min-w-0 flex-1"
              value={orderType}
              onSelect={(t) => {
                setOrderType(t);
                setTypeForSheet(t);
                setGuestOpen(true);
              }}
            />
          </div>
        ) : null}

        {/* Seat picker for table orders: new items are assigned to the chosen seat */}
        {!addGuestOpen && showTableChip ? <SeatPicker /> : null}

        {/* Order number on the left, table centred, server name then notes on the right */}
        {!addGuestOpen ? (
          <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-2 text-fs-xs font-bold uppercase text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0">Order# {orderNumber ?? "--"}</span>
            </span>
            {showTableChip ? (
              <span className="flex min-w-0 items-center justify-center gap-1 text-foreground">
                <Grid2x2 className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{tableGroupLabel(activeTable) ?? activeTable}</span>
              </span>
            ) : (
              <span aria-hidden />
            )}
            <span className="flex min-w-0 items-center justify-end gap-2">
              <span className="min-w-0 truncate text-foreground">{orderOwner}</span>
              <button
                type="button"
                onClick={() => setNotesOpen(true)}
                aria-label="Order notes"
                title="Order notes"
                className="grid size-7 shrink-0 place-items-center rounded-pill bg-muted text-muted-foreground transition-colors hover:bg-secondary"
              >
                <NotebookPen className="size-3.5" />
              </button>
            </span>
          </div>
        ) : null}

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
          <div className="flex items-center justify-between py-0 font-bold text-muted-foreground">
            <dt>Sub Total</dt>
            <dd className="tabular-nums">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between py-0 font-bold text-muted-foreground">
            <dt>{brand.taxLabel}{noTax ? " (exempt)" : ""}</dt>
            <dd className="tabular-nums">{money(totals.tax)}</dd>
          </div>
          {orderDiscountPercent > 0 || totals.discount > 0 ? (
            <div className="flex items-center justify-between py-0 font-bold text-muted-foreground">
              <dt>Discount{orderDiscountName ? ` · ${orderDiscountName}` : ""}</dt>
              <dd className="tabular-nums">-{money(totals.discount)}</dd>
            </div>
          ) : null}
          {serviceChargePercent > 0 || totals.serviceCharge > 0 ? (
            <div className="flex items-center justify-between py-0 font-bold text-muted-foreground">
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

/** Add-on groups are the ones that show up as orange "+" extras. */
const ADD_ON_GROUPS = new Set(addOnGroups.map((g) => g.name));

/**
 * Per-line styling follows the reference: add-ons are orange "+", removals red
 * "−", allergies amber "−", and plain choices blue "•". The mark and the colour
 * both carry the kind.
 */
function modifierStyle(raw: string) {
  const at = raw.indexOf(" · ");
  const group = at === -1 ? "" : raw.slice(0, at);
  const name = at === -1 ? raw : raw.slice(at + 3);
  if (ADD_ON_GROUPS.has(group)) return { color: "text-mod-extra", mark: "+", name };
  if (/allerg/i.test(name)) return { color: "text-mod-alert", mark: "−", name };
  if (/^no\b/i.test(name)) return { color: "text-mod-remove", mark: "−", name };
  return { color: "text-mod-option", mark: "•", name };
}

/** Course chips carry the course name above the item, one colour per course. */
function courseChipClass(name: string) {
  const n = name.toLowerCase();
  if (n.startsWith("dessert")) return "bg-tile-pink";
  if (n.startsWith("appetizer") || n.startsWith("starter")) return "bg-tile-green";
  if (n.startsWith("main")) return "bg-tile-blue";
  if (n.startsWith("hold")) return "bg-tile-slate";
  return "bg-tile-violet";
}

/** Receipt row: swipe left reveals Cancel, swipe right reveals No VAT. */
function SwipeLine({ line: l, onCancel, onToggleTax, onEdit }: { line: CartLine; onCancel: () => void; onToggleTax: () => void; onEdit?: (() => void) | undefined }) {
  const ACTION = 88;
  // The chosen course leaves the modifier list and becomes the coloured chip
  // above the item name instead.
  const course = l.modifiers?.find((m) => m.startsWith("Course · "))?.slice("Course · ".length);
  const otherMods = course ? l.modifiers?.filter((m) => !m.startsWith("Course · ")) : l.modifiers;
  // Course and seat only mean something on a table order (Dine In with a table).
  const { orderType, activeTable } = usePos();
  const isTableOrder = orderType === "Dine In" && Boolean(activeTable);

  const [x, setX] = useState(0);
  // Drag state lives in refs: pointerup can fire before the last pointermove's
  // state commits, and settling from a stale `x` snapped the row shut — which
  // made the revealed Cancel / No VAT buttons impossible to press.
  const xRef = useRef(0);
  const startRef = useRef<{ px: number; py: number; base: number; moved: boolean } | null>(null);
  // Set when a drag ends: the click the release leaves behind must be swallowed,
  // not treated as a tap that closes the row.
  const draggedRef = useRef(false);
  const moveTo = (v: number) => { xRef.current = v; setX(v); };
  const settle = () => {
    const v = xRef.current;
    moveTo(v <= -ACTION / 2 ? -ACTION : v >= ACTION / 2 ? ACTION : 0);
  };
  return (
    <li className="relative py-0">
      <div className="relative overflow-hidden">
      <button
        type="button"
        onClick={() => { moveTo(0); onToggleTax(); }}
        aria-label={l.taxExempt ? `Add ${brand.taxLabel} to ${l.name}` : `No ${brand.taxLabel} for ${l.name}`}
        tabIndex={x > 0 ? 0 : -1}
        className="absolute inset-y-0 left-0 grid place-items-center bg-foreground px-2 text-fs-xs font-bold text-background"
        style={{ width: ACTION }}
      >
        {l.taxExempt ? `Add ${brand.taxLabel}` : `No ${brand.taxLabel}`}
      </button>
      <button
        type="button"
        onClick={() => { moveTo(0); onCancel(); }}
        aria-label={`Cancel ${l.name}`}
        tabIndex={x < 0 ? 0 : -1}
        className="absolute inset-y-0 right-0 grid place-items-center bg-destructive px-2 text-fs-xs font-bold uppercase text-destructive-foreground"
        style={{ width: ACTION }}
      >
        Cancel
      </button>
      <div
        className="relative touch-pan-y bg-surface py-1 pr-0.5"

        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          startRef.current = { px: e.clientX, py: e.clientY, base: xRef.current, moved: false };
        }}
        onPointerMove={(e) => {
          const s = startRef.current;
          if (!s) return;
          const dx = e.clientX - s.px;
          if (!s.moved) {
            if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - s.py)) return;
            s.moved = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }
          moveTo(Math.max(-ACTION, Math.min(ACTION, s.base + dx)));
        }}
        onPointerUp={() => {
          if (startRef.current?.moved) { draggedRef.current = true; settle(); }
          startRef.current = null;
        }}
        onPointerCancel={() => { settle(); startRef.current = null; }}
        onClickCapture={(e) => {
          if (draggedRef.current) { draggedRef.current = false; e.stopPropagation(); e.preventDefault(); return; }
          if (xRef.current !== 0) { e.stopPropagation(); e.preventDefault(); moveTo(0); }
        }}
      >
        {isTableOrder ? (
          <span
            className={cn(
              "mb-0.5 inline-block max-w-full truncate rounded-md px-2 py-0.5 text-[0.65rem] font-bold leading-tight text-white",
              course ? courseChipClass(course) : "bg-tile-slate",
            )}
          >
            {course ?? "No Course"}
          </span>
        ) : null}
        <div
          className={cn("flex items-start gap-1.5", !startRef.current && "transition-transform")}
          style={{ transform: `translateX(${x}px)` }}
        >
        <span className="shrink-0 pt-0.5 text-fs-xs font-extrabold tabular-nums text-foreground">{l.qty}</span>
          <div className="min-w-0 flex-1">

            <button
              type="button"
              disabled={!onEdit}
              onClick={onEdit}
              aria-label={onEdit ? `Edit ${l.name}` : undefined}
              className="w-full min-w-0 rounded-md text-left enabled:hover:bg-muted/60 disabled:cursor-default"
            >
              <div className="flex min-h-6 items-center gap-2">
                <span className="min-w-0 flex-1 text-fs-sm font-bold leading-snug text-foreground">{l.name}</span>
                <span className="flex shrink-0 items-baseline gap-1.5 text-fs-sm font-bold tabular-nums text-foreground">
                  {l.discountPercent ? <s className="text-fs-xs text-muted-foreground">{money(l.price * l.qty)}</s> : null}
                  {money(l.price * l.qty * (1 - (l.discountPercent ?? 0) / 100))}
                </span>
              </div>
            </button>
          </div>
        </div>
        </div>
      </div>

      {l.taxExempt ? (
        <p className="flex items-center gap-1 text-fs-xs font-bold leading-snug text-muted-foreground">
          No {brand.taxLabel} added
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Why is there no tax on this item?"
                className="grid size-4 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60"
              >
                <Info className="size-3.5" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" sideOffset={10} align="start" className="w-60 max-w-[calc(100vw-2rem)] rounded-lg p-3">
              <p className="text-fs-xs font-normal leading-snug text-popover-foreground">No tax added on this product</p>
            </PopoverContent>
          </Popover>
        </p>
      ) : null}
          {otherMods?.length ? (
            <ul className="mt-0.5 ml-0.5 border-l border-border pl-2">
              {otherMods.map((m, i) => {
                const { color, mark, name } = modifierStyle(m);
                return (
                  <li key={i} className={cn("mod-line relative flex items-start gap-1 py-px font-normal leading-snug", color)}>
                    <span aria-hidden className="absolute left-0 top-1/2 h-px w-1.5 -translate-x-full bg-border" />
                    <span aria-hidden className="shrink-0 tabular-nums">{mark}</span>
                    <span className="min-w-0">{name}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {l.notes ? <p className="truncate text-fs-xs italic leading-snug text-muted-foreground">{l.notes}</p> : null}
          {isTableOrder ? (
            <p className="mt-0.5 flex items-center gap-1 text-fs-xs font-bold leading-snug text-muted-foreground">
              <Armchair className="size-3.5" aria-hidden />
              <span
                title={l.seat ? `Seat ${l.seat}` : "This order is for all seats"}
                className="rounded-sm bg-foreground px-1.5 py-0.5 text-[0.625rem] font-extrabold tabular-nums text-background"
              >
                {l.seat ?? "All"}
              </span>
            </p>
          ) : null}

    </li>
  );
}

/** Seat selector for table orders: ALL or one seat per guest; new items take the picked seat. */
function SeatPicker() {
  const { activeTable, tableSeated, guest, activeSeat, setActiveSeat } = usePos();
  const seats = Math.max(guest.partySize, activeTable ? (tableSeated[activeTable] ?? 0) : 0, 1);
  const seatButton = (n: number | null, label: string) => (
    <button
      key={label}
      type="button"
      onClick={() => setActiveSeat(n)}
      aria-pressed={activeSeat === n}
      aria-label={n === null ? "Assign items to all seats" : `Assign items to seat ${n}`}
      className={cn(
        "grid h-8 min-w-8 shrink-0 place-items-center rounded-row border px-2 text-fs-xs font-extrabold tabular-nums transition-colors",
        activeSeat === n
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-surface text-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="no-scrollbar mt-1.5 flex items-center gap-1.5 overflow-x-auto">
      <Armchair className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      {seatButton(null, "ALL")}
      <button
        type="button"
        onClick={() => toast.info("Split by seat is not configured for this location")}
        aria-label="Split by seat"
        title="Split by seat"
        className="grid size-8 shrink-0 place-items-center rounded-row border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted"
      >
        <Share2 className="size-3.5" />
      </button>
      {Array.from({ length: seats }, (_, i) => seatButton(i + 1, String(i + 1)))}
    </div>
  );
}
