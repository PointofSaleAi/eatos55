import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgeDollarSign,
  BedDouble,
  Bike,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReceiptCard, ReceiptRow } from "@/components/pos/receipt";
import { RoomChargeDialog } from "@/components/pos/room-charge-dialog";
import { BackButton } from "@/components/pos/shell";
import { TAX_RATE, money } from "@/lib/demo-data";
import type { Room } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
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
  /** Room charge and split open their own surface instead of charging. */
  kind?: "room" | "split" | "route" | "info";
  run: () => void;
};

function PaymentMethod() {
  const navigate = useNavigate();
  const { cart, totals, tickets, guest, orderType, activeTable, paidSoFar, settings } = usePos();
  const orderNumber = tickets.length + 1;
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);
  const nothingToPay = cart.length === 0;

  const [selected, setSelected] = useState<string | null>(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!nothingToPay) return;
    toast.info("Add items to the order before tendering");
    navigate({ to: "/order/new" });
  }, [nothingToPay, navigate]);

  const tenders: Tender[] = [
    { id: "cash", label: "Cash", icon: Wallet, run: () => navigate({ to: "/payment/cash" }) },
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
    ...(settings.roomService
      ? [
          {
            id: "room",
            label: "Room Charge",
            icon: BedDouble,
            kind: "room" as const,
            run: () => setRoomOpen(true),
          },
        ]
      : []),
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
      kind: "info",
      run: () => toast.info("Scan the guest loyalty card"),
    },
    {
      id: "in-kind",
      label: "In-kind",
      icon: HandHeart,
      kind: "info",
      run: () => toast.info("In-kind tender needs manager approval"),
    },
    {
      id: "uber",
      label: "Uber Eats",
      icon: Bike,
      kind: "info",
      run: () => toast.info("Enter the Uber Eats order or reference number"),
    },
    {
      id: "doordash",
      label: "Doordash",
      icon: Bike,
      kind: "info",
      run: () => toast.info("Enter the Doordash order or reference number"),
    },
    {
      id: "grubhub",
      label: "Grubhub",
      icon: Utensils,
      kind: "info",
      run: () => toast.info("Enter the Grubhub order or reference number"),
    },
  ];

  const activeTender = tenders.find((t) => t.id === selected) ?? null;
  const actionLabel = room
    ? `Print Bill · ${room.name} - ${room.number}`
    : activeTender
      ? activeTender.kind === "split"
        ? "Split this check"
        : `Charge ${money(due)}`
      : "Select a payment method";

  const receipt = (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <ReceiptCard className="mx-auto max-w-md">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <p className="truncate text-fs-sm font-extrabold text-foreground">Order #{orderNumber}</p>
          <p className="shrink-0 text-fs-sm font-extrabold uppercase text-foreground">{orderType}</p>
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
            <ReceiptRow label={`TAX (${Math.round(TAX_RATE * 100)}%)`} value={money(totals.tax)} />
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
    </div>
  );

  const grid = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <h2 className="text-fs-lg font-extrabold text-foreground">Payment Method</h2>
        <p className="mt-1 text-fs-xs text-muted-foreground">
          Point of Sale online supports cash, manual card entry and Pay by Link. For Tap to Pay and
          Card Sale, connect a card reader or download the iOS or Android app.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {tenders.map((t) => {
            const Icon = t.icon;
            const active = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!cart.length}
                onClick={() => {
                  setSelected(t.id);
                  if (t.kind !== "room") setRoom(null);
                  t.run();
                }}
                aria-pressed={active}
                className={cn(
                  "flex min-h-ctl-lg items-center gap-2.5 rounded-row border px-3 py-3 text-left transition-colors disabled:opacity-40",
                  active
                    ? "border-success bg-success/10"
                    : "border-border bg-surface hover:bg-muted",
                )}
              >
                <Icon className="size-5 shrink-0 text-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-3 pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-3">
        <button
          type="button"
          disabled={!activeTender && !room}
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
        <BackButton fallbackTo="/order/review" label="Back to order review" />
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
    </div>
  );
}
