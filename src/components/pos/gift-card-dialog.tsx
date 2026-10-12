import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScanLine } from "lucide-react";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { NumPad } from "@/components/pos/numpad";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

type Field = "card" | "amount";

/**
 * Gift card desk: one flow for selling a new card or topping one up — enter
 * the card number, enter the amount, charge. A single number pad targets
 * whichever field is active; a recognized number shows its balance live, so
 * checking a balance needs no separate mode. Charging drops a no-tax
 * "Gift Card - XXXX" line on the order so the guest pays for the load
 * through the normal payment flow.
 */
export function GiftCardDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const wide = useWideViewport();
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const { giftCardBalance, loadGiftCard, addGiftCardLine } = usePos();

  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [activeField, setActiveField] = useState<Field>("card");

  useEffect(() => {
    if (open) {
      setCardNumber("");
      setAmount("");
      setActiveField("card");
    }
  }, [open]);

  const balance = cardNumber ? giftCardBalance(cardNumber) : null;
  const entered = Number(amount || "0");
  const cardReady = cardNumber.length >= 8;
  const isNewCard = cardReady && balance === null;
  const canCharge = cardReady && entered > 0;

  const type = (d: string) => {
    if (activeField === "card") {
      if (d === ".") return;
      setCardNumber((cur) => {
        const next = `${cur}${d}`.replace(/\D/g, "").slice(0, 19);
        // Once the number looks complete, hand the pad over to the amount.
        if (next.length >= 8 && cur.length < 8) setActiveField("amount");
        return next;
      });
      return;
    }
    setAmount((cur) => {
      if (d === "." && cur.includes(".")) return cur;
      const next = `${cur}${d}`;
      return next.length > 9 ? cur : next;
    });
  };

  const backspace = () => {
    if (activeField === "card") {
      setCardNumber((cur) => cur.slice(0, -1));
    } else {
      setAmount((cur) => cur.slice(0, -1));
    }
  };

  const charge = () => {
    if (!canCharge) return;
    loadGiftCard(cardNumber, entered);
    addGiftCardLine(cardNumber, entered);
    toast.success(
      `${isNewCard ? "Gift card sold" : "Funds added"} · ${money(entered)} on card ·${cardNumber.slice(-4)}`,
    );
    onClose();
  };

  const fieldRing = (field: Field) =>
    cn(
      "rounded-row border bg-surface transition-shadow",
      activeField === field
        ? "border-accent ring-2 ring-accent/40"
        : "border-border",
    );

  const body = (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3")}>
      <div className={cn("grid min-h-0 flex-1 gap-4", wide && "grid-cols-2")}>
        <div className="flex min-h-0 flex-col gap-3">
          <p className="text-fs-xs font-semibold text-muted-foreground">
            [ Adding funds to any card will activate it ]
          </p>

          <button
            type="button"
            onClick={() => setActiveField("card")}
            aria-pressed={activeField === "card"}
            className={cn("flex items-center gap-2 px-3 text-left", fieldRing("card"))}
          >
            <span className="flex h-ctl-lg min-w-0 flex-1 flex-col justify-center">
              <span className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                Gift card number
              </span>
              <span
                className={cn(
                  "truncate text-fs-base font-bold tabular-nums text-foreground",
                  !cardNumber && "text-muted-foreground/50",
                )}
              >
                {cardNumber || "6048 8798 9894 46715"}
              </span>
            </span>
            <ScanLine className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setActiveField("amount")}
            aria-pressed={activeField === "amount"}
            className={cn("flex items-center gap-2 px-3 text-left", fieldRing("amount"))}
          >
            <span className="flex h-ctl-lg min-w-0 flex-1 flex-col justify-center">
              <span className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                Amount
              </span>
              <span
                className={cn(
                  "text-fs-base font-bold tabular-nums text-foreground",
                  !amount && "text-muted-foreground/50",
                )}
              >
                {amount ? money(entered) : "$0.00"}
              </span>
            </span>
          </button>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
            <div>
              <p className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                Available balance
              </p>
              <p className="text-fs-money font-extrabold tabular-nums text-foreground">
                {balance !== null ? money(balance) : isNewCard ? "New card" : "—"}
              </p>
            </div>
          </div>
        </div>

        <NumPad
          className={cn("min-h-0 flex-1", wide && "h-full self-stretch")}
          onDigit={type}
          onBackspace={backspace}
          disableDecimal={activeField === "card"}
        />
      </div>

      <button
        type="button"
        disabled={!canCharge}
        onClick={charge}
        className="h-ctl-lg w-full shrink-0 rounded-row bg-shell text-fs-base font-extrabold uppercase tracking-[0.06em] text-shell-foreground transition-colors disabled:opacity-40"
      >
        Charge {entered > 0 ? money(entered) : ""}
      </button>
    </div>
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent className="flex h-[min(34rem,88dvh)] w-[min(46rem,94vw)] max-w-none flex-col gap-0 rounded-sheet border-border bg-surface p-0">
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
            <DialogTitle className="min-w-0 flex-1 truncate text-fs-lg font-extrabold text-foreground">
              Gift Card
            </DialogTitle>
          </div>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto flex max-h-[92dvh] w-full max-w-sheet flex-col gap-0 rounded-t-sheet border-0 bg-surface p-0"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="shrink-0 px-4 pb-1 pt-1" {...handleProps}>
          <SheetTitle className="text-center text-fs-base font-extrabold text-foreground">
            Gift Card
          </SheetTitle>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}
