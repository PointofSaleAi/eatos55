import { useEffect, useState } from "react";
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
 * "Payment By Gift Card": key or scan the card, see its balance, and charge
 * the due amount against it. One number pad targets whichever field is
 * active. When the balance cannot cover the check the full balance is
 * applied as a partial payment and the rest stays open for another tender.
 */
export function GiftCardPaymentDialog({
  open,
  due,
  onClose,
  onCommit,
}: {
  open: boolean;
  /** Balance still outstanding on the check. */
  due: number;
  onClose: () => void;
  /** Receives the amount actually charged to the card. */
  onCommit: (amount: number) => void;
}) {
  const wide = useWideViewport();
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  const { giftCardBalance, chargeGiftCard } = usePos();

  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [activeField, setActiveField] = useState<Field>("card");

  useEffect(() => {
    if (open) {
      setCardNumber("");
      setAmount(due > 0 ? String(due) : "");
      setActiveField("card");
    }
  }, [open, due]);

  const balance = cardNumber ? giftCardBalance(cardNumber) : null;
  const entered = Number(amount || "0");
  const known = cardNumber.length >= 8 && balance !== null;
  const applied = known ? Math.min(entered, balance) : 0;
  const canCharge = known && applied > 0;

  const type = (d: string) => {
    if (activeField === "card") {
      if (d === ".") return;
      setCardNumber((cur) => {
        const next = `${cur}${d}`.replace(/\D/g, "").slice(0, 19);
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
    if (!chargeGiftCard(cardNumber, applied)) return;
    onCommit(applied);
  };

  const fieldRing = (field: Field) =>
    cn(
      "rounded-row border bg-surface transition-shadow",
      activeField === field
        ? "border-accent ring-2 ring-accent/40"
        : "border-border",
    );

  const body = (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
      <div className={cn("grid min-h-0 flex-1 gap-4", wide && "grid-cols-2")}>
        <div className="flex min-h-0 flex-col gap-3">
          <button
            type="button"
            onClick={() => setActiveField("card")}
            aria-pressed={activeField === "card"}
            className={cn("flex items-center gap-2 px-3 text-left", fieldRing("card"))}
          >
            <span className="flex h-ctl-lg min-w-0 flex-1 flex-col justify-center">
              <span className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                Card number
              </span>
              <span
                className={cn(
                  "truncate text-fs-base font-bold tabular-nums text-foreground",
                  !cardNumber && "text-muted-foreground/50",
                )}
              >
                {cardNumber || "XXXX-XXXX-XXXX-XXXX"}
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
              <span className="text-fs-base font-bold tabular-nums text-foreground">
                {money(entered)}
              </span>
            </span>
          </button>

          <div className="mt-auto space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                Available balance
              </p>
              <p className="text-fs-lg font-extrabold tabular-nums text-foreground">
                {balance === null ? "—" : money(balance)}
              </p>
            </div>
            {cardNumber.length >= 8 && balance === null ? (
              <p className="text-fs-xs font-bold text-destructive">Unknown card number</p>
            ) : known && entered > balance ? (
              <p className="text-fs-xs font-bold text-accent">
                Balance covers {money(balance)} · the rest stays open for another tender
              </p>
            ) : null}
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
        Charge {applied > 0 ? money(applied) : ""}
      </button>
    </div>
  );

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
        <DialogContent className="flex h-[min(34rem,88dvh)] w-[min(46rem,94vw)] max-w-none flex-col gap-0 rounded-sheet border-border bg-surface p-0">
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
            <DialogTitle className="min-w-0 flex-1 truncate text-fs-lg font-extrabold text-foreground">
              Payment By Gift Card
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
            Payment By Gift Card
          </SheetTitle>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  );
}
