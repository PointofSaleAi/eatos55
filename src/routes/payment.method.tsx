import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgeDollarSign,
  BedDouble,
  Bike,
  ChevronLeft,
  ChevronRight,
  CreditCard,
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
import { useAnnounce } from "@/components/pos/live-region";
import { PinSheet } from "@/components/pos/pin-sheet";
import { ReceiptCard, ReceiptRow } from "@/components/pos/receipt";
import { ReferenceTenderDialog } from "@/components/pos/reference-tender-dialog";
import { RoomChargeDialog } from "@/components/pos/room-charge-dialog";
import { BackButton } from "@/components/pos/shell";
import { haptic } from "@/lib/haptics";
import { TAX_RATE, money } from "@/lib/demo-data";
import type { Room } from "@/lib/floor-data";
import { usePos, type TenderId, type TenderMethod } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payment/method")({
  head: () => ({
    meta: [
      { title: "Select Payment Method - eatOS Point of Sale" },
      {
        name: "description",
        content:
          "Review the check and choose cash, card, split check, room charge, gift card, loyalty or a delivery partner.",
      },
      { property: "og:title", content: "Select Payment Method - eatOS Point of Sale" },
      {
        property: "og:description",
        content:
          "Review the check and choose cash, card, split check, room charge or a delivery partner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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
  const { cart, totals, tickets, guest, orderType, activeTable, paidSoFar, settings, commitPayment } =
    usePos();
  const announce = useAnnounce();
  const orderNumber = tickets.length + 1;
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);
  const nothingToPay = cart.length === 0;

  const [selected, setSelected] = useState<string | null>(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [refConfig, setRefConfig] = useState<RefConfig | null>(null);
  const [pinFor, setPinFor] = useState<{ cfg: RefConfig; value: string } | null>(null);

  const finish = (cfg: RefConfig, value: string) => {
    haptic("success");
    commitPayment(cfg.method, due);
    announce("Payment complete");
    toast.success(cfg.success(value));
    navigate({ to: "/payment/success" });
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
        { id: "cash", label: "Cash", icon: Wallet, run: () => navigate({ to: "/payment/cash" }) },
        {
          id: "manual-card",
          label: "Manual Card",
          icon: CreditCard,
          run: () => navigate({ to: "/payment/card" }),
        },
        {
          id: "manual-cc",
          label: "Manual CC",
          icon: BadgeDollarSign,
          run: () => navigate({ to: "/payment/card" }),
        },
        {
          id: "external",
          label: "External CC",
          icon: UploadCloud,
          run: () => navigate({ to: "/payment/tender/$kind", params: { kind: "other" } }),
        },
        {
          id: "split",
          label: "Split Check",
          icon: Split,
          kind: "split",
          run: () => navigate({ to: "/payment/split" }),
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
          run: () => navigate({ to: "/payment/tender/$kind", params: { kind: "house" } }),
        },
        {
          id: "house",
          label: "House",
          icon: Landmark,
          run: () => navigate({ to: "/payment/tender/$kind", params: { kind: "house" } }),
        },
        {
          id: "gift",
          label: "Gift Card",
          icon: Gift,
          run: () => navigate({ to: "/payment/tender/$kind", params: { kind: "gift" } }),
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
    return on;
  };
  const groups = allGroups
    .map((g) => ({ title: g.title, items: g.items.filter((t) => enabled(t.id)) }))
    .filter((g) => g.items.length > 0);

  // Tiles page instead of scrolling: pack whole groups into the measured pane.
  const paneRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry?.contentRect;
      if (r) setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = box.w >= 1024 ? 4 : box.w >= 620 ? 3 : 2;
  const pages = useMemo(() => {
    const ROW = 52;
    const HEAD = 24;
    const GAP = 8;
    const SECTION_GAP = 8;
    const height = box.h || 999;
    const out: { title: string; items: Tender[] }[][] = [];
    let current: { title: string; items: Tender[] }[] = [];
    let used = 0;
    for (const g of groups) {
      const rows = Math.ceil(g.items.length / cols);
      const h = HEAD + rows * ROW + (rows - 1) * GAP + (current.length ? SECTION_GAP : 0);
      if (current.length && used + h > height) {
        out.push(current);
        current = [];
        used = 0;
      }
      current.push(g);
      used += h;
    }
    if (current.length) out.push(current);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.h, cols, JSON.stringify(groups.map((g) => [g.title, g.items.length]))]);

  const [page, setPage] = useState(0);
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pages.length - 1)));
  }, [pages.length]);





  const allTenders = groups.flatMap((g) => g.items);
  const activeTender = allTenders.find((t) => t.id === selected) ?? null;
  const actionLabel = room
    ? `Print Bill · ${room.name} - ${room.number}`
    : activeTender && !activeTender.unavailable
      ? activeTender.kind === "split"
        ? "Split this check"
        : `Charge ${money(due)}`
      : "Select a payment method";

  const receipt = (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      {nothingToPay ? (
        <ReceiptCard className="mx-auto max-w-md">
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
      ) : (
        <ReceiptCard className="mx-auto max-w-md">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <p className="truncate text-fs-sm font-extrabold text-foreground">
              Order #{orderNumber}
            </p>
            <p className="shrink-0 text-fs-sm font-extrabold uppercase text-foreground">
              {orderType}
            </p>
            <p className="truncate text-fs-xs text-muted-foreground">
              {guest.name || activeTable || "Guest Name"}
            </p>
            <p className="shrink-0 text-fs-xs text-muted-foreground">
              Ticket No. {orderNumber} · Amount Due {money(due)}
            </p>
          </div>

          <div className="mt-3 border-t border-dashed border-border pt-3">
            <div className="flex items-center justify-between text-fs-base font-extrabold text-foreground">
              <span>Total Due</span>
              <span className="tabular-nums">{money(due)}</span>
            </div>
            <div className="mt-2 space-y-1">
              <ReceiptRow label="TOTAL" value={money(totals.total)} strong />
              <ReceiptRow label="Sub Total" value={money(totals.subtotal)} />
              <ReceiptRow
                label={`TAX (${Math.round(TAX_RATE * 100)}%)`}
                value={money(totals.tax)}
              />
              {totals.serviceCharge ? (
                <ReceiptRow label="Service Charge" value={money(totals.serviceCharge)} />
              ) : null}
              {totals.discount ? (
                <ReceiptRow label="Discount" value={`-${money(totals.discount)}`} tone="accent" />
              ) : null}
              {paidSoFar > 0 ? <ReceiptRow label="Paid so far" value={money(paidSoFar)} /> : null}
            </div>
          </div>

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
      )}
    </div>
  );

  const grid = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="truncate text-fs-lg font-extrabold text-foreground">Payment Method</h2>
          {pages.length > 1 ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Previous payment methods"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="grid size-9 place-items-center rounded-pill border border-border text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-fs-xs tabular-nums text-muted-foreground">
                {page + 1}/{pages.length}
              </span>
              <button
                type="button"
                aria-label="More payment methods"
                onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
                disabled={page >= pages.length - 1}
                className="grid size-9 place-items-center rounded-pill border border-border text-foreground disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
        <p className="mt-1 hidden text-fs-xs text-muted-foreground lg:block">
          Cash, manual card entry and Pay by Link are supported online. Connect a card reader for Tap
          to Pay.
        </p>
      </div>

      <div ref={paneRef} className="min-h-0 flex-1 overflow-hidden px-4 py-2">
        {(pages[page] ?? []).map((group) => (
          <section key={group.title} className="mt-2 first:mt-0">
            <h3 className="text-fs-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {group.title}
            </h3>
            <div
              className="mt-1.5 grid gap-2"
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
                    className={cn(
                      "flex min-h-tap items-center gap-2.5 rounded-row border px-3 py-2.5 text-left transition-colors disabled:opacity-40",
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


      <div className="shrink-0 border-t border-border bg-surface px-3 pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-3">
        <button
          type="button"
          disabled={nothingToPay || (!activeTender && !room) || Boolean(activeTender?.unavailable)}
          onClick={() => {
            if (room) {
              toast.success(`Bill printed and charged to ${room.name} - ${room.number}`);
              navigate({ to: "/payment/success" });
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
            Order {orderNumber} · {guest.name || activeTable || "Guest"} · {orderType}
          </p>
        </div>
      </div>

      {/* Two-pane on tablet and desktop; stacked on phones. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex min-h-0 shrink-0 flex-col overflow-hidden border-border md:w-[22rem] md:border-r lg:w-[24rem]">
          {receipt}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{grid}</div>
      </div>

      <RoomChargeDialog
        open={roomOpen}
        due={due}
        onClose={() => setRoomOpen(false)}
        onCharge={(r) => {
          setRoom(r);
          setRoomOpen(false);
          setSelected("room");
          toast.success(`${r.name} - ${r.number} selected for room charge`);
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
    </div>
  );
}
