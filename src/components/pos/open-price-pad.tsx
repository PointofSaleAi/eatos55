import { useEffect, useState } from "react";
import { Delete, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { money, type MenuItem } from "@/lib/demo-data";
import { moneyDigitsToAmount, popMoneyDigit, pushMoneyDigit } from "@/lib/money-entry";
import { cn } from "@/lib/utils";

const padKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Price entry for open-price products: a calculator-style keypad that fills
 * cash-register style from the last decimal (9 → $0.09, 9 + 00 → $9.00).
 * Tapping outside closes without adding anything; Save adds the item at the
 * entered price.
 */
export function OpenPricePad({
  item,
  onSave,
  onClose,
}: {
  item: MenuItem | null;
  onSave: (item: MenuItem, price: number) => void;
  onClose: () => void;
}) {
  const [digits, setDigits] = useState("");
  useEffect(() => {
    setDigits("");
  }, [item]);
  const amount = moneyDigitsToAmount(digits);

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="w-[min(92vw,22rem)] gap-0 rounded-card p-0" hideClose>
        <DialogTitle className="flex items-center gap-2 border-b border-border px-4 py-3 text-fs-base font-extrabold">
          <span className="grid size-7 place-items-center rounded-md bg-accent/15 text-accent">
            <DollarSign className="size-4" />
          </span>
          Open Price
        </DialogTitle>
        {item ? (
          <div className="flex flex-col items-center px-4 pb-4 pt-3">
            <p className="text-fs-base font-extrabold text-foreground">{item.name}</p>
            <p className="mt-2 text-fs-2xl font-extrabold tabular-nums leading-none text-foreground">
              <span className="mr-1 align-top text-fs-base text-muted-foreground">$</span>
              {amount.toFixed(2)}
            </p>
            <p className="mt-1 text-fs-xs font-bold text-accent">Editing the open price</p>
            <div className="mt-3 grid w-full grid-cols-3 gap-2">
              {padKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDigits((current) => pushMoneyDigit(current, key))}
                  className="min-h-tap rounded-md border border-border bg-muted text-fs-lg font-extrabold text-foreground transition-[filter,transform] hover:brightness-95 active:scale-[0.98]"
                >
                  {key}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDigits((current) => pushMoneyDigit(current, "00"))}
                className="min-h-tap rounded-md border border-border bg-muted text-fs-lg font-extrabold text-foreground transition-[filter,transform] hover:brightness-95 active:scale-[0.98]"
              >
                00
              </button>
              <button
                type="button"
                onClick={() => setDigits((current) => pushMoneyDigit(current, "0"))}
                className="min-h-tap rounded-md border border-border bg-muted text-fs-lg font-extrabold text-foreground transition-[filter,transform] hover:brightness-95 active:scale-[0.98]"
              >
                0
              </button>
              <button
                type="button"
                aria-label="Delete last digit"
                onClick={() => setDigits((current) => popMoneyDigit(current))}
                className="grid min-h-tap place-items-center rounded-md border border-border bg-muted text-foreground transition-[filter,transform] hover:brightness-95 active:scale-[0.98]"
              >
                <Delete className="size-5" />
              </button>
            </div>
            <button
              type="button"
              disabled={amount <= 0}
              onClick={() => {
                onSave(item, amount);
                onClose();
              }}
              className={cn(
                "mt-3 min-h-tap w-full rounded-pill text-fs-sm font-extrabold transition-[filter,transform] active:scale-[0.99]",
                amount > 0
                  ? "bg-accent text-accent-foreground hover:brightness-95"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              Save {money(amount)}
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
