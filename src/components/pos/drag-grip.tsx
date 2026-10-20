import { useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export type Side = "left" | "right";

/** Order panel side for this visit (module store: survives navigation, not reloads). */
let panelSide: Side = "right";
const listeners = new Set<() => void>();
export function setOrderPanelSide(side: Side) {
  panelSide = side;
  listeners.forEach((l) => l());
}
export function useOrderPanelSide() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => panelSide,
    () => "right" as Side,
  );
}

/** Six-dot grip: drag to a screen edge (or press arrow keys) to move a panel. */
export function DragGrip({
  label,
  onMove,
  onDragPosition,
  className,
}: {
  label: string;
  onMove: (side: Side) => void;
  onDragPosition: (x: number | null) => void;
  className?: string;
}) {
  const drag = useRef<{ startX: number; moved: boolean } | null>(null);
  return (
    <button
      type="button"
      title={`Drag ${label} to either side; arrow keys move it`}
      aria-label={`Move ${label}`}
      onKeyDown={(e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        onMove(e.key === "ArrowLeft" ? "left" : "right");
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { startX: e.clientX, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const c = drag.current;
        if (!c) return;
        if (Math.abs(e.clientX - c.startX) > 12) c.moved = true;
        if (c.moved) onDragPosition(e.clientX);
      }}
      onPointerUp={(e) => {
        const c = drag.current;
        drag.current = null;
        onDragPosition(null);
        if (!c?.moved) return;
        if (e.clientX <= 120) onMove("left");
        else if (e.clientX >= window.innerWidth - 120) onMove("right");
      }}
      onPointerCancel={() => {
        drag.current = null;
        onDragPosition(null);
      }}
      className={cn(
        "mx-auto flex h-6 w-10 shrink-0 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing",
        className,
      )}
    >
      <span className="grid grid-cols-3 gap-[2px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="size-[3px] rounded-full bg-current" />
        ))}
      </span>
    </button>
  );
}

/** Dashed drop targets on both screen edges while a grip is being dragged. */
export function DropZones({ x }: { x: number | null }) {
  const [w] = useState(() => (typeof window === "undefined" ? 0 : window.innerWidth));
  if (x === null) return null;
  const zone = "pointer-events-none fixed inset-y-2 z-50 w-24 rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30";
  return (
    <>
      <div aria-hidden className={cn(zone, "left-2", x <= 120 && "border-primary bg-primary/15")} />
      <div aria-hidden className={cn(zone, "right-2", x >= (window.innerWidth || w) - 120 && "border-primary bg-primary/15")} />
    </>
  );
}
