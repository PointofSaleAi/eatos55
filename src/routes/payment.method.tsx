import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand, isTenderVisible, tenderLabel } from "@/lib/brand";
import {
  BadgeDollarSign,
  Banknote,
  BedDouble,
  Bike,
  Building2,
  CalendarClock,
  CreditCard,
  Link2,
  Nfc,
  QrCode,
  Receipt,
  Smartphone,
  Ticket,
  UserCog,
  Gift,
  HandHeart,
  Heart,
  Landmark,
  Split,
  SquareUser,
  UploadCloud,
  Utensils,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AmountEntry } from "@/components/pos/amount-entry";
import { PaymentCompleteDialog } from "@/components/pos/payment-complete-dialog";
import { useAnnounce } from "@/components/pos/live-region";
import { PinSheet } from "@/components/pos/pin-sheet";
import { ReceiptCard, ReceiptRow } from "@/components/pos/receipt";
import { ReferenceTenderDialog } from "@/components/pos/reference-tender-dialog";
import { RoomChargeDialog } from "@/components/pos/room-charge-dialog";
import { TTP, TapToPayMark } from "@/components/pos/tap-to-pay";
import { TTP_DEVICE_NOTE, useTapToPayAvailable } from "@/lib/device";
import { BackButton } from "@/components/pos/shell";
import { SplitPayments } from "@/components/pos/split-payments";
import { X } from "lucide-react";

