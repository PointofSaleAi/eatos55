import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,

  Clock,
  CreditCard,
  ListFilter,
  Search,
  Settings2,
  SoupIcon,
  User,
  ReceiptText,
  RefreshCcwDot,
  X,

} from "lucide-react";
import { useState } from "react";
import { MenuButton } from "@/components/pos/shell";

import { EmptyState, TicketCard } from "@/components/pos/primitives";
import { SwipeRow } from "@/components/pos/swipe-row";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { useAnnounce } from "@/components/pos/live-region";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { usePos, emptyFilters, type SortKey, type SearchScope } from "@/lib/pos-store";
import {
  iso,
  parseIso,
  presetOptions,
  rangeLabel,
  type RangePreset,
} from "@/lib/date-range";
import type { DateRange } from "react-day-picker";
import {
  DEFAULT_TICKET_DATE,
  employees,
  paymentTypes,
  revenueCenters,
  ticketOrderTypes,
  type TicketStatus,
} from "@/lib/demo-data";


import { SearchDock } from "@/components/pos/search-dock";
import { cn } from "@/lib/utils";

export type TicketsOverlay = "none" | "sort" | "filter" | "search";

type Tab =
  | "all"
  | "unpaid"
  | "open"
  | "closed"
  | Extract<TicketStatus, "ordering" | "payment" | "ready" | "preparing" | "paid">;

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ordering", label: "Ordering" },
  { id: "payment", label: "Payment Progress" },
  { id: "ready", label: "Ready" },
  { id: "preparing", label: "Preparing" },
  { id: "paid", label: "Paid" },
  { id: "unpaid", label: "Unpaid" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
];

const scopeOptions: { id: SearchScope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "order", label: "Order No" },
  { id: "transaction", label: "Transaction" },
  { id: "guest", label: "Guest" },
  { id: "employee", label: "Employee" },
  { id: "orderType", label: "Order type" },
];

const scopePlaceholder: Record<SearchScope, string> = {
  all: "Search orders, guests, staff…",
  order: "Search by order or check number…",
  transaction: "Search by transaction reference…",
  guest: "Search by guest name or email…",
  employee: "Search by employee name…",
  orderType: "Search by order type…",
};

const sortOptions: { id: SortKey; icon: typeof Clock; strong: string; rest: string }[] = [

  { id: "time-late-early", icon: Clock, strong: "Time", rest: "Late → Early" },
  { id: "time-early-late", icon: Clock, strong: "Time", rest: "Early → Late" },
  { id: "orders-z-a", icon: SoupIcon, strong: "Orders", rest: "Z → A" },
  { id: "orders-a-z", icon: SoupIcon, strong: "Orders", rest: "A → Z" },
];

const filterFacets = [
  {
    id: "revenue",
    key: "revenueCenters",
    label: "Revenue Center",
    icon: RefreshCcwDot,
    options: revenueCenters,
  },
  {
    id: "employee",
    key: "employees",
    label: "Employee",
    icon: User,
    options: employees.map((e) => e.name),
  },
  {
    id: "order-type",
    key: "orderTypes",
    label: "Order Type",
    icon: ReceiptText,
    options: ticketOrderTypes,
  },
  { id: "payment", key: "payments", label: "Payment", icon: CreditCard, options: paymentTypes },
] as const satisfies readonly {
  id: string;
  key: "revenueCenters" | "employees" | "orderTypes" | "payments";
  label: string;
  icon: typeof User;
  options: readonly string[];
}[];

