import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownUp, CalendarDays, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {} from "@/components/pos/shell";
import { money, type Ticket, type TicketStatus } from "@/lib/demo-data";
import { boardChannels, boardColumns, type BoardChannel } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/board/")({
  head: () => ({
    meta: [
      { title: "Order Status — eatOS Point of Purchase" },
      {
        name: "description",
        content: "Kitchen board tracking every order from new through completed.",
      },
      { property: "og:title", content: "Order Status — eatOS Point of Purchase" },
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
          <h1 className="text-2xl font-extrabold text-foreground">Order Status</h1>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Pick board date"
              onClick={() => toast.info("Showing today's orders")}
              className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
            >
              <CalendarDays className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Clear board filters"
              onClick={() => {
                setChannel("DINE IN");
                setAsc({});
                toast.success("Board filters cleared");
              }}
              className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
            >
              <XCircle className="size-5" />
            </button>
            <p className="ml-1 text-sm font-bold text-muted-foreground">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="mt-3 inline-flex rounded-full bg-muted p-1">
          {boardChannels.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={cn(
                "min-h-ctl-sm rounded-full px-4 text-sm font-bold transition-colors",
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
                  <h2 className="text-sm font-extrabold text-foreground">{col.label}</h2>
                  <button
                    type="button"
                    aria-label={`Sort ${col.label}`}
                    onClick={() => setAsc((s) => ({ ...s, [col.id]: !s[col.id] }))}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <ArrowDownUp className="size-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {list.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">No orders</p>
                  ) : (
                    list.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          openTicket(t.id);
                          navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } });
                        }}
                        className="w-full rounded-2xl border border-border bg-surface p-3 text-left transition-transform active:scale-[0.98]"
                      >
                        <p className="text-sm font-extrabold text-foreground">
                          #{t.number} · {t.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t.arrivedAt} · {t.seats} guest{t.seats === 1 ? "" : "s"}
                        </p>
                        <p className="mt-2 text-sm font-bold text-foreground">{money(t.total)}</p>
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