import { haptic } from "@/lib/haptics";
import { TAX_RATE, money } from "@/lib/demo-data";
import type { Room } from "@/lib/floor-data";
import { usePos, type TenderId, type TenderMethod } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payment/method")({
  head: () => ({
    meta: [
      { title: `Select Payment Method - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content:
          "Review the check and choose cash, card, split check, room charge, gift card, loyalty or a delivery partner.",
      },
      { property: "og:title", content: `Select Payment Method - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content:
          "Review the check and choose cash, card, split check, room charge or a delivery partner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  // On a phone the bill is step 1; ?methods=1 means the guest pressed Continue.
  validateSearch: (search: Record<string, unknown>): { methods?: 1 } =>
    search["methods"] === 1 || search["methods"] === "1" ? { methods: 1 } : {},
  component: PaymentMethod,
});

type Tender = {
  id: string;
  label: string;
  icon: typeof CreditCard;
  /** Surfaces that open their own step instead of charging straight away. */
  kind?: "room" | "split" | "route" | "dialog";
  /** Shown under the label when the tender is unavailable. */
  note?: string;
  unavailable?: boolean;
  run: () => void;
};

type RefConfig = {
  title: string;
  hint: string;
  inputLabel: string;
  placeholder?: string;
  numeric?: boolean;
  reasons?: string[];
  confirmLabel?: string;
  method: TenderMethod;
  success: (value: string) => string;
  /** In-kind needs a manager PIN before it is recorded. */
  needsPin?: boolean;
};

function PaymentMethod() {
  const navigate = useNavigate();
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
    addPartialPayment,
    removePartialPayment,
    settings,
    commitPayment,
  } = usePos();
  const announce = useAnnounce();
  const ttpDevice = useTapToPayAvailable();
  const wide = useWideLayout();
  const { methods } = Route.useSearch();
  // Phones split this into two steps: the bill, then the payment options.
  const showBill = wide;
  useEffect(() => {
    if (!wide && methods !== 1) void navigate({ to: "/payment/bill", replace: true });
  }, [wide, methods, navigate]);
  const ttpEnabled = (settings.tenders?.["tap-to-pay"] ?? true) && ttpDevice.available;
  const orderNumber = tickets.length + 1;
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);
  const nothingToPay = cart.length === 0;

  const [selected, setSelected] = useState<string | null>(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  const [room, setRoom] = useState<Room | null>(null);
  const [refConfig, setRefConfig] = useState<RefConfig | null>(null);
  const [pinFor, setPinFor] = useState<{ cfg: RefConfig; value: string } | null>(null);
  const [amountFor, setAmountFor] = useState<{
    label: string;
    method: TenderMethod;
    denominations?: boolean;
  } | null>(null);

  /** Same screen for every tender: part payments stack up until the check clears. */
  const takeAmount = (amount: number, notes?: Record<number, number>) => {
    const cfg = amountFor;
    if (!cfg) return;
    setAmountFor(null);
    if (amount < due) {
      haptic("medium");
      addPartialPayment(amount, cfg.method, cfg.label);
      announce("Partial payment applied");
      toast.success(`${cfg.label} ${money(amount)} applied · ${money(due - amount)} remaining`);
      return;
    }
    haptic("success");
    commitPayment(cfg.method, amount, {
      label: cfg.label,
      ...(selected ? { tenderId: selected as TenderId } : {}),
      ...(notes ? { notes } : {}),
    });
    announce("Payment complete");
    toast.success(`Paid in full with ${cfg.label}`);
    setDoneOpen(true);
  };

  const openAmount = (label: string, method: TenderMethod, denominations = false) =>
    setAmountFor({ label, method, denominations });

  const finish = (cfg: RefConfig, value: string) => {
    haptic("success");
    commitPayment(cfg.method, due, {
      label: cfg.title,
      ...(selected ? { tenderId: selected as TenderId } : {}),
    });
    announce("Payment complete");
    toast.success(cfg.success(value));
    setDoneOpen(true);
  };

  const openRef = (cfg: RefConfig) => setRefConfig(cfg);

  const delivery = (brand: string): RefConfig => ({
    title: `${brand} charge`,
    hint: `Enter the ${brand} order or reference number printed on the delivery ticket.`,
    inputLabel: "Reference number",
    placeholder: "e.g. 4429 8817",
    numeric: true,
    method: "other",
    success: (v) => `${brand} charge recorded · ref ${v}`,
  });

  const allGroups: { title: string; items: Tender[] }[] = [
    {
      title: "Standard",
      items: [
        {
          id: "cash",
          label: "Cash",
          icon: Wallet,
          kind: "dialog",
          run: () => openAmount("Cash", "cash", true),
        },
        {
          id: "card-present",
          label: "Chip and PIN",
          icon: CreditCard,
          kind: "dialog",
          run: () => openAmount("Chip and PIN", "card"),
        },
        {
          id: "contactless",
          label: "Contactless",
          icon: Nfc,
          kind: "dialog",
          run: () => openAmount("Contactless", "card"),
        },
        {
          id: "amex",
          label: "Amex",
          icon: CreditCard,
          kind: "dialog",
          run: () => openAmount("Amex", "card"),
        },
        {
          id: "manual-card",
          label: "Manual Card",
          icon: CreditCard,
          kind: "dialog",
          run: () => openAmount("Manual Card", "card"),
        },
        {
          id: "manual-cc",
          label: "Manual CC",
          icon: BadgeDollarSign,
          kind: "dialog",
          run: () => openAmount("Manual CC", "card"),
        },
        {
          id: "external",
          label: "External CC",
          icon: UploadCloud,
          kind: "dialog",
          run: () => openAmount("External CC", "other"),
        },
        {
          id: "split",
          label: "Split Check",
          icon: Split,
          kind: "split",
          run: () => setSplitOpen(true),
        },

      ],
    },
    {
      title: "Wallets",
      items: [
        {
          id: "apple-pay",
          label: "Apple Pay",
          icon: Smartphone,
          kind: "dialog",
          run: () => openAmount("Apple Pay", "card"),
        },
        {
          id: "google-pay",
          label: "Google Pay",
          icon: Smartphone,
          kind: "dialog",
          run: () => openAmount("Google Pay", "card"),
        },
      ],
    },
    {
      title: "Remote and alternative",
      items: [
        {
          id: "pay-by-link",
          label: "Pay by Link",
          icon: Link2,
          kind: "dialog",
          run: () =>
            openRef({
              title: "Pay by Link",
              hint: "Send a secure payment link to the guest by email or SMS.",
              inputLabel: "Email or mobile number",
              placeholder: "e.g. 07700 900123",
              numeric: false,
              method: "other",
              success: (v) => `Payment link sent to ${v}`,
            }),
        },
        {
          id: "qr",
          label: "Scan to Pay",
          icon: QrCode,
          kind: "dialog",
          run: () => openAmount("Scan to Pay", "qr"),
        },
        {
          id: "open-banking",
          label: "Pay by Bank",
          icon: Building2,
          kind: "dialog",
          run: () => openAmount("Pay by Bank", "other"),
        },
        {
          id: "bank-transfer",
          label: "Bank Transfer",
          icon: Landmark,
          kind: "dialog",
          run: () =>
            openRef({
              title: "Bank transfer",
              hint: "Record the payment reference once the transfer lands.",
              inputLabel: "Payment reference",
              placeholder: "e.g. FT2608251",
              numeric: false,
              method: "other",
              success: (v) => `Bank transfer recorded · ref ${v}`,
            }),
        },
        {
          id: "paypal",
          label: "PayPal",
          icon: Wallet,
          kind: "dialog",
          run: () => openAmount("PayPal", "other"),
        },
        {
          id: "klarna",
          label: "Klarna",
          icon: CalendarClock,
          kind: "dialog",
          run: () => openAmount("Klarna", "other"),
        },
      ],
    },
    {
      title: "Cash-like and vouchers",
      items: [
        {
          id: "cheque",
          label: "Cheque",
          icon: Receipt,
          kind: "dialog",
          run: () =>
            openRef({
              title: "Cheque",
              hint: "Key the cheque number written on the slip.",
              inputLabel: "Cheque number",
              placeholder: "e.g. 004128",
              numeric: true,
              method: "other",
              success: (v) => `Cheque ${v} recorded`,
            }),
        },
        {
          id: "voucher",
          label: "Voucher",
          icon: Ticket,
          kind: "dialog",
          run: () =>
            openRef({
              title: "Voucher",
              hint: "Scan or key the voucher code.",
              inputLabel: "Voucher code",
              placeholder: "e.g. EAT-2026-UK",
              numeric: false,
              method: "gift",
              success: (v) => `Voucher ${v} applied`,
            }),
        },
        {
          id: "round-up",
          label: "Donation Round-up",
          icon: Banknote,
          kind: "dialog",
          run: () => openAmount("Donation Round-up", "other"),
        },
      ],
    },
    {
      title: "Accounts and rewards",
      items: [
        {
          id: "account",
          label: "Account",
          icon: SquareUser,
          kind: "dialog",
          run: () => openAmount("Account", "house"),
        },
        {
          id: "house",
          label: "House",
          icon: Landmark,
          kind: "dialog",
          run: () => openAmount("House Account", "house"),
        },
        {
          id: "gift",
          label: "Gift Card",
          icon: Gift,
          kind: "dialog",
          run: () => openAmount("Gift Card", "gift"),
        },
        {
          id: "loyalty",
          label: "Loyalty",
          icon: Heart,
          kind: "dialog",
          run: () =>
            openRef({
              title: "Loyalty lookup",
              hint: "Scan the guest loyalty card, or key the card number or phone number.",
              inputLabel: "Card or phone number",
              placeholder: "e.g. 415 555 0132",
              numeric: true,
              method: "loyalty",
              success: (v) => `Loyalty account ${v} charged`,
            }),
        },
        {
          id: "in-kind",
          label: "In-kind",
          icon: HandHeart,
          kind: "dialog",
          note: "Manager PIN",
          run: () =>
            openRef({
              title: "In-kind tender",
              hint: "Pick a reason, then confirm with a manager PIN.",
              inputLabel: "Reason",
              placeholder: "Reason for in-kind tender",
              numeric: false,
              reasons: ["Staff meal", "Owner comp", "Marketing", "Charity", "Service recovery"],
              confirmLabel: "Continue to manager PIN",
              method: "other",
              needsPin: true,
              success: (v) => `In-kind tender recorded · ${v}`,
            }),
        },
        {
          id: "staff",
          label: "Staff Charge",
          icon: UserCog,
          kind: "dialog",
          run: () => openAmount("Staff Charge", "house"),
        },
      ],
    },
    {
      title: "Lodging",
      items: [
        {
          id: "room",
          label: "Room Charge",
          icon: BedDouble,
          kind: "room" as const,
          run: () => setRoomOpen(true),
        },
      ],
    },
    {
      title: "Delivery partners",
      items: [
        {
          id: "deliveroo",
          label: "Deliveroo",
          icon: Bike,
          kind: "dialog",
          run: () => openRef(delivery("Deliveroo")),
        },
        {
          id: "just-eat",
          label: "Just Eat",
          icon: Utensils,
          kind: "dialog",
          run: () => openRef(delivery("Just Eat")),
        },
        {
          id: "uber",
          label: "Uber Eats",
          icon: Bike,
          kind: "dialog",
          run: () => openRef(delivery("Uber Eats")),
        },
        {
          id: "doordash",
          label: "Doordash",
          icon: Bike,
          kind: "dialog",
          run: () => openRef(delivery("Doordash")),
        },
        {
          id: "grubhub",
          label: "Grubhub",
          icon: Utensils,
          kind: "dialog",
          run: () => openRef(delivery("Grub Hub")),
        },
      ],
    },
  ];

  // Only enabled tenders are offered; Room Charge also needs the room module.
  const enabled = (id: string) => {
    const on = settings.tenders?.[id as TenderId] ?? true;
    if (id === "room") return on && settings.roomService;
    // Region visibility comes from the build variant, enablement from Settings.
    return on && isTenderVisible(id);
  };
  const groups = allGroups
    .map((g) => ({
      title: g.title,
      items: g.items
        .filter((t) => enabled(t.id))
        // Shared tenders carry a regional display name, e.g. Grubhub as Just Eat.
        .map((t) => ({ ...t, label: tenderLabel(t.id, t.label) })),
    }))
    .filter((g) => g.items.length > 0);

  // All tenders live on one screen: measure the pane, then choose the column
  // count and tile height that make the full set fit without scrolling.
  const paneRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [metrics, setMetrics] = useState({ tileMin: 152, tileH: 52, gap: 8, tap: 44 });
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const readMetrics = () => {
      const cs = getComputedStyle(el);
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // Tokens resolve to rem or px depending on the tier, so normalise to px.
      const px = (name: string, fallback: number) => {
        const raw = cs.getPropertyValue(name).trim();
        const v = parseFloat(raw);
        if (!Number.isFinite(v) || v <= 0) return fallback;
        return raw.endsWith("rem") ? v * rootPx : v;
      };
      setMetrics({
        tileMin: px("--tender-min", 152),
        tileH: px("--tender-h", 52),
        gap: px("--gap-sec", 8),
        tap: px("--tap", 44),
      });
    };

    readMetrics();
    const ro = new ResizeObserver(([entry]) => {
      const r = entry?.contentRect;
      if (r) setBox({ w: r.width, h: r.height });
      readMetrics();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const HEAD = 22;
  const fit = useMemo(() => {
    const gap = metrics.gap;
    const minTile = Math.min(metrics.tileMin, 140);
    const maxCols = Math.max(2, Math.min(6, Math.floor((box.w + gap) / (minTile + gap)) || 2));
    const height = box.h || 0;
    const floor = Math.max(42, Math.min(metrics.tap, metrics.tileH));
    const rowsFor = (cols: number) =>
      groups.reduce((sum, g) => sum + Math.ceil(g.items.length / cols), 0);
    const chromeFor = (cols: number) =>
      groups.length * HEAD + (rowsFor(cols) - groups.length) * gap + (groups.length - 1) * gap;

    // Prefer the fewest columns (biggest tiles) that still fit the pane height.
    for (let cols = 2; cols <= maxCols; cols += 1) {
      const rows = rowsFor(cols);
      if (!height) break;
      const avail = height - chromeFor(cols);
      const h = avail / Math.max(1, rows);
      if (h >= floor) {
        return {
          cols,
          tileH: Math.min(Math.max(h, floor), metrics.tileH * 1.6),
          rows,
          fits: true,
        };
      }
    }
    const cols = maxCols;
    const rows = rowsFor(cols);
    const need = rows * floor + chromeFor(cols);
    return { cols, tileH: floor, rows, fits: !height || need <= height };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    box.w,
    box.h,
    metrics.tileMin,
    metrics.tileH,
    metrics.gap,
    metrics.tap,
    JSON.stringify(groups.map((g) => [g.title, g.items.length])),
  ]);

  const cols = fit.cols;



  const allTenders = groups.flatMap((g) => g.items);
  const activeTender = allTenders.find((t) => t.id === selected) ?? null;
  const actionLabel = room
    ? `Room charge posted · ${room.number}`
    : activeTender && !activeTender.unavailable
      ? activeTender.kind === "split"
        ? "Split this check"
        : `Charge ${money(due)}`
      : "Select a payment method";

  const receipt = (
    <div className="min-h-0 flex-1 overflow-y-auto px-[var(--pad-screen)] py-3">
      <PaymentBill room={room} />
    </div>
  );


  const grid = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-[var(--pad-screen)] pt-3">
        <h2 className="truncate text-fs-lg font-extrabold text-foreground">Payment Method</h2>

        {/*
         * Requirements 2.1 to 2.5: this button is always here, always first,
         * always above the fold, always with the exact same label, whether or
         * not this iPhone has been set up yet. If it has not, it starts setup
         * and the ticket is kept.
         */}
        {ttpEnabled ? (
          <button
            type="button"
            onClick={() => {
              if (settings.tapToPayState === "ready") {
                setSelected("tap-to-pay");
                navigate({ to: "/payment/tap-to-pay" });
                return;
              }
              navigate({ to: "/tap-to-pay/setup/$from", params: { from: "checkout" } });
            }}
            className="mt-3 flex h-ctl-lg w-full items-center justify-center gap-2 rounded-row bg-primary px-3 text-fs-base font-extrabold text-primary-foreground transition-colors"
          >
            <TapToPayMark className="size-5 shrink-0" />
            <span className="truncate">{TTP}</span>
          </button>
        ) : (
          <div
            aria-disabled
            className="mt-2 flex h-ctl-md w-full items-center gap-2 rounded-row border border-border bg-muted/40 px-3 text-muted-foreground"
          >
            <TapToPayMark className="size-4 shrink-0" />
            <span className="truncate text-fs-sm font-bold">{TTP}</span>
            <span className="ml-auto shrink-0 text-fs-xs">{TTP_DEVICE_NOTE}</span>
          </div>
        )}

        <p className="mt-1 hidden text-fs-xs text-muted-foreground lg:block">
          Cash, manual card entry and Pay by Link are supported online. Connect a card reader for
          other card payments.
        </p>
      </div>


      <div
        ref={paneRef}
        className={cn(
          "mx-auto flex min-h-0 w-full max-w-[64rem] flex-1 flex-col gap-[var(--gap-sec)] px-[var(--pad-screen)] py-2",
          fit.fits ? "justify-between overflow-hidden" : "justify-start overflow-y-auto",
        )}
      >
        {groups.map((group) => (
          <section key={group.title} className="flex shrink-0 flex-col">
            <h3
              className="text-fs-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
              style={{ height: HEAD, lineHeight: `${HEAD}px` }}
            >
              {group.title}
            </h3>
            <div
              className="grid gap-[var(--gap-sec)]"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {group.items.map((t) => {
                const Icon = t.icon;
                const active = selected === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={nothingToPay}
                    onClick={() => {
                      setSelected(t.id);
                      if (t.kind !== "room") setRoom(null);
                      t.run();
                    }}
                    aria-pressed={active}
                    style={{ height: fit.tileH }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-row border px-3 py-2 text-left transition-colors disabled:opacity-40",
                      active
                        ? "border-success bg-success/10"
                        : "border-border bg-surface hover:bg-muted",
                    )}
                  >
                    <Icon className="size-5 shrink-0 text-foreground" aria-hidden />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-fs-sm font-bold text-foreground">
                        {t.label}
                      </span>
                      {t.note ? (
                        <span className="block truncate text-fs-xs text-muted-foreground">
                          {t.note}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>



      <div className="shrink-0 border-t border-border bg-surface px-[var(--pad-screen)] pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-3">
        <button
          type="button"
          disabled={nothingToPay || (!activeTender && !room) || Boolean(activeTender?.unavailable)}
          onClick={() => {
            if (room) {
              setRoomOpen(true);
              return;
            }
            activeTender?.run();
          }}
          className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold uppercase tracking-[0.06em] text-primary-foreground transition-colors disabled:opacity-40"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-surface px-2 py-3 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <BackButton fallbackTo="/order/new" label="Back to order" />
        <div className="min-w-0">
          <h1 className="truncate text-fs-xl font-extrabold text-foreground">
            Total Due <span className="text-accent">{money(due)}</span>
          </h1>
          <p className="truncate text-fs-xs text-muted-foreground">
            Order {orderNumber} · {guest.name || tableGroupLabel(activeTable) || "Guest"} · {orderType}
          </p>
        </div>
      </div>

      {/* Two-pane on tablet and desktop; stacked on phones. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex min-h-0 max-h-[38dvh] flex-col overflow-hidden border-border md:max-h-none md:w-[20rem] md:shrink-0 md:border-r lg:w-[24rem] xl:w-[26rem] 2xl:w-[30rem]">
          {receipt}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{grid}</div>
      </div>

      <AmountEntry
        open={amountFor !== null}
        title={amountFor?.label ?? "Amount"}
        due={due}
        denominations={amountFor?.denominations ?? false}
        onClose={() => setAmountFor(null)}
        onCommit={takeAmount}
      />

      <PaymentCompleteDialog
        open={doneOpen}
        onDone={() => {
          setDoneOpen(false);
          setSelected(null);
          navigate({ to: "/order/new" });
        }}
      />

      <RoomChargeDialog
        open={roomOpen}
        due={due}
        onClose={() => setRoomOpen(false)}
        onCharge={(r) => {
          setRoom(r);
          setRoomOpen(false);
          setSelected("room");
          haptic("success");
          commitPayment("other", due, {
            label: "Room Charge",
            roomNumber: r.number,
            ...(r.stay ? { bookingNumber: r.stay.bookingNumber } : {}),
            signedBill: true,
          });
          announce("Charge posted to room");
          toast.success(`Signed bill posted to room ${r.number} · add the tip from Tickets`);
          setDoneOpen(true);
        }}
      />

      <ReferenceTenderDialog
        open={refConfig !== null}
        title={refConfig?.title ?? "Reference"}
        hint={refConfig?.hint}
        due={due}
        inputLabel={refConfig?.inputLabel ?? "Reference number"}
        placeholder={refConfig?.placeholder}
        numeric={refConfig?.numeric ?? true}
        reasons={refConfig?.reasons}
        confirmLabel={refConfig?.confirmLabel}
        onClose={() => setRefConfig(null)}
        onConfirm={(value) => {
          const cfg = refConfig;
          if (!cfg) return;
          setRefConfig(null);
          if (cfg.needsPin) {
            setPinFor({ cfg, value });
            return;
          }
          finish(cfg, value);
        }}
      />

      <PinSheet
        open={pinFor !== null}
        onOpenChange={(o) => {
          if (!o) setPinFor(null);
        }}
        onSubmit={() => {
          const pending = pinFor;
          setPinFor(null);
          if (pending) finish(pending.cfg, pending.value);
        }}
      />

      {splitOpen ? (
        <SplitPayments
          onClose={() => setSplitOpen(false)}
          onProceed={(result) => {
            setSplitOpen(false);
            setSelected("split");
            if (result.mode !== "standard") {
              toast.info(
                `${result.checks} checks · first check ${money(result.firstTotal)} · choose a tender`,
              );
            }
          }}
        />
      ) : null}
    </div>

  );
}
