import { isDecor, tableStateMeta, type FloorObject, type FloorTable } from "@/lib/floor-data";
import { cn } from "@/lib/utils";

/** Seat dots drawn around a table shape so capacity reads at a glance. */
function Seats({ seats }: { seats: number }) {
  const count = Math.min(8, Math.max(1, seats));
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI;
        const r = 58;
        const left = 50 + Math.cos(angle - Math.PI / 2) * r;
        const top = 50 + Math.sin(angle - Math.PI / 2) * r;
        return (
          <span
            key={i}
            aria-hidden
            className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-70"
            style={{ left: `${left}%`, top: `${top}%` }}
          />
        );
      })}
    </>
  );
}

/** Bars, counters, walls, doors and plants: shown for orientation, never tappable. */
export function DecorShape({ object }: { object: FloorObject }) {
  const isBlock = object.kind === "bar" || object.kind === "counter" || object.kind === "wall";
  return (
    <span
      className={cn(
        "grid place-items-center border-2 border-dashed border-border bg-muted/60 text-fs-xs font-bold uppercase tracking-wide text-muted-foreground",
        object.kind === "plant" ? "rounded-full" : "rounded-md",
      )}
      style={
        isBlock
          ? { width: `${(object.w ?? 40) * 4}px`, height: `${(object.h ?? 8) * 4}px` }
          : { width: "2.75rem", height: "2.75rem" }
      }
    >
      <span className="max-w-[90%] truncate px-1">{object.name}</span>
    </span>
  );
}

/**
 * Spatial floor view: tables sit at their real positions on a scaled canvas so the
 * whole plan always fits without scrolling.
 */
export function FloorCanvas({
  tables,
  decor = [],
  onOpen,
  onStatus,
}: {
  tables: FloorTable[];
  decor?: FloorObject[];
  onOpen: (t: FloorTable) => void;
  onStatus: (t: FloorTable) => void;
}) {
  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-card border border-border bg-surface">
      {decor
        .filter((o) => isDecor(o.kind))
        .map((o) => (
          <div
            key={o.id}
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${o.x}%`, top: `${o.y}%` }}
          >
            <DecorShape object={o} />
          </div>
        ))}
      {tables.map((t) => {
        const meta = tableStateMeta[t.state];
        const shape = t.shape ?? "round";
        return (
          <div
            key={t.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${t.x ?? 50}%`, top: `${t.y ?? 50}%` }}
          >
            <button
              type="button"
              onClick={() => onOpen(t)}
              onContextMenu={(e) => {
                e.preventDefault();
                onStatus(t);
              }}
              title={t.name}
              className="group grid place-items-center gap-1 text-center transition-transform active:scale-[0.97]"
            >
              <span
                className={cn(
                  "relative grid size-[clamp(2.5rem,5.5vw,4.25rem)] place-items-center border-2",
                  meta.ring,
                  meta.text,
                  shape === "round" ? "rounded-full" : "rounded-md",
                )}
              >
                <Seats seats={t.seats} />
                <span className="max-w-[80%] truncate text-[clamp(0.5rem,1.1vw,0.7rem)] font-bold leading-none text-foreground">
                  {t.name}
                </span>
              </span>
              <span
                className={cn(
                  "hidden max-w-[5rem] truncate text-[0.5rem] font-bold uppercase tracking-wide sm:block",
                  meta.text,
                )}
              >
                {meta.label}
              </span>
            </button>
          </div>
        );
      })}
      {tables.length === 0 && decor.length === 0 ? (
        <p className="grid h-full place-items-center text-fs-sm text-muted-foreground">
          No Tables Found
        </p>
      ) : null}
    </div>
  );
}
