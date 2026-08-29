import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import {
  Check,
  ChevronDown,
  Combine,
  LayoutGrid,
  Map as MapIcon,
  Minus,
  Pencil,
  Plus,
  Trash2,
  Unlink,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { FloorCanvas } from "@/components/pos/floor-canvas";
import { FloorEditor } from "@/components/pos/floor-editor";
import { GuestsSheet } from "@/components/pos/guests-sheet";
import { StaffPanel } from "@/components/pos/staff-panel";
import { StatusSheet, type StatusOption } from "@/components/pos/status-sheet";
import { useConfirm } from "@/components/pos/confirm-sheet";

import { MenuButton, ScreenBody } from "@/components/pos/shell";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  cloneLayout,
  defaultFloorLayout,
  floorCounts,
  findMerge,
  floorSections,
  floorTables,
  formatDwell,
  floors,
  isDecor,
  layoutTemplates,
  mergeLabel,
  tableStateMeta,
  tableStateOrder,
  type FloorObject,
  type FloorSection,
  type FloorTable,
  type TableState,
} from "@/lib/floor-data";

import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/floor/")({
  head: () => ({
    meta: [
      { title: `Floor Plan - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content: "Live table status by floor and section, in grid or seating layout view.",
      },
      { property: "og:title", content: `Floor Plan - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Live table status by floor and section, in grid or seating layout view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FloorPlan,
});



const statusOptions: StatusOption<TableState>[] = tableStateOrder.map((id) => ({
  id,
  label: tableStateMeta[id].label.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase()),
  dot: tableStateMeta[id].dot,
}));

function FloorPlan() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const {
    floor,
    setFloor,
    tableStates,
    tableSince,
    tableSeated,
    setTableState,
    startOrder,
    settings,
    getFloorLayout,
    saveFloorLayout,
    floorTemplates,
    saveFloorTemplate,
    deleteFloorTemplate,
    canManageSettings,
    tableMerges,
    mergeTables,
    unmergeTables,
    setMergeSeats,
    customFloorKinds,
    addCustomFloorKind,
    deleteCustomFloorKind,
  } = usePos();
  // Dwell times tick once a minute so the grid and layout stay in step.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const [section, setSection] = useState<FloorSection>("all");
  const [view, setView] = useState<"grid" | "layout">("grid");
  const [staffOpen, setStaffOpen] = useState(false);
  const [statusFor, setStatusFor] = useState<{ name: string; label: string; state: TableState } | null>(
    null,
  );
  const [guestsFor, setGuestsFor] = useState<{ name: string; seats: number } | null>(null);
  const [draft, setDraft] = useState<FloorObject[] | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState<"saved" | "default" | null>(null);
  // Merge mode: tap tables to pick them, then join them into one big party.
  const [merging, setMerging] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [seatsFor, setSeatsFor] = useState<{ id: string; seats: number } | null>(null);

  const editing = draft !== null;


  const layout = getFloorLayout(floor);
  const seed = new Map(floorTables.filter((t) => t.floor === floor).map((t) => [t.name, t]));
  const inSection = (sec: "B1" | "B2") => section === "all" || sec === section;

  const rawTables: FloorTable[] = layout
    .filter((o) => !isDecor(o.kind))
    .filter((o) => inSection(o.section))
    .map((o) => {
      const base = seed.get(o.name);
      const started = tableSince[o.name];
      return {
        id: o.id,
        name: o.name,
        seats: o.seats,
        seated: tableSeated[o.name] ?? base?.seated ?? 0,
        floor,
        section: o.section,
        shape: o.shape,
        rotation: o.rotation ?? 0,
        label: o.label ?? "",
        kind: o.kind === "booth" || o.kind === "bar-chair" ? o.kind : "table",
        x: o.x,
        y: o.y,
        state: (tableStates[o.name] ?? base?.state ?? "available") as TableState,
        since: started
          ? formatDwell(Math.round((now - new Date(started).getTime()) / 60000))
          : base?.seatedMinutesAgo !== undefined
            ? formatDwell(base.seatedMinutesAgo)
            : undefined,
      };
    });

  const floorMerges = tableMerges.filter((m) => m.floor === floor);
  const mergeOf = (name: string) => findMerge(floorMerges, floor, name);

  /**
   * A merged group shows up as one table: the first member carries the order, the
   * others fold into it, and capacity is the manager's override or the sum of seats.
   */
  const tables: FloorTable[] = merging
    ? rawTables
    : rawTables.flatMap((t) => {
        const merge = mergeOf(t.name);
        if (!merge) return [t];
        if (merge.members[0] !== t.name) return [];
        const group = merge.members
          .map((n) => rawTables.find((r) => r.name === n))
          .filter((r): r is FloorTable => Boolean(r));
        const busy = group.find((g) => g.state !== "available" && g.state !== "reserved");
        return [
          {
            ...t,
            label: mergeLabel(merge.members),
            seats: merge.seats ?? group.reduce((sum, g) => sum + g.seats, 0),
            seated: group.reduce((sum, g) => sum + (g.seated ?? 0), 0),
            state: busy?.state ?? t.state,
            since: busy?.since ?? t.since,
          },
        ];
      });

  /**
   * Layout view keeps every real table where it stands and draws the merge as a halo
   * around its members, so the plan matches the room while still reading as one party.
   */
  const layoutGroups = merging
    ? []
    : floorMerges
        .map((m) => {
          const group = m.members
            .map((n) => rawTables.find((r) => r.name === n))
            .filter((r): r is FloorTable => Boolean(r));
          if (group.length < 2) return null;
          const busy = group.find((g) => g.state !== "available" && g.state !== "reserved");
          return {
            id: m.id,
            label: mergeLabel(m.members),
            members: group.map((g) => g.name),
            state: busy?.state ?? group[0]!.state,
            seats: m.seats ?? group.reduce((sum, g) => sum + g.seats, 0),
            seated: group.reduce((sum, g) => sum + (g.seated ?? 0), 0),
            since: busy?.since,
          };
        })
        .filter((g): g is NonNullable<typeof g> => Boolean(g));

  /** A tap on any merged member acts on the whole group. */
  const asGroup = (t: FloorTable) => {
    const g = layoutGroups.find((grp) => grp.members.includes(t.name));
    if (!g) return t;
    return { ...t, name: g.members[0] ?? t.name, seats: g.seats, state: g.state };
  };


  const decor = layout.filter((o) => isDecor(o.kind)).filter((o) => inSection(o.section));

  const counts = floorCounts(editing ? (draft ?? []) : layout, section);
  const seatedTotal = rawTables.reduce((sum, t) => sum + (t.seated ?? 0), 0);

  const togglePick = (name: string) =>
    setPicked((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));

  const applyMerge = () => {
    if (picked.length < 2) return;
    const seats = picked.reduce(
      (sum, n) => sum + (rawTables.find((t) => t.name === n)?.seats ?? 0),
      0,
    );
    mergeTables(floor, picked, seats);
    toast.success(`${mergeLabel(picked)} merged, ${seats} seats`);
    setPicked([]);
    setMerging(false);
  };

  /** One tap split, with a confirm so a busy party is never broken up by accident. */
  const splitMerge = async (id: string) => {
    const merge = tableMerges.find((m) => m.id === id);
    if (!merge) return;
    const ok = await confirm({
      title: `Split ${mergeLabel(merge.members)}?`,
      message: `This restores ${merge.members.length} tables and their own capacities.`,
      confirmLabel: "Unmerge",
      destructive: true,
    });
    if (!ok) return;
    unmergeTables(id);
    setSeatsFor(null);
    toast.success("Tables split back up");
  };

  const openTable = (t: { name: string; seats: number; state: TableState }) => {
    // While merging, a tap picks the table instead of starting an order.
    if (merging) {
      togglePick(t.name);
      return;
    }
    // Occupied tables resume; free tables ask how many are seated first.
    if (t.state === "available" || t.state === "reserved") {
      setGuestsFor({ name: t.name, seats: t.seats });
      return;
    }
    startOrder(t.name);
    navigate({ to: "/order/new" });
  };


  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-1">
              <MenuButton className="-ml-2" />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex min-h-tap min-w-0 items-center gap-1 text-fs-xl font-extrabold uppercase text-foreground">
                  <span className="truncate">{floor}</span>
                  <ChevronDown className="size-5 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-44">
                  {floors.map((f) => (
                    <DropdownMenuItem
                      key={f}
                      onClick={() => setFloor(f)}
                      className="text-fs-sm font-normal text-foreground"
                    >
                      <span className="min-w-0 flex-1 truncate">{f}</span>
                      {f === floor ? (
                        <Check className="size-4 shrink-0 text-primary" aria-hidden />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {editing ? (
                <>
                  <button

                    type="button"
                    onClick={() => setDraft(null)}
                    aria-label="Cancel layout edits"
                    className="grid size-11 shrink-0 place-items-center rounded-pill border border-border text-foreground transition-colors hover:bg-muted"
                  >
                    <X className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (draft) saveFloorLayout(floor, draft);
                      setDraft(null);
                      toast.success(`${floor} layout saved`);
                    }}
                    className="inline-flex h-ctl-sm min-h-ctl-sm shrink-0 items-center justify-center rounded-pill bg-primary px-4 text-fs-sm font-extrabold uppercase leading-none text-primary-foreground"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  {/* Grid or seating-layout view. */}
                  <div className="flex items-center gap-1 rounded-pill bg-muted p-1">
                    {(
                      [
                        { id: "grid" as const, label: "Grid", Icon: LayoutGrid },
                        { id: "layout" as const, label: "Layout", Icon: MapIcon },
                      ] satisfies { id: "grid" | "layout"; label: string; Icon: typeof MapIcon }[]
                    ).map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setView(id)}
                        aria-pressed={view === id}
                        aria-label={`${label} view`}
                        className={cn(
                          "grid size-9 place-items-center rounded-pill transition-colors",
                          view === id
                            ? "bg-surface text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    ))}
                  </div>
                  {/* Layout editing is a manager-level action. */}
                  {view === "layout" && canManageSettings ? (
                    <button
                      type="button"
                      onClick={() => setDraft(layout.map((o) => ({ ...o })))}
                      aria-label="Edit floor layout"
                      className="grid size-11 shrink-0 place-items-center rounded-pill border border-border text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="size-5" />
                    </button>
                  ) : null}
                  {/* Merge mode: pick two or more tables for a big party. */}
                  <button
                    type="button"
                    onClick={() => {
                      setMerging((v) => !v);
                      setPicked([]);
                    }}
                    aria-label="Merge tables"
                    aria-pressed={merging}
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-pill border border-border transition-colors",
                      merging
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Combine className="size-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffOpen((v) => !v)}
                    aria-label="Staff list"
                    aria-pressed={staffOpen}
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-pill border border-border transition-colors",
                      staffOpen ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Users className="size-5" />
                  </button>
                  {/* Rooms is a hotel module: only shown when room service is switched on. */}
                  {settings.roomService ? (
                    <Link
                      to="/rooms"
                      className="inline-flex h-ctl-sm min-h-ctl-sm shrink-0 items-center justify-center rounded-pill border border-border px-3.5 text-fs-sm font-bold leading-none text-foreground transition-colors hover:bg-muted"
                    >
                      Rooms
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {floorSections.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={cn(
                  "min-h-ctl-sm shrink-0 rounded-pill px-3.5 text-fs-sm font-bold uppercase transition-colors",
                  s === section
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
            {/* Same helper the editor chip uses, so the views can never disagree. */}
            <span className="ml-auto shrink-0 rounded-pill bg-muted px-2.5 py-1 text-fs-xs font-bold uppercase text-muted-foreground">
              Tables {counts.tables} / Chairs {counts.chairs} / Seated {seatedTotal}
            </span>
          </div>

          {merging ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-card bg-muted p-2">
              <span className="min-w-0 flex-1 text-fs-xs font-bold uppercase text-muted-foreground">
                {picked.length < 2
                  ? "Tap two or more tables to merge"
                  : `Merging ${mergeLabel(picked)}`}
              </span>
              <button
                type="button"
                disabled={picked.length < 2}
                onClick={applyMerge}
                className={cn(
                  "min-h-ctl-sm shrink-0 rounded-pill bg-primary px-3.5 text-fs-xs font-extrabold uppercase text-primary-foreground",
                  picked.length < 2 && "opacity-40",
                )}
              >
                Merge {picked.length || ""}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMerging(false);
                  setPicked([]);
                }}
                className="min-h-ctl-sm shrink-0 rounded-pill border border-border px-3.5 text-fs-xs font-bold uppercase text-foreground"
              >
                Done
              </button>
            </div>
          ) : null}
        </div>


        {editing ? (
          <div className="flex min-h-0 flex-1 flex-col p-3 pb-[calc(0.75rem+var(--tabs-h,0px))]">
            <FloorEditor
              objects={draft ?? []}
              onChange={setDraft}
              onReset={() => setResetMode("saved")}
              onResetDefault={() => setResetMode("default")}
              customKinds={customFloorKinds}
              onAddCustomKind={addCustomFloorKind}
              onDeleteCustomKind={deleteCustomFloorKind}

              toolbarExtra={
                /* Templates give staff a starting arrangement to edit. */
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex min-h-ctl-sm shrink-0 items-center gap-1 rounded-pill border border-border bg-surface px-2.5 text-fs-xs font-bold uppercase text-foreground transition-colors hover:bg-muted">
                    Template
                    <ChevronDown className="size-3.5 shrink-0" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-52">
                    <DropdownMenuLabel className="text-fs-xs uppercase text-muted-foreground">
                      Starter layouts
                    </DropdownMenuLabel>
                    {layoutTemplates.map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        className="text-fs-sm font-normal text-foreground"
                        onClick={() => {
                          setDraft(t.build());
                          toast.success(`${t.label} template loaded. Save to keep it.`);
                        }}
                      >
                        {t.label}
                      </DropdownMenuItem>
                    ))}
                    {floorTemplates.length ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-fs-xs uppercase text-muted-foreground">
                          My templates
                        </DropdownMenuLabel>
                        {floorTemplates.map((t) => (
                          <DropdownMenuItem
                            key={t.id}
                            className="text-fs-sm font-normal text-foreground"
                            onClick={() => {
                              setDraft(cloneLayout(t.objects));
                              toast.success(`${t.label} loaded. Save to keep it.`);
                            }}
                          >
                            <span className="min-w-0 flex-1 truncate">{t.label}</span>
                            <button
                              type="button"
                              aria-label={`Delete ${t.label}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFloorTemplate(t.id);
                                toast.success(`${t.label} deleted`);
                              }}
                              className="ml-2 shrink-0 text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </DropdownMenuItem>
                        ))}
                      </>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-fs-sm font-bold text-foreground"
                      onClick={() => setTemplateName("")}
                    >
                      Save current as template
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          </div>
        ) : view === "layout" ? (

          <div className="min-h-0 flex-1 p-3 pb-[calc(0.75rem+var(--tabs-h,0px))]">
            <FloorCanvas
              tables={rawTables}
              decor={decor}
              groups={layoutGroups}
              onOpen={(t) => openTable(asGroup(t))}
              onStatus={(t) => {
                const g = layoutGroups.find((grp) => grp.members.includes(t.name));
                setStatusFor(
                  g
                    ? { name: g.members[0] ?? t.name, label: g.label, state: g.state }
                    : { name: t.name, label: t.name, state: t.state },
                );
              }}
              onUnmerge={(id) => void splitMerge(id)}
              selectedNames={merging ? picked : []}
            />

          </div>
        ) : (
          <ScreenBody>
            {tables.length === 0 ? (
              <p className="px-4 py-24 text-center text-fs-sm text-muted-foreground">
                No Tables Found
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
                {tables.map((t) => {
                  const meta = tableStateMeta[t.state];
                  const seated = t.seated ?? 0;
                  const merge = merging ? null : mergeOf(t.name);
                  const shown = merge ? mergeLabel(merge.members) : t.name;
                  const isPicked = merging && picked.includes(t.name);
                  // Long names shrink instead of truncating so the number stays readable.
                  const nameSize =
                    shown.length > 7
                      ? "text-[0.6rem]"
                      : shown.length > 5
                        ? "text-[0.7rem]"
                        : "text-fs-sm";
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "overflow-hidden rounded-card border bg-surface text-left",
                        isPicked ? "border-primary ring-2 ring-primary" : "border-border",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => openTable(t)}
                        title={shown}
                        className="block w-full transition-transform active:scale-[0.98]"
                      >
                        <div className="relative grid h-tile place-items-center">
                          <div
                            className={cn(
                              "grid size-[76px] place-items-center border-2 font-bold text-foreground",
                              (t.shape ?? "round") === "round" ? "rounded-full" : "rounded-row",
                              meta.ring,
                            )}
                          >
                            <span className={cn("max-w-[94%] truncate px-0.5 leading-none", nameSize)}>
                              {shown}
                            </span>
                          </div>
                          {/* Which real tables were pushed together for this party. */}
                          {merge ? (
                            <span className="absolute left-0 right-0 top-2 truncate px-2 text-center text-fs-xs font-bold text-muted-foreground">
                              {merge.members.join(" · ")}
                            </span>
                          ) : null}
                          {t.since ? (
                            <span className="absolute bottom-2 right-3 text-fs-xs font-bold text-muted-foreground">
                              {t.since}
                            </span>
                          ) : null}

                          <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 text-fs-xs text-muted-foreground">
                            <Users className="size-3.5 shrink-0" aria-hidden />
                            {seated} / {t.seats}
                          </span>
                        </div>
                      </button>

                      {/* Merged groups get their own row to retune capacity or split back up. */}
                      {merge ? (
                        <div className="flex items-stretch border-t border-border">
                          <button
                            type="button"
                            onClick={() => setSeatsFor({ id: merge.id, seats: t.seats })}
                            aria-label={`Adjust capacity for ${shown}`}
                            className="flex min-h-tap min-w-0 flex-1 items-center justify-center gap-1 px-2 text-fs-xs font-bold uppercase text-muted-foreground"
                          >
                            <Combine className="size-3.5 shrink-0" aria-hidden />
                            <span className="truncate">Merged · {t.seats} seats</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void splitMerge(merge.id)}
                            aria-label={`Unmerge ${shown}`}
                            className="grid min-h-tap w-11 shrink-0 place-items-center border-l border-border text-destructive"
                          >
                            <Unlink className="size-4" aria-hidden />
                          </button>
                        </div>
                      ) : null}

                      {/* Status strip is its own control so staff can change state without ordering. */}
                      <button
                        type="button"
                        onClick={() => setStatusFor({ name: t.name, label: shown, state: t.state })}
                        aria-label={`Change status for ${shown}, currently ${meta.label}`}
                        className={cn(
                          "flex min-h-ctl-sm w-full items-center justify-center gap-1 px-2 py-2 text-center text-fs-xs font-extrabold uppercase transition-opacity active:opacity-80",
                          meta.strip,
                          meta.text,
                        )}
                      >
                        <span className="truncate">{meta.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScreenBody>
        )}

        {/* Adjust how many can sit at a merged group, or split it back up. */}
        <Dialog open={seatsFor !== null} onOpenChange={(o) => (o ? null : setSeatsFor(null))}>
          <DialogContent className="max-w-sm rounded-card p-4">
            <DialogHeader>
              <DialogTitle className="text-fs-base font-extrabold text-foreground">
                Merged tables
              </DialogTitle>
            </DialogHeader>
            <p className="text-fs-sm text-muted-foreground">
              {seatsFor
                ? mergeLabel(tableMerges.find((m) => m.id === seatsFor.id)?.members ?? [])
                : ""}
            </p>
            <div className="flex items-center justify-center gap-1 rounded-pill bg-muted p-1">
              <button
                type="button"
                aria-label="Fewer seats"
                onClick={() =>
                  setSeatsFor((s) => (s ? { ...s, seats: Math.max(1, s.seats - 1) } : s))
                }
                className="grid size-9 place-items-center rounded-pill text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-20 text-center text-fs-sm font-bold text-foreground">
                {seatsFor?.seats ?? 0} seats
              </span>
              <button
                type="button"
                aria-label="More seats"
                onClick={() =>
                  setSeatsFor((s) => (s ? { ...s, seats: Math.min(60, s.seats + 1) } : s))
                }
                className="grid size-9 place-items-center rounded-pill text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  if (seatsFor) void splitMerge(seatsFor.id);
                }}
                className="inline-flex min-h-ctl-sm items-center gap-1 rounded-pill border border-border px-4 text-fs-sm font-bold text-destructive"
              >
                <Unlink className="size-4" aria-hidden />
                Unmerge
              </button>
              <button
                type="button"
                onClick={() => {
                  if (seatsFor) {
                    setMergeSeats(seatsFor.id, seatsFor.seats);
                    toast.success(`Capacity set to ${seatsFor.seats} seats`);
                  }
                  setSeatsFor(null);
                }}
                className="min-h-ctl-sm rounded-pill bg-primary px-4 text-fs-sm font-extrabold uppercase text-primary-foreground"
              >
                Save
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <GuestsSheet
          open={guestsFor !== null}
          table={guestsFor?.name ?? null}
          seats={guestsFor?.seats ?? 1}
          onClose={() => setGuestsFor(null)}
          onStart={(count) => {
            if (guestsFor) {
              startOrder(guestsFor.name, count);
              setGuestsFor(null);
              navigate({ to: "/order/new" });
            }
          }}
        />

        <StatusSheet
          open={statusFor !== null}
          title={statusFor ? `${statusFor.label} status` : "Status"}
          options={statusOptions}
          value={statusFor?.state ?? null}
          onClose={() => setStatusFor(null)}
          onPick={(state) => {
            if (statusFor) {
              setTableState(statusFor.name, state);
              toast.success(`${statusFor.label} · ${tableStateMeta[state].label}`);
            }
            setStatusFor(null);
          }}
        />

        {/* Name a saved template so staff can reapply it to any floor. */}
        <Dialog open={templateName !== null} onOpenChange={(o) => (o ? null : setTemplateName(null))}>
          <DialogContent className="max-w-sm rounded-card p-4">
            <DialogHeader>
              <DialogTitle className="text-fs-base font-extrabold text-foreground">
                Save layout as template
              </DialogTitle>
            </DialogHeader>
            <input
              autoFocus
              value={templateName ?? ""}
              onChange={(e) => setTemplateName(e.target.value.slice(0, 32))}
              placeholder="Template name"
              aria-label="Template name"
              className="min-h-ctl-sm w-full rounded-row bg-muted px-3 text-fs-sm font-bold text-foreground outline-none placeholder:text-muted-foreground"
            />
            <DialogFooter className="gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setTemplateName(null)}
                className="min-h-ctl-sm rounded-pill border border-border px-4 text-fs-sm font-bold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!templateName?.trim()}
                onClick={() => {
                  const label = (templateName ?? "").trim();
                  if (!label) return;
                  saveFloorTemplate(label, draft ?? layout);
                  setTemplateName(null);
                  toast.success(`${label} saved to My templates`);
                }}
                className="min-h-ctl-sm rounded-pill bg-primary px-4 text-fs-sm font-extrabold uppercase text-primary-foreground disabled:opacity-50"
              >
                Save
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm before throwing away the current arrangement. */}
        <Dialog open={resetMode !== null} onOpenChange={(o) => (o ? null : setResetMode(null))}>
          <DialogContent className="max-w-sm rounded-card p-4">
            <DialogHeader>
              <DialogTitle className="text-fs-base font-extrabold text-foreground">
                {resetMode === "default" ? "Reset to default layout" : "Reset to saved layout"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-fs-sm text-muted-foreground">
              {resetMode === "default"
                ? `This puts ${floor} back to the original tables it shipped with. Nothing is kept until you press Save.`
                : `This drops the changes you made in this session and reloads the saved ${floor} layout.`}
            </p>
            <DialogFooter className="gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setResetMode(null)}
                className="min-h-ctl-sm rounded-pill border border-border px-4 text-fs-sm font-bold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const next =
                    resetMode === "default" ? defaultFloorLayout(floor) : getFloorLayout(floor);
                  setDraft(next.map((o) => ({ ...o })));
                  setResetMode(null);
                  toast.success(
                    resetMode === "default"
                      ? `${floor} reset to the default layout`
                      : `${floor} reset to the saved layout`,
                  );
                }}
                className="min-h-ctl-sm rounded-pill bg-primary px-4 text-fs-sm font-extrabold uppercase text-primary-foreground"
              >
                Reset
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      <StaffPanel
        open={staffOpen}
        onClose={() => setStaffOpen(false)}
        onPick={(name) => {
          toast.success(`Assigned to ${name}`);
          setStaffOpen(false);
        }}
      />
    </div>
  );
}
