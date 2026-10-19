import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Armchair,
  Banknote,
  Cake,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Car,
  ChevronRight,
  Clock,
  Info,
  Mail,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  NotebookPen,
  Phone,
  Plus,
  Search,
  Star,
  StickyNote,
  Table2,
  Tag,
  UserRound,
  Users,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenBody, SubHeader, useWideLayout } from "@/components/pos/shell";
import { PaneEmpty, SplitPane } from "@/components/pos/split-pane";
import { usePos } from "@/lib/pos-store";
import { guestDirectory, guestOrderPatch } from "@/lib/guestbook";
import { money, statusMeta } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import { GuestVisitBooking } from "@/components/pos/guest-visit-booking";
import { SwipeRow, type SwipeRowHandle } from "@/components/pos/swipe-row";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { GuestVisit } from "@/lib/guest-reservation";

export const Route = createFileRoute("/settings/guestbook")({
  head: () => ({ meta: [
    { title: `Guestbook - ${brand.appName}` },
    { name: "description", content: "Guest directory, available contact details and order history in eatOS." },
    { property: "og:title", content: `Guestbook - ${brand.appName}` },
    { property: "og:description", content: "Guest directory, available contact details and order history in eatOS." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Guestbook,
});

type GuestRow = ReturnType<typeof guestDirectory>[number];

/** Demo guest extras (tags, allergies, notes, booked visits) kept on the device only. */
const EXTRAS_KEY = "eatos.pos.guestbook-extras";
/** A booked visit: date, time and the optional note / party / table it was booked under. */
type Visit = {
  date: string;
  time: string;
  description?: string | undefined;
  party?: number | undefined;
  table?: string | undefined;
  /** Stable id, so a visit keeps its no-show flag when the list changes. */
  id?: string | undefined;
};
type Extras = {
  tags: string[];
  allergies: string[];
  notes: Record<string, string>;
  visits: Visit[];
  /** Row keys of the visits the guest did not turn up for. */
  noShows: string[];
};
const emptyExtras = (): Extras => ({ tags: [], allergies: [], notes: {}, visits: [], noShows: [] });

/** Stable id for a visit that was just booked. */
const newVisitId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Demo reservations seeded once per guest so the Reservations tab opens with real history. */
const SEED_KEY = "eatos.pos.guestbook-seeded";
const RESERVATION_NOTES = ["Birthday dinner", "Anniversary celebration", "Business lunch", "Window table requested", "High chair needed", "Quiet corner please", "Tasting menu for guests", "Date night", "Family Sunday lunch", "Team dinner after work"];
const RESERVATION_TABLES = ["T1", "T2", "EC226", "P4", "B7", "V3"];
const RESERVATION_PLAN = [
  { offset: -9, time: "19:30" },
  { offset: -23, time: "13:00" },
  { offset: -38, time: "20:15" },
  { offset: 4, time: "19:00" },
  { offset: 12, time: "20:30" },
];
const textSeed = (text: string) => [...text].reduce((total, char) => total + char.charCodeAt(0), 0);
const shiftDate = (iso: string, days: number) => {
  const day = new Date(`${iso}T12:00:00`);
  day.setDate(day.getDate() + days);
  return day.toISOString().slice(0, 10);
};
const seedVisits = (id: string): Visit[] => {
  const seed = textSeed(id);
  const today = new Date().toISOString().slice(0, 10);
  return RESERVATION_PLAN.map((entry, index) => ({
    id: `seed-${index}`,
    date: shiftDate(today, entry.offset),
    time: entry.time,
    description: RESERVATION_NOTES[(seed + index) % RESERVATION_NOTES.length] ?? "No Description",
    party: 1 + ((seed + index) % 5),
    table: RESERVATION_TABLES[(seed + index) % RESERVATION_TABLES.length] ?? undefined,
  }));
};
const alreadySeeded = (id: string) => {
  try {
    return (JSON.parse(localStorage.getItem(SEED_KEY) ?? "[]") as string[]).includes(id);
  } catch {
    return false;
  }
};
const markSeeded = (id: string) => {
  try {
    const list = (JSON.parse(localStorage.getItem(SEED_KEY) ?? "[]") as string[]).filter((item) => item !== id);
    localStorage.setItem(SEED_KEY, JSON.stringify([...list, id]));
  } catch {
    // Demo-only storage: ignore write failures.
  }
};
/** Preset tags offered in the Tags popup, matching the guestbook reference. */
/** A preset choice in the add popup; `color` paints the pill, `large` makes it a bigger button. */
type PickerOption = { label: string; color?: string | undefined; large?: boolean | undefined };

const TAG_OPTIONS: PickerOption[] = [
  "VIP",
  "BIRTHDAY",
  "REGULAR",
  "SMOKER",
  "NON-SMOKER",
  "VEGETARIAN",
  "HIGH CHAIR",
  "VEGAN",
  "PATIO REQUIRED",
  "FRIEND OF OWNER",
].map((label) => ({ label }));

/** Allergy popup: pill colours and sizes follow the reference screen. */
const ALLERGY_OPTIONS: PickerOption[] = [
  { label: "Almonds", color: "#FCAE68", large: true },
  { label: "Corn", color: "#70B8FF" },
  { label: "Egg", color: "#7876FA" },
  { label: "Fish", color: "#74B7FF" },
  { label: "Gelatin", color: "#F96D76", large: true },
  { label: "Gluten", color: "#FDB872" },
  { label: "Meat", color: "#6F73EC" },
  { label: "Milk", color: "#F96D76", large: true },
  { label: "Soy", color: "#7572EB" },
  { label: "Peanuts", color: "#F96D76", large: true },
  { label: "Shellfish", color: "#FDB872", large: true },
  { label: "Sesame", color: "#6CB8FF" },
  { label: "Tree Nuts", color: "#F96D76", large: true },
  { label: "Wheat", color: "#FDB872", large: true },
];
const loadExtras = (id: string): Extras => {
  try {
    const all = JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? "{}") as Record<string, Extras>;
    const stored: Extras = { ...emptyExtras(), ...all[id] };
    if (!alreadySeeded(id)) {
      stored.visits = [...stored.visits, ...seedVisits(id)];
      all[id] = stored;
      localStorage.setItem(EXTRAS_KEY, JSON.stringify(all));
      markSeeded(id);
    }
    // Visits booked before ids existed get one now, so their no-show flag stays put.
    if (stored.visits.some((visit) => !visit.id)) {
      stored.visits = stored.visits.map((visit, index) => (visit.id ? visit : { ...visit, id: `legacy-${index}` }));
      all[id] = stored;
      localStorage.setItem(EXTRAS_KEY, JSON.stringify(all));
    }
    return stored;
  } catch {
    return emptyExtras();
  }
};
const saveExtras = (id: string, extras: Extras) => {
  try {
    const all = JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? "{}") as Record<string, Extras>;
    all[id] = extras;
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(all));
  } catch {
    // Demo-only storage: ignore write failures.
  }
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";

/** "2026-07-31" -> "07/31/2026"; returns null for unknown shapes so callers show "-". */
const formatDate = (iso: string | undefined) =>
  iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}` : null;

const initialsTone = (name: string) => {
  const tones = ["bg-muted", "bg-surface-muted", "bg-accent"];
  return tones[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length];
};

/** Searchable guest list; used full-width on phones and as the left pane on wide screens. */
function GuestList({
  records,
  selectedId,
  onSelect,
  className,
}: {
  records: GuestRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string | undefined;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = records.filter((row) => [row.name, row.email, row.phone].some((value) => value?.toLowerCase().includes(q)));
  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
      <label className="mb-5 flex min-h-ctl-md shrink-0 items-center gap-3 rounded-pill border border-border bg-surface px-4">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input type="search" aria-label="Search guests" placeholder="Search guests" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-tap min-w-0 flex-1 bg-transparent outline-none" />
      </label>
      {visible.length ? (
        <ul className="min-h-0 min-w-0 flex-1 divide-y divide-border overflow-y-auto border-y border-border">
          {visible.map((row) => (
            <li key={row.id}>
              <Button
                variant="ghost"
                className={cn(
                  "h-auto min-h-ctl-lg w-full justify-start gap-3 rounded-none px-2 py-4 text-foreground hover:bg-muted",
                  row.id === selectedId && "bg-muted",
                )}
                onClick={() => onSelect(row.id)}
              >
                <Users className="size-5 shrink-0" />
                <span className="min-w-0 flex-1 whitespace-normal break-words text-left">
                  <span className="block font-bold">{row.name}</span>
                  {row.email ? <span className="block break-all text-fs-xs text-muted-foreground">{row.email}</span> : null}
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-muted-foreground">{q ? "No guests found." : "No named guests available."}</p>
      )}
    </div>
  );
}

/** Uppercase section label with an optional right-hand action, over a card. */
function SectionCard({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={label}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-fs-sm font-bold uppercase tracking-wide text-muted-foreground">{label}</h3>
        {action ?? null}
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">{children}</div>
    </section>
  );
}

/** Dark pill used for the reference-style actions (New Order, Add, Book A Visit…). */
function DarkPill({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-tap items-center gap-1 rounded-pill bg-foreground px-4 py-1.5 text-fs-sm font-bold text-background transition-colors hover:bg-foreground/90"
    >
      {children}
    </button>
  );
}

/** Chips with an inline "add" entry; values persist per guest in demo storage. */
function TagEditor({
  values,
  addLabel,
  tone = "ghost",
  preset,
  dialogTitle,
  dialogNote,
  dialogFooter,
  onAdd,
  onRemove,
}: {
  values: string[];
  addLabel: string;
  /** "dark" renders the reference-style pill; "ghost" a quiet inline control. */
  tone?: "ghost" | "dark";
  /** When set, the add button opens a popup offering these preset choices. */
  preset?: PickerOption[];
  /** Heading shown in that popup. */
  dialogTitle?: string;
  /** Line shown under the heading; defaults to the tags wording. */
  dialogNote?: ReactNode;
  /** Line shown under the choices; used for the allergy note. */
  dialogFooter?: ReactNode;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const cancelled = useRef(false);
  const commit = () => {
    if (!cancelled.current) {
      const value = draft.trim();
      if (value) onAdd(value);
    }
    cancelled.current = false;
    setDraft("");
    setAdding(false);
  };
  return (
    <>
    <div className="flex flex-wrap items-center gap-2">
      {values.map((value) => {
        const color = preset?.find((option) => option.label === value)?.color;
        return (
          <span
            key={value}
            style={color ? { backgroundColor: color } : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-fs-sm font-bold",
              color ? "text-background" : "bg-surface-muted",
            )}
          >
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              className={cn(
                "transition-colors",
                color ? "text-background/80 hover:text-background" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onRemove(value)}
            >
              <X className="size-3.5" />
            </button>
          </span>
        );
      })}
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              cancelled.current = false;
              commit();
            } else if (e.key === "Escape") {
              cancelled.current = true;
              setDraft("");
              setAdding(false);
            }
          }}
          placeholder={addLabel}
          className="min-h-tap min-w-40 flex-1 bg-transparent text-fs-sm outline-none"
        />
      ) : preset ? (
        <DarkPill onClick={() => setPickerOpen(true)}>{addLabel}</DarkPill>
      ) : tone === "dark" ? (
        <DarkPill onClick={() => setAdding(true)}>{addLabel}</DarkPill>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-tap rounded-pill px-3 text-fs-sm text-muted-foreground hover:text-foreground"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      )}
    </div>
      {preset && pickerOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4"
          onClick={() => setPickerOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={dialogTitle ?? "Tags"}
            tabIndex={-1}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") setPickerOpen(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl outline-none"
          >
            <div className="relative border-b border-border px-14 py-4 text-center text-fs-lg font-bold">
              {dialogTitle ?? "Tags"}
              <button
                type="button"
                aria-label="Close"
                className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setPickerOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <p className="text-center text-fs-sm text-muted-foreground">
                {dialogNote ?? "Select relevant tags for the guest."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {preset.map((option) => {
                  const selected = values.includes(option.label);
                  return (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={selected}
                      style={option.color ? { backgroundColor: option.color } : undefined}
                      onClick={() => (selected ? onRemove(option.label) : onAdd(option.label))}
                      className={cn(
                        "rounded-pill font-bold transition-all",
                        option.color
                          ? cn(
                              "text-background",
                              option.large ? "px-6 py-3 text-fs-base" : "px-4 py-2 text-fs-sm",
                              selected && "ring-2 ring-foreground ring-offset-2 ring-offset-surface",
                            )
                          : cn(
                              "px-4 py-2 text-fs-sm uppercase tracking-wide",
                              selected
                                ? "bg-foreground text-background"
                                : "bg-muted text-foreground hover:bg-muted/80",
                            ),
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {dialogFooter ? (
                <p className="text-center text-fs-sm text-muted-foreground">{dialogFooter}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** A labelled note row; tapping the placeholder turns it into an autosaving field. */
function NoteRow({
  title,
  icon,
  value,
  onChange,
}: {
  title: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="font-bold">{title}</span>
      </div>
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") setEditing(false);
          }}
          placeholder="Add notes"
          className="mt-2 w-full bg-transparent text-fs-sm outline-none"
        />
      ) : (
        <button
          type="button"
          className={cn("mt-1 block w-full text-left text-fs-sm", value ? "text-foreground" : "text-muted-foreground")}
          onClick={() => setEditing(true)}
        >
          {value || "Add notes"}
        </button>
      )}
    </div>
  );
}

/** Upcoming visits and the entry point to table-based booking. */
function VisitEditor({ visits, onBook, onRemove }: { visits: Visit[]; onBook: () => void; onRemove: (visit: Visit) => void }) {
  return <div className="space-y-3">
    {visits.length ? <ul className="divide-y divide-border">{visits.map((visit, index) => <li key={`${visit.date}-${visit.time}-${index}`} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
      <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 break-words text-fs-sm"><span className="font-bold">{visit.description || "No Description"}</span><span className="text-muted-foreground"> · {visit.date} · {visit.time}{visit.table ? ` · ${visit.table}` : ""}{visit.party ? ` · ${visit.party} guests` : ""}</span></span>
      <Button type="button" variant="ghost" size="icon" aria-label="Remove visit" onClick={() => onRemove(visit)}><X /></Button>
    </li>)}</ul> : <p className="text-fs-sm">No Upcoming Visits</p>}
    <DarkPill onClick={onBook}>Book A Visit</DarkPill>
  </div>;
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-3">
      <span className="truncate text-fs-base font-bold">{value}</span>
      <span className="text-fs-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function MiniStat({ value, label, className }: { value: string | number; label: string; className?: string | undefined }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="truncate text-fs-lg font-bold">{value}</span>
      <span className="text-fs-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/** The Profile tab: guest identity, spend stats, loyalty, visits, items and notes. */
function GuestProfile({ guest, onBook }: { guest: GuestRow; onBook: () => void }) {
  const [extras, setExtras] = useState<Extras>(() => loadExtras(guest.id));
  const update = (patch: Partial<Extras>) =>
    setExtras((prev) => {
      const next = { ...prev, ...patch };
      saveExtras(guest.id, next);
      return next;
    });

  const orders = [...guest.tickets].sort((a, b) => b.date.localeCompare(a.date));
  const lifetime = orders.reduce((sum, ticket) => sum + ticket.total, 0);
  const avgSpend = orders.length ? lifetime / orders.length : 0;
  const tips = orders.reduce((sum, ticket) => sum + (ticket.tips ?? 0), 0);
  const avgTip = orders.length ? tips / orders.length : 0;
  const lastVisit = formatDate(orders[0]?.date) ?? "-";
  const firstVisit = formatDate(orders[orders.length - 1]?.date) ?? "-";

  const itemTotals = new Map<string, number>();
  for (const ticket of guest.tickets) {
    for (const line of ticket.lines) itemTotals.set(line.name, (itemTotals.get(line.name) ?? 0) + line.qty);
  }
  const mostOrdered = [...itemTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)]">
      {/* Identity column */}
      <div className="flex flex-col items-center gap-2 self-start rounded-xl border border-border bg-surface p-6 text-center">
        <span className={cn("flex size-20 items-center justify-center rounded-full text-fs-xl font-bold", initialsTone(guest.name))}>{initials(guest.name)}</span>
        <p className="mt-1 break-words text-fs-lg font-bold">{guest.name}</p>
        <p className="break-all text-fs-sm text-muted-foreground">{guest.email}</p>
        <p className="text-fs-sm text-muted-foreground">{guest.phone}</p>
        <div className="mt-3 w-full">
          <TagEditor
            values={extras.tags}
            addLabel="Add Tags"
            tone="dark"
            preset={TAG_OPTIONS}
            onAdd={(value) => update({ tags: [...extras.tags, value] })}
            onRemove={(value) => update({ tags: extras.tags.filter((tag) => tag !== value) })}
          />
        </div>
      </div>

      {/* Detail column */}
      <div className="@container min-w-0 space-y-5">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border @sm:grid-cols-3 @xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)]" aria-label="Visit and spend summary">
          <div className="bg-surface"><StatCell value={lastVisit} label="Last Visit" /></div>
          <div className="bg-surface"><StatCell value={money(avgSpend)} label="Average Spend" /></div>
          <div className="bg-surface"><StatCell value={money(lifetime)} label="Lifetime Spend" /></div>
          <div className="bg-surface"><StatCell value={String(orders.length)} label="Total Orders" /></div>
          <div className="bg-surface"><StatCell value={money(avgTip)} label="Average Tip" /></div>
        </div>

        <div className="grid gap-3 @xl:gap-4 @md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-border bg-surface p-3 @xl:p-4">
            <dl className="divide-y divide-border @md:flex @md:h-full @md:flex-col @md:justify-between">
              {[
                ["Loyalty No.", "-"],
                ["Since", firstVisit],
                ["Birthday", "-"],
                ["Anniversary", "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <dt className="min-w-0 truncate font-bold">{label}</dt>
                  <dd className="shrink-0 text-right text-fs-sm text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 @xl:p-4">
            <h4 className="text-fs-sm font-bold uppercase tracking-wide text-muted-foreground">Loyalty</h4>
            <div className="mt-3 grid grid-cols-1 gap-y-2 @xl:grid-cols-2 @xl:gap-x-4 @xl:gap-y-3">
              <MiniStat value={0} label="Earned" />
              <MiniStat value={0} label="Redeemed" />
              <MiniStat value={0} label="Available" />
              <MiniStat value={money(0)} label="Amount" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 @xl:p-4">
            <h4 className="text-fs-sm font-bold uppercase tracking-wide text-muted-foreground">Visits</h4>
            <div className="mt-3 grid grid-cols-1 gap-y-2 @xl:grid-cols-2 @xl:gap-x-4 @xl:gap-y-3">
              <MiniStat value={orders.length} label="Total" />
              <MiniStat value={extras.visits.length} label="Upcoming" />
              <MiniStat value={0} label="Canceled" />
              <MiniStat value={extras.noShows.length} label="No Show" />
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <SectionCard
            label="Most Ordered Items"
            action={
              <button type="button" aria-label="Most ordered items options" className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="size-4" />
              </button>
            }
          >
            {mostOrdered.length ? (
              <ul className="space-y-2">
                {mostOrdered.map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between gap-3 rounded-pill border border-border px-4 py-2">
                    <span className="min-w-0 truncate">{name}</span>
                    <span className="shrink-0 text-fs-sm text-muted-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-fs-sm text-muted-foreground">No items ordered yet.</p>
            )}
          </SectionCard>
          <SectionCard label="Vehicle">
            <p className="flex items-center gap-3 py-2 text-fs-sm"><Car className="size-5 shrink-0" />No Recent Vehicle To Show</p>
          </SectionCard>
        </div>

        <SectionCard label="Allergies">
          <div className="flex items-start gap-3">
            <Utensils className="mt-1 size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <TagEditor
                values={extras.allergies}
                addLabel="Add"
                tone="dark"
                preset={ALLERGY_OPTIONS}
                dialogTitle="Allergies"
                dialogNote="Select what type of food allergy the customer has from the list below"
                dialogFooter={
                  <>
                    <span className="font-bold">Note:</span> The most commonly used products that trigger allergies are
                    displayed with larger buttons.
                  </>
                }
                onAdd={(value) => update({ allergies: [...extras.allergies, value] })}
                onRemove={(value) => update({ allergies: extras.allergies.filter((item) => item !== value) })}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard label="Upcoming Visits">
          <div className="flex items-start gap-3">
            <Cake className="mt-1 size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <VisitEditor
                visits={extras.visits.filter((visit) => visit.date >= new Date().toISOString().slice(0, 10))}
                onBook={onBook}
                onRemove={(visit) => update({ visits: extras.visits.filter((item) => item !== visit) })}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard label="Notes">
          {([
            ["General", <NotebookPen className="size-5 shrink-0" key="general" />],
            ["Special Relation", <Star className="size-5 shrink-0" key="relation" />],
            ["Seating Preferences", <Armchair className="size-5 shrink-0" key="seating" />],
            ["Special Note", <StickyNote className="size-5 shrink-0" key="special" />],
            ["Allergies", <UtensilsCrossed className="size-5 shrink-0" key="allergies" />],
          ] as const).map(([title, icon]) => (
            <NoteRow
              key={title}
              title={title}
              icon={icon}
              value={extras.notes[title] ?? ""}
              onChange={(value) => update({ notes: { ...extras.notes, [title]: value } })}
            />
          ))}
        </SectionCard>

        <SectionCard label="Recent Orders">
          <p className="flex items-center gap-3 py-2 text-fs-sm"><UtensilsCrossed className="size-5 shrink-0" />No Recent Orders to Show</p>
        </SectionCard>

        <SectionCard label="Online Reviews">
          <p className="flex items-center gap-3 py-2 text-fs-sm"><MessageSquareText className="size-5 shrink-0" />No Online Reviews</p>
        </SectionCard>
      </div>
    </div>
  );
}

/** "2026-01-21" -> { day: "21", month: "Jan" }; null for unknown shapes. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dateParts = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? { day: match[3] ?? "--", month: MONTHS[Number(match[2]) - 1] ?? "" } : null;
};

/** "18:45" -> "6:45 PM"; labels already in a display form pass through unchanged. */
const formatTime = (time: string | undefined) => {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time;
  const hours = Number(match[1]);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
};

/** One visit row: date badge, description and the time / party / table summary. */
function VisitRow({ day, month, time, party, table, description, noShow }: { day: string; month: string; time: string | null; party: string | number; table: string | null; description: string | null; noShow: boolean }) {
  return (
    <div className={cn("flex items-stretch overflow-hidden rounded-xl border border-border bg-surface group-hover:bg-muted", noShow && "border-destructive")}>
      <span aria-hidden className={cn("w-1 shrink-0", noShow ? "bg-destructive" : "bg-success")} />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 sm:px-4">
        <div aria-label={`Visit date ${month} ${day}`} className="flex shrink-0 flex-col items-center border-r border-border pr-3 sm:pr-4">
          <span className="text-fs-lg font-bold leading-none">{day}</span>
          <span className="text-fs-xs text-muted-foreground">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="min-w-0 truncate font-bold">{description || "No Description"}</p>
          {noShow ? <p className="mt-0.5 text-fs-xs font-bold text-destructive">No show</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-fs-sm text-muted-foreground sm:gap-3">
          {time ? <span className="flex items-center gap-1.5"><Clock className="size-4" />{time}</span> : null}
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="flex items-center gap-1.5"><UserRound className="size-4" />{party}</span>
          {table ? (
            <>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <span className="flex items-center gap-1.5"><Table2 className="size-4" />{table}</span>
            </>
          ) : null}
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </div>
    </div>
  );
}

function ReservationsCell({ icon, value, label }: { icon: ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg bg-surface-muted px-4 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-fs-lg font-bold">{value}</p>
        <p className="text-fs-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/** Reservations tab: Upcoming/Recent toggle, summary strip and visit rows. */
function ReservationsTab({ guest, indent }: { guest: GuestRow; indent: number }) {
  const [view, setView] = useState<"upcoming" | "recent">("recent");
  const [extras, setExtras] = useState<Extras>(() => loadExtras(guest.id));
  const [menu, setMenu] = useState<string | null>(null);
  const rowRef = useRef<SwipeRowHandle>(null);
  /** Marks a visit as a no show (or back to a normal visit) and keeps it on the device. */
  const setNoShow = (key: string, value: boolean) =>
    setExtras((prev) => {
      const noShows = value
        ? Array.from(new Set([...prev.noShows, key]))
        : prev.noShows.filter((item) => item !== key);
      const next = { ...prev, noShows };
      saveExtras(guest.id, next);
      return next;
    });
  const today = new Date().toISOString().slice(0, 10);
  const booked = [...extras.visits].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = booked.filter((visit) => visit.date >= today);
  const spent = guest.tickets.reduce((sum, ticket) => sum + (ticket.payments ?? []).reduce((total, payment) => total + payment.amount, 0), 0);

  /** Stable demo party size / table code for a booked visit (not stored by the booking form). */
  const demoDetails = (visit: { date: string }, index: number) => {
    const seed = [...(guest.id + visit.date)].reduce((total, char) => total + char.charCodeAt(0), 0) + index;
    return { party: 1 + (seed % 4), table: `${initials(guest.name).slice(0, 2)}${100 + (seed % 900)}` };
  };

  const rowFor = (visit: Visit, index: number) => {
    const parts = dateParts(visit.date) ?? { day: "--", month: "" };
    const demo = demoDetails(visit, index);
    return {
      ...parts,
      key: visit.id ?? `b:${visit.date}-${visit.time}`,
      time: formatTime(visit.time),
      description: visit.description ?? null,
      party: visit.party ?? demo.party,
      table: visit.table ?? demo.table,
    };
  };
  const upcomingRows = upcoming.map((visit, index) => rowFor(visit, index));
  const pastBooked = booked.filter((visit) => visit.date < today).reverse().map((visit, index) => rowFor(visit, index));
  // Recent visits come from the guest's real checks, joined by any booked past visits.
  const recentRows = [
    ...pastBooked,
    ...[...guest.tickets].sort((a, b) => b.date.localeCompare(a.date)).map((ticket) => ({
      key: `t:${ticket.id}`,
      day: dateParts(ticket.date)?.day ?? "--",
      month: dateParts(ticket.date)?.month ?? "",
      time: ticket.arrivedAt || null,
      description: null,
      party: ticket.seats,
      table: ticket.table ?? null,
    })),
  ];
  const rows = view === "upcoming" ? upcomingRows : recentRows;

  return (
    <div className="space-y-5">
      <div data-resv-toggle className="flex items-center gap-2" style={indent ? { paddingLeft: `${indent}px` } : undefined}>
        <div role="tablist" aria-label="Reservations view" className="flex items-center rounded-pill bg-surface-muted p-1">
          {([["upcoming", "Upcoming Visits"], ["recent", "Recent Visits"]] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              className={cn(
                "min-h-tap shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-fs-sm font-bold transition-colors sm:px-5",
                view === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="hidden text-muted-foreground sm:block" title="Reservation and visit history for this guest">
          <Info className="size-4" />
          <span className="sr-only">Reservation and visit history for this guest</span>
        </span>
      </div>

      <section aria-label="Reservations summary">
        <h3 className="mb-3 text-fs-sm font-bold uppercase tracking-wide text-muted-foreground">Summary</h3>
        <div className="grid gap-2 rounded-xl border border-border bg-surface p-2 sm:grid-cols-2 xl:grid-cols-4">
          <ReservationsCell icon={<CalendarClock className="size-5" />} value={booked.length} label="Reservations" />
          <ReservationsCell icon={<CalendarCheck className="size-5" />} value={upcoming.length} label="Upcoming Visits" />
          <ReservationsCell icon={<CalendarX className="size-5" />} value={0} label="Cancellation" />
          <ReservationsCell icon={<Banknote className="size-5" />} value={money(spent)} label="Spent" />
        </div>
      </section>

      {rows.length ? (
        <>
          <ul className="space-y-3">
            {rows.map((row) => {
              const noShow = extras.noShows.includes(row.key);
              return (
                <li key={row.key}>
                  <SwipeRow
                    ref={rowRef}
                    className="rounded-xl"
                    action={{
                      label: "No show",
                      destructive: true,
                      onAction: () => {
                        if (!noShow) setNoShow(row.key, true);
                      },
                    }}
                  >
                    <Popover open={menu === row.key} onOpenChange={(open) => {
                      // A swipe release leaves a click behind; it must not open the row menu.
                      if (open && rowRef.current?.wasDragged()) return;
                      setMenu(open ? row.key : null);
                    }}>
                      <PopoverTrigger asChild>
                        <button type="button" className="group w-full text-left">
                          <VisitRow day={row.day} month={row.month} time={row.time} party={row.party} table={row.table} description={row.description} noShow={noShow} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setNoShow(row.key, !noShow);
                            setMenu(null);
                          }}
                          className="flex w-full items-center rounded-sm px-3 py-2 text-left text-fs-sm font-bold hover:bg-muted"
                        >
                          {noShow ? "Undo no show" : "No show"}
                        </button>
                      </PopoverContent>
                    </Popover>
                  </SwipeRow>
                </li>
              );
            })}
          </ul>
          <p className="text-fs-xs text-muted-foreground">Swipe left on a visit to mark it as a no show. Tap a visit for the same option, or to undo a no show. Demo only — it doesn't change orders or table occupancy.</p>
        </>
      ) : (
        <p className="py-2 text-fs-sm text-muted-foreground">{view === "upcoming" ? "No Upcoming Visits" : "No Past Reservations"}</p>
      )}
    </div>
  );
}

/** Payments tab: payments recorded on the guest's checks. */
function PaymentsTab({ guest }: { guest: GuestRow }) {
  const payments = guest.tickets
    .flatMap((ticket) => (ticket.payments ?? []).map((payment) => ({ ...payment, ticket })))
    .sort((a, b) => b.ticket.date.localeCompare(a.ticket.date));
  return (
    <SectionCard label="Payments">
      {payments.length ? (
        <ul className="divide-y divide-border">
          {payments.map((payment) => (
            <li key={`${payment.ticket.id}-${payment.no}-${payment.at}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="font-bold">{payment.method}</p>
                <p className="text-fs-xs text-muted-foreground">Order# {payment.ticket.orderNo ?? "--"} · {payment.ticket.date} · {payment.at}</p>
              </div>
              <p className="shrink-0 font-bold">{money(payment.amount)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 text-fs-sm text-muted-foreground">No payments to show.</p>
      )}
    </SectionCard>
  );
}

