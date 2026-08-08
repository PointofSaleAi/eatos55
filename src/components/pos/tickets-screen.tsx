import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  FilePlus2,
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
import { BottomTabs } from "@/components/pos/shell";
import { EmptyState, TicketCard } from "@/components/pos/primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePos, emptyFilters, type SortKey } from "@/lib/pos-store";
import {
  employees,
  paymentTypes,
  revenueCenters,
  ticketOrderTypes,
  type TicketStatus,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export type TicketsOverlay = "none" | "sort" | "filter" | "search";

type Tab = "all" | Extract<TicketStatus, "ordering" | "payment" | "ready" | "preparing" | "paid">;

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ordering", label: "Ordering" },
  { id: "payment", label: "Payment Progress" },
  { id: "ready", label: "Ready" },
  { id: "preparing", label: "Preparing" },
  { id: "paid", label: "Paid" },
];

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
    filters,
    setFilters,
    ticketDate,
    shiftTicketDate,
  } = usePos();
  const [tab, setTab] = useState<Tab>("all");
  const [overlay, setOverlay] = useState<TicketsOverlay>(initialOverlay);
  const [openFacet, setOpenFacet] = useState<string | null>(null);

  const list = visibleTickets(tab === "all" ? "all" : tab, {
    ignoreDate: overlay === "search" && search.trim().length > 0,
  });

  const dateLabel = new Date(`${ticketDate}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      {/* Title bar */}
      <div className="shrink-0 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-foreground">Tickets</h1>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Sort tickets"
              onClick={() => setOverlay((o) => (o === "sort" ? "none" : "sort"))}
              className="grid size-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted"
            >
              <ListFilter className="size-6" />
            </button>
            <button
              type="button"
              aria-label="Filter tickets"
              onClick={() => setOverlay("filter")}
              className="grid size-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted"
            >
              <Settings2 className="size-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Date stepper or search field */}
      <div className="shrink-0 bg-surface px-4 pt-3">
        {overlay === "search" ? (
          <div className="flex h-14 items-center gap-2 rounded-xl border border-foreground px-4">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number..."
              className="min-w-0 flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setSearch("");
                setOverlay("none");
              }}
              className="grid size-8 shrink-0 place-items-center text-foreground"
            >
              <X className="size-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => shiftTicketDate(-1)}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-foreground hover:bg-muted"
              >
                <ChevronLeft className="size-6" />
              </button>
              <Calendar className="size-6 shrink-0 text-foreground" />
              <span className="truncate text-base font-medium text-foreground">{dateLabel}</span>
              <button
                type="button"
                aria-label="Next day"
                onClick={() => shiftTicketDate(1)}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-foreground hover:bg-muted"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
            <button
              type="button"
              aria-label="Search tickets"
              onClick={() => setOverlay("search")}
              className="grid size-12 shrink-0 place-items-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-6" />
            </button>
          </div>
        )}

        {/* Status chips */}
        <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "min-h-[48px] shrink-0 rounded-xl px-5 text-base font-medium transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="no-scrollbar relative flex-1 overflow-y-auto bg-background px-4 py-3">
        {list.length ? (
          <div className="space-y-3">
            {list.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                onClick={() => {
                  openTicket(t.id);
                  navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No tickets here" detail="Adjust the date, filters or search." />
        )}
      </div>

      {/* New ticket FAB */}
      <button
        type="button"
        aria-label="New ticket"
        onClick={() => {
          startOrder();
          navigate({ to: "/order/new" });
        }}
        className="absolute bottom-24 right-5 grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <FilePlus2 className="size-7" />
      </button>

      {/* Sort dropdown */}
      {overlay === "sort" ? (
        <>
          <button
            type="button"
            aria-label="Close sort menu"
            onClick={() => setOverlay("none")}
            className="absolute inset-0 z-20 cursor-default"
          />
          <div className="absolute left-1/2 top-[60px] z-30 w-[68%] -translate-x-1/4 rounded-md bg-surface py-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45)]">
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
                    "flex w-full items-center gap-3 px-4 py-4 text-left",
                    active && "border border-success bg-success/10",
                  )}
                >
                  <Icon className={cn("size-6 shrink-0", active ? "text-success" : "text-muted-foreground")} />
                  <span className="truncate text-lg text-foreground">
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
        <SheetContent side="bottom" className="rounded-t-3xl border-0 bg-surface p-0 pb-6">
          <SheetHeader className="px-4 pb-2 pt-5">
            <SheetTitle className="text-center text-2xl font-extrabold text-foreground">
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {filterFacets.map((f, i) => {
              const Icon = f.icon;
              const open = openFacet === f.id;
              const selected = filters[f.key] as string[];
              return (
                <div key={f.id} className={i % 2 === 0 ? "bg-muted/40" : "bg-surface"}>
                  <button
                    type="button"
                    onClick={() => setOpenFacet(open ? null : f.id)}
                    className="flex w-full items-center gap-4 px-4 py-5 text-left"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xl text-foreground">{f.label}</span>
                    {selected.length ? (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
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
                              "min-h-[44px] rounded-xl px-4 text-sm font-medium transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "border border-border text-muted-foreground",
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
              className="min-h-[52px] flex-1 rounded-xl border border-border text-base font-bold text-foreground"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOverlay("none")}
              className="min-h-[52px] flex-1 rounded-xl bg-primary text-base font-bold text-primary-foreground"
            >
              Apply
            </button>
          </div>

        </SheetContent>
      </Sheet>

      <BottomTabs />
    </div>
  );
}
