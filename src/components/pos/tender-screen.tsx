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
        <h1 className="truncate text-2xl font-extrabold text-foreground">{title}</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 pb-[max(0.75rem,var(--kb-inset,0px))]">
        <div className="shrink-0 text-center">
          <p className="text-3xl font-extrabold tabular-nums text-foreground">{money(entered)}</p>
          <p className="text-sm text-muted-foreground">
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
          <div className="grid shrink-0 grid-cols-[repeat(auto-fill,minmax(6.25rem,1fr))] gap-2">
            {cashDenominations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setAmount(String(Math.round((entered + d) * 100) / 100))}
                className="min-h-ctl-lg rounded-full border border-border bg-surface text-base font-extrabold text-foreground shadow-sm transition-colors hover:bg-muted active:scale-[0.97]"
              >
                ${d}
              </button>
            ))}
          </div>
        ) : null}

        <NumPad
          className="min-h-0 flex-1"
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
            "h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40",
          )}
        >
          {actionLabel ? actionLabel(entered) : `Charge ${money(entered || due)}`}
        </button>
      </div>
    </div>
  );
}
