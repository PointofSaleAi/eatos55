import {
  hasFootprint,
  isDecor,
  isZone,
  tableStateMeta,
  type FloorObject,
  type FloorTable,
} from "@/lib/floor-data";
import { cn } from "@/lib/utils";

/** Seat dots drawn around a table shape so capacity reads at a glance. */
export function Seats({ seats }: { seats: number }) {
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

/** Keeps a rotated label the right way up: past 90 degrees the text would invert. */
export function uprightSpin(rotation = 0) {
  const deg = ((rotation % 360) + 360) % 360;
  return deg > 90 && deg < 270 ? 180 : 0;
}

/** Label sizing that shrinks with the footprint instead of clipping. */
function fitLabel(object: FloorObject) {
  if (!hasFootprint(object.kind)) return "text-fs-xs";
  const area = (object.w ?? 20) * (object.h ?? 8);
  if (area > 400) return "text-[clamp(0.6rem,1.4vw,0.95rem)]";
  if (area > 140) return "text-[clamp(0.5rem,1.1vw,0.75rem)]";
  return "text-[clamp(0.45rem,0.9vw,0.65rem)]";
}

/** Bars, counters, walls, doors, plants and zones: shown for orientation, never tappable. */
export function DecorShape({ object }: { object: FloorObject }) {
  const zone = isZone(object.kind);
  const sized = hasFootprint(object.kind);
  return (
    <span
      className={cn(
        "grid place-items-center border-2 border-dashed text-center font-bold uppercase tracking-wide",
        zone
          ? "border-primary/30 bg-primary/5 text-muted-foreground"
          : "border-border bg-muted/60 text-muted-foreground",
        object.kind === "plant" ? "rounded-full" : "rounded-md",
        fitLabel(object),
      )}
      style={{
        transform: `rotate(${object.rotation ?? 0}deg)`,
        ...(sized
          ? { width: `${(object.w ?? 40) * 4}px`, height: `${(object.h ?? 8) * 4}px` }
          : { width: "2.75rem", height: "2.75rem" }),
      }}
    >
      <span
        className="max-w-[92%] px-1 leading-tight [overflow-wrap:anywhere]"
        style={{ transform: `rotate(${uprightSpin(object.rotation)}deg)` }}
      >
        {object.label || object.name}
      </span>
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
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2",
              isZone(o.kind) ? "z-0" : "z-10",
            )}
            style={{ left: `${o.x}%`, top: `${o.y}%` }}
          >
            <DecorShape object={o} />
          </div>
        ))}
      {tables.map((t) => {
        const meta = tableStateMeta[t.state];
        const shape = t.shape ?? "round";
        const stool = t.kind === "bar-chair";
        return (
          <div
            key={t.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
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
                  "relative grid place-items-center border-2",
                  stool
                    ? "size-[clamp(1.5rem,3vw,2.25rem)] rounded-full"
                    : "size-[clamp(2.5rem,5.5vw,4.25rem)]",
                  meta.ring,
                  meta.text,
                  stool ? "" : shape === "round" ? "rounded-full" : "rounded-md",
                )}
                style={{ transform: `rotate(${t.rotation ?? 0}deg)` }}
              >
                {stool ? null : <Seats seats={t.seats} />}
                <span
                  className="max-w-[86%] truncate text-[clamp(0.5rem,1.1vw,0.7rem)] font-bold leading-none text-foreground"
                  style={{ transform: `rotate(${uprightSpin(t.rotation)}deg)` }}
                >
                  {t.label || t.name}
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
