import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Receipt-styled card used by the payment and split-check screens.
 * The zig-zag edges are drawn with a mask utility so they follow the card colour.
 */
export function ReceiptCard({
  children,
  className,
  watermark,
  topAction,
}: {
  children: ReactNode;
  className?: string;
  /** Large ghost number shown behind the content (split checks). */
  watermark?: ReactNode;
  /** Corner control, e.g. the remove badge on a child check. */
  topAction?: ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      {topAction ? <div className="absolute right-1.5 top-1.5 z-10">{topAction}</div> : null}
      <div className="receipt-edge text-surface" aria-hidden />
      <div className="relative overflow-hidden bg-surface px-3 py-3">
        {watermark ? (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-2 select-none text-[3.25rem] font-black leading-none text-muted-foreground/10"
          >
            {watermark}
          </span>
        ) : null}
        <div className="relative">{children}</div>
      </div>
      <div className="receipt-edge-bottom text-surface" aria-hidden />
    </div>
  );
}

/** Label / value line inside a receipt card. */
export function ReceiptRow({
  label,
  value,
  tone = "muted",
  strong,
}: {
  label: string;
  value: string;
  tone?: "muted" | "accent" | "foreground";
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 text-fs-sm",
        tone === "accent" && "text-accent",
        tone === "muted" && "text-muted-foreground",
        tone === "foreground" && "text-foreground",
        strong && "font-extrabold text-foreground",
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}
