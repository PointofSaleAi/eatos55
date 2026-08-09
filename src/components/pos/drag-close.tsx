import { useRef, useState } from "react";

/**
 * Swipe-down-to-close for bottom sheets.
 * Spread `handleProps` on the grab handle (or header) and apply `dragStyle`
 * to the sheet content element.
 */
export function useSheetDrag(onClose: () => void, threshold = 90) {
  const [dy, setDy] = useState(0);
  const startY = useRef<number | null>(null);
  const dragging = startY.current !== null;

  const end = () => {
    if (startY.current === null) return;
    const moved = dy;
    startY.current = null;
    if (moved > threshold) {
      setDy(0);
      onClose();
    } else {
      setDy(0);
    }
  };

  return {
    dragStyle: {
      transform: dy ? `translateY(${dy}px)` : undefined,
      transition: dragging ? "none" : "transform 200ms ease-out",
      touchAction: "none" as const,
    },
    handleProps: {
      onPointerDown: (e: React.PointerEvent) => {
        startY.current = e.clientY;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (startY.current === null) return;
        setDy(Math.max(0, e.clientY - startY.current));
      },
      onPointerUp: end,
      onPointerCancel: end,
      style: { touchAction: "none" as const },
    },
  };
}

/** Visual grab handle for a draggable bottom sheet. */
export function SheetGrabber({
  handleProps,
  className,
}: {
  handleProps: ReturnType<typeof useSheetDrag>["handleProps"];
  className?: string;
}) {
  return (
    <div
      {...handleProps}
      aria-hidden
      className={`flex shrink-0 cursor-grab items-center justify-center pb-1 pt-2 active:cursor-grabbing ${className ?? ""}`}
    >
      <span className="h-1.5 w-10 rounded-pill bg-border" />
    </div>
  );
}
