import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Mail, MapPin, Phone, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenBody, SubHeader, useWideLayout } from "@/components/pos/shell";
import { PaneEmpty, SplitPane } from "@/components/pos/split-pane";
import { usePos } from "@/lib/pos-store";
import { guestDirectory } from "@/lib/guestbook";
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

function GuestDetail({ guest }: { guest: GuestRow }) {
  return <div className="w-full space-y-6">
    <section className="space-y-3 border-y border-border py-4" aria-label="Contact information">
      {guest.email ? <p className="flex items-start gap-3 break-all"><Mail className="size-5 shrink-0" />{guest.email}</p> : null}
      {guest.phone ? <p className="flex items-start gap-3"><Phone className="size-5 shrink-0" />{guest.phone}</p> : null}
      {guest.address ? <p className="flex items-start gap-3"><MapPin className="size-5 shrink-0" />{guest.address}</p> : null}
      {!guest.email && !guest.phone && !guest.address ? <p className="text-fs-sm text-muted-foreground">No contact information available.</p> : null}
    </section>
    <section aria-label="Order history">
      <h3 className="mb-3 text-fs-lg font-bold">Order History</h3>
      {guest.tickets.length ? <ul className="divide-y divide-border">{[...guest.tickets].sort((a, b) => b.date.localeCompare(a.date)).map((ticket) => <li key={ticket.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 py-4">
        <div><p className="font-bold">Order# {ticket.orderNo ?? "--"}</p><p className="text-fs-xs text-muted-foreground">{ticket.date} · {ticket.arrivedAt}</p></div>
        <div className="text-right"><p className="font-bold">{money(ticket.total)}</p><p className="text-fs-xs text-muted-foreground">{ticket.closed ? "Closed" : statusMeta[ticket.status].label}</p></div>
      </li>)}</ul> : <p className="py-4 text-fs-sm text-muted-foreground">No order history available.</p>}
    </section>
  </div>;
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
    // The guestbook owns the whole panel: guest list on the left, the selected
    // guest's details on the right, and a back chevron straight to Settings.
    return selected ? (
      <SplitPane
        list={<GuestList records={records} selectedId={selected.id} className="px-3 py-3 lg:px-4" onSelect={(id) => setSelectedId(id === selected.id ? null : id)} />}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <SubHeader title={selected.name} backLabel="Settings" onBack={goSettings} />
          <ScreenBody><GuestDetail guest={selected} /></ScreenBody>
        </div>
      </SplitPane>
    ) : (
      <SplitPane list={<GuestList records={records} selectedId={null} className="px-3 py-3 lg:px-4" onSelect={setSelectedId} />}>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <SubHeader title="Guestbook" backLabel="Settings" onBack={goSettings} />
          <PaneEmpty title="No guest selected" detail="Pick a guest on the left to see contact details and order history." />
        </div>
      </SplitPane>
    );
  }

  return <>
    <SubHeader title="Guestbook" backTo="/settings" />
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
