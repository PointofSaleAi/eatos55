import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CreditCard as PayCard, Banknote as PayCash, Gift as PayGift, Award as PayPoints, ChevronDown as PayDown, ArrowUpDown as PaySort, House as Home, Camera, Pencil, Trash2 } from "lucide-react";
import { ArchiveGlyph } from "@/components/pos/archive-glyph";

import {
  ArrowLeft,
  Armchair,
  Banknote,
  Cake,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Car,
  Check,
  ChevronRight,
  Clock,
  Frown,
  Info,
  Mail,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  NotebookPen,
  Phone,
  Plus,
  Search,
  Smile,
  Star,
  StickyNote,
  Table2,
  Tag,
  UserRound,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenBody, SubHeader, useWideLayout } from "@/components/pos/shell";
import { PaneEmpty, SplitPane } from "@/components/pos/split-pane";
import { usePos } from "@/lib/pos-store";
import { guestDirectory, guestOrderPatch, mockEmail, mockPhone, type DirectoryEntry } from "@/lib/guestbook";
import { money, statusMeta } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";
import { GuestVisitBooking } from "@/components/pos/guest-visit-booking";
import { SwipeRow, type SwipeRowHandle } from "@/components/pos/swipe-row";
import { formatPhoneFor as formatPhoneRaw, isValidPhoneFor, phoneCountries, phoneCountryByName, defaultPhoneCountry } from "@/lib/phone";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import type { GuestVisit } from "@/lib/guest-reservation";
import googleFeedbackLogo from "@/assets/feedback-google.png.asset.json";
import eatosFeedbackLogo from "@/assets/feedback-eatos.png.asset.json";
import yelpFeedbackLogo from "@/assets/feedback-yelp.png.asset.json";
import zagatFeedbackLogo from "@/assets/feedback-zagat.png.asset.json";
import orderosFeedbackLogo from "@/assets/feedback-orderos.png.asset.json";

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

