import { useState } from "react";
import { BackButton } from "@/components/pos/shell";
import { NumPad } from "@/components/pos/numpad";
import { cashDenominations, money } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

/**
 * Shared amount-entry tender screen: compact readout, optional cash
 * denomination pills and a keypad that fills all remaining height.
 */
export function TenderScreen({
  title,
  due,
  initialAmount = "",
  denominations = false,
  actionLabel,
  onCommit,
}: {
  title: string;
  due: number;
  initialAmount?: string;
  denominations?: boolean;
  actionLabel?: (amount: number) => string;
  onCommit: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(initialAmount);
  const entered = Number(amount || "0");
  const change = Math.round((entered - due) * 100) / 100;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-2 py-3">
        <BackButton fallbackTo="/payment/method" label="Back to payment methods" />
        <h1 className="truncate text-fs-xl font-extrabold text-foreground">{title}</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2 pb-[max(0.75rem,var(--kb-inset,0px))]">
        <div className="shrink-0 text-center">
          <p className="text-fs-xl font-extrabold tabular-nums text-foreground">{money(entered)}</p>
          <p className="text-fs-sm text-muted-foreground">
            Due {money(due)}
            {amount ? (
              change >= 0 ? (
                <span className="font-bold text-success"> · Change {money(change)}</span>
              ) : (
                <span className="font-bold text-destructive">
                  {" "}
                  · Short {money(Math.abs(change))}
                </span>
              )
            ) : null}
          </p>
        </div>

        {denominations ? (
          <div className="no-scrollbar -mx-1 flex shrink-0 snap-x gap-2 overflow-x-auto px-1 pb-1">
            {cashDenominations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setAmount(String(Math.round((entered + d) * 100) / 100))}
                className="min-h-tap min-w-[4.5rem] shrink-0 snap-start rounded-pill border border-border bg-surface px-4 text-fs-base font-extrabold text-foreground shadow-sm transition-colors hover:bg-muted active:scale-[0.97]"
              >
                ${d}
              </button>
            ))}
          </div>
        ) : null}

        <NumPad
          className="min-h-[calc(4*var(--key-h)+1.5rem)] flex-1 shrink-0"
          onDigit={(d) =>
            setAmount((cur) => {
              if (d === "." && cur.includes(".")) return cur;
              const next = `${cur}${d}`;
              return next.length > 9 ? cur : next;
            })
          }
          onBackspace={() => setAmount((cur) => cur.slice(0, -1))}
        />
      </div>

      <div className="shrink-0 border-t border-border bg-surface p-3">
        <button
          type="button"
          disabled={entered <= 0}
          onClick={() => onCommit(entered)}
          className={cn(
            "h-ctl-lg w-full rounded-pill bg-accent text-fs-base font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40",
          )}
        >
          {actionLabel ? actionLabel(entered) : `Charge ${money(entered || due)}`}
        </button>
      </div>
    </div>
  );
}
