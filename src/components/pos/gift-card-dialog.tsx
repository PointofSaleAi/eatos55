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

type Tab = "purchase" | "add-funds" | "check-balance";

const tabs: { id: Tab; label: string }[] = [
  { id: "purchase", label: "Purchase" },
  { id: "add-funds", label: "Add Funds" },
  { id: "check-balance", label: "Check Balance" },
];

/**
 * Gift card desk: sell a new card, top one up, or read a balance. Charging
 * drops a no-tax "Gift Card - XXXX" line on the order so the guest pays for
 * the load through the normal payment flow.
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

  const [tab, setTab] = useState<Tab>("purchase");
  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open) {
      setTab("purchase");
      setCardNumber("");
      setAmount("");
    }
  }, [open]);

  const balance = cardNumber ? giftCardBalance(cardNumber) : null;
  const entered = Number(amount || "0");
  const checkOnly = tab === "check-balance";
  // A purchase may start a brand-new number; top-ups need a known card.
  const cardOk = cardNumber.length >= 8 && (tab === "purchase" || balance !== null);
  const canCharge = !checkOnly && cardOk && entered > 0;

  const type = (d: string) => {
    setAmount((cur) => {
      if (d === "." && cur.includes(".")) return cur;
      const next = `${cur}${d}`;
      return next.length > 9 ? cur : next;
    });
  };

  const charge = () => {
    if (!canCharge) return;
    loadGiftCard(cardNumber, entered);
    addGiftCardLine(cardNumber, entered);
    toast.success(
      `${tab === "purchase" ? "Gift card sold" : "Funds added"} · ${money(entered)} on card ·${cardNumber.slice(-4)}`,
    );
    onClose();
  };

  const body = (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3")}>
      <div className={cn("grid min-h-0 flex-1 gap-4", wide && "grid-cols-2")}>
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={cn(
                  "min-h-ctl-sm rounded-pill px-3 text-fs-xs font-extrabold uppercase tracking-[0.06em] transition-colors",
                  tab === t.id
                    ? "bg-shell text-shell-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-fs-xs font-semibold text-muted-foreground">
            [ Adding funds to any card will activate it ]
          </p>

          <label className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
            Please enter gift card number
          </label>
          <div className="flex items-center gap-2 rounded-row border border-border bg-surface px-3">
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
              inputMode="numeric"
              placeholder="6048 8798 9894 46715"
              aria-label="Gift card number"
              className="h-ctl-lg min-w-0 flex-1 bg-transparent text-fs-base font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50"
            />
            <ScanLine className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </div>
          {cardNumber.length >= 8 && balance === null && tab !== "purchase" ? (
            <p className="text-fs-xs font-bold text-destructive">Unknown card number</p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
            <div>
              <p className="text-fs-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                Available balance
              </p>
              <p className="text-fs-money font-extrabold tabular-nums text-foreground">
                {balance === null ? "—" : money(balance)}
              </p>
            </div>
            {!checkOnly ? (
              <p className="text-fs-lg font-extrabold tabular-nums text-foreground">
                {money(entered)}
              </p>
            ) : null}
          </div>
        </div>

        {!checkOnly ? (
          <NumPad
            className={cn("min-h-0 flex-1", wide && "h-full self-stretch")}
            onDigit={type}
            onBackspace={() => setAmount((cur) => cur.slice(0, -1))}
          />
        ) : null}
      </div>

      {!checkOnly ? (
        <button
          type="button"
          disabled={!canCharge}
          onClick={charge}
          className="h-ctl-lg w-full shrink-0 rounded-row bg-shell text-fs-base font-extrabold uppercase tracking-[0.06em] text-shell-foreground transition-colors disabled:opacity-40"
        >
          Charge {entered > 0 ? money(entered) : ""}
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="h-ctl-lg w-full shrink-0 rounded-row bg-shell text-fs-base font-extrabold uppercase tracking-[0.06em] text-shell-foreground transition-colors"
        >
          Done
        </button>
      )}
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
