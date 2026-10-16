import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Mail, MapPin, Phone, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { usePos } from "@/lib/pos-store";
import { guestDirectory } from "@/lib/guestbook";
import { money, statusMeta } from "@/lib/demo-data";
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

function Guestbook() {
  const { tickets, guest } = usePos();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const records = useMemo(() => guestDirectory(tickets, guest), [tickets, guest]);
  const q = query.trim().toLowerCase();
  const visible = records.filter((row) => [row.name, row.email, row.phone].some((value) => value?.toLowerCase().includes(q)));
  const selected = records.find((row) => row.id === selectedId);
  return <>
    <SubHeader title="Guestbook" backTo="/settings" />
    <ScreenBody>
      {selected ? <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to guests" title="Back to guests" onClick={() => setSelectedId(null)}><ArrowLeft className="size-5" /></Button>
          <h2 className="min-w-0 break-words text-fs-xl font-bold">{selected.name}</h2>
        </div>
        <section className="space-y-3 border-y border-border py-4" aria-label="Contact information">
          {selected.email ? <p className="flex items-start gap-3 break-all"><Mail className="size-5 shrink-0" />{selected.email}</p> : null}
          {selected.phone ? <p className="flex items-start gap-3"><Phone className="size-5 shrink-0" />{selected.phone}</p> : null}
          {selected.address ? <p className="flex items-start gap-3"><MapPin className="size-5 shrink-0" />{selected.address}</p> : null}
          {!selected.email && !selected.phone && !selected.address ? <p className="text-fs-sm text-muted-foreground">No contact information available.</p> : null}
        </section>
        <section aria-label="Order history">
          <h3 className="mb-3 text-fs-lg font-bold">Order History</h3>
          {selected.tickets.length ? <ul className="divide-y divide-border">{[...selected.tickets].sort((a, b) => b.date.localeCompare(a.date)).map((ticket) => <li key={ticket.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 py-4">
            <div><p className="font-bold">Order# {ticket.orderNo ?? "--"}</p><p className="text-fs-xs text-muted-foreground">{ticket.date} · {ticket.arrivedAt}</p></div>
            <div className="text-right"><p className="font-bold">{money(ticket.total)}</p><p className="text-fs-xs text-muted-foreground">{ticket.closed ? "Closed" : statusMeta[ticket.status].label}</p></div>
          </li>)}</ul> : <p className="py-4 text-fs-sm text-muted-foreground">No order history available.</p>}
        </section>
      </div> : <div className="w-full">
        <label className="mb-5 flex min-h-ctl-md items-center gap-3 rounded-pill border border-border bg-surface px-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input type="search" aria-label="Search guests" placeholder="Search guests" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-tap min-w-0 flex-1 bg-transparent outline-none" />
        </label>
        {visible.length ? <ul className="divide-y divide-border border-y border-border">{visible.map((row) => <li key={row.id}>
          <Button variant="ghost" className="h-auto min-h-ctl-lg w-full justify-start gap-3 rounded-none px-2 py-4 text-foreground hover:bg-muted" onClick={() => setSelectedId(row.id)}>
            <Users className="size-5 shrink-0" /><span className="min-w-0 flex-1 whitespace-normal break-words text-left"><span className="block font-bold">{row.name}</span>{row.email ? <span className="block break-all text-fs-xs text-muted-foreground">{row.email}</span> : null}</span><ChevronRight className="size-4 shrink-0" />
          </Button>
        </li>)}</ul> : <p className="py-10 text-center text-muted-foreground">{q ? "No guests found." : "No named guests available."}</p>}
      </div>}
    </ScreenBody>
  </>;
}