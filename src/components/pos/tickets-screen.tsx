import { useNavigate, useSearch, useRouterState } from "@tanstack/react-router";
import { money } from "@/lib/demo-data";
import { rooms as allRooms } from "@/lib/floor-data";
const roomNames = new Set(allRooms.map((r) => r.name));
import { X as XIcon } from "lucide-react";
import { TapToPayNudge } from "@/components/pos/tap-to-pay";
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
  Check,
  CircleDollarSign,
  ClipboardList,
  DollarSign,
  Users,
  Wallet,

} from "lucide-react";
import { useEffect, useState } from "react";


import { EmptyState, TicketCard } from "@/components/pos/primitives";
import { TransferOrderDialog } from "@/components/pos/transfer-order-dialog";
import { canTransfer, noteText } from "@/lib/ticket-transfer";
import { Forward } from "lucide-react";
import { SwipeRow } from "@/components/pos/swipe-row";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { useAnnounce } from "@/components/pos/live-region";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
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
import { useWideLayout } from "@/components/pos/shell";
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

const statusChips: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Paid" },
  { id: "unpaid", label: "Unpaid" },
];

const facetById = Object.fromEntries(filterFacets.map((f) => [f.id, f])) as Record<
  (typeof filterFacets)[number]["id"],
  (typeof filterFacets)[number]
>;
const trayIcons = {
  payment: DollarSign,
  employee: Users,
  "order-type": ClipboardList,
  revenue: CircleDollarSign,
} as const;
/** Order matches the recording: $ · (calendar) · people · clipboard · coin. */
const trayFacets = (["payment", "employee", "order-type", "revenue"] as const).map((id) => ({
  ...facetById[id],
  icon: trayIcons[id],
}));
const roundIcon =
  "relative grid size-8 shrink-0 place-items-center rounded-pill bg-muted text-foreground transition-colors hover:bg-secondary";
const dot =
  "absolute -right-0.5 -top-0.5 grid size-3.5 place-items-center rounded-pill bg-foreground text-[0.5rem] font-bold text-background";

