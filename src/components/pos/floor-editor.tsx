import { ChevronDown, Minus, Plus, RotateCcw, RotateCw, Sparkles, Trash2 } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { DecorShape, Seats, uprightSpin } from "@/components/pos/floor-canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  floorCounts,
  hasFootprint,
  isDecor,
  isZone,
  kindMeta,
  kindString,
  tidyLayout,
  type CustomFloorKind,
  type CustomKindCategory,
  type FloorObject,
  type FloorObjectKind,
} from "@/lib/floor-data";
import { cn } from "@/lib/utils";

const paletteGroups: {
  label: string;
  menu: string;
  category: CustomKindCategory;
  kinds: FloorObjectKind[];
}[] = [
  { label: "Seating", menu: "Add seating", category: "seating", kinds: ["table", "booth", "bar-chair"] },
  {
    label: "Fixtures",
    menu: "Add fixture",
    category: "fixture",
    kinds: ["bar", "counter", "wall", "door", "plant"],
  },
  {
    label: "Zones",
    menu: "Add zone",
    category: "zone",
    kinds: ["zone-kitchen", "zone-private-dining", "zone-patio", "zone-lounge"],
  },
];

const SNAP = 2;
const snap = (n: number) => Math.round(Math.min(96, Math.max(4, n)) / SNAP) * SNAP;
const ROT_STEP = 15;
const norm = (deg: number) => ((Math.round(deg / ROT_STEP) * ROT_STEP % 360) + 360) % 360;


/**
 * Editable floor layout: drag objects to reposition them, drag the corner handle to
 * rotate, add seating, fixtures and zones from the toolbar, and tune the selection.
 */
