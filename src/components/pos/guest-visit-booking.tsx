import { useState } from "react";
import { LayoutGrid, Map, Table2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloorCanvas, Seats } from "@/components/pos/floor-canvas";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { floors, floorSections, isDecor, type FloorTable, type FloorSection } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { isFutureVisit, type GuestVisit } from "@/lib/guest-reservation";
import { cn } from "@/lib/utils";

export function GuestVisitBooking({ name, phone, onCancel, onBook }: {
  name: string;
  phone: string | undefined;
  onCancel: () => void;
  onBook: (visit: GuestVisit) => void;
}) {
  const { floor: currentFloor, getFloorLayout } = usePos();
  const [floor, setFloor] = useState(currentFloor);
  const [section, setSection] = useState<FloorSection>("all");
  const [view, setView] = useState<"grid" | "layout">("grid");
  const [selected, setSelected] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [party, setParty] = useState(2);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const layout = getFloorLayout(floor);
  const tables: FloorTable[] = layout.filter((object) => !isDecor(object.kind))
    .filter((object) => section === "all" || object.section === section)
    .map((object) => ({ ...object, floor, state: "available", kind: object.kind === "booth" || object.kind === "bar-chair" ? object.kind : "table" }));
  const picked = tables.find((table) => table.name === selected);
  const fieldClass = "min-h-tap w-full min-w-0 rounded-md border border-border bg-surface px-3 text-fs-sm text-foreground";
  const submit = () => {
    if (!isFutureVisit(date, time)) { setError("Choose a future date and time."); return; }
    if (!picked || party < 1 || party > picked.seats) { setError("Choose a table with enough seats for your guests."); return; }
    onBook({ date, time, party, table: picked.name, floor, description: description.trim() || undefined });
  };

  return <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    <SubHeader title="Book A Visit" backLabel="Guestbook" onBack={onCancel} />
    <ScreenBody>
      <form className="w-full space-y-5" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="min-w-0"><h2 className="break-words text-fs-xl font-bold">{name}</h2>{phone && <p className="text-fs-sm text-muted-foreground">{phone}</p>}</div>
          <span className="text-fs-sm text-muted-foreground">{picked ? `${floor} · ${picked.name}` : "Select a table"}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="min-w-0 space-y-1 text-fs-sm font-bold">Date<input required aria-label="Visit date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} /></label>
          <label className="min-w-0 space-y-1 text-fs-sm font-bold">Time<input required aria-label="Visit time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className={fieldClass} /></label>
          <label className="min-w-0 space-y-1 text-fs-sm font-bold">Guests<input required aria-label="Visit guests" type="number" min={1} step={1} value={party} onChange={(event) => { setParty(Number(event.target.value)); setSelected(null); }} className={fieldClass} /></label>
          <label className="min-w-0 space-y-1 text-fs-sm font-bold">Description<input aria-label="Visit description" value={description} onChange={(event) => setDescription(event.target.value)} className={fieldClass} /></label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <label className="min-w-0 text-fs-sm font-bold"><select aria-label="Reservation floor" value={floor} onChange={(event) => { setFloor(event.target.value); setSelected(null); }} className={fieldClass}>{floors.map((entry) => <option key={entry}>{entry}</option>)}</select></label>
          <div className="flex gap-1 rounded-pill bg-muted p-1">
            <Button type="button" variant="ghost" size="icon" title="Grid view" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={cn("rounded-pill", view === "grid" && "bg-surface")}><LayoutGrid /></Button>
            <Button type="button" variant="ghost" size="icon" title="Layout view" aria-label="Layout view" aria-pressed={view === "layout"} onClick={() => setView("layout")} className={cn("rounded-pill", view === "layout" && "bg-surface")}><Map /></Button>
          </div>
        </div>
        <div className="flex gap-2">{floorSections.map((entry) => <Button type="button" key={entry} variant={section === entry ? "secondary" : "ghost"} className="rounded-pill" onClick={() => { setSection(entry); setSelected(null); }}>{entry === "all" ? "All" : entry}</Button>)}</div>
        {view === "layout" ? <div className="h-[28rem] min-w-0 overflow-hidden"><FloorCanvas tables={tables} decor={layout.filter((object) => isDecor(object.kind) && (section === "all" || object.section === section))} selectedNames={selected ? [selected] : []} onOpen={(table) => { if (table.seats >= party) setSelected(table.name); }} onStatus={() => {}} /></div> :
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" aria-label="Reservation tables">{tables.map((table) => <Button key={table.id} type="button" variant="outline" disabled={party < 1 || table.seats < party} aria-label={`Reserve ${table.name}, ${table.seats} seats`} aria-pressed={selected === table.name} onClick={() => setSelected(table.name)} className={cn("h-auto min-w-0 flex-col gap-3 rounded-lg py-6", selected === table.name && "border-foreground bg-muted ring-2 ring-foreground")}>
            <span className={cn("relative grid size-14 place-items-center border-2 border-current text-fs-sm font-bold", table.shape === "round" ? "rounded-full" : "rounded-md")}><Seats seats={table.seats} />{table.label || table.name}</span>
            <span className="flex items-center gap-1 text-fs-xs text-muted-foreground"><Users className="size-3" />{table.seats} seats</span>
          </Button>)}</div>}
        {error && <p role="alert" className="text-fs-sm text-destructive">{error}</p>}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="ghost" className="min-h-tap rounded-pill" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={!picked || !date || !time} className="min-h-tap rounded-pill bg-foreground px-6 text-background hover:bg-foreground/90"><Table2 />Book Visit</Button>
        </div>
      </form>
    </ScreenBody>
  </div>;
}