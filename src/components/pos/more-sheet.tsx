import {
  ArrowLeftRight,
  BadgeDollarSign,
  CircleDollarSign,
  Gift,
  Percent,
  QrCode,
  Receipt,
  RotateCcw,
  Ticket,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { PinSheet } from "@/components/pos/pin-sheet";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { cn } from "@/lib/utils";

type GuestMode = "transfer" | "add" | null;

/** Secondary order actions presented as a full-height right-side tool rail. */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useBackDismiss(open, onClose);
  const {
    serviceCharge,
    setServiceCharge,
    comped,
    setComped,
    cart,
    cancelOrder,
  } = usePos();
  const confirm = useConfirm();
  const router = useRouter();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [charge, setCharge] = useState(String(serviceCharge || ""));
  const [guestMode, setGuestMode] = useState<GuestMode>(null);
  const [pinOpen, setPinOpen] = useState(false);

  const notifyUnavailable = (label: string) => {
    toast.info(`${label} is not configured for this location`);
  };

  const rows = [
    {
      id: "transfer",
      label: "Transfer Check",
      icon: ArrowLeftRight,
      run: () => setGuestMode("transfer"),
    },
    {
      id: "service-charge",
      label: "Service Charge",
      icon: Receipt,
      value: serviceCharge ? `$${serviceCharge.toFixed(2)}` : undefined,
      run: () => setChargeOpen(true),
    },
    { id: "add-guest", label: "Add Guest", icon: UserPlus, run: () => setGuestMode("add") },
    { id: "gift-card", label: "Gift Card", icon: Gift, run: () => notifyUnavailable("Gift Card") },
    { id: "sell-voucher", label: "Sell Voucher", icon: Ticket, run: () => notifyUnavailable("Sell Voucher") },
    {
      id: "create-deposit",
      label: "Create Deposit",
      icon: CircleDollarSign,
      run: () => notifyUnavailable("Create Deposit"),
    },
    {
      id: "redeem-deposit",
      label: "Redeem Deposit",
      icon: QrCode,
      run: () => notifyUnavailable("Redeem Deposit"),
    },
    {
      id: "reopen-check",
      label: "Reopen Check",
      icon: RotateCcw,
      run: () => notifyUnavailable("Reopen Check"),
    },
    {
      id: "comp",
      label: comped ? "Remove Comp" : "Comp Order",
      icon: BadgeDollarSign,
      value: comped ? "On" : undefined,
      run: () => {
        if (comped) {
          setComped(false);
          toast.success("Comp removed");
          return;
        }
        setPinOpen(true);
      },
    },
    {
      id: "cancel",
      label: "Cancel Order",
      icon: Trash2,
      destructive: true,
      run: () => {
        void (async () => {
          const ok = await confirm({
            title: "Cancel this order?",
            message: cart.length
              ? "This cannot be undone — every item on the order is removed."
              : "The order in progress is discarded.",
            confirmLabel: "Cancel order",
            destructive: true,
          });
          if (!ok) return;
          cancelOrder();
          onClose();
          toast.success("Order cancelled");
          router.navigate({ to: "/tickets" });
        })();
      },
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <SheetContent
          side="right"
          className="flex h-dvh w-[min(21rem,88vw)] flex-col border-l border-border bg-surface p-0 sm:max-w-none"
        >
          <SheetHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
            <SheetTitle className="text-fs-lg font-extrabold text-foreground">Order Options</SheetTitle>
            <p className="text-fs-xs font-bold text-muted-foreground">Tools for the current check</p>
          </SheetHeader>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <Button
                  key={row.id}
                  type="button"
                  variant="ghost"
                  onClick={row.run}
                  className={cn(
                    "h-auto min-h-14 w-full justify-start rounded-row px-3 py-2 text-left hover:bg-muted hover:text-foreground",
                    row.destructive ? "text-destructive" : "text-foreground",
                  )}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-row bg-muted">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-fs-sm font-bold">{row.label}</span>
                  {row.value ? (
                    <span className="shrink-0 text-fs-xs font-bold text-muted-foreground">
                      {row.value}
                    </span>
                  ) : null}
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={chargeOpen} onOpenChange={setChargeOpen}>
        <SheetContent side="bottom" className="mx-auto w-full max-w-sheet rounded-t-sheet border-0 bg-surface p-4 pb-[calc(1rem+var(--kb-inset,0px))]">
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

      <GuestSheet open={guestMode !== null} onClose={() => setGuestMode(null)} />
      <PinSheet
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSubmit={() => {
          setPinOpen(false);
          setComped(true);
          toast.success("Order comped");
        }}
      />
    </>
  );
}