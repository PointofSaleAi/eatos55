import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  LayoutGrid,
  Map as MapIcon,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { FloorCanvas } from "@/components/pos/floor-canvas";
import { FloorEditor } from "@/components/pos/floor-editor";
import { GuestsSheet } from "@/components/pos/guests-sheet";
import { StaffPanel } from "@/components/pos/staff-panel";
import { StatusSheet, type StatusOption } from "@/components/pos/status-sheet";

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
  floorSections,
  floorTables,
  floors,
  isDecor,
  layoutTemplates,
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
      { title: "Floor Plan - eatOS Point of Sale" },
      {
        name: "description",
        content: "Live table status by floor and section, in grid or seating layout view.",
      },
      { property: "og:title", content: "Floor Plan - eatOS Point of Sale" },
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

function elapsed(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 60 ? `${mins}M` : `${Math.floor(mins / 60)}H`;
}

const statusOptions: StatusOption<TableState>[] = tableStateOrder.map((id) => ({
  id,
  label: tableStateMeta[id].label.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase()),
  dot: tableStateMeta[id].dot,
}));

function FloorPlan() {
  const navigate = useNavigate();
  const {
    floor,
    setFloor,
    tableStates,
    tableSince,
    setTableState,
    startOrder,
    settings,
    getFloorLayout,
    saveFloorLayout,
    floorTemplates,
    saveFloorTemplate,
    deleteFloorTemplate,
    canManageSettings,
  } = usePos();
  const [section, setSection] = useState<FloorSection>("all");
  const [view, setView] = useState<"grid" | "layout">("grid");
  const [staffOpen, setStaffOpen] = useState(false);
  const [statusFor, setStatusFor] = useState<{ name: string; state: TableState } | null>(null);
  const [guestsFor, setGuestsFor] = useState<{ name: string; seats: number } | null>(null);
  const [draft, setDraft] = useState<FloorObject[] | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState<"saved" | "default" | null>(null);
  const editing = draft !== null;


  const layout = getFloorLayout(floor);
  const seed = new Map(floorTables.filter((t) => t.floor === floor).map((t) => [t.name, t]));
  const inSection = (sec: "B1" | "B2") => section === "all" || sec === section;

  const tables: FloorTable[] = layout
    .filter((o) => !isDecor(o.kind))
    .filter((o) => inSection(o.section))
    .map((o) => {
      const base = seed.get(o.name);
      const started = tableSince[o.name];
      return {
        id: o.id,
        name: o.name,
        seats: o.seats,
        seated: base?.seated ?? 0,
        floor,
        section: o.section,
        shape: o.shape,
        rotation: o.rotation ?? 0,
        label: o.label ?? "",
        kind: o.kind === "booth" || o.kind === "bar-chair" ? o.kind : "table",
        x: o.x,
        y: o.y,
        state: (tableStates[o.name] ?? base?.state ?? "available") as TableState,
        since: started ? elapsed(started) : base?.since,
      };
    });

  const decor = layout.filter((o) => isDecor(o.kind)).filter((o) => inSection(o.section));

  const openTable = (t: { name: string; seats: number; state: TableState }) => {
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

          <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
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
          </div>
        </div>

        {editing ? (
          <div className="flex min-h-0 flex-1 flex-col p-3 pb-[calc(0.75rem+var(--tabs-h,0px))]">
            <FloorEditor objects={draft ?? []} onChange={setDraft} />
          </div>
        ) : view === "layout" ? (
          <div className="min-h-0 flex-1 p-3 pb-[calc(0.75rem+var(--tabs-h,0px))]">
            <FloorCanvas
              tables={tables}
              decor={decor}
              onOpen={(t) => openTable(t)}
              onStatus={(t) => setStatusFor({ name: t.name, state: t.state })}
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
                  // Long names shrink instead of truncating so the number stays readable.
                  const nameSize =
                    t.name.length > 7
                      ? "text-[0.6rem]"
                      : t.name.length > 5
                        ? "text-[0.7rem]"
                        : "text-fs-sm";
                  return (
                    <div
                      key={t.id}
                      className="overflow-hidden rounded-card border border-border bg-surface text-left"
                    >
                      <button
                        type="button"
                        onClick={() => openTable(t)}
                        title={t.name}
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
                              {t.name}
                            </span>
                          </div>
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
                      {/* Status strip is its own control so staff can change state without ordering. */}
                      <button
                        type="button"
                        onClick={() => setStatusFor({ name: t.name, state: t.state })}
                        aria-label={`Change status for ${t.name}, currently ${meta.label}`}
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
          title={statusFor ? `${statusFor.name} status` : "Status"}
          options={statusOptions}
          value={statusFor?.state ?? null}
          onClose={() => setStatusFor(null)}
          onPick={(state) => {
            if (statusFor) {
              setTableState(statusFor.name, state);
              toast.success(`${statusFor.name} · ${tableStateMeta[state].label}`);
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
