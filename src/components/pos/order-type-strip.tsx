import { useRef } from "react";
import { ChevronRight } from "lucide-react";

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
 * phone, tablet and desktop.
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
  const stripRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("relative", className)}>
      <div ref={stripRef} className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth pr-8">
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
                "flex min-h-ctl-md shrink-0 items-center justify-center gap-1.5 rounded-row px-2.5 text-fs-xs font-extrabold uppercase tracking-[-0.02em] transition-colors md:min-h-tap md:px-3",
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
      <button
        type="button"
        aria-label="More order types"
        onClick={() =>
          stripRef.current?.scrollBy({
            left: stripRef.current.clientWidth * 0.7,
            behavior: "smooth",
          })
        }
        className="absolute right-0 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-pill border border-border bg-surface text-foreground shadow-sm"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}
