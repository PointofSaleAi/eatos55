import { Minus, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { DecorShape } from "@/components/pos/floor-canvas";
import {
  floorObjectKindMeta,
  isDecor,
  type FloorObject,
  type FloorObjectKind,
} from "@/lib/floor-data";
import { cn } from "@/lib/utils";

const paletteKinds: FloorObjectKind[] = [
  "table",
  "booth",
  "bar",
  "counter",
  "wall",
  "door",
  "plant",
];

const SNAP = 2;
const snap = (n: number) => Math.round(Math.min(96, Math.max(4, n)) / SNAP) * SNAP;

/**
 * Editable floor layout: drag objects to reposition them, add tables and fixtures
 * from the palette, and tune the selected object in the inspector.
 */
export function FloorEditor({
  objects,
  onChange,
}: {
  objects: FloorObject[];
  onChange: (next: FloorObject[]) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null);
  const selected = objects.find((o) => o.id === selectedId) ?? null;

  const patch = useCallback(
    (id: string, next: Partial<FloorObject>) =>
      onChange(objects.map((o) => (o.id === id ? { ...o, ...next } : o))),
    [objects, onChange],
  );

  const add = (kind: FloorObjectKind) => {
    const meta = floorObjectKindMeta[kind];
    const count = objects.filter((o) => o.kind === kind).length + 1;
    const next: FloorObject = {
      id: `fo-${kind}-${Date.now()}`,
      kind,
      name: kind === "table" ? `T${count}` : `${meta.label}${count > 1 ? ` ${count}` : ""}`,
      seats: meta.seats,
      shape: kind === "table" ? "round" : "square",
      section: "B1",
      x: 50,
      y: 50,
      ...(kind === "bar" || kind === "counter" || kind === "wall"
        ? { w: 40, h: 8 }
        : {}),
    };
    onChange([...objects, next]);
    setSelectedId(next.id);
  };

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id, moved: false };
    setSelectedId(id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    drag.moved = true;
    patch(drag.id, {
      x: snap(((e.clientX - rect.left) / rect.width) * 100),
      y: snap(((e.clientY - rect.top) / rect.height) * 100),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* Palette */}
      <div className="no-scrollbar flex shrink-0 items-center gap-2 overflow-x-auto">
        {paletteKinds.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => add(kind)}
            className="inline-flex min-h-ctl-sm shrink-0 items-center gap-1 rounded-pill border border-border bg-surface px-3 text-fs-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="size-3.5" aria-hidden />
            {floorObjectKindMeta[kind].label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-card border-2 border-dashed border-border bg-surface"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, currentColor 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, currentColor 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "5% 8%",
        }}
      >
        {objects.map((o) => {
          const active = o.id === selectedId;
          return (
            <div
              key={o.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 touch-none"
              style={{ left: `${o.x}%`, top: `${o.y}%` }}
            >
              <button
                type="button"
                onPointerDown={(e) => onPointerDown(e, o.id)}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                aria-label={`Move ${o.name}`}
                className={cn(
                  "grid cursor-grab place-items-center rounded-md p-0.5 outline-none",
                  active && "ring-2 ring-primary",
                )}
              >
                {isDecor(o.kind) ? (
                  <DecorShape object={o} />
                ) : (
                  <span
                    className={cn(
                      "grid size-[clamp(2.5rem,5.5vw,4.25rem)] place-items-center border-2 border-foreground/40",
                      o.shape === "round" ? "rounded-full" : "rounded-md",
                    )}
                  >
                    <span className="max-w-[80%] truncate text-[clamp(0.5rem,1.1vw,0.7rem)] font-bold leading-none text-foreground">
                      {o.name}
                    </span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
        {objects.length === 0 ? (
          <p className="grid h-full place-items-center px-6 text-center text-fs-sm text-muted-foreground">
            Add tables and fixtures, or load a template
          </p>
        ) : null}
      </div>

      {/* Inspector */}
      {selected ? (
        <div className="shrink-0 rounded-card border border-border bg-surface p-2.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <input
              value={selected.name}
              onChange={(e) => patch(selected.id, { name: e.target.value.slice(0, 12) })}
              aria-label="Name"
              className="min-h-ctl-sm w-full min-w-0 rounded-row bg-muted px-3 text-fs-sm font-bold text-foreground outline-none"
            />
            <button
              type="button"
              onClick={() => {
                onChange(objects.filter((o) => o.id !== selected.id));
                setSelectedId(null);
              }}
              aria-label={`Delete ${selected.name}`}
              className="grid size-9 shrink-0 place-items-center rounded-pill border border-border text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {!isDecor(selected.kind) ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-pill bg-muted p-1">
                <button
                  type="button"
                  aria-label="Fewer seats"
                  onClick={() => patch(selected.id, { seats: Math.max(1, selected.seats - 1) })}
                  className="grid size-8 place-items-center rounded-pill text-foreground"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-10 text-center text-fs-xs font-bold text-foreground">
                  {selected.seats} seats
                </span>
                <button
                  type="button"
                  aria-label="More seats"
                  onClick={() => patch(selected.id, { seats: Math.min(20, selected.seats + 1) })}
                  className="grid size-8 place-items-center rounded-pill text-foreground"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 rounded-pill bg-muted p-1">
                {(["round", "square"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => patch(selected.id, { shape: s })}
                    aria-pressed={selected.shape === s}
                    className={cn(
                      "min-h-8 rounded-pill px-3 text-fs-xs font-bold uppercase",
                      selected.shape === s
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-pill bg-muted p-1">
                {(["B1", "B2"] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => patch(selected.id, { section: sec })}
                    aria-pressed={selected.section === sec}
                    className={cn(
                      "min-h-8 rounded-pill px-3 text-fs-xs font-bold uppercase",
                      selected.section === sec
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>
          ) : selected.kind === "bar" || selected.kind === "counter" || selected.kind === "wall" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(
                [
                  { key: "w" as const, label: "Width" },
                  { key: "h" as const, label: "Depth" },
                ]
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1 rounded-pill bg-muted p-1">
                  <button
                    type="button"
                    aria-label={`Less ${label}`}
                    onClick={() =>
                      patch(selected.id, { [key]: Math.max(4, (selected[key] ?? 20) - 4) })
                    }
                    className="grid size-8 place-items-center rounded-pill text-foreground"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-14 text-center text-fs-xs font-bold text-foreground">
                    {label} {selected[key] ?? 20}
                  </span>
                  <button
                    type="button"
                    aria-label={`More ${label}`}
                    onClick={() =>
                      patch(selected.id, { [key]: Math.min(90, (selected[key] ?? 20) + 4) })
                    }
                    className="grid size-8 place-items-center rounded-pill text-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="shrink-0 text-center text-fs-xs text-muted-foreground">
          Drag to move. Tap an object to rename, resize or delete it.
        </p>
      )}
    </div>
  );
}