export function TicketsScreen({
  initialOverlay = "none",
  pane = false,
}: {
  initialOverlay?: TicketsOverlay;
  /** Rendered as the list pane of a landscape split layout. */
  pane?: boolean;
}) {
  const [transferFor, setTransferFor] = useState<string | null>(null);
  const transferTicket = usePos().tickets.find((x) => x.id === transferFor);
  const navigate = useNavigate();
  const landscape = useLandscapeWide();
  const selectedTicketId = useRouterState({ select: (state) => state.location.pathname.match(/^\/tickets\/([^/]+)$/)?.[1] });
  const tableParam = (useSearch({ strict: false }) as { table?: string }).table;
  const tableMembers = tableParam ? tableParam.split(",").filter(Boolean) : [];
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
  const wide = useWideLayout();
  const [tab, setTab] = useState<Tab>("all");
  const [overlay, setOverlay] = useState<TicketsOverlay>(initialOverlay);
  const [openFacet, setOpenFacet] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    ignoreDate: (searching && searchAllDates) || tableMembers.length > 0,
  });
  const tableList = tableMembers.length
    ? baseList.filter((t) => t.table && tableMembers.includes(String(t.table)))
    : baseList;
  const list =
    tab === "unpaid" || tab === "open"
      ? tableList.filter((t) => t.status !== "paid")
      : tab === "closed"
        ? tableList.filter((t) => t.status === "paid")
        : tableList;

  const firstTicketId = list[0]?.id;

  // In the landscape split the right pane always shows a ticket, so the first
  // one in the current list is selected as soon as the module opens. Only the
  // route changes - the order draft is left untouched.
  useEffect(() => {
    if (!pane || !landscape || selectedTicketId || !firstTicketId) return;
    void navigate({
      to: "/tickets/$ticketId",
      params: { ticketId: firstTicketId },
      search: tableParam ? { table: tableParam } : {},
      replace: true,
    });
  }, [pane, landscape, selectedTicketId, firstTicketId, navigate, tableParam]);

  const dateLabel = rangeLabel(ticketRange, DEFAULT_TICKET_DATE);
  const isDefaultPeriod =
    ticketRange.start === DEFAULT_TICKET_DATE && ticketRange.end === DEFAULT_TICKET_DATE;

  const activeFacetCount = filterFacets.reduce(
    (s, f) => s + (filters[f.key] as string[]).length,
    0,
  ) + (filters.mineOnly ? 1 : 0);

  const activeChips: { id: string; label: string; clear: () => void }[] = [
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
          <h1 className="shrink-0 truncate text-fs-lg font-extrabold text-foreground">
            Tickets
          </h1>
          <div className="no-scrollbar flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
            {filtersOpen ? (
              <>
                {trayFacets.map((f) => {
                  const Icon = f.icon;
                  const selected = filters[f.key] as string[];
                  return (
                    <Popover key={f.id}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={f.label}
                          title={f.label}
                          className={roundIcon}
                        >
                          <Icon className="size-4" />
                          {selected.length ? <span className={dot}>{selected.length}</span> : null}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-56 p-1.5">
                        <p className="px-2 pb-1 pt-1 text-fs-xs font-semibold text-muted-foreground">
                          {f.label}
                        </p>
                        {f.options.map((opt) => {
                          const on = selected.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              aria-pressed={on}
                              onClick={() =>
                                setFilters((prev) => ({
                                  ...prev,
                                  [f.key]: on
                                    ? selected.filter((s) => s !== opt)
                                    : [...selected, opt],
                                }))
                              }
                              className={cn(
                                "flex w-full items-center gap-2 rounded-row px-2 py-2 text-left text-fs-sm text-foreground transition-colors hover:bg-muted",
                                on && "bg-muted font-bold",
                              )}
                            >
                              <span className="min-w-0 flex-1 truncate">{opt}</span>
                              {on ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                            </button>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  );
                })}
                <button
                  type="button"
                  aria-label={`Choose period, ${dateLabel}`}
                  title={dateLabel}
                  onClick={() => {
                    setDraft({ from: parseIso(ticketRange.start), to: parseIso(ticketRange.end) });
                    setRangeOpen(true);
                  }}
                  className={roundIcon}
                >
                  <Calendar className="size-4" />
                  {!isDefaultPeriod ? <span className={dot}>1</span> : null}
                </button>
                <button
                  type="button"
                  aria-label="Sort tickets"
                  title="Sort"
                  onClick={() => setOverlay((o) => (o === "sort" ? "none" : "sort"))}
                  className={roundIcon}
                >
                  <Wallet className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setFiltersOpen(false)}
                  className={roundIcon}
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                aria-label="Filter tickets"
                aria-expanded={false}
                onClick={() => setFiltersOpen(true)}
                className={roundIcon}
              >
                <Settings2 className="size-4" />
                {activeFacetCount ? <span className={dot}>{activeFacetCount}</span> : null}
              </button>
            )}
            <button
              type="button"
              aria-label="Search tickets"
              onClick={() => setOverlay((o) => (o === "search" ? "none" : "search"))}
              className={roundIcon}
            >
              <Search className="size-4" />
            </button>
          </div>
        </div>

        {tableParam ? (
          <div className="flex items-center gap-2 pt-1.5">
            <button
              type="button"
              aria-label={`Clear table ${tableMembers.join(" + ")} filter`}
              onClick={() => navigate({ to: "/tickets", search: {} })}
              className="flex min-w-0 items-center gap-1.5 rounded-pill bg-foreground px-3 py-1.5 text-fs-sm font-bold text-background"
            >
              <span className="truncate">
                {roomNames.has(tableMembers[0] ?? "") ? "Rooms / " : "Table "}
                {tableMembers.join(" + ")}
              </span>
              <XIcon className="size-3.5 shrink-0" aria-hidden />
            </button>
            {(() => {
              const unpaid = tableList.filter((t) => t.status !== "paid");
              return unpaid.length ? (
                <span className="shrink-0 rounded-pill bg-muted px-2.5 py-1 text-fs-xs font-bold text-foreground">
                  {unpaid.length} unpaid · {money(unpaid.reduce((n, t) => n + t.total, 0))}
                </span>
              ) : null;
            })()}
            <button
              type="button"
              onClick={() => {
                startOrder(tableMembers[0]);
                navigate({ to: "/order/new" });
              }}
              className="ml-auto shrink-0 rounded-pill bg-accent px-3 py-1.5 text-fs-sm font-bold text-accent-foreground"
            >
              New Order
            </button>
          </div>
        ) : null}


        {overlay === "search" ? (
          <div className="px-2 pt-1.5">
            <SearchDock
              inline={wide}
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



        {/* Status chips */}
        <div className="flex items-center gap-2 border-b border-border pb-2 pt-1.5">
          <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {statusChips.map((t) => {
              const count =
                t.id === "all"
                  ? tableList.length
                  : t.id === "closed"
                    ? tableList.filter((x) => x.status === "paid").length
                    : tableList.filter((x) => x.status !== "paid").length;
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex h-7 shrink-0 items-center gap-1.5 rounded-pill pl-3 pr-1 text-[0.8125rem] font-semibold leading-none transition-colors",
                    on
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground hover:bg-secondary",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-pill px-1 text-[0.6875rem] font-bold",
                      on ? "bg-background text-foreground" : "bg-background/60 text-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
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
        <TapToPayNudge className="mb-3" />
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
                <div className="overflow-hidden rounded-card">
                  {t.transferNotes?.[0] ? (
                    <p className="truncate bg-foreground px-3 py-1 text-fs-xs font-bold text-background">{noteText(t.transferNotes[0])}</p>
                  ) : null}
                  <div className="flex items-stretch gap-1">
                    <div className="min-w-0 flex-1">
                      <TicketCard
                        ticket={t}
                        landscape={pane && landscape}
                        selected={selectedTicketId === t.id}
                        onClick={() => {
                          openTicket(t.id);
                          navigate({
                            to: "/tickets/$ticketId",
                            params: { ticketId: t.id },
                            search: tableParam ? { table: tableParam } : {},
                          });
                        }}
                      />
                    </div>
                    {canTransfer(t) ? (
                      <button type="button" aria-label={`Transfer order ${t.number}`} onClick={() => setTransferFor(t.id)}
                        className="grid w-9 shrink-0 place-items-center rounded-card bg-muted text-foreground hover:bg-secondary">
                        <Forward className="size-4" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </div>
              </SwipeRow>
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              tableMembers.length
                ? `No tickets for Table ${tableMembers.join(" + ")} yet`
                : "No Tickets Found"
            }
            detail="Let's create an order."
            icon={<ReceiptText className="size-6" aria-hidden />}
            action={{
              label: "New order",
              onPress: () => {
                startOrder(tableMembers[0]);
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
      {transferTicket ? (
        <TransferOrderDialog
          ticket={transferTicket}
          onClose={() => setTransferFor(null)}
          onDone={(id) => navigate({ to: "/tickets/$ticketId", params: { ticketId: id }, search: tableParam ? { table: tableParam } : {} })}
        />
      ) : null}
    </div>

  );
}