export function TicketsScreen({ initialOverlay = "none" }: { initialOverlay?: TicketsOverlay }) {
  const navigate = useNavigate();
  const {
    visibleTickets,
    openTicket,
    startOrder,
    sortKey,
    setSortKey,
    search,
    setSearch,
    searchScope,
    setSearchScope,
    searchAllDates,
    setSearchAllDates,
    filters,
    setFilters,
    ticketRange,
    setTicketRange,
    applyRangePreset,
    shiftTicketDate,
    cancelTicket,
  } = usePos();
  const confirm = useConfirm();
  const announce = useAnnounce();
  const [tab, setTab] = useState<Tab>("all");
  const [overlay, setOverlay] = useState<TicketsOverlay>(initialOverlay);
  const [openFacet, setOpenFacet] = useState<string | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: parseIso(ticketRange.start),
    to: parseIso(ticketRange.end),
  });
  const ptr = usePullToRefresh(async () => {
    await new Promise((r) => setTimeout(r, 600));
    announce("Tickets refreshed");
  });

  const searching = overlay === "search" && search.trim().length > 0;

  const aggregate = tab === "all" || tab === "unpaid" || tab === "open" || tab === "closed";
  const baseList = visibleTickets(aggregate ? "all" : tab, {
    ignoreDate: searching && searchAllDates,
  });
  const list =
    tab === "unpaid" || tab === "open"
      ? baseList.filter((t) => t.status !== "paid")
      : tab === "closed"
        ? baseList.filter((t) => t.status === "paid")
        : baseList;

  const dateLabel = rangeLabel(ticketRange, DEFAULT_TICKET_DATE);
  const isDefaultPeriod =
    ticketRange.start === DEFAULT_TICKET_DATE && ticketRange.end === DEFAULT_TICKET_DATE;

  const activeFacetCount = filterFacets.reduce(
    (s, f) => s + (filters[f.key] as string[]).length,
    0,
  ) + (filters.mineOnly ? 1 : 0);

  const activeChips: { id: string; label: string; clear: () => void }[] = [
    ...(isDefaultPeriod
      ? []
      : [{ id: "period", label: dateLabel, clear: () => applyRangePreset("today") }]),
    ...filterFacets.flatMap((f) =>
      (filters[f.key] as string[]).map((opt) => ({
        id: `${f.key}-${opt}`,
        label: opt,
        clear: () =>
          setFilters((prev) => ({
            ...prev,
            [f.key]: (prev[f.key] as string[]).filter((s) => s !== opt),
          })),
      })),
    ),
    ...(filters.mineOnly
      ? [
          {
            id: "mine",
            label: "My tickets",
            clear: () => setFilters((prev) => ({ ...prev, mineOnly: false })),
          },
        ]
      : []),
  ];


  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      {/* Title + controls */}
      <div className="shrink-0 bg-surface px-2 pt-1.5">
        <div className="flex items-center gap-1">
          <MenuButton />
          <h1 className="min-w-0 flex-1 truncate text-fs-lg font-extrabold text-foreground">
            Tickets
          </h1>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              aria-label="Search tickets"
              onClick={() => setOverlay((o) => (o === "search" ? "none" : "search"))}
              className="grid size-9 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Sort tickets"
              onClick={() => setOverlay((o) => (o === "sort" ? "none" : "sort"))}
              className="grid size-9 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <ListFilter className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Filter tickets"
              onClick={() => setOverlay("filter")}
              className="relative grid size-9 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <Settings2 className="size-5" />
              {activeFacetCount ? (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-pill bg-accent text-[0.625rem] font-bold text-accent-foreground">
                  {activeFacetCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Date stepper + facet icons */}
        <div className="flex flex-col items-center gap-1 pt-0.5 md:flex-row md:justify-center md:gap-3">
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              aria-label="Previous period"
              onClick={() => shiftTicketDate(-1)}
              className="grid size-9 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Choose period"
              onClick={() => {
                setDraft({ from: parseIso(ticketRange.start), to: parseIso(ticketRange.end) });
                setRangeOpen(true);
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-pill px-2 py-2 transition-colors hover:bg-muted"
            >
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <span className="whitespace-nowrap text-fs-sm font-extrabold text-foreground">
                {dateLabel}
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>

            <button
              type="button"
              aria-label="Next period"
              onClick={() => shiftTicketDate(1)}
              className="grid size-9 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto pb-0.5">
            {filterFacets.map((f) => {
              const Icon = f.icon;
              const selected = filters[f.key] as string[];
              const active = selected.length > 0;
              return (
                <Popover key={f.id}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={f.label}
                      title={f.label}
                      className={cn(
                        "relative grid size-10 shrink-0 place-items-center rounded-row border transition-colors",
                        active
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="size-5" />
                      {active ? (
                        <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-pill bg-accent text-[0.5625rem] font-bold text-accent-foreground">
                          {selected.length}
                        </span>
                      ) : null}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="center"
                    className="w-[min(18rem,calc(100vw-1.5rem))] p-3"
                  >
                    <p className="pb-2 text-fs-sm font-extrabold text-foreground">{f.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.options.map((opt) => {
                        const on = selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                [f.key]: on
                                  ? selected.filter((s) => s !== opt)
                                  : [...selected, opt],
                              }))
                            }
                            className={cn(
                              "min-h-ctl-sm rounded-pill px-3 text-fs-xs font-bold transition-colors",
                              on
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-secondary",
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {active ? (
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, [f.key]: [] }))}
                        className="mt-3 min-h-ctl-sm w-full rounded-pill border border-border text-fs-xs font-bold text-foreground"
                      >
                        Clear {f.label}
                      </button>
                    ) : null}
                  </PopoverContent>
                </Popover>
              );
            })}
            <button
              type="button"
              aria-label="My tickets"
              title="My tickets"
              aria-pressed={filters.mineOnly}
              onClick={() => setFilters((prev) => ({ ...prev, mineOnly: !prev.mineOnly }))}
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-row border transition-colors",
                filters.mineOnly
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-foreground hover:bg-muted",
              )}
            >
              <User className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Sync tickets"
              title="Sync"
              onClick={() => announce("Tickets refreshed")}
              className="grid size-10 shrink-0 place-items-center rounded-row border border-border text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCcwDot className="size-5" />
            </button>
          </div>
        </div>

        {overlay === "search" ? (
          <div className="px-2 pt-1.5">
            <SearchDock
              open
              value={search}
              onChange={setSearch}
              onClose={() => {
                setSearch("");
                setOverlay("none");
              }}
              placeholder={scopePlaceholder[searchScope]}
              above={
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                  {scopeOptions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSearchScope(s.id)}
                      className={cn(
                        "min-h-ctl-sm shrink-0 rounded-pill px-3 text-fs-xs font-bold transition-colors",
                        searchScope === s.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              }
              below={
                search.trim() ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-fs-xs text-muted-foreground">
                      {list.length} result{list.length === 1 ? "" : "s"}
                      {searchAllDates ? " across all dates" : ` in ${dateLabel}`}
                    </span>
                    <button
                      type="button"
                      aria-pressed={searchAllDates}
                      onClick={() => setSearchAllDates(!searchAllDates)}
                      className={cn(
                        "shrink-0 rounded-pill border px-2.5 py-1 text-fs-xs font-bold transition-colors",
                        searchAllDates
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-foreground",
                      )}
                    >
                      All dates
                    </button>
                  </div>
                ) : null
              }
            />
          </div>
        ) : null}

        {activeChips.length ? (
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-1.5">
            {activeChips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={c.clear}
                aria-label={`Clear ${c.label}`}
                className="flex min-h-ctl-sm shrink-0 items-center gap-1 rounded-pill bg-muted px-2.5 text-fs-xs font-bold text-foreground transition-colors hover:bg-secondary"
              >
                {c.label}
                <X className="size-3" aria-hidden />
              </button>
            ))}
            {activeChips.length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setFilters(emptyFilters);
                  applyRangePreset("today");
                }}
                className="min-h-ctl-sm shrink-0 rounded-pill px-2 text-fs-xs font-bold text-accent"
              >
                Clear all
              </button>
            ) : null}
          </div>
        ) : null}



        {/* Status chips + amount due */}
        <div className="flex items-center gap-2 border-b border-border pb-2 pt-1.5">
          <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "min-h-ctl-sm shrink-0 rounded-pill px-3 text-fs-xs font-bold transition-colors",
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* List */}
      <div
        {...ptr.bind}
        className={cn(
          "no-scrollbar relative min-h-0 flex-1 overflow-y-auto bg-background px-4 pt-3",
          overlay === "search"
            ? "pb-[calc(5rem+var(--kb-inset,0px)+var(--tabs-h,0px))]"
            : "pb-[calc(0.75rem+var(--kb-inset,0px)+var(--tabs-h,0px))]",
        )}
      >
        <div
          aria-live="polite"
          style={{ height: ptr.busy ? 28 : ptr.pull }}
          className="grid place-items-center overflow-hidden text-fs-xs font-bold text-muted-foreground"
        >
          {ptr.busy
            ? "Refreshing…"
            : ptr.pull >= ptr.threshold
              ? "Release to refresh"
              : ptr.pull > 0
                ? "Pull to refresh"
                : ""}
        </div>
        {list.length ? (
          <div className="space-y-3">
            {list.map((t) => (
              <SwipeRow
                key={t.id}
                action={
                  t.status === "paid"
                    ? undefined
                    : {
                        label: "Void",
                        destructive: true,
                        onAction: () => {
                          void (async () => {
                            const ok = await confirm({
                              title: `Void ${t.label}?`,
                              message: "The ticket is removed from the open list.",
                              confirmLabel: "Void ticket",
                              destructive: true,
                            });
                            if (ok) {
                              cancelTicket(t.id);
                              announce(`${t.label} voided`);
                            }
                          })();
                        },
                      }
                }
              >
                <TicketCard
                  ticket={t}
                  onClick={() => {
                    openTicket(t.id);
                    navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                  }}
                />
              </SwipeRow>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Tickets Found"
            detail="Let's create an order."
            icon={<ReceiptText className="size-6" aria-hidden />}
            action={{
              label: "New order",
              onPress: () => {
                startOrder();
                navigate({ to: "/order/new" });
              },
            }}
          />
        )}
      </div>


      {/* Sort dropdown */}
      {overlay === "sort" ? (
        <>
          <button
            type="button"
            aria-label="Close sort menu"
            onClick={() => setOverlay("none")}
            className="absolute inset-0 z-20 cursor-default"
          />
          <div className="absolute right-3 top-[60px] z-30 w-[68%] max-w-[17rem] overflow-hidden rounded-card border border-border bg-surface py-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45)]">
            {sortOptions.map((o) => {
              const Icon = o.icon;
              const active = sortKey === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSortKey(o.id);
                    setOverlay("none");
                  }}
                  className={cn(
                    "flex min-h-key w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted",
                    active && "bg-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-accent" : "text-muted-foreground",
                    )}
                  />
                  <span className="truncate text-fs-sm text-foreground">
                    <span className="font-extrabold">{o.strong}</span> {o.rest}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {/* Filters sheet */}
      <Sheet
        open={overlay === "filter"}
        onOpenChange={(open) => setOverlay(open ? "filter" : "none")}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-sheet border-t border-border bg-surface p-0 pb-6"
        >
          <SheetHeader className="px-4 pb-2 pt-5">
            <SheetTitle className="text-center text-fs-xl font-extrabold text-foreground">
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="flex gap-2 px-4 pb-3">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, mineOnly: !prev.mineOnly }))}
              className={cn(
                "min-h-ctl-sm flex flex-1 items-center justify-center gap-2 rounded-pill border text-fs-sm font-bold transition-colors",
                filters.mineOnly
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-foreground hover:bg-muted",
              )}
            >
              <User className="size-4" aria-hidden />
              My tickets
            </button>
            <button
              type="button"
              onClick={() => announce("Tickets refreshed")}
              className="min-h-ctl-sm flex flex-1 items-center justify-center gap-2 rounded-pill border border-border text-fs-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCcwDot className="size-4" aria-hidden />
              Sync
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {filterFacets.map((f, i) => {
              const Icon = f.icon;
              const open = openFacet === f.id;
              const selected = filters[f.key] as string[];
              return (
                <div key={f.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenFacet(open ? null : f.id)}
                    className="flex min-h-row w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="shrink-0 text-accent">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                      {f.label}
                    </span>
                    {selected.length ? (
                      <span className="shrink-0 rounded-pill bg-primary px-2 py-0.5 text-fs-xs font-bold text-primary-foreground">
                        {selected.length}
                      </span>
                    ) : null}
                    <ChevronRight
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-90",
                      )}
                    />
                  </button>
                  {open ? (
                    <div className="flex flex-wrap gap-2 px-4 pb-5">
                      {f.options.map((opt) => {
                        const active = selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                [f.key]: active
                                  ? selected.filter((s) => s !== opt)
                                  : [...selected, opt],
                              }))
                            }
                            className={cn(
                              "min-h-ctl-sm rounded-pill px-3.5 text-fs-sm font-bold transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 px-4 pt-4">
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              className="min-h-ctl-lg flex-1 rounded-card border border-border text-fs-sm font-bold text-foreground"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOverlay("none")}
              className="min-h-ctl-lg flex-1 rounded-card bg-primary text-fs-sm font-bold text-primary-foreground"
            >
              Apply
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Period sheet */}
      <Sheet open={rangeOpen} onOpenChange={setRangeOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-sheet border-t border-border bg-surface p-0 pb-6"
        >
          <SheetHeader className="px-4 pb-2 pt-5">
            <SheetTitle className="text-center text-fs-xl font-extrabold text-foreground">
              Period
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 px-4 pb-3 sm:grid-cols-3">
            {presetOptions.map((p) => {
              const active =
                ticketRange.preset === p.id ||
                (p.id === "today" && isDefaultPeriod && ticketRange.preset === "day");
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    applyRangePreset(p.id as RangePreset);
                    setRangeOpen(false);
                  }}
                  className={cn(
                    "min-h-ctl-lg rounded-card border text-fs-sm font-bold transition-colors",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-foreground hover:bg-muted",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="border-t border-border px-4 pt-3">
            <p className="pb-1 text-fs-sm font-extrabold text-foreground">Custom range</p>
            <p className="pb-2 text-fs-xs text-muted-foreground">
              Tap a start day, then an end day.
            </p>
            <div className="flex justify-center">
              <CalendarPicker
                mode="range"
                numberOfMonths={1}
                selected={draft}
                onSelect={setDraft}
                className={cn("pointer-events-auto p-0")}
              />
            </div>
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  applyRangePreset("today");
                  setDraft({ from: parseIso(DEFAULT_TICKET_DATE), to: parseIso(DEFAULT_TICKET_DATE) });
                  setRangeOpen(false);
                }}
                className="min-h-ctl-lg flex-1 rounded-card border border-border text-fs-sm font-bold text-foreground"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={!draft?.from}
                onClick={() => {
                  if (!draft?.from) return;
                  const start = iso(draft.from);
                  const end = iso(draft.to ?? draft.from);
                  setTicketRange({ start, end, preset: start === end ? "day" : "custom" });
                  setRangeOpen(false);
                }}
                className="min-h-ctl-lg flex-1 rounded-card bg-primary text-fs-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>

  );
}
