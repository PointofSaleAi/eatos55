import {
  serviceOrderTypeLabels,
  serviceOrderTypes,
  type ServiceOrderType,
} from "@/lib/demo-data";
import { orderTypeIcons } from "@/components/pos/guest-sheet";
import { cn } from "@/lib/utils";

/**
 * The service type row (Dine-In, Takeout, Delivery, ...). One control shared by
 * the order panel and the charge screen so both look and behave identically on
 * phone, tablet and desktop. The row scrolls by swipe or trackpad; it carries no
 * chevron button at its right end.
 */
export function OrderTypeStrip({
  value,
  onSelect,
  className,
}: {
  value: ServiceOrderType;
  onSelect: (type: ServiceOrderType) => void;
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar flex gap-2 overflow-x-auto scroll-smooth", className)}>
      {serviceOrderTypes.map((t) => {
        const Icon = orderTypeIcons[t];
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(t)}
            className={cn(
              "flex min-h-ctl-xs shrink-0 items-center justify-center gap-1.5 rounded-row px-2.5 text-fs-xs font-extrabold uppercase tracking-[-0.02em] transition-colors md:px-3",
              active
                ? "border-2 border-foreground bg-surface text-foreground shadow-sm"
                : "border border-transparent bg-muted text-muted-foreground hover:bg-secondary",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{serviceOrderTypeLabels[t]}</span>
          </button>
        );
      })}
    </div>
  );
}