export function FloorEditor({
  objects,
  onChange,
  onReset,
  onResetDefault,
  toolbarExtra,
  customKinds = [],
  onAddCustomKind,
  onDeleteCustomKind,
}: {
  objects: FloorObject[];
  onChange: (next: FloorObject[]) => void;
  /** Restore the layout that was saved before this edit session. */
  onReset?: () => void;
  /** Restore the original seeded layout for this floor. */
  onResetDefault?: () => void;
  /** Extra toolbar controls, such as the Template menu. */
  toolbarExtra?: ReactNode;
  /** Venue defined object types shown alongside the built-in ones. */
  customKinds?: CustomFloorKind[];
  onAddCustomKind?: (kind: Omit<CustomFloorKind, "id">) => void;
  onDeleteCustomKind?: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newKind, setNewKind] = useState<CustomKindCategory | null>(null);
  const [newKindName, setNewKindName] = useState("");
  const [newKindSeats, setNewKindSeats] = useState(4);
  const dragRef = useRef<{ id: string; mode: "move" | "rotate" } | null>(null);
  const selected = objects.find((o) => o.id === selectedId) ?? null;

  // Counts read from the same helper the grid list uses, so they always agree.
  const { tables: tableCount, chairs: chairCount } = floorCounts(objects);

  const patch = useCallback(
    (id: string, next: Partial<FloorObject>) =>
      onChange(objects.map((o) => (o.id === id ? { ...o, ...next } : o))),
    [objects, onChange],
  );

  const add = (kind: FloorObjectKind) => {
    const meta = kindMeta(kind, customKinds);
    const count = objects.filter((o) => o.kind === kind).length + 1;
    const next: FloorObject = {
      id: `fo-${kind}-${Date.now()}`,
      kind,
      name:
        kind === "table"
          ? `T${count}`
          : kind === "bar-chair"
            ? `S${count}`
            : `${meta.label}${count > 1 ? ` ${count}` : ""}`,
      seats: meta.seats,
      rotation: 0,
      shape: kind === "table" ? "round" : (meta.shape ?? "square"),
      section: "B1",
      // Stagger drops so a new object never lands exactly on the last one.
      x: snap(30 + ((objects.length * 8) % 50)),
      y: snap(30 + ((objects.length * 6) % 40)),
      ...(hasFootprint(kind) ? { w: meta.w ?? 30, h: meta.h ?? 8 } : {}),
    };
    onChange([...objects, next]);
    setSelectedId(next.id);
  };

  const saveNewKind = () => {
    const label = newKindName.trim();
    if (!newKind || !label || !onAddCustomKind) return;
    onAddCustomKind({
      label,
      category: newKind,
      seats: newKind === "seating" ? Math.max(0, Math.min(25, newKindSeats)) : 0,
      shape: "square",
      ...(newKind === "zone" ? { w: 28, h: 22 } : newKind === "fixture" ? { w: 30, h: 8 } : {}),
    });
    setNewKind(null);
    setNewKindName("");
    setNewKindSeats(4);
  };


  const onPointerDown = (e: React.PointerEvent, id: string, mode: "move" | "rotate") => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id, mode };
    setSelectedId(id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    if (drag.mode === "rotate") {
      const target = objects.find((o) => o.id === drag.id);
      if (!target) return;
      // Angle from the object centre to the pointer, offset so the handle sits at 45deg.
      const dx = (px - target.x) * rect.width;
      const dy = (py - target.y) * rect.height;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI - 45;
      patch(drag.id, { rotation: norm(deg) });
      return;
    }

    let next: Partial<FloorObject> = { x: snap(px), y: snap(py) };
    const moving = objects.find((o) => o.id === drag.id);
    if (moving?.kind === "bar-chair") {
      // Stools line up along the nearest bar or counter so seating reads cleanly.
      const rail = objects
        .filter((o) => o.kind === "bar" || o.kind === "counter")
        .map((o) => ({ o, d: Math.hypot(o.x - px, o.y - py) }))
        .sort((a, b) => a.d - b.d)[0];
      if (rail && rail.d < 14) {
        const edge = (rail.o.h ?? 8) / 2 + 3;
        next = {
          x: snap(px),
          y: snap(py > rail.o.y ? rail.o.y + edge : rail.o.y - edge),
          rotation: rail.o.rotation ?? 0,
        };
      }
    }
    patch(drag.id, next);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* Toolbar: add menus, templates, reset and the live counts. */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 rounded-card border border-border bg-surface p-1.5">
        {paletteGroups.map((group) => {
          const mine = customKinds.filter((k) => k.category === group.category);
          const kinds: FloorObjectKind[] = [...group.kinds, ...mine.map(kindString)];
          return (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger className="inline-flex min-h-ctl-sm shrink-0 items-center gap-1 rounded-pill border border-border bg-surface px-2.5 text-fs-xs font-bold uppercase text-foreground transition-colors hover:bg-muted">
                <Plus className="size-3.5" aria-hidden />
                {group.label}
                <ChevronDown className="size-3.5 shrink-0" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-56">
                <DropdownMenuLabel className="text-fs-xs uppercase text-muted-foreground">
                  {group.menu}
                </DropdownMenuLabel>
                {kinds.map((kind) => {
                  const meta = kindMeta(kind, customKinds);
                  const detail = hasFootprint(kind)
                    ? `${meta.w ?? 30} x ${meta.h ?? 8}`
                    : meta.seats > 0
                      ? `${meta.seats} seats`
                      : "";
                  return (
                    <DropdownMenuItem
                      key={kind}
                      className="text-fs-sm font-normal text-foreground"
                      onClick={() => add(kind)}
                    >
                      <span className="min-w-0 flex-1 truncate">{meta.label}</span>
                      {detail ? (
                        <span className="ml-2 shrink-0 text-fs-xs text-muted-foreground">
                          {detail}
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                  );
                })}
                {onAddCustomKind ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-fs-sm font-bold text-foreground"
                      onClick={() => {
                        setNewKind(group.category);
                        setNewKindName("");
                      }}
                    >
                      <Plus className="size-3.5" aria-hidden />
                      Add new type
                    </DropdownMenuItem>
                    {mine.length && onDeleteCustomKind ? (
                      <>
                        <DropdownMenuLabel className="text-fs-xs uppercase text-muted-foreground">
                          Remove my types
                        </DropdownMenuLabel>
                        {mine.map((k) => (
                          <DropdownMenuItem
                            key={k.id}
                            className="text-fs-sm font-normal text-destructive"
                            onClick={() => onDeleteCustomKind(k.id)}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">{k.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </>
                    ) : null}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}


        {toolbarExtra}

        {/* Tidy up snaps everything back into an even, orderly arrangement. */}
        <button
          type="button"
          onClick={() => {
            onChange(tidyLayout(objects));
            setSelectedId(null);
          }}
          className="inline-flex min-h-ctl-sm shrink-0 items-center gap-1 rounded-pill border border-border bg-surface px-2.5 text-fs-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3.5" aria-hidden />
          Tidy up
        </button>



        {onReset || onResetDefault ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex min-h-ctl-sm shrink-0 items-center gap-1 rounded-pill border border-border bg-surface px-2.5 text-fs-xs font-bold uppercase text-foreground transition-colors hover:bg-muted">
              <RotateCcw className="size-3.5" aria-hidden />
              Reset
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {onReset ? (
                <DropdownMenuItem
                  className="text-fs-sm font-normal text-foreground"
                  onClick={onReset}
                >
                  Reset to saved layout
                </DropdownMenuItem>
              ) : null}
              {onResetDefault ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-fs-sm font-normal text-foreground"
                    onClick={onResetDefault}
                  >
                    Reset to default layout
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <span className="ml-auto shrink-0 rounded-pill bg-muted px-2.5 py-1 text-fs-xs font-bold uppercase text-muted-foreground">
          Tables {tableCount} / Chairs {chairCount}
        </span>
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
          const stool = o.kind === "bar-chair";
          return (
            <div
              key={o.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 touch-none",
                isZone(o.kind) ? "z-0" : active ? "z-30" : "z-20",
              )}
              style={{ left: `${o.x}%`, top: `${o.y}%` }}
            >
              <div className="relative">
                <button
                  type="button"
                  onPointerDown={(e) => onPointerDown(e, o.id, "move")}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onDoubleClick={() => {
                    setSelectedId(o.id);
                    setRenamingId(o.id);
                  }}
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
                        "relative grid place-items-center border-2 border-foreground/40 text-foreground",
                        stool
                          ? "size-[clamp(1.5rem,3vw,2.25rem)] rounded-full"
                          : "size-[clamp(2.5rem,5.5vw,4.25rem)]",
                        stool ? "" : o.shape === "round" ? "rounded-full" : "rounded-md",
                      )}
                      style={{ transform: `rotate(${o.rotation ?? 0}deg)` }}
                    >
                      {/* Seat dots match the seats stepper, so counts never drift. */}
                      {stool ? null : <Seats seats={o.seats} />}
                      <span
                        className="max-w-[86%] truncate text-[clamp(0.5rem,1.1vw,0.7rem)] font-bold leading-none text-foreground"
                        style={{ transform: `rotate(${uprightSpin(o.rotation)}deg)` }}
                      >
                        {o.label || o.name}
                      </span>
                    </span>

                  )}
                </button>

                {/* Rotate handle on the selected object. */}
                {active ? (
                  <button
                    type="button"
                    onPointerDown={(e) => onPointerDown(e, o.id, "rotate")}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    aria-label={`Rotate ${o.name}`}
                    className="absolute -bottom-3 -right-3 grid size-7 cursor-grab place-items-center rounded-pill bg-primary text-primary-foreground shadow-sm"
                  >
                    <RotateCw className="size-3.5" aria-hidden />
                  </button>
                ) : null}

                {/* Inline rename on double tap. */}
                {renamingId === o.id ? (
                  <input
                    autoFocus
                    value={o.name}
                    onChange={(e) => patch(o.id, { name: e.target.value.slice(0, 24) })}
                    onBlur={() => setRenamingId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") setRenamingId(null);
                    }}
                    aria-label={`Rename ${o.name}`}
                    className="absolute left-1/2 top-full z-40 mt-1 w-32 -translate-x-1/2 rounded-row border border-border bg-surface px-2 py-1 text-center text-fs-xs font-bold text-foreground outline-none"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
        {objects.length === 0 ? (
          <p className="grid h-full place-items-center px-6 text-center text-fs-sm text-muted-foreground">
            Add seating, fixtures or zones, or load a template
          </p>
        ) : null}
      </div>

      {/* Inspector */}
      {selected ? (
        <div className="shrink-0 rounded-card border border-border bg-surface p-2.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
            <input
              value={selected.name}
              onChange={(e) => patch(selected.id, { name: e.target.value.slice(0, 24) })}
              aria-label="Name"
              className="min-h-ctl-sm w-full min-w-0 rounded-row bg-muted px-3 text-fs-sm font-bold text-foreground outline-none"
            />
            <input
              value={selected.label ?? ""}
              onChange={(e) => patch(selected.id, { label: e.target.value.slice(0, 8) })}
              placeholder="Short"
              aria-label="Short label"
              className="min-h-ctl-sm w-20 shrink-0 rounded-row bg-muted px-2 text-center text-fs-xs font-bold text-foreground outline-none placeholder:text-muted-foreground"
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

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Rotation applies to every object type. */}
            <div className="flex items-center gap-1 rounded-pill bg-muted p-1">
              <button
                type="button"
                aria-label="Rotate left"
                onClick={() =>
                  patch(selected.id, { rotation: norm((selected.rotation ?? 0) - ROT_STEP) })
                }
                className="grid size-8 place-items-center rounded-pill text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-12 text-center text-fs-xs font-bold text-foreground">
                {selected.rotation ?? 0} deg
              </span>
              <button
                type="button"
                aria-label="Rotate right"
                onClick={() =>
                  patch(selected.id, { rotation: norm((selected.rotation ?? 0) + ROT_STEP) })
                }
                className="grid size-8 place-items-center rounded-pill text-foreground"
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Turn 90 degrees"
                onClick={() =>
                  patch(selected.id, { rotation: norm((selected.rotation ?? 0) + 90) })
                }
                className="grid size-8 place-items-center rounded-pill text-foreground"
              >
                <RotateCw className="size-4" />
              </button>
            </div>

            {!isDecor(selected.kind) ? (
              <>
                <div className="flex items-center gap-1 rounded-pill bg-muted p-1">
                  <button
                    type="button"
                    aria-label="Fewer seats"
                    onClick={() => patch(selected.id, { seats: Math.max(1, selected.seats - 1) })}
                    className="grid size-8 place-items-center rounded-pill text-foreground"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-14 text-center text-fs-xs font-bold text-foreground">
                    {selected.seats} guests
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

                {selected.kind !== "bar-chair" ? (
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
                ) : null}
              </>
            ) : null}

            {hasFootprint(selected.kind)
              ? (
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
                    <span className="min-w-16 text-center text-fs-xs font-bold text-foreground">
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
                ))
              : null}

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
        </div>
      ) : (
        <p className="shrink-0 text-center text-fs-xs text-muted-foreground">
          Drag to move, drag the pink handle to rotate. Double tap to rename.
        </p>
      )}
    </div>
  );
}