function FeedbackTab() {
  return (
    <SectionCard label="Feedback">
      <p className="flex items-center gap-3 py-2 text-fs-sm"><MessageSquareText className="size-5 shrink-0" />No Feedback Yet</p>
    </SectionCard>
  );
}

/** Order History tab: the guest's real checks, newest first. */
function HistoryTab({ guest }: { guest: GuestRow }) {
  return (
    <section aria-label="Order history">
      <h3 className="mb-3 text-fs-lg font-bold">Order History</h3>
      {guest.tickets.length ? (
        <ul className="divide-y divide-border">
          {[...guest.tickets].sort((a, b) => b.date.localeCompare(a.date)).map((ticket) => (
            <li key={ticket.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 py-4">
              <div>
                <p className="font-bold">Order# {ticket.orderNo ?? "--"}</p>
                <p className="text-fs-xs text-muted-foreground">{ticket.date} · {ticket.arrivedAt}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{money(ticket.total)}</p>
                <p className="text-fs-xs text-muted-foreground">{ticket.closed ? "Closed" : statusMeta[ticket.status].label}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-fs-sm text-muted-foreground">No order history available.</p>
      )}
    </section>
  );
}

type GuestTab = "profile" | "reservations" | "payments" | "feedback" | "history";
const GUEST_TABS: { id: GuestTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "reservations", label: "Reservations" },
  { id: "payments", label: "Payments" },
  { id: "feedback", label: "Feedback" },
  { id: "history", label: "Order History" },
];

function GuestDetail({ guest, onBook }: { guest: GuestRow; onBook: () => void }) {
  const router = useRouter();
  const { setGuest } = usePos();
  const [tab, setTab] = useState<GuestTab>("profile");
  const [resvIndent, setResvIndent] = useState(0);
  const paneRef = useRef<HTMLDivElement>(null);
  // Starting an order from a profile attaches that guest, so the New Order
  // screen opens with their name, phone, email and address already filled in.
  const startOrder = () => {
    setGuest(guestOrderPatch(guest));
    router.navigate({ to: "/order/new" });
  };

  // The Reservations view toggle sits under the "Reservations" tab: measure that tab's
  // left edge so the two line up at any width, and never shift the toggle past the pane.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const measure = () => {
      const strip = pane.querySelector<HTMLElement>('[role="tablist"][aria-label="Guest sections"]');
      const target = pane.querySelector<HTMLElement>('[data-tab="reservations"]');
      const toggle = pane.querySelector<HTMLElement>('[role="tablist"][aria-label="Reservations view"]');
      const info = pane.querySelector<HTMLElement>('[data-resv-toggle] span[title]');
      if (!strip || !target) {
        setResvIndent(0);
        return;
      }
      const stripRect = strip.getBoundingClientRect();
      const wanted = target.getBoundingClientRect().left - stripRect.left - 4;
      // Keep the whole row (toggle, gap, info icon) inside the pane. The icon is hidden on phones.
      const infoWidth = info?.getBoundingClientRect().width ?? 0;
      const used = (toggle?.getBoundingClientRect().width ?? 0) + (infoWidth ? 8 + infoWidth : 0);
      const room = pane.getBoundingClientRect().right - stripRect.left - used;
      const next = Math.max(0, Math.min(wanted, room));
      setResvIndent((current) => (Math.abs(current - next) < 1 ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [tab]);

  return (
    <div ref={paneRef} className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Guest sections" className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-pill bg-surface-muted p-1">
          {GUEST_TABS.map((entry) => (
            <button
              key={entry.id}
              data-tab={entry.id}
              type="button"
              role="tab"
              aria-selected={tab === entry.id}
              className={cn(
                "min-h-tap shrink-0 rounded-pill px-4 py-1.5 text-fs-sm font-bold transition-colors",
                tab === entry.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <DarkPill onClick={startOrder}>
          <Plus className="size-4" />
          New Order
        </DarkPill>
      </div>

      {tab === "profile" ? <GuestProfile guest={guest} onBook={onBook} /> : null}
      {tab === "reservations" ? <ReservationsTab guest={guest} indent={resvIndent} /> : null}
      {tab === "payments" ? <PaymentsTab guest={guest} /> : null}
      {tab === "feedback" ? <FeedbackTab /> : null}
      {tab === "history" ? <HistoryTab guest={guest} /> : null}
    </div>
  );
}

function Guestbook() {
  const router = useRouter();
  const wide = useWideLayout();
  const { tickets, guest } = usePos();
  const records = useMemo(() => guestDirectory(tickets, guest), [tickets, guest]);
  // On wide screens the detail pane would otherwise sit empty, so the first
  // guest is picked for you; phones still open on the list.
  const [selectedId, setSelectedId] = useState<string | null>(() => (wide ? records[0]?.id ?? null : null));
  const [booking, setBooking] = useState(false);
  const selected = records.find((row) => row.id === selectedId);
  const goSettings = () => router.navigate({ to: "/settings" });

  if (booking && selected) {
    const book = (visit: GuestVisit) => {
      const extras = loadExtras(selected.id);
      saveExtras(selected.id, { ...extras, visits: [...extras.visits, { ...visit, id: newVisitId() }] });
      setBooking(false);
    };
    return <GuestVisitBooking name={selected.name} phone={selected.phone} onCancel={() => setBooking(false)} onBook={book} />;
  }

  if (wide) {
    // The guestbook owns the whole panel: a "Guestbook" header with a back
    // chevron to Settings above the guest list on the left, and the selected
    // guest's details on the right.
    const listHeader = <SubHeader title="Guestbook" backLabel="Settings" onBack={goSettings} />;
    return selected ? (
      <SplitPane
        list={
          <>
            {listHeader}
            <GuestList records={records} selectedId={selected.id} className="px-3 py-3 lg:px-4" onSelect={(id) => setSelectedId(id === selected.id ? null : id)} />
          </>
        }
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <SubHeader title={selected.name} />
          <ScreenBody><GuestDetail key={selected.id} guest={selected} onBook={() => setBooking(true)} /></ScreenBody>
        </div>
      </SplitPane>
    ) : (
      <SplitPane
        list={
          <>
            {listHeader}
            <GuestList records={records} selectedId={null} className="px-3 py-3 lg:px-4" onSelect={setSelectedId} />
          </>
        }
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PaneEmpty title="No guest selected" detail="Pick a guest on the left to see contact details and order history." />
        </div>
      </SplitPane>
    );
  }

  return <>
    <SubHeader title="Guestbook" backLabel="Settings" onBack={goSettings} />
    <ScreenBody>
      {selected ? <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to guests" title="Back to guests" onClick={() => setSelectedId(null)}><ArrowLeft className="size-5" /></Button>
          <h2 className="min-w-0 break-words text-fs-xl font-bold">{selected.name}</h2>
        </div>
        <GuestDetail key={selected.id} guest={selected} onBook={() => setBooking(true)} />
      </div> : <GuestList records={records} selectedId={null} onSelect={setSelectedId} />}
    </ScreenBody>
  </>;
}
