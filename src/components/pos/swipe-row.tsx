import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export type SwipeAction = {
  label: string;
  onAction: () => void;
  destructive?: boolean;
};

/**
 * Row with an optional swipe-left action. Works with touch and with a mouse or
 * trackpad drag, and keeps vertical scrolling. Every swipe action must also be
 * reachable by tap elsewhere in the UI, so nothing is swipe-only.
 *
 * `wasDragged()` tells a caller whether the last interaction was a drag, so a
 * row's tap control can ignore the click a swipe release leaves behind.
 */
export type SwipeRowHandle = { wasDragged: () => boolean };

export const SwipeRow = forwardRef<SwipeRowHandle, {
  children: ReactNode;
  action?: SwipeAction | undefined;
  className?: string | undefined;
}>(function SwipeRow({ children, action, className }, ref) {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startDx = useRef(0);
  const locked = useRef(false);
  const dragging = useRef(false);
  const width = 96;

  useImperativeHandle(ref, () => ({ wasDragged: () => dragging.current }), []);

  if (!action) return <div className={className}>{children}</div>;

  const end = () => {
    if (startX.current === null) return;
    startX.current = null;
    startY.current = null;
    locked.current = false;
    dragging.current = false;
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
        onDragStart={(e) => e.preventDefault()}
        onTouchStart={(e) => {
          // Touch browsers also fire pointer events; the pointer path below
          // owns touch so a swipe can't be driven twice.
          if (e.touches.length > 1) end();
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          startX.current = e.clientX;
          startY.current = e.clientY;
          startDx.current = dx;
          locked.current = false;
        }}
        onPointerMove={(e) => {
          if (startX.current === null || startY.current === null) return;
          if (!locked.current) {
            if (Math.abs(e.clientY - startY.current) > Math.abs(e.clientX - startX.current)) {
              // Vertical intent: let the list scroll.
              startX.current = null;
              return;
            }
            if (Math.abs(e.clientX - startX.current) < 8) return;
            locked.current = true;
            // Only once a drag is real: capturing keeps the moves coming without
            // stealing the click a plain tap on the row (or the action) needs.
            if (e.pointerType !== "touch") e.currentTarget.setPointerCapture(e.pointerId);
          }
          const moved = Math.max(-width, Math.min(0, startDx.current + e.clientX - startX.current));
          dragging.current = true;
          setDx(moved);
        }}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          transform: dx ? `translateX(${dx}px)` : undefined,
          transition: dragging.current ? "none" : "transform 180ms ease-out",
        }}
        className="relative z-10 touch-pan-y select-none"
      >
        {children}
      </div>
    </div>
  );
});
