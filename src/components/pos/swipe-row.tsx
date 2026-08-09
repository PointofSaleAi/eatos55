import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export type SwipeAction = {
  label: string;
  onAction: () => void;
  destructive?: boolean;
};

/**
 * Row with an optional swipe-left action. Every swipe action must also be
 * reachable by tap elsewhere in the UI, so nothing is swipe-only.
 */
export function SwipeRow({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: SwipeAction | undefined;
  className?: string | undefined;
}) {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const locked = useRef(false);
  const width = 96;

  if (!action) return <div className={className}>{children}</div>;

  const end = () => {
    if (startX.current === null) return;
    startX.current = null;
    startY.current = null;
    locked.current = false;
    setDx((d) => (d < -width * 0.6 ? -width : 0));
  };

  return (
    <div className={cn("relative overflow-hidden rounded-card", className)}>
      <button
        type="button"
        aria-hidden={dx === 0}
        tabIndex={-1}
        onClick={() => {
          setDx(0);
          haptic(action.destructive ? "error" : "medium");
          action.onAction();
        }}
        style={{ width }}
        className={cn(
          "absolute inset-y-0 right-0 grid place-items-center text-fs-sm font-extrabold",
          action.destructive
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        {action.label}
      </button>
      <div
        onTouchStart={(e) => {
          startX.current = e.touches[0]?.clientX ?? null;
          startY.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchMove={(e) => {
          if (startX.current === null || startY.current === null) return;
          const x = e.touches[0]?.clientX ?? startX.current;
          const y = e.touches[0]?.clientY ?? startY.current;
          if (!locked.current) {
            if (Math.abs(y - startY.current) > Math.abs(x - startX.current)) {
              // Vertical intent: let the list scroll.
              startX.current = null;
              return;
            }
            if (Math.abs(x - startX.current) < 8) return;
            locked.current = true;
          }
          setDx(Math.max(-width, Math.min(0, x - startX.current)));
        }}
        onTouchEnd={end}
        onTouchCancel={end}
        style={{
          transform: dx ? `translateX(${dx}px)` : undefined,
          transition: startX.current === null ? "transform 180ms ease-out" : "none",
        }}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}
