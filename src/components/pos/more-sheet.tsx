import {
  ArrowLeftRight,
  Gift,
  Receipt,
  RotateCcw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { cn } from "@/lib/utils";

type GuestMode = "transfer" | "add" | null;

/** First word on line one, the rest on line two — the rail is too narrow for one line. */
function labelLines(label: string) {
  const [first = "", ...rest] = label.split(" ");
  return rest.length ? [first, rest.join(" ")] : [first];
}

/** Secondary order actions presented as a full-height right-side tool rail. */
export function MoreSheet({
  open,
  onClose,
  docked = false,
}: {
  open: boolean;
  onClose: () => void;
  docked?: boolean;
}) {
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

  const optionRows = docked ? (
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-1.5">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <Button
            key={row.id}
            type="button"
            variant="ghost"
            onClick={row.run}
            title={row.label}
            className={cn(
              "h-auto min-h-[4.75rem] w-full shrink-0 flex-col justify-center gap-1 rounded-row px-1 py-2 text-center hover:bg-muted hover:text-foreground",
              row.destructive ? "text-destructive" : "text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="w-full whitespace-normal text-[0.625rem] font-bold leading-tight">
              {labelLines(row.label).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
            {row.value ? (
              <span className="text-[0.5625rem] font-bold leading-none text-muted-foreground">
                {row.value}
              </span>
            ) : null}
          </Button>
        );
      })}
    </div>
  ) : (
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
  );

  return (
    <>
      {docked ? (
        open ? (
          <aside
            aria-label="Order Options"
            className="flex min-h-0 w-[5.75rem] shrink-0 flex-col overflow-hidden border-l border-border bg-surface"
          >
            <h2 className="sr-only">Order Options</h2>
            {optionRows}
          </aside>
        ) : null
      ) : (
        <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
          <SheetContent
            side="right"
            className="flex h-dvh w-[min(21rem,88vw)] flex-col border-l border-border bg-surface p-0 sm:max-w-none"
          >
            <SheetHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
              <SheetTitle className="text-fs-lg font-extrabold text-foreground">Order Options</SheetTitle>
              <p className="text-fs-xs font-bold text-muted-foreground">Tools for the current check</p>
            </SheetHeader>
            {optionRows}
          </SheetContent>
        </Sheet>
      )}

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