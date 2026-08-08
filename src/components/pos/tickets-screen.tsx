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
import {} from "@/components/pos/shell";
import { AccountBar } from "@/components/pos/account-bar";
import { EmptyState, TicketCard } from "@/components/pos/primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePos, emptyFilters, type SortKey } from "@/lib/pos-store";
import {
  employees,
  money,
  paymentTypes,
  revenueCenters,
  ticketOrderTypes,
  type TicketStatus,
} from "@/lib/demo-data";

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

  const aggregate = tab === "all" || tab === "unpaid" || tab === "open" || tab === "closed";
  const baseList = visibleTickets(aggregate ? "all" : tab, {
    ignoreDate: overlay === "search" && search.trim().length > 0,
  });
  const list =
    tab === "unpaid" || tab === "open"
      ? baseList.filter((t) => t.status !== "paid")
      : tab === "closed"
        ? baseList.filter((t) => t.status === "paid")
        : baseList;
  const amountDue = list.filter((t) => t.status !== "paid").reduce((s, t) => s + t.total, 0);



  const dateLabel = new Date(`${ticketDate}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <AccountBar />


      {/* Title bar */}
      <div className="shrink-0 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-foreground">Tickets</h1>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Sort tickets"
              onClick={() => setOverlay((o) => (o === "sort" ? "none" : "sort"))}
              className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <ListFilter className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Filter tickets"
              onClick={() => setOverlay("filter")}
              className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Settings2 className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Date stepper or search field */}
      <div className="shrink-0 bg-surface px-4 pt-3">
        {overlay === "search" ? (
          <div className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-muted px-4">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => shiftTicketDate(-1)}
                className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-5" />
              </button>
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-bold text-foreground">{dateLabel}</span>
              <button
                type="button"
                aria-label="Next day"
                onClick={() => shiftTicketDate(1)}
                className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
            <button
              type="button"
              aria-label="Search tickets"
              onClick={() => setOverlay("search")}
              className="grid size-11 shrink-0 place-items-center rounded-2xl border border-border text-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-5" />
            </button>
          </div>
        )}

        {/* Status chips */}
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "min-h-[36px] shrink-0 rounded-full px-3.5 text-[13px] font-bold transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border py-3">
          <p className="text-sm font-bold text-muted-foreground">Amount Due</p>
          <p className="text-sm font-extrabold text-accent">{money(amountDue)}</p>
        </div>

      </div>

      {/* List */}
      <div className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto bg-background px-4 pb-[calc(0.75rem+var(--kb-inset,0px))] pt-3">
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
          <EmptyState title="No Tickets Found" detail="Let's create an order." />
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
        className="absolute bottom-24 right-5 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <FilePlus2 className="size-6" />
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
          <div className="absolute left-1/2 top-[60px] z-30 w-[68%] -translate-x-1/4 overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45)]">
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
                    "flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted",
                    active && "bg-muted",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-muted-foreground")} />
                  <span className="truncate text-sm text-foreground">
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
        <SheetContent side="bottom" className="rounded-t-3xl border-t border-border bg-surface p-0 pb-6">
          <SheetHeader className="px-4 pb-2 pt-5">
            <SheetTitle className="text-center text-xl font-extrabold text-foreground">
              Filters
            </SheetTitle>
          </SheetHeader>
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
                    className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="shrink-0 text-accent">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{f.label}</span>
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
                              "min-h-[36px] rounded-full px-3.5 text-[13px] font-bold transition-colors",
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
              className="min-h-[48px] flex-1 rounded-2xl border border-border text-sm font-bold text-foreground"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOverlay("none")}
              className="min-h-[48px] flex-1 rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
            >
              Apply
            </button>
          </div>

        </SheetContent>
      </Sheet>
    </div>
  );
}
