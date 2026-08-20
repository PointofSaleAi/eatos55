import { AmountEntryPanel } from "@/components/pos/amount-entry";
import { BackButton, useWideLayout } from "@/components/pos/shell";

/**
 * Full-screen tender route: header plus the shared cash / amount panel so
 * every place cash is taken looks identical.
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
  onCommit: (amount: number, notes?: Record<number, number>) => void;
}) {
  const wide = useWideLayout();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-2 py-3">
        <BackButton fallbackTo="/payment/method" label="Back to payment methods" />
        <h1 className="truncate text-fs-xl font-extrabold text-foreground">{title}</h1>
      </div>

      <AmountEntryPanel
        due={due}
        denominations={denominations}
        initialAmount={initialAmount}
        {...(actionLabel ? { actionLabel } : {})}
        onCommit={onCommit}
        wide={wide}
        className="pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))]"
      />
    </div>
  );
}
