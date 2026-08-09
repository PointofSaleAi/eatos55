import { BadgePercent, Check, Percent, Receipt, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DiscountSheet } from "@/components/pos/discount-sheet";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { cn } from "@/lib/utils";

/** Order "More" sheet: Service Charge, No Tax, Discount, Open Register. */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useBackDismiss(open, onClose);
  const {
    noTax,
    setNoTax,
    serviceCharge,
    setServiceCharge,
    orderDiscountPercent,
    setOrderDiscountPercent,
  } = usePos();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [charge, setCharge] = useState(String(serviceCharge || ""));
  const [discountOpen, setDiscountOpen] = useState(false);
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const charge2 = useSheetDrag(() => setChargeOpen(false));

  const rows = [
    {
      id: "service-charge",
      label: "Service Charge",
      icon: Receipt,
      value: serviceCharge ? `$${serviceCharge.toFixed(2)}` : "",
      onClick: () => setChargeOpen(true),
    },
    {
      id: "no-tax",
      label: "No Tax",
      icon: Percent,
      value: noTax ? "On" : "",
      onClick: () => {
        setNoTax(!noTax);
        toast.success(noTax ? "Tax applied" : "Tax removed from this order");
      },
    },
    {
      id: "discount",
      label: "Discount",
      icon: BadgePercent,
      value: orderDiscountPercent ? `${orderDiscountPercent}%` : "",
      onClick: () => setDiscountOpen(true),
    },
    {
      id: "open-register",
      label: "Open Register",
      icon: Wallet,
      value: "",
      onClick: () => {
        toast.success("Register opened");
        onClose();
      },
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <SheetContent side="bottom" style={dragStyle} className="mx-auto w-full max-w-[420px] rounded-t-3xl border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]">
          <SheetGrabber handleProps={handleProps} />
          <SheetHeader className="px-4 pb-1.5 pt-1" {...handleProps}>
            <SheetTitle className="text-center text-base font-extrabold text-foreground">
              More
            </SheetTitle>
          </SheetHeader>
          <div>
            {rows.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={r.onClick}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left",
                    i % 2 === 0 ? "bg-muted/40" : "bg-surface",
                  )}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                    {r.label}
                  </span>
                  {r.value ? (
                    <span className="shrink-0 text-fs-sm font-bold text-muted-foreground">
                      {r.value}
                    </span>
                  ) : null}
                  {r.id === "no-tax" && noTax ? (
                    <Check className="size-5 shrink-0 text-success" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={chargeOpen} onOpenChange={(next) => (next ? null : setChargeOpen(false))}>
        <SheetContent side="bottom" style={charge2.dragStyle} className="mx-auto w-full max-w-[420px] rounded-t-3xl border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]">
          <SheetGrabber handleProps={charge2.handleProps} />
          <SheetHeader className="px-4 pb-1.5 pt-1" {...charge2.handleProps}>
            <SheetTitle className="text-center text-base font-extrabold text-foreground">
              Service Charge
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              placeholder="0.00"
              aria-label="Service charge amount"
              className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base font-bold text-foreground outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setServiceCharge(Number(charge) || 0);
                setChargeOpen(false);
                toast.success("Service charge updated");
              }}
              className="mt-3 h-11 w-full rounded-full bg-primary text-fs-sm font-extrabold uppercase text-primary-foreground"
            >
              Apply
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <DiscountSheet
        open={discountOpen}
        selected={null}
        onClose={() => setDiscountOpen(false)}
        onPick={(d) => {
          setOrderDiscountPercent(d.percent);
          setDiscountOpen(false);
          toast.success(`${d.name} applied`);
        }}
      />
    </>
  );
}
