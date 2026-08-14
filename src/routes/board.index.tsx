import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDownUp, CalendarDays, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {} from "@/components/pos/shell";
import { money, type Ticket, type TicketStatus } from "@/lib/demo-data";
import { boardChannels, boardColumns, type BoardChannel } from "@/lib/floor-data";
import { useAnnounce } from "@/components/pos/live-region";
import { haptic } from "@/lib/haptics";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/board/")({
  head: () => ({
    meta: [
      { title: "Order Status — eatOS Point of Sale" },
      {
        name: "description",
        content: "Kitchen board tracking every order from new through completed.",
      },
      { property: "og:title", content: "Order Status — eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Kitchen board tracking every order from new through completed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Board,
});

const columnStatuses: Record<string, TicketStatus[]> = {
  new: ["ordering"],
  preparing: ["preparing"],
  ready: ["ready"],
  delivery: ["payment"],
  completed: ["paid"],
};

function Board() {
  const navigate = useNavigate();
  const { tickets, openTicket } = usePos();
  const announce = useAnnounce();
  const [channel, setChannel] = useState<BoardChannel>("DINE IN");
  const [asc, setAsc] = useState<Record<string, boolean>>({});

  const forColumn = (id: string): Ticket[] => {
    const statuses = columnStatuses[id] ?? [];
    const list = tickets.filter(
      (t) =>
        statuses.includes(t.status) &&
        (channel === "DINE IN" ? t.mode === "dine-in" : t.mode !== "dine-in"),
    );
    return [...list].sort((a, b) =>
      asc[id]
        ? a.arrivedMinutesAgo - b.arrivedMinutesAgo
        : b.arrivedMinutesAgo - a.arrivedMinutesAgo,
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-fs-xl font-extrabold text-foreground">Order Status</h1>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/orders"
              aria-label="Order history"
              title="Order history"
              className="grid size-10 tap-safe place-items-center rounded-pill border border-border text-foreground transition-colors hover:bg-muted"
            >
              <CalendarDays className="size-5" />
            </Link>
            <button
              type="button"
              aria-label="Refresh board"
              onClick={() => {
                haptic("light");
                announce("Board refreshed");
                toast.success("Board refreshed");
              }}
              className="grid size-10 tap-safe place-items-center rounded-pill border border-border text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCw className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Clear board filters"
              onClick={() => {
                setChannel("DINE IN");
                setAsc({});
                toast.success("Board filters cleared");
              }}
              className="grid size-10 tap-safe place-items-center rounded-pill border border-border text-foreground transition-colors hover:bg-muted"
            >
              <XCircle className="size-5" />
            </button>
            <p className="ml-1 text-fs-sm font-bold text-muted-foreground">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="mt-3 inline-flex rounded-pill bg-muted p-1">
          {boardChannels.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={cn(
                "min-h-ctl-sm rounded-pill px-4 text-fs-sm font-bold transition-colors",
                c === channel ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-x-auto">
        <div className="flex h-full min-w-max gap-3 px-4 py-4">
          {boardColumns.map((col) => {
            const list = forColumn(col.id);
            return (
              <section key={col.id} className="flex w-[220px] flex-col">
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2">
                  <h2 className="text-fs-sm font-extrabold text-foreground">{col.label}</h2>
                  <button
                    type="button"
                    aria-label={`Sort ${col.label}`}
                    onClick={() => setAsc((s) => ({ ...s, [col.id]: !s[col.id] }))}
                    className="grid size-11 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <ArrowDownUp className="size-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {list.length === 0 ? (
                    <p className="py-8 text-center text-fs-xs text-muted-foreground">No orders in this stage yet</p>
                  ) : (
                    list.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          openTicket(t.id);
                          navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                        }}
                        className="w-full rounded-card border border-border bg-surface p-3 text-left transition-transform active:scale-[0.98]"
                      >
                        <p className="text-fs-sm font-extrabold text-foreground">
                          #{t.number} · {t.label}
                        </p>
                        <p className="mt-1 text-fs-xs text-muted-foreground">
                          {t.arrivedAt} · {t.seats} guest{t.seats === 1 ? "" : "s"}
                        </p>
                        <p className="mt-2 text-fs-sm font-bold text-foreground">{money(t.total)}</p>
                      </button>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