/** Demo directory actions — guests added here and archived ids, kept on the device only. */
const DIRECTORY_KEY = "eatos.pos.guestbook-directory";
type DirectoryStore = { added: DirectoryEntry[]; archived: string[] };
const emptyDirectory = (): DirectoryStore => ({ added: [], archived: [] });
const loadDirectory = (): DirectoryStore => {
  try {
    return { ...emptyDirectory(), ...(JSON.parse(localStorage.getItem(DIRECTORY_KEY) ?? "{}") as DirectoryStore) };
  } catch {
    return emptyDirectory();
  }
};
const saveDirectory = (store: DirectoryStore) => {
  try {
    localStorage.setItem(DIRECTORY_KEY, JSON.stringify(store));
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



/** One guest row: swipe left to archive the guest (or restore them in the archived view). */
function GuestListRow({
  row,
  selected,
  archived,
  onSelect,
  onArchive,
  onRestore,
}: {
  row: GuestRow;
  selected: boolean;
  archived: boolean;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const rowRef = useRef<SwipeRowHandle>(null);
  return (
    <SwipeRow
      ref={rowRef}
      className="rounded-none"
      action={{
        label: archived ? "Restore to list" : "Archive guest",
        muted: !archived,
        icon: <ArchiveGlyph className="size-5" />,
        onAction: () => (archived ? onRestore(row.id) : onArchive(row.id)),
      }}

    >
      <Button
        variant="ghost"
        className={cn(
          "h-auto min-h-ctl-lg w-full min-w-0 justify-start gap-3 rounded-none px-2 py-4 text-foreground hover:bg-muted",
          selected && "bg-muted",
        )}
        onClick={() => {
          // A swipe release leaves a click behind; it must not open the guest.
          if (rowRef.current?.wasDragged()) return;
          onSelect(row.id);
        }}
      >
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-fs-xs font-bold", initialsTone(row.name))} aria-hidden="true">{initials(row.name)}</span>
        <span className="min-w-0 flex-1 whitespace-normal break-words text-left">
          <span className="block font-bold">{row.name}</span>
          {row.email ? <span className="block break-all text-fs-xs text-muted-foreground">{row.email}</span> : null}
        </span>
        <ChevronRight className="size-4 shrink-0" />
      </Button>
    </SwipeRow>
  );
}

/** Searchable guest list; used full-width on phones and as the left pane on wide screens. */
function GuestList({
  records,
  archivedRecords,
  selectedId,
  onSelect,
  onArchive,
  onRestore,
  onOpenAdd,
  className,
}: {
  records: GuestRow[];
  archivedRecords: GuestRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onOpenAdd: () => void;
  className?: string | undefined;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"az" | "za" | "recent">("az");
  const [archivedView, setArchivedView] = useState(false);
  const q = query.trim().toLowerCase();
  const pool = archivedView ? archivedRecords : records;
  const latestDate = (row: GuestRow) => row.tickets.reduce((latest, ticket) => (ticket.date > latest ? ticket.date : latest), "");
  const visible = useMemo(() => {
    const list = pool.filter((row) => [row.name, row.email, row.phone].some((value) => value?.toLowerCase().includes(q)));
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return [...list].sort((a, b) => latestDate(b).localeCompare(latestDate(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, q, sort]);
  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
      <label className="mb-3 flex min-h-ctl-md shrink-0 items-center gap-3 rounded-pill border border-border bg-surface px-4">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input type="search" aria-label="Search guests" placeholder="Search guests" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-tap min-w-0 flex-1 bg-transparent outline-none" />
      </label>
      <div className="mb-3 flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label="Add new guest" title="Add new guest" onClick={onOpenAdd} className="rounded-full bg-foreground text-background hover:bg-foreground/90 hover:text-background">
          <Plus className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label={archivedView ? "Show active guests" : "Show archived guests"} aria-pressed={archivedView} onClick={() => setArchivedView((v) => !v)} title={archivedView ? "Show active guests" : "Show archived guests"} className={cn("rounded-full bg-action-grey text-action-grey-foreground hover:bg-action-grey/80 hover:text-action-grey-foreground", archivedView && "ring-2 ring-foreground/25")}>
          <ArchiveGlyph className="size-4" />
        </Button>

        <span className="flex-1" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Sort guests" title="Sort guests" className="rounded-full"><PaySort className="size-4" /></Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-1">
            {([["az", "Name A–Z"], ["za", "Name Z–A"], ["recent", "Most Recent"]] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setSort(value)} className={cn("flex min-h-tap w-full items-center justify-between rounded-lg px-3 py-2 text-left text-fs-sm hover:bg-muted", sort === value && "bg-muted font-bold")}>
                {label}
                {sort === value ? <Check className="size-4" /> : null}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      {visible.length ? (
        <ul className="no-scrollbar min-h-0 min-w-0 flex-1 divide-y divide-border overflow-y-auto border-y border-border">
          {visible.map((row) => (
            <li key={row.id}>
              <GuestListRow
                row={row}
                selected={row.id === selectedId}
                archived={archivedView}
                onSelect={onSelect}
                onArchive={onArchive}
                onRestore={onRestore}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-muted-foreground">{archivedView ? "No archived guests." : q ? "No guests found." : "No named guests available."}</p>
      )}
      <p className="pt-2 text-fs-xs text-muted-foreground">{archivedView ? "Archived guests stay on this device only. Swipe a guest left to restore them." : "Demo only — swipe a guest left to archive them."}</p>
    </div>
  );
}

/** Uppercase section label with an optional right-hand action, over a card. */
function SectionCard({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={label}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-fs-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</h3>
        {action ?? null}
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">{children}</div>
    </section>
  );
}

/** Dark pill used for the reference-style actions (New Order, Add, Book A Visit…). */
function DarkPill({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string | undefined }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex min-h-tap items-center gap-1 rounded-pill bg-foreground px-4 py-1.5 text-fs-sm font-bold text-background transition-colors hover:bg-foreground/90", className)}
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
  align = "start",
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
  /** Where the add control sits among the chips: left, centered, or pushed to the right edge. */
  align?: "start" | "center" | "end";
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
  const pushRight = align === "end" ? "ml-auto" : undefined;
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
    <div className={cn("flex flex-wrap items-center gap-2", align === "center" && "justify-center")}>
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
        <DarkPill className={pushRight} onClick={() => setPickerOpen(true)}>{addLabel}</DarkPill>
      ) : tone === "dark" ? (
        <DarkPill className={pushRight} onClick={() => setAdding(true)}>{addLabel}</DarkPill>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className={cn("min-h-tap rounded-pill px-3 text-fs-sm text-muted-foreground hover:text-foreground", pushRight)}
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
    </li>)}</ul> : null}
    <div className="flex items-center justify-between gap-3">
      {!visits.length ? <p className="min-w-0 text-fs-sm">No Upcoming Visits</p> : <span />}
      <DarkPill className="shrink-0" onClick={onBook}>Book A Visit</DarkPill>
    </div>
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
  const [itemSort, setItemSort] = useState<"name" | "frequency">("frequency");
  const [itemSortAsc, setItemSortAsc] = useState(false);
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
  const allMostOrdered = [...itemTotals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const mostOrdered = allMostOrdered.slice(0, 5);
  const sortedItems = [...allMostOrdered].sort((a, b) => (itemSort === "name" ? a[0].localeCompare(b[0]) : a[1] - b[1] || a[0].localeCompare(b[0])) * (itemSortAsc ? 1 : -1));
  const sortItems = (column: "name" | "frequency") => {
    setItemSortAsc(itemSort === column ? !itemSortAsc : column === "name");
    setItemSort(column);
  };

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
            align="center"
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Most ordered items options" className="size-7 rounded-full bg-muted text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-lg p-0">
                  <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <DialogTitle className="flex-1 text-center text-fs-lg">Most Ordered Items</DialogTitle>
                    <DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close most ordered items" className="shrink-0 rounded-full bg-muted"><X className="size-4" /></Button></DialogClose>
                  </div>
                  <DialogDescription className="sr-only">All dishes ordered by this guest and their frequency.</DialogDescription>
                  <div className="max-h-[65dvh] overflow-y-auto px-4 pb-4">
                    <table className="w-full text-fs-sm">
                      <thead className="sticky top-0 bg-surface"><tr className="border-b border-border">
                        <th scope="col" aria-sort={itemSort === "name" ? itemSortAsc ? "ascending" : "descending" : "none"} className="text-left"><Button variant="ghost" onClick={() => sortItems("name")} className="justify-start px-3">Dish Name<PaySort className="size-3" /></Button></th>
                        <th scope="col" aria-sort={itemSort === "frequency" ? itemSortAsc ? "ascending" : "descending" : "none"} className="text-right"><Button variant="ghost" onClick={() => sortItems("frequency")} className="px-3">Frequency<PaySort className="size-3" /></Button></th>
                      </tr></thead>
                      <tbody>{sortedItems.length ? sortedItems.map(([name, count]) => <tr key={name} className="border-b border-border odd:bg-surface even:bg-surface-muted"><td className="break-words px-3 py-4">{name}</td><td className="px-3 py-4 text-right tabular-nums">{count}</td></tr>) : <tr><td colSpan={2} className="p-4 text-muted-foreground">No items ordered yet.</td></tr>}</tbody>
                    </table>
                  </div>
                </DialogContent>
              </Dialog>
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
                align="end"
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
        <Popover>
          <PopoverTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label="Reservation information" className="size-8 shrink-0 rounded-full text-muted-foreground"><Info className="size-4" /></Button></PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-80 max-w-[calc(100vw-2rem)] rounded-lg p-4">
            <ul className="space-y-2 text-fs-xs text-muted-foreground">
              <li className="flex items-start gap-3"><span className="mt-1 size-2.5 shrink-0 rounded-full bg-tile-blue" /><span>Blue represents official events or gatherings.</span></li>
              <li className="flex items-start gap-3"><span className="mt-1 size-2.5 shrink-0 rounded-full bg-tile-pink" /><span>Pink signifies engagement, anniversary, and dates.</span></li>
              <li className="flex items-start gap-3"><span className="mt-1 size-2.5 shrink-0 rounded-full bg-tile-yellow" /><span>Yellow signifies fun celebration, birthday, Christmas, New Year.</span></li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      <section aria-label="Reservations summary">
        <h3 className="mb-3 text-fs-sm font-bold uppercase tracking-wide tet-muted-foreground">Summary</h3>
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

type PayGroup = "Cards" | "Loyalty" | "Cash" | "Gift Card";
const PAY_GROUPS: PayGroup[] = ["Cards", "Loyalty", "Cash", "Gift Card"];
const payGroupOf = (method: string): PayGroup =>
  /cash/i.test(method) ? "Cash" : /gift/i.test(method) ? "Gift Card" : /loyal|point/i.test(method) ? "Loyalty" : "Cards";
type PaySortKey = "date" | "spent" | "tips" | "points" | "type" | "total";

const CARD_BRANDS = ["Visa", "Mastercard", "Amex", "Discover"] as const;
/** Demo per-tender detail line for a payment row: card brand / till / points, plus its check and time. */
const payDetailOf = (method: string, seed: number, ref: string | undefined, points: number, check: string, time: string): string => {
  const refTxt = ref ?? `AUTH-${100000 + (seed % 900000)}`;
  const tail = `Check #${check} · ${time}`;
  if (/cash/i.test(method)) return `Cash · Till ${1 + (seed % 4)} · Ref ${refTxt} · ${tail}`;
  if (/gift/i.test(method)) return `Gift Card · Ref ${refTxt} · ${tail}`;
  if (/loyal|point/i.test(method)) return `Loyalty · ${points} pts redeemed · Ref ${refTxt} · ${tail}`;
  if (/qr/i.test(method)) return `Scan to Pay · Ref ${refTxt} · ${tail}`;
  const brand = CARD_BRANDS[seed % CARD_BRANDS.length] ?? "Visa";
  return `Card · ${brand} ····${1000 + (seed % 9000)} · Auth ${refTxt} · ${tail}`;
};

/** Payments tab: payments on the guest's checks grouped by tender, with a summary strip. Points are demo values (1 per $10). */
function PaymentsTab({ guest }: { guest: GuestRow }) {
  const [sort, setSort] = useState<{ key: PaySortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [open, setOpen] = useState<PayGroup | null>(null);
  const rows = guest.tickets.flatMap((ticket) => {
    const paid = (ticket.payments ?? []).reduce((n, p) => n + p.amount, 0) || 1;
    return (ticket.payments ?? []).map((p) => {
      const tips = ((ticket.tips ?? 0) * p.amount) / paid;
      const key = `${ticket.id}-${p.no}-${p.at}`;
      const seed = textSeed(key);
      // Loyalty rows are redemptions: their Points cell shows points spent, other rows earn 1 point per $10.
      const points = /loyal|point/i.test(p.method) ? Math.round(p.amount) : Math.floor(p.amount / 10);
      const check = String(ticket.checkNumber ?? ticket.number ?? ticket.id);
      return { key, date: ticket.date, method: p.method, group: payGroupOf(p.method), total: p.amount, tips, spent: p.amount - tips, points, detail: payDetailOf(p.method, seed, p.ref, points, check, p.at) };
    });
  });
  const val = (r: (typeof rows)[number]) => (sort.key === "type" ? r.method : sort.key === "date" ? r.date : r[sort.key]);
  const sorted = [...rows].sort((a, b) => {
    const x = val(a), y = val(b);
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
  });
  const sum = (g: PayGroup) => rows.filter((r) => r.group === g).reduce((n, r) => n + r.total, 0);
  const points = rows.filter((r) => r.group !== "Loyalty").reduce((n, r) => n + r.points, 0);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const cols = "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 @lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,1fr)]";
  const header: [PaySortKey, string, string][] = [["date", "Date", ""], ["spent", "Spent", "hidden @lg:flex"], ["tips", "Tips", "hidden @lg:flex"], ["points", "Points", "hidden @lg:flex"], ["type", "Payment Type", ""], ["total", "Total", "justify-end"]];
  const cards: [string, ReactNode, ReactNode][] = [
    ["Cards", <PayCard key="c" className="size-4" />, money(sum("Cards"))],
    ["Cash", <PayCash key="m" className="size-4" />, money(sum("Cash"))],
    ["Loyalty Points", <PayPoints key="l" className="size-4" />, points.toFixed(2)],
    ["Gift Card", <PayGift key="g" className="size-4" />, money(sum("Gift Card"))],
  ];
  return (
    <section aria-label="Payments" className="@container space-y-4">
      <div>
        <h3 className="mb-2 text-fs-sm font-bold uppercase tracking-wide tet-muted-foreground">Summary</h3>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-2 @xl:grid-cols-4">
          {cards.map(([label, icon, value]) => (
            <div key={label} className="flex items-center gap-3 rounded-lg bg-surface-muted p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface">{icon}</span>
              <div className="min-w-0"><p className="font-bold">{value}</p><p className="truncate text-fs-xs text-muted-foreground">{label}</p></div>
            </div>
          ))}
        </div>
      </div>
      {rows.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className={cn(cols, "border-b border-border px-3 py-2.5 text-fs-xs font-bold")}>
            {header.map(([key, label, extra]) => (
              <button key={key} type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }))} className={cn("flex items-center gap-1 text-left hover:text-foreground", key === "type" && "@lg:justify-center", extra)}>
                {label}<PaySort className={cn("size-3", sort.key === key ? "text-foreground" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
          {PAY_GROUPS.filter((g) => rows.some((r) => r.group === g)).map((g) => {
            const list = sorted.filter((r) => r.group === g);
            const latest = list[0]!;
            const expanded = open === g;
            return (
              <div key={g}>
                <p className="bg-surface-muted px-3 py-1.5 text-fs-xs font-bold uppercase text-muted-foreground">{g}</p>
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : g)} className={cn(cols, "w-full border-b border-border px-3 py-3 text-left text-fs-sm hover:bg-muted")}>
                  <span className="font-bold">{fmtDate(latest.date)}</span>
                  <span className="hidden @lg:block">{money(list.reduce((n, r) => n + r.spent, 0))}</span>
                  <span className="hidden @lg:block">{money(list.reduce((n, r) => n + r.tips, 0))}</span>
                  <span className="hidden @lg:block">{String(list.reduce((n, r) => n + r.points, 0)).padStart(2, "0")}</span>
                  <span className="flex items-center gap-2 truncate @lg:justify-center">{latest.method}<span className="grid size-5 place-items-center rounded-full border border-border text-fs-xs">{list.length}</span></span>
                  <span className="flex items-center justify-end gap-1 font-bold">{money(list.reduce((n, r) => n + r.total, 0))}<PayDown className={cn("size-4 text-muted-foreground transition-transform", !expanded && "-rotate-90")} /></span>
                </button>
                {expanded ? list.map((r) => (
                  <div key={r.key} className="border-b border-border bg-surface-muted/50">
                    <div className={cn(cols, "px-3 pt-2.5 text-fs-sm")}>
                      <span>{fmtDate(r.date)}</span>
                      <span className="hidden @lg:block">{money(r.spent)}</span>
                      <span className="hidden @lg:block">{money(r.tips)}</span>
                      <span className="hidden @lg:block">{String(r.points).padStart(2, "0")}</span>
                      <span className="truncate @lg:text-center">{r.method}</span>
                      <span className="text-right">{money(r.total)}</span>
                    </div>
                    <p className="px-3 pb-2.5 pt-0.5 text-fs-xs text-muted-foreground">{r.detail}</p>
                  </div>
                )) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-2 text-fs-sm text-muted-foreground">No payments to show.</p>
      )}
    </section>
  );
}

/** Original source artwork supplied for the feedback screen. */
const FEEDBACK_SOURCES = ["Google", "eatos", "yelp", "ZAGAT", "ordéros"] as const;
const FEEDBACK_LOGOS = {
  Google: googleFeedbackLogo.url,
  eatos: eatosFeedbackLogo.url,
  yelp: yelpFeedbackLogo.url,
  ZAGAT: zagatFeedbackLogo.url,
  ordéros: orderosFeedbackLogo.url,
};
const FEEDBACK_REVIEWS = [
  "Good Food lives up to its name, offering a delightful dining experience in downtown. The cozy ambiance and friendly staff create a welcoming atmosphere, while the menu impresses with its variety and quality.",
  "The service was prompt and attentive, making our evening enjoyable. Highly recommend the tasting menu and the warm attention from the staff.",
  "The Steak is Raw",
];
const FEEDBACK_REVIEWERS = ["Christo Phill", "Morgan Ellis", "Dana Whitfield", "Priya Nair", "Sam Otero"];
/** Day gaps back from today, mirroring the reference screen's spread. */
const FEEDBACK_OFFSETS = [9, 14, 23, 38, 46];

type FeedbackRow = {
  id: string;
  date: string;
  time: string;
  text: string;
  source: (typeof FEEDBACK_SOURCES)[number];
  serverName: string;
  liked: boolean;
};

/** Deterministic per guest, so reopening the tab shows the same reviews. */
const buildFeedback = (guestId: string): FeedbackRow[] => {
  const seed = textSeed(guestId);
  const today = new Date().toISOString().slice(0, 10);
  return FEEDBACK_OFFSETS.map((offset, index) => {
    const local = (seed + index * 7) % 100;
    const text = FEEDBACK_REVIEWS[(seed + index) % FEEDBACK_REVIEWS.length] ?? "The Steak is Raw";
    return {
      id: `${guestId}-${index}`,
      date: shiftDate(today, -offset),
      time: `${String(1 + (local % 12)).padStart(2, "0")}:${String(10 + (local % 50)).padStart(2, "0")}:00`,
      text,
      source: FEEDBACK_SOURCES[(seed + index) % FEEDBACK_SOURCES.length] ?? "Google",
      serverName: FEEDBACK_REVIEWERS[(seed + index) % FEEDBACK_REVIEWERS.length] ?? "Christo Phill",
      liked: !/raw/i.test(text),
    };
  });
};

function SourceLogo({ name }: { name: FeedbackRow["source"] }) {
  return <img src={FEEDBACK_LOGOS[name]} alt={name} className={cn("h-5 w-12 object-contain sm:h-6 sm:w-16", (name === "eatos" || name === "ordéros") && "dark:invert")} />;
}

function FeedbackRow({ row }: { row: FeedbackRow }) {
  const [open, setOpen] = useState(false);
  const day = new Date(`${row.date}T12:00:00`);
  const contentId = `feedback-${row.id}`;
  return (
    <li className="flex items-start gap-2 rounded-xl border border-border bg-surface px-2 py-2 sm:gap-3 sm:px-3">
      <div aria-hidden className="w-10 shrink-0 border-r border-border py-1 text-center leading-tight sm:w-12">
        <span className="block text-fs-sm font-bold">{String(day.getDate()).padStart(2, "0")}</span>
        <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {day.toLocaleDateString("en-US", { month: "short" })}
        </span>
      </div>
      <div aria-label={row.liked ? "Positive feedback" : "Negative feedback"} className="flex shrink-0 items-center gap-0.5 pt-3">
        <Frown className={cn("size-4", row.liked ? "text-muted-foreground/40" : "text-muted-foreground")} />
        <Smile className={cn("size-4", row.liked ? "text-muted-foreground" : "text-muted-foreground/40")} />
      </div>
      <div className="min-w-0 flex-1 pt-2">
        <div className="flex min-w-0 items-start gap-1.5">
          <MessageSquareText aria-hidden className="mt-1 hidden size-3.5 shrink-0 text-muted-foreground sm:block" />
          <p id={contentId} className={cn("min-w-0 flex-1 text-fs-sm leading-relaxed", open ? "break-words" : "truncate")}>{row.text}</p>
          <Button type="button" variant="ghost" size="sm" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen((value) => !value)} className="h-auto min-h-0 shrink-0 rounded-sm px-1 py-0.5 text-fs-sm font-bold">
            {open ? "Less" : "More"}
          </Button>
        </div>
        {open ? <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-fs-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="size-3 shrink-0" />{row.time}</span>
          <span className="flex items-center gap-1"><UserRound className="size-3 shrink-0" />Server: {row.serverName}</span>
        </div> : null}
      </div>
      <div className="flex shrink-0 items-center justify-end pt-2.5"><SourceLogo name={row.source} /></div>
    </li>
  );
}

function FeedbackTab({ guest }: { guest: GuestRow }) {
  const rows = useMemo(() => buildFeedback(guest.id), [guest.id]);
  return (
    <section aria-label="Feedback">
      <ul className="space-y-2">
        {rows.map((row) => (
          <FeedbackRow key={row.id} row={row} />
        ))}
      </ul>
      <p className="mt-3 text-fs-xs text-muted-foreground">Demo only — sample feedback, it doesn't change real reviews.</p>
    </section>
  );
}

/** Read-only order history; expansion never opens or changes the active POS order. */
function HistoryTab({ guest }: { guest: GuestRow }) {
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: "date" | "name" | "spent" | "tips" | "items" | "type"; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const chronological = [...guest.tickets].sort((a, b) => b.date.localeCompare(a.date) || b.arrivedAt.localeCompare(a.arrivedAt));
  const rows = chronological.map((ticket) => ({
    ticket,
    date: `${ticket.date} ${ticket.arrivedAt}`,
    name: ticket.lines.map((line) => line.name).join(", ") || "No items",
    spent: ticket.total - (ticket.tips ?? 0),
    tips: ticket.tips ?? 0,
    items: ticket.lines.reduce((sum, line) => sum + line.qty, 0),
    type: ticket.orderType || ({ "dine-in": "Dine in", takeaway: "Takeaway", delivery: "Delivery", bar: "Bar" }[ticket.mode]),
  }));
  const latest = rows[0];
  const counts = new Map<string, number>();
  for (const ticket of guest.tickets) for (const line of ticket.lines) counts.set(line.name, (counts.get(line.name) ?? 0) + line.qty);
  const favorite = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const cards: [string, ReactNode, string][] = [
    ["Recent Spent", <Banknote key="rs" />, money(latest?.spent ?? 0)],
    ["Recent Tips", <PayPoints key="rt" />, money(latest?.tips ?? 0)],
    ["Total Spent", <Banknote key="ts" />, money(rows.reduce((sum, row) => sum + row.spent, 0))],
    ["Total Tips", <PayPoints key="tt" />, money(rows.reduce((sum, row) => sum + row.tips, 0))],
    ["Most Ordered Items", <Star key="mi" />, favorite],
  ];
  const sorted = [...rows].sort((a, b) => {
    const x = a[sort.key], y = b[sort.key];
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
  });
  const cols = "grid grid-cols-[3rem_minmax(0,1fr)_5rem_1.25rem] items-center gap-2 @2xl:grid-cols-[3rem_minmax(0,2fr)_minmax(4rem,1fr)_minmax(4rem,1fr)_minmax(3rem,0.7fr)_minmax(5rem,1fr)_1.25rem]";
  const headers: [typeof sort.key, string, string][] = [["date", "Date", ""], ["name", "Dish Name", ""], ["spent", "Spent", "justify-end"], ["tips", "Tips", "hidden @2xl:flex justify-end"], ["items", "Items", "hidden @2xl:flex justify-center"], ["type", "Order Type", "hidden @2xl:flex justify-end"]];
  return (
    <section aria-label="Order history" className="@container space-y-4">
      <div>
        <h3 className="mb-2 text-fs-sm font-bold uppercase tracking-wide tet-muted-foreground">Summary</h3>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-2 @xl:grid-cols-3 @3xl:grid-cols-5">
          {cards.map(([label, icon, value]) => (
            <div key={label} className="flex items-center gap-3 rounded-lg bg-surface-muted p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface [&_svg]:size-4">{icon}</span>
              <div className="min-w-0"><p className="break-words font-bold">{value}</p><p className="text-fs-xs text-muted-foreground">{label}</p></div>
            </div>
          ))}
        </div>
      </div>
      {rows.length ? (
        <div className="space-y-2">
          <div className={cn(cols, "rounded-lg bg-surface px-3 py-2 text-fs-xs font-bold")}>
            {headers.map(([key, label, extra]) => (
              <Button key={key} variant="ghost" onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === -1 ? 1 : -1 }))} className={cn("h-auto min-h-8 gap-0.5 whitespace-normal p-0 text-left text-fs-xs", extra)} aria-label={`Sort orders by ${label}`}>
                {label}<PaySort className="size-3" />
              </Button>
            ))}
            <span />
          </div>
          <ul className="space-y-2">
            {sorted.map((row) => {
              const { ticket } = row;
              const expanded = open === ticket.id;
              const date = dateParts(ticket.date);
              const detailId = `history-${ticket.id}`;
              const paid = (ticket.payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);
              const itemTotal = ticket.lines.reduce((sum, line) => sum + line.price * line.qty * (1 - (line.discountPercent ?? 0) / 100), 0);
              const info: [string, string][] = [["Arrived at", ticket.arrivedAt || "—"], ["Leave at", ticket.closed ? ticket.payments?.at(-1)?.at ?? "—" : "—"], ["Seated at", ticket.table || "—"], ["People", String(ticket.seats)], ["Server", ticket.server || "—"], ["Order Type", row.type], ["Revenue Centre", ticket.revenueCenter || "—"]];
              const bill: [string, string][] = [["Confirmation No.", String(ticket.checkNumber ?? ticket.number)], ["Order No.", String(ticket.orderNo ?? "—")], ["Payment Mode", ticket.payments?.map((p) => p.method).join(", ") || ticket.paymentType || "—"], ["Transaction ID", ticket.payments?.map((p) => p.ref).filter(Boolean).join(", ") || "—"], ["Time", ticket.payments?.at(-1)?.at ?? "—"], ["Payment", ticket.refund ? "Refunded" : ticket.closed ? "Completed" : statusMeta[ticket.status].label]];
              return (
                <li key={ticket.id} className="overflow-hidden rounded-lg border-l-2 border-border bg-surface">
                  <Button variant="ghost" aria-label={`Order ${ticket.orderNo ?? ticket.checkNumber ?? ticket.number}: ${row.name}`} aria-expanded={expanded} aria-controls={detailId} onClick={() => setOpen(expanded ? null : ticket.id)} className={cn(cols, "h-auto min-h-16 w-full rounded-none px-3 py-3 text-left font-normal whitespace-normal")}>
                    <span className="border-r border-border pr-2 text-center text-fs-xs"><span className="block font-bold">{date?.day ?? "—"}</span>{date?.month ?? ""}</span>
                    <span className="min-w-0 break-words text-fs-sm font-semibold">{ticket.lines.length > 3 ? `${ticket.lines[0]?.name} +${ticket.lines.length - 1} more` : row.name}<span className="mt-1 block text-fs-xs font-normal text-muted-foreground @2xl:hidden">{row.type} · {row.items} items · Tips {money(row.tips)}</span></span>
                    <span className="text-right text-fs-sm tabular-nums">{money(row.spent)}</span>
                    <span className="hidden text-right text-fs-sm tabular-nums @2xl:block">{money(row.tips)}</span>
                    <span className="hidden text-center text-fs-sm tabular-nums @2xl:block">{String(row.items).padStart(2, "0")}</span>
                    <span className="hidden items-center justify-end gap-1 text-fs-xs @2xl:flex"><Utensils className="size-3" />{row.type}</span>
                    <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
                  </Button>
                  {expanded ? (
                    <div id={detailId} className="grid gap-4 border-t border-border p-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                      <div className="min-w-0">
                        <div className="grid gap-4 @lg:grid-cols-2">
                          <div><h4 className="mb-3 text-fs-sm font-bold">{ticket.notes?.split("\n")[0] || `Order #${ticket.orderNo ?? ticket.checkNumber ?? ticket.number}`}</h4><dl className="space-y-2">{info.map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-fs-xs"><dt className="text-muted-foreground">{label}</dt><dd className="min-w-0 break-words text-right">{value}</dd></div>)}</dl></div>
                          <div><h4 className="mb-3 flex flex-wrap justify-between gap-2 text-fs-sm font-bold"><span>Bill Summary</span><span>Total Amount: {money(ticket.total)}</span></h4><dl className="space-y-2">{bill.map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-fs-xs"><dt className="text-muted-foreground">{label}</dt><dd className="min-w-0 break-words text-right">{value}</dd></div>)}</dl></div>
                        </div>
                        <div className="mt-4"><h4 className="mb-1 text-fs-sm font-bold">Notes</h4><p className="break-words text-fs-xs text-muted-foreground">{ticket.notes || "No notes"}</p></div>
                      </div>
                      <div className="min-w-0">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-80 text-fs-xs">
                            <thead className="bg-surface-muted"><tr>{["Dish Name", "Qty", "Add - Ons", "Price"].map((label, i) => <th key={label} className={cn("px-2 py-2 font-bold", i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center")}>{label}</th>)}</tr></thead>
                            <tbody>{ticket.lines.map((line, index) => <tr key={`${line.id}-${index}`} className="border-b border-border"><td className="max-w-40 break-words px-2 py-3">{line.name}{line.notes ? <p className="mt-1 text-muted-foreground">{line.notes}</p> : null}</td><td className="px-2 py-3 text-center">{line.qty}</td><td className="max-w-40 break-words px-2 py-3 text-center text-muted-foreground">{line.modifiers?.join(", ") || "—"}</td><td className="px-2 py-3 text-right tabular-nums">{money(line.price * line.qty * (1 - (line.discountPercent ?? 0) / 100))}{line.discountPercent ? <span className="block text-muted-foreground">−{line.discountPercent}%</span> : null}</td></tr>)}</tbody>
                          </table>
                        </div>
                        <dl className="mt-2 space-y-2 text-fs-xs">
                          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Item Total</dt><dd>{row.items} items · {money(itemTotal)}</dd></div>
                          {Math.abs(row.spent - itemTotal) > 0.005 ? <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Adjustments</dt><dd>{money(row.spent - itemTotal)}</dd></div> : null}
                          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Tip</dt><dd>{money(row.tips)}</dd></div>
                          <div className="flex justify-between gap-3 border-t border-border pt-2 font-bold"><dt>Total Amount</dt><dd>{money(ticket.total)}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Paid</dt><dd>{money(paid)}</dd></div>
                          {paid < ticket.total ? <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Balance Due</dt><dd>{money(ticket.total - paid)}</dd></div> : null}
                          {ticket.payments?.map((payment, index) => <div key={`${payment.no}-${index}`} className="flex justify-between gap-3"><dt className="min-w-0 break-words text-muted-foreground">{payment.method} · {payment.at}{payment.ref ? ` · ${payment.ref}` : ""}</dt><dd className="shrink-0">{money(payment.amount)}</dd></div>)}
                          {ticket.refund ? <div className="flex justify-between gap-3 text-destructive"><dt>Refund · {ticket.refund.reason}</dt><dd>{money(ticket.refund.amount)}</dd></div> : null}
                        </dl>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
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
      {tab === "feedback" ? <FeedbackTab guest={guest} /> : null}
      {tab === "history" ? <HistoryTab guest={guest} /> : null}
    </div>
  );
}

function Guestbook() {
  const router = useRouter();
  const wide = useWideLayout();
  const { tickets, guest } = usePos();
  const [directory, setDirectory] = useState<DirectoryStore>(loadDirectory);
  const updateDirectory = (next: DirectoryStore) => {
    setDirectory(next);
    saveDirectory(next);
  };
  const merged = useMemo(() => {
    const base = guestDirectory(tickets, guest);
    const known = new Set(base.map((row) => row.id));
    return [...base, ...directory.added.filter((row) => !known.has(row.id))];
  }, [tickets, guest, directory.added]);
  const records = useMemo(() => merged.filter((row) => !directory.archived.includes(row.id)), [merged, directory.archived]);
  const archivedRecords = useMemo(() => merged.filter((row) => directory.archived.includes(row.id)), [merged, directory.archived]);
  const archiveGuest = (id: string) => {
    updateDirectory({ ...directory, archived: [...new Set([...directory.archived, id])] });
    if (selectedId === id) setSelectedId(records.find((row) => row.id !== id)?.id ?? null);
  };
  const restoreGuest = (id: string) => {
    updateDirectory({ ...directory, archived: directory.archived.filter((item) => item !== id) });
  };
  const addGuest = (input: { name: string; email?: string | undefined; phone?: string | undefined }) => {
    const name = input.name.trim();
    if (!name) return;
    const id = `custom|${name.toLowerCase()}`;
    const entry: DirectoryEntry = { id, name, email: input.email?.trim() || mockEmail(name), phone: input.phone?.trim() || mockPhone(name), tickets: [] };
    updateDirectory({ ...directory, added: [...directory.added.filter((row) => row.id !== id), entry] });
    setSelectedId(id);
  };
  // On wide screens the detail pane would otherwise sit empty, so the first
  // guest is picked for you; phones still open on the list.
  const [selectedId, setSelectedId] = useState<string | null>(() => (wide ? records[0]?.id ?? null : null));
  const [booking, setBooking] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const selected = records.find((row) => row.id === selectedId);
  const goSettings = () => router.navigate({ to: "/settings" });

  if (addingGuest) {
    return <NewGuestPage onCancel={() => setAddingGuest(false)} onSave={(input) => { addGuest(input); setAddingGuest(false); }} />;
  }

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
            <GuestList records={records} archivedRecords={archivedRecords} selectedId={selected.id} className="px-3 py-3 lg:px-4" onSelect={(id) => setSelectedId(id === selected.id ? null : id)} onArchive={archiveGuest} onRestore={restoreGuest} onOpenAdd={() => setAddingGuest(true)} />
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
            <GuestList records={records} archivedRecords={archivedRecords} selectedId={null} className="px-3 py-3 lg:px-4" onSelect={setSelectedId} onArchive={archiveGuest} onRestore={restoreGuest} onOpenAdd={() => setAddingGuest(true)} />
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
      </div> : <GuestList records={records} archivedRecords={archivedRecords} selectedId={null} onSelect={setSelectedId} onArchive={archiveGuest} onRestore={restoreGuest} onOpenAdd={() => setAddingGuest(true)} />}
    </ScreenBody>
  </>;
}

/** Full-page Add Guest form (reference layout, app theme). Demo-only: saves to the device guest directory. */
function NewGuestPage({ onCancel, onSave }: { onCancel: () => void; onSave: (input: { name: string; email?: string | undefined; phone?: string | undefined }) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<{ "Vehicle Details": FormValues[]; Address: FormValues[] }>({ "Vehicle Details": [], Address: [] });
  const [cc, setCc] = useState(defaultPhoneCountry.name);
  const [photo, setPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, number | null>>({});
  const [f, setF] = useState({ first: "", last: "", phone: "", email: "", dob: "", since: "", anniversary: "", note: "" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((d) => ({ ...d, [k]: e.target.value }));
  const valid = f.first.trim() && f.last.trim() && isValidPhoneFor(phoneCountryByName(cc), f.phone) && /.+@.+\..+/.test(f.email);
  const row = "flex min-h-ctl-md items-center justify-between gap-3 border-b border-border py-2 last:border-b-0";
  const input = "min-w-0 flex-1 bg-transparent text-right text-fs-sm outline-none placeholder:text-muted-foreground";
  const req = <span className="text-destructive"> *</span>;
  return <>
    <SubHeader title="New Guest" backLabel="Guestbook" onBack={() => (valid ? onSave({ name: `${f.first.trim()} ${f.last.trim()}`, email: f.email.trim(), phone: `${phoneCountryByName(cc).dial} ${f.phone.trim()}` }) : onCancel())} />
    <ScreenBody>
      <div className="w-full space-y-6">
        <div className="grid gap-4 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)]">
          <label className="relative mx-auto grid size-24 cursor-pointer place-items-center rounded-full bg-surface-muted text-muted-foreground hover:bg-muted" aria-label="Add guest photo" title="Add guest photo">
            {photo ? <img src={photo} alt="Guest photo" className="size-full rounded-full object-cover" /> : <Plus className="size-9" />}
            <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border border-border bg-surface text-foreground"><Camera className="size-4" /></span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => setPhoto(String(r.result)); r.readAsDataURL(file); e.target.value = ""; }} />
          </label>
          <div className="rounded-xl border border-border bg-surface px-4">
            <label className={row}><span className="text-fs-sm font-bold">First Name{req}</span><input aria-label="First name" placeholder="Enter" value={f.first} onChange={set("first")} className={input} /></label>
            <label className={row}><span className="text-fs-sm font-bold">Last Name{req}</span><input aria-label="Last name" placeholder="Enter" value={f.last} onChange={set("last")} className={input} /></label>
            <label className={row}><span className="text-fs-sm font-bold">Phone{req}</span><CountrySelect value={cc} onChange={(c) => { setCc(c); setF((d) => ({ ...d, phone: formatPhoneFor(phoneCountryByName(c), d.phone) })); }} /><input aria-label="Phone" inputMode="tel" placeholder={formatPhoneFor(phoneCountryByName(cc), "0000000000").replace(/0/g, "X")} value={f.phone} onChange={(e) => setF((d) => ({ ...d, phone: formatPhoneFor(phoneCountryByName(cc), e.target.value) }))} className={input} /></label>
            <label className={row}><span className="text-fs-sm font-bold">Email{req}</span><input aria-label="Email" type="email" placeholder="email@example.com" value={f.email} onChange={set("email")} className={input} /></label>
          </div>
          <div className="self-start rounded-xl border border-border bg-surface px-4">
            {([["dob", "Date of Birth"], ["since", "Customer Since"], ["anniversary", "Anniversary"]] as const).map(([k, l]) => (
              <label key={k} className={row}><span className="text-fs-sm font-bold">{l}</span><input aria-label={l} type="date" value={f[k]} onChange={set(k)} className={cn(input, "max-w-40")} /></label>
            ))}
          </div>
        </div>
        <section>
          <h3 className="mb-2 text-fs-xs font-bold uppercase tracking-wide text-muted-foreground">Note</h3>
          <div className="rounded-xl border border-border bg-surface p-4">
            <textarea aria-label="Note" placeholder="Optional" maxLength={250} rows={2} value={f.note} onChange={set("note")} className="w-full resize-none bg-transparent text-fs-sm outline-none placeholder:text-muted-foreground" />
            <p className="text-right text-fs-xs text-muted-foreground">{250 - f.note.length}</p>
          </div>
        </section>
        <div className="grid gap-6 sm:grid-cols-2">
          {(["Vehicle Details", "Address"] as const).map((t) => <section key={t}>
            <h3 className="mb-2 text-fs-sm font-bold">{t}</h3>
            <div className="grid gap-3 @container sm:grid-cols-2">
              {saved[t].map((v, i) => editing[t] === i ? <div key={i} className="sm:col-span-2"><InlineForm kind={t} phone={f.phone} country={cc} initial={v} onClose={(nv) => { setEditing((e) => ({ ...e, [t]: null })); if (nv) setSaved((d) => ({ ...d, [t]: d[t].map((x, j) => (j === i ? nv : x)) })); }} /></div> :
                <SwipeCard key={i} onEdit={() => { setOpen((o) => ({ ...o, [t]: false })); setEditing((e) => ({ ...e, [t]: i })); }} onDelete={() => { setEditing((e) => ({ ...e, [t]: null })); setSaved((d) => ({ ...d, [t]: d[t].filter((_, j) => j !== i) })); }}><SavedCard kind={t} v={v} /></SwipeCard>)}
              {open[t] ? <div className="sm:col-span-2"><InlineForm kind={t} phone={f.phone} country={cc} onClose={(v) => { setOpen((o) => ({ ...o, [t]: false })); if (v) setSaved((d) => ({ ...d, [t]: [...d[t], v] })); }} /></div> :
              <button type="button" onClick={() => setOpen((o) => ({ ...o, [t]: true }))} className="grid min-h-24 w-full place-items-center rounded-xl border-2 border-dashed border-border text-fs-xs text-muted-foreground hover:bg-muted"><span className="grid place-items-center gap-1"><Plus className="size-5" />{t === "Address" ? "Add Address" : "Add Vehicle"}</span></button>}
            </div>
          </section>)}
        </div>
        <p className="text-fs-xs text-muted-foreground">Saved automatically when you go back once name, phone and email are filled. Demo only.</p>
      </div>
    </ScreenBody>
  </>;
}

const VEHICLE_BRANDS: Record<string, string[]> = {
  Car: ["Toyota", "Honda", "Ford", "Tesla", "BMW", "Chevrolet"],
  SUV: ["Jeep", "Toyota", "Ford", "Kia", "Subaru"],
  Truck: ["Ford", "Ram", "GMC", "Chevrolet"],
  Motorcycle: ["Harley-Davidson", "Honda", "Yamaha", "Ducati"],
};
const VEHICLE_COLORS = ["Black", "White", "Silver", "Grey", "Red", "Blue", "Green"];

type FormValues = Partial<Record<"number" | "type" | "color" | "brand" | "label" | "phone" | "cc" | "street" | "city" | "state" | "zip" | "country", string>>;
const DEMO_ADDRESSES = [
  { street: "350 Fifth Avenue", city: "New York", state: "NY", zip: "10118", country: "United States" },
  { street: "1600 Amphitheatre Parkway", city: "Mountain View", state: "CA", zip: "94043", country: "United States" },
  { street: "233 S Wacker Drive", city: "Chicago", state: "IL", zip: "60606", country: "United States" },
  { street: "1 Ocean Drive", city: "Miami Beach", state: "FL", zip: "33139", country: "United States" },
  { street: "400 Broad Street", city: "Seattle", state: "WA", zip: "98109", country: "United States" },
  { street: "100 Congress Avenue", city: "Austin", state: "TX", zip: "78701", country: "United States" },
  { street: "500 Fifth Avenue", city: "New York", state: "NY", zip: "10110", country: "United States" },
  { street: "200 Santa Monica Pier", city: "Santa Monica", state: "CA", zip: "90401", country: "United States" },
];

/** Saved vehicle/address card: swipe (or drag) left to reveal Edit and Delete. */
function SwipeCard({ children, onEdit, onDelete }: { children: ReactNode; onEdit: () => void; onDelete: () => void }) {
  const W = 112;
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; base: number } | null>(null);
  const [drag, setDrag] = useState(false);
  return <div className="relative overflow-hidden rounded-xl">
    <div className="absolute inset-y-0 right-0 flex" style={{ width: W, visibility: dx === 0 ? "hidden" : "visible" }}>
      <button type="button" aria-label="Edit" onClick={() => { setDx(0); onEdit(); }} className="grid flex-1 place-items-center bg-surface-muted text-foreground hover:bg-muted"><Pencil className="size-5" /></button>
      <button type="button" aria-label="Delete" onClick={() => { setDx(0); onDelete(); }} className="grid flex-1 place-items-center bg-destructive text-destructive-foreground"><Trash2 className="size-5" /></button>
    </div>
    <div
      className="relative z-10 touch-pan-y select-none"
      style={{ transform: `translateX(${dx}px)`, transition: drag ? "none" : "transform 180ms ease-out" }}
      onPointerDown={(e) => { start.current = { x: e.clientX, base: dx }; setDrag(true); }}
      onPointerMove={(e) => { if (!start.current) return; setDx(Math.max(-W, Math.min(0, start.current.base + e.clientX - start.current.x))); }}
      onPointerUp={() => { start.current = null; setDrag(false); setDx((d) => (d < -W / 2 ? -W : 0)); }}
      onPointerCancel={() => { start.current = null; setDrag(false); setDx(0); }}
      onPointerLeave={() => { if (start.current) { start.current = null; setDrag(false); setDx((d) => (d < -W / 2 ? -W : 0)); } }}
    >{children}</div>
  </div>;
}

function SavedCard({ kind, v }: { kind: "Vehicle Details" | "Address"; v: FormValues }) {
  const vehicle = kind === "Vehicle Details";
  return <div className="flex min-h-24 items-center gap-4 rounded-xl border border-border bg-surface p-4">
    {vehicle ? <Car className="size-5 shrink-0 text-muted-foreground" /> : <Home className="size-5 shrink-0 text-muted-foreground" />}
    <div className="min-w-0">
      <p className="break-words text-fs-sm font-bold">{vehicle ? [v.brand, v.type].filter(Boolean).join(" ") : v.label}</p>
      <p className="break-words text-fs-xs text-muted-foreground">{vehicle ? [v.number, v.color].filter(Boolean).join(" · ") : [v.street, v.city, `${v.state ?? ""} ${v.zip ?? ""}`.trim()].filter(Boolean).join(", ")}</p>
    </div>
  </div>;
}

/** Guest phone fields accept at most 10 digits, formatted for the chosen country. */
function formatPhoneFor(country: Parameters<typeof formatPhoneRaw>[0], raw: string) {
  return formatPhoneRaw(country, raw.replace(/\D/g, "").slice(0, 10));
}

function CountrySelect({ value, onChange, boxed }: { value: string; onChange: (name: string) => void; boxed?: boolean }) {
  const c = phoneCountryByName(value);
  return <label className={cn("relative inline-flex shrink-0 items-center gap-1 rounded-md bg-surface-muted px-2 text-fs-xs", boxed ? "min-h-ctl-md rounded-lg border border-border px-3 text-fs-sm" : "py-1")}>
    <span aria-hidden>{c.flag} {c.dial}</span><PayDown className="size-3 text-muted-foreground" />
    <select aria-label="Country code" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
      {phoneCountries.map((x) => <option key={x.name} value={x.name}>{x.flag} {x.name} {x.dial}</option>)}
    </select>
  </label>;
}

function L({ t, r, children }: { t: string; r?: boolean; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-fs-xs font-bold text-muted-foreground">{t}{r ? <span className="text-destructive">*</span> : null}</span>{children}</label>;
}

/** Collapsible New Vehicle / New Address form inside the New Guest page (demo-only). */
function InlineForm({ kind, phone, country, initial, onClose }: { kind: "Vehicle Details" | "Address"; phone: string; country: string; initial?: FormValues; onClose: (v?: FormValues) => void }) {
  const [v, setV] = useState<FormValues>(initial ?? { label: "Home", phone, cc: country });
  const pc = phoneCountryByName(v.cc);
  const [suggest, setSuggest] = useState(false);
  const q = (v.street ?? "").trim().toLowerCase();
  const matches = q ? DEMO_ADDRESSES.filter((a) => `${a.street} ${a.city} ${a.state} ${a.zip}`.toLowerCase().includes(q)).slice(0, 5) : [];
  const complete = kind === "Vehicle Details" ? !!(v.number?.trim() && v.brand) : !!(v.street?.trim() && v.city?.trim() && v.state?.trim() && v.zip?.trim());
  const set = (k: "color" | "brand" | "label" | "phone" | "street" | "city" | "state" | "zip" | "country") => (e: { target: { value: string } }) => setV((d) => ({ ...d, [k]: e.target.value }));
  const field = "min-h-ctl-md w-full rounded-lg border border-border bg-surface-muted px-3 text-fs-sm outline-none placeholder:text-muted-foreground focus:border-foreground disabled:opacity-60";
  const vehicle = kind === "Vehicle Details";
  return (
    <div className="rounded-xl border border-border bg-surface">
      <button type="button" onClick={() => onClose(complete ? v : undefined)} aria-label="Collapse form" className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-fs-sm font-bold">
        {initial ? (vehicle ? "Edit Vehicle" : "Edit Address") : vehicle ? "New Vehicle" : "New Address"}<PayDown className="size-4 rotate-180" />
      </button>
      <div className="space-y-3 p-4">
        {vehicle ? <>
          <L t="Vehicle Number" r><input aria-label="Vehicle number" placeholder="ENTER VEHICLE NUMBER" value={v.number ?? ""} onChange={(e) => setV((d) => ({ ...d, number: e.target.value.toUpperCase() }))} className={field} /></L>
          <L t="Vehicle Type"><select aria-label="Vehicle type" value={v.type ?? ""} onChange={(e) => setV((d) => ({ ...d, type: e.target.value, brand: "" }))} className={field}><option value="">Enter Vehicle Type</option>{Object.keys(VEHICLE_BRANDS).map((x) => <option key={x}>{x}</option>)}</select></L>
          <L t="Vehicle Color"><select aria-label="Vehicle color" value={v.color ?? ""} onChange={set("color")} className={field}><option value="">Enter Vehicle Color</option>{VEHICLE_COLORS.map((x) => <option key={x}>{x}</option>)}</select></L>
          <L t="Vehicle Brand" r><select aria-label="Vehicle brand" disabled={!v.type} value={v.brand ?? ""} onChange={set("brand")} className={field}><option value="">{v.type ? "Select Brand" : "Select type first"}</option>{(VEHICLE_BRANDS[v.type ?? ""] ?? []).map((x) => <option key={x}>{x}</option>)}</select></L>
        </> : <>
          <L t="Label"><select aria-label="Address label" value={v.label} onChange={set("label")} className={field}>{["Home", "Work", "Other"].map((x) => <option key={x}>{x}</option>)}</select></L>
          <L t="Phone Number"><div className="flex gap-2"><CountrySelect boxed value={v.cc ?? defaultPhoneCountry.name} onChange={(c) => setV((d) => ({ ...d, cc: c, phone: formatPhoneFor(phoneCountryByName(c), d.phone ?? "") }))} /><input aria-label="Address phone" inputMode="tel" placeholder={formatPhoneFor(pc, "2015550123")} value={v.phone ?? ""} onChange={(e) => setV((d) => ({ ...d, phone: formatPhoneFor(pc, e.target.value) }))} className={field} /></div></L>
          <div className="relative"><L t="Street Address" r><input aria-label="Street address" autoComplete="off" placeholder="Start typing an address..." value={v.street ?? ""} onFocus={() => setSuggest(true)} onBlur={() => setTimeout(() => setSuggest(false), 150)} onChange={(e) => { set("street")(e); setSuggest(true); }} className={field} /></L>
            {suggest && matches.length ? <ul role="listbox" aria-label="Address suggestions" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
              {matches.map((a) => <li key={a.street + a.zip}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setV((d) => ({ ...d, ...a })); setSuggest(false); }} className="flex w-full items-start gap-2 px-3 py-2 text-left text-fs-sm hover:bg-muted"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span><span className="block">{a.street}</span><span className="block text-fs-xs text-muted-foreground">{a.city}, {a.state} {a.zip}, {a.country}</span></span></button></li>)}
            </ul> : null}</div>
          <div className="grid grid-cols-2 gap-3">
            <L t="City" r><input aria-label="City" placeholder="City" value={v.city ?? ""} onChange={set("city")} className={field} /></L>
            <L t="State" r><input aria-label="State" placeholder="State" value={v.state ?? ""} onChange={set("state")} className={field} /></L>
            <L t="Zip Code" r><input aria-label="Zip code" inputMode="numeric" placeholder="Zip" value={v.zip ?? ""} onChange={set("zip")} className={field} /></L>
            <L t="Country"><input aria-label="Country" placeholder="Country" value={v.country ?? ""} onChange={set("country")} className={field} /></L>
          </div>
        </>}
      </div>
    </div>
  );
}
