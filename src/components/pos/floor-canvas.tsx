import {
  hasFootprint,
  isDecor,
  isZone,
  tableStateMeta,
  type FloorObject,
  type FloorTable,
} from "@/lib/floor-data";
import { cn } from "@/lib/utils";

/**
 * Seat dots drawn around a table shape. Filled dots are guests already seated, so a
 * half-full six top reads at a glance without opening the table. Big parties keep
 * drawing: past ten seats the extras fill a second, inner ring instead of stopping.
 */
export function Seats({ seats, seated = 0 }: { seats: number; seated?: number }) {
  const count = Math.min(25, Math.max(1, seats));
  const filled = Math.min(count, Math.max(0, seated));
  const outer = count <= 10 ? count : Math.ceil(count / 2);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const ring = i < outer ? 0 : 1;
        const inRing = ring === 0 ? outer : count - outer;
        const index = ring === 0 ? i : i - outer;
        const angle = (index / inRing) * 2 * Math.PI + (ring === 1 ? Math.PI / inRing : 0);
        const r = ring === 0 ? 58 : 40;
        const left = 50 + Math.cos(angle - Math.PI / 2) * r;
        const top = 50 + Math.sin(angle - Math.PI / 2) * r;
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-current",
              count > 14 ? "size-1" : "size-1.5",
              i < filled ? "bg-current opacity-100" : "bg-transparent opacity-50",
            )}
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

/** A merged party: several real tables pushed together, read as one group. */
export type FloorGroup = {
  id: string;
  label: string;
  members: string[];
  state: FloorTable["state"];
  seats: number;
  seated: number;
  since?: string;
};

/**
 * Spatial floor view: tables sit at their real positions on a scaled canvas so the
 * whole plan always fits without scrolling.
 */
export function FloorCanvas({
  tables,
  decor = [],
  onOpen,
  onStatus,
  selectedNames = [],
  groups = [],
}: {
  tables: FloorTable[];
  decor?: FloorObject[];
  onOpen: (t: FloorTable) => void;
  onStatus: (t: FloorTable) => void;
  /** Tables picked while merging, drawn with a highlight ring. */
  selectedNames?: string[];
  /** Merged groups drawn as one connected party. */
  groups?: FloorGroup[];
}) {
  const grouped = new Map<string, FloorGroup>();
  for (const g of groups) for (const name of g.members) grouped.set(name, g);

  /** Each group's geometry: centre point plus the box its members occupy. */
  const geoms = groups
    .map((g) => {
      const pts = g.members
        .map((n) => tables.find((t) => t.name === n))
        .filter((t): t is FloorTable => Boolean(t))
        .map((t) => ({ x: t.x ?? 50, y: t.y ?? 50 }));
      if (!pts.length) return null;
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      return {
        group: g,
        pts,
        cx: (Math.min(...xs) + Math.max(...xs)) / 2,
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };
    })
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

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

      {/* Merge halos and the link lines that show which tables were pushed together. */}
      {geoms.length ? (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 z-10 size-full"
        >
          {geoms.map((geo) => (
            <g key={geo.group.id} className={tableStateMeta[geo.group.state].text}>
              <rect
                x={Math.max(0, geo.minX - 7)}
                y={Math.max(0, geo.minY - 7)}
                width={Math.min(100, geo.maxX + 7) - Math.max(0, geo.minX - 7)}
                height={Math.min(100, geo.maxY + 7) - Math.max(0, geo.minY - 7)}
                rx={4}
                ry={4}
                fill="currentColor"
                fillOpacity={0.07}
                stroke="currentColor"
                strokeOpacity={0.5}
                strokeWidth={0.4}
                strokeDasharray="1.5 1.5"
                vectorEffect="non-scaling-stroke"
              />
              {geo.pts.map((p, i) => {
                const next = geo.pts[(i + 1) % geo.pts.length];
                if (geo.pts.length < 2) return null;
                return (
                  <line
                    key={i}
                    x1={p.x}
                    y1={p.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="currentColor"
                    strokeOpacity={0.6}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </g>
          ))}
        </svg>
      ) : null}

      {tables.map((t) => {
        const meta = tableStateMeta[t.state];
        const shape = t.shape ?? "round";
        const stool = t.kind === "bar-chair";
        const seated = t.seated ?? 0;
        const free = t.state === "available" || t.state === "reserved";
        const picked = selectedNames.includes(t.name);
        return (
          <div
            key={t.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${t.x ?? 50}%`, top: `${t.y ?? 50}%` }}
          >
            <div className="relative grid place-items-center gap-1 text-center">
              <button
                type="button"
                onClick={() => onOpen(t)}
                title={t.name}
                aria-pressed={picked || undefined}
                className="group grid place-items-center transition-transform active:scale-[0.97]"
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
                    picked && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
                  )}
                  style={{ transform: `rotate(${t.rotation ?? 0}deg)` }}
                >

                  {stool ? null : <Seats seats={t.seats} seated={seated} />}
                  <span
                    className="grid max-w-[86%] place-items-center leading-none"
                    style={{ transform: `rotate(${uprightSpin(t.rotation)}deg)` }}
                  >
                    <span className="max-w-full truncate text-[clamp(0.5rem,1.1vw,0.7rem)] font-bold text-foreground">
                      {t.label || t.name}
                    </span>
                    {/* Party size and time at the table, the way a host reads a floor. */}
                    {!stool && !free ? (
                      <span className="text-[clamp(0.4rem,0.9vw,0.6rem)] font-bold text-muted-foreground">
                        {seated}/{t.seats}
                        {t.since ? ` · ${t.since}` : ""}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>

              {/*
                Status is its own tap target so state can change without opening an order.
                Phones get a compact dot so labels never collide on a busy floor.
              */}
              <button
                type="button"
                onClick={() => onStatus(t)}
                aria-label={`Change status for ${t.name}, currently ${meta.label}`}
                className={cn(
                  "grid size-4 place-items-center rounded-pill border transition-opacity active:opacity-80 sm:size-auto sm:max-w-[5.5rem] sm:truncate sm:border-0 sm:px-1.5 sm:py-0.5 sm:text-[0.5rem] sm:font-bold sm:uppercase sm:tracking-wide",
                  meta.strip,
                  meta.text,
                  "border-current",
                )}
              >
                <span className="size-1.5 rounded-full bg-current sm:hidden" aria-hidden />
                <span className="hidden sm:inline">{meta.label}</span>
              </button>
            </div>
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
