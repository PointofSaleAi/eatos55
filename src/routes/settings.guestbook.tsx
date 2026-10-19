import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Armchair,
  Cake,
  CalendarClock,
  Car,
  ChevronRight,
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
  Tag,
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
type Extras = {
  tags: string[];
  allergies: string[];
  notes: Record<string, string>;
  visits: { date: string; time: string }[];
};
const emptyExtras = (): Extras => ({ tags: [], allergies: [], notes: {}, visits: [] });
const loadExtras = (id: string): Extras => {
  try {
    const all = JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? "{}") as Record<string, Extras>;
    return { ...emptyExtras(), ...all[id] };
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
  onAdd,
  onRemove,
}: {
  values: string[];
  addLabel: string;
  /** "dark" renders the reference-style pill; "ghost" a quiet inline control. */
  tone?: "ghost" | "dark";
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [adding, setAdding] = useState(false);
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
    <div className="flex flex-wrap items-center gap-2">
      {values.map((value) => (
        <span key={value} className="inline-flex items-center gap-1.5 rounded-pill bg-surface-muted px-3 py-1 text-fs-sm font-medium">
          {value}
          <button
            type="button"
            aria-label={`Remove ${value}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onRemove(value)}
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
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

/** Inline visit booking: pick a date and time, saved to the guest's demo record. */
function VisitEditor({ visits, onAdd, onRemove }: { visits: Extras["visits"]; onAdd: (visit: { date: string; time: string }) => void; onRemove: (visit: { date: string; time: string }) => void }) {
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  return (
    <div className="space-y-3">
      {visits.length ? (
        <ul className="divide-y divide-border">
          {visits.map((visit, index) => (
            <li key={`${visit.date}-${visit.time}-${index}`} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
              <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 text-fs-sm">{visit.date || "Unset date"}{visit.time ? ` · ${visit.time}` : ""}</span>
              <button type="button" aria-label="Remove visit" className="text-muted-foreground hover:text-foreground" onClick={() => onRemove(visit)}>
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-fs-sm">No Upcoming Visits</p>
      )}
      {adding ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="Visit date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-tap rounded-lg border border-border bg-transparent px-3 text-fs-sm outline-none"
          />
          <input
            type="time"
            aria-label="Visit time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="min-h-tap rounded-lg border border-border bg-transparent px-3 text-fs-sm outline-none"
          />
          <DarkPill
            onClick={() => {
              if (date || time) onAdd({ date, time });
              setDate("");
              setTime("");
              setAdding(false);
            }}
          >
            Add
          </DarkPill>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-tap rounded-pill"
            onClick={() => {
              setDate("");
              setTime("");
              setAdding(false);
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <DarkPill onClick={() => setAdding(true)}>Book A Visit</DarkPill>
      )}
    </div>
  );
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
function GuestProfile({ guest }: { guest: GuestRow }) {
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
      <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
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

        <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <dl className="divide-y divide-border">
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
          <div className="rounded-xl border border-border bg-surface p-4">
            <h4 className="text-fs-sm font-bold uppercase tracking-wide text-muted-foreground">Loyalty</h4>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <MiniStat value={0} label="Earned" />
              <MiniStat value={0} label="Redeemed" />
              <MiniStat value={0} label="Available" />
              <MiniStat value={money(0)} label="Amount" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <h4 className="text-fs-sm font-bold uppercase tracking-wide text-muted-foreground">Visits</h4>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <MiniStat value={orders.length} label="Total" />
              <MiniStat value={extras.visits.length} label="Upcoming" />
              <MiniStat value={0} label="Canceled" />
              <MiniStat value={0} label="No Show" />
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
                visits={extras.visits}
                onAdd={(visit) => update({ visits: [...extras.visits, visit] })}
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

/** Reservations tab: the guest's booked visits only. */
function ReservationsTab({ guest }: { guest: GuestRow }) {
  const extras = loadExtras(guest.id);
  return (
    <div className="space-y-5">
      <SectionCard label="Upcoming Visits">
        {extras.visits.length ? (
          <ul className="divide-y divide-border">
            {extras.visits.map((visit, index) => (
              <li key={`${visit.date}-${visit.time}-${index}`} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 text-fs-sm">{visit.date || "Unset date"}{visit.time ? ` · ${visit.time}` : ""}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-2 text-fs-sm text-muted-foreground">No Upcoming Visits</p>
        )}
      </SectionCard>
      <SectionCard label="Past Reservations">
        <p className="py-2 text-fs-sm text-muted-foreground">No Past Reservations</p>
      </SectionCard>
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

function GuestDetail({ guest }: { guest: GuestRow }) {
  const router = useRouter();
  const [tab, setTab] = useState<GuestTab>("profile");
  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Guest sections" className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-pill bg-surface-muted p-1">
          {GUEST_TABS.map((entry) => (
            <button
              key={entry.id}
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
        <DarkPill onClick={() => router.navigate({ to: "/order/new" })}>
          <Plus className="size-4" />
          New Order
        </DarkPill>
      </div>

      {tab === "profile" ? <GuestProfile guest={guest} /> : null}
      {tab === "reservations" ? <ReservationsTab guest={guest} /> : null}
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const records = useMemo(() => guestDirectory(tickets, guest), [tickets, guest]);
  const selected = records.find((row) => row.id === selectedId);
  const goSettings = () => router.navigate({ to: "/settings" });

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
          <ScreenBody><GuestDetail guest={selected} /></ScreenBody>
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
        <GuestDetail guest={selected} />
      </div> : <GuestList records={records} selectedId={null} onSelect={setSelectedId} />}
    </ScreenBody>
  </>;
}
