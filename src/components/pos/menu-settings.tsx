import { useNavigate } from "@tanstack/react-router";
import { tableAlign } from "@/components/ui/table";
import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Circle, CircleCheck, Copy, GripVertical, Plus, Search, XCircle } from "lucide-react";
import { ArchiveGlyph } from "@/components/pos/archive-glyph";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SwipeRow } from "@/components/pos/swipe-row";
import { Picker } from "@/components/pos/tax-settings";
import { WheelDatePicker, WheelTimePicker } from "@/components/pos/time-picker";
import { categories as demoCategories } from "@/lib/demo-data";
import { CHANNELS, REVENUE_CENTERS, WEEKDAYS, channelError, fmtDate, menuDates, newMenu, useMenuSettings, type Channel, type ChannelId, type MenuRule } from "@/lib/menu-settings";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = demoCategories.filter((c) => c !== "Popular") as string[];
const th = "px-3 py-2 t-caption font-medium text-muted-foreground";

type View = { kind: "list" } | { kind: "archive" } | { kind: "edit"; id: string | null };

export function MenuSettings() {
  const [view, setView] = useState<View>({ kind: "list" });
  if (view.kind === "edit") return <MenuEditor id={view.id} onBack={() => setView({ kind: "list" })} />;
  return <MenuList archived={view.kind === "archive"} onOpen={(id) => setView({ kind: "edit", id })}
    onArchive={() => setView({ kind: "archive" })} onBackFromArchive={() => setView({ kind: "list" })} />;
}

function MenuList({ archived, onOpen, onArchive, onBackFromArchive }: { archived: boolean; onOpen: (id: string | null) => void; onArchive: () => void; onBackFromArchive: () => void }) {
  const navigate = useNavigate();
  const { menus, patch } = useMenuSettings();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const list = menus.filter((m) => m.archived === archived && m.name.toLowerCase().includes(q.trim().toLowerCase()));
  return <>
    <SubHeader title={archived ? "Archived Menus" : "Menu"} backLabel={archived ? "Menu" : "Menu settings"}
      onBack={archived ? onBackFromArchive : () => navigate({ to: "/settings/menu" })}
      right={<Button variant="ghost" size="icon" aria-label="Search menus" onClick={() => { setSearching((v) => !v); setQ(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searching && <div className="mb-3 flex items-center gap-2">
        <Input autoFocus aria-label="Search menus" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="ghost" onClick={() => { setSearching(false); setQ(""); }}>Cancel</Button></div>}
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 t-caption text-muted-foreground">Menu featuring a fusion of bold flavors and fresh ingredients. From savory starters to decadent desserts, each dish is meticulously crafted to satisfy your culinary cravings.</p>
        {!archived && <><Button variant="outline" size="icon" aria-label="Archived menus" onClick={onArchive}><ArchiveGlyph className="size-4" /></Button>
          <Button size="icon" aria-label="Add menu" onClick={() => onOpen(null)}><Plus /></Button></>}
      </div>
      <GroupCard className="mt-4">
        <div className="grid grid-cols-[minmax(0,1.4fr)_4rem_minmax(0,1fr)_minmax(0,1fr)_1.25rem] items-center gap-2 border-b border-border px-4 py-2">
          <span className={cn(th, "px-0")}>Menu Name</span><span className={cn(th, "px-0 text-center")}>Status</span><span className={cn(th, "px-0 text-center")}>Start Date</span><span className={cn(th, "px-0 text-right")}>End Date</span><span />
        </div>
        {list.map((m) => {
          const d = menuDates(m);
          return <SwipeRow key={m.id} className="border-b border-border last:border-0"
            action={{ label: archived ? "Restore" : "Archive", destructive: !archived, icon: <ArchiveGlyph className="size-5" />, onAction: () => { patch(m.id, { archived: !archived }); toast.success(archived ? "Menu restored" : "Menu archived"); } }}>
            <div className="grid min-h-12 grid-cols-[minmax(0,1.4fr)_4rem_minmax(0,1fr)_minmax(0,1fr)_1.25rem] items-center gap-2 bg-surface px-4 py-2 hover:bg-muted">
              <button type="button" className="min-w-0 break-words text-left t-row" onClick={() => onOpen(m.id)}>{m.name}</button>
              <Switch className="justify-self-center" aria-label={`${m.name} status`} checked={m.active} disabled={archived} onCheckedChange={(active) => patch(m.id, { active })} />
              <button type="button" className="text-center t-value" onClick={() => onOpen(m.id)}>{d.start ? fmtDate(d.start) : "—"}</button>
              <button type="button" className="text-right t-value" onClick={() => onOpen(m.id)}>{d.end ? fmtDate(d.end) : "—"}</button>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </SwipeRow>;
        })}
        {list.length === 0 && <p className="px-4 py-10 text-center t-row text-muted-foreground">{archived ? "No archived menus" : "No menus found"}</p>}
      </GroupCard>
      <Caption>Swipe left on a menu to {archived ? "restore" : "archive"} it. Demo only — menus don't change what New Order sells.</Caption>
    </ScreenBody>
  </>;
}

function Row({ label, value, onClick, sub, error }: { label: string; value: ReactNode; onClick: () => void; sub?: string | undefined; error?: string | null | undefined }) {
  return <Button variant="ghost" onClick={onClick} className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`}>
    <span className="min-w-0 flex-1 text-left"><span className="block t-row">{label}</span>
      {sub && <span className="block t-caption text-muted-foreground">{sub}</span>}
      {error && <span className="block t-caption text-destructive">{error}</span>}</span>
    <span className="max-w-[55%] break-words text-right t-value text-muted-foreground">{value}</span><ChevronRight />
  </Button>;
}

type Popup =
  | { kind: "date"; ch: ChannelId; field: "start" | "end" }
  | { kind: "time"; ch: ChannelId; day: number; field: "start" | "end" }
  | { kind: "copy"; ch: ChannelId; day: number }
  | { kind: "categories" } | { kind: "revenue" } | { kind: "exit" } | null;

function MenuEditor({ id, onBack }: { id: string | null; onBack: () => void }) {
  const { menus, save } = useMenuSettings();
  const existing = menus.find((m) => m.id === id);
  const [draft, setDraft] = useState<MenuRule>(() => existing ?? newMenu());
  const [popup, setPopup] = useState<Popup>(null);
  const [temp, setTemp] = useState("");
  const [organize, setOrganize] = useState(false);
  const isNew = !existing && !menus.some((m) => m.id === draft.id);

  const update = (next: MenuRule) => {
    setDraft(next);
    if (next.name.trim()) save(next);
  };
  const setCh = (ch: ChannelId, p: Partial<Channel>) => update({ ...draft, channels: { ...draft.channels, [ch]: { ...draft.channels[ch], ...p } } });
  const back = () => (isNew ? setPopup({ kind: "exit" }) : onBack());

  if (organize) return <OrganizeCategories items={draft.categories} onBack={() => setOrganize(false)} onChange={(categories) => update({ ...draft, categories })} />;

  return <>
    <SubHeader title={existing ? "Edit Menu" : "Add Menu"} backLabel="Menu" onBack={back} />
    <ScreenBody className="py-4">
      <GroupCard>
        <label className={settingsRowClass}><span className="shrink-0 t-row">Menu Name</span>
          <input aria-label="Menu name" placeholder="Enter menu name" value={draft.name} onChange={(e) => update({ ...draft, name: e.target.value })}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-right t-value outline-none" />
          {draft.name && <Button variant="ghost" size="icon" aria-label="Clear menu name" onClick={() => setDraft({ ...draft, name: "" })}><XCircle className="text-muted-foreground" /></Button>}
        </label>
        {!draft.name.trim() && <p className="px-4 pb-3 t-caption text-destructive">Menu name cannot be empty</p>}
      </GroupCard>

      {CHANNELS.map(({ id: ch, label }) => {
        const c = draft.channels[ch];
        const err = channelError(c);
        return <GroupCard key={ch} className="mt-4">
          <label className={cn(settingsRowClass, !c.enabled && "border-b-0")}><span className="min-w-0 flex-1 t-row">{label}</span>
            <Switch aria-label={label} checked={c.enabled} onCheckedChange={(enabled) => setCh(ch, { enabled })} /></label>
          {c.enabled && <>
            <Row label="Start Date" value={fmtDate(c.start)} error={err === "Please select start date" ? err : null} onClick={() => { setTemp(c.start); setPopup({ kind: "date", ch, field: "start" }); }} />
            <Row label="End Date" value={fmtDate(c.end)} error={err && err !== "Please select start date" ? err : null} onClick={() => { setTemp(c.end || c.start); setPopup({ kind: "date", ch, field: "end" }); }} />
            <div className="overflow-x-auto">
              <table className={cn("w-full min-w-[22rem]", tableAlign)}>
                <thead><tr className="border-b border-border"><th className={th}>Days</th><th className={th}>Start Time</th><th className={th}>End Time</th><th className="w-12" /></tr></thead>
                <tbody>{WEEKDAYS.map((day, i) => {
                  const s = c.days[i]!;
                  const setDay = (p: Partial<typeof s>) => setCh(ch, { days: c.days.map((d, j) => (j === i ? { ...d, ...p } : d)) });
                  return <tr key={day} className="border-b border-border last:border-0">
                    <td className="px-3 py-1"><button type="button" aria-pressed={s.on} aria-label={`${day} ${s.on ? "on" : "off"}`} onClick={() => setDay({ on: !s.on })} className="flex min-h-11 items-center gap-2 t-caption font-semibold uppercase">
                      {s.on ? <CircleCheck className="size-4" /> : <Circle className="size-4 text-muted-foreground" />}{day}</button></td>
                    {(["start", "end"] as const).map((f) => <td key={f} className="px-3 py-1"><button type="button" aria-label={`${day} ${f} time`} className="min-h-11 rounded-md px-1 t-value hover:bg-muted"
                      onClick={() => { setTemp(s[f]); setPopup({ kind: "time", ch, day: i, field: f }); }}>{s[f]}</button></td>)}
                    <td className="px-2"><Button variant="ghost" size="icon" aria-label={`Copy ${day} times`} onClick={() => setPopup({ kind: "copy", ch, day: i })}><Copy className="size-4" /></Button></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </>}
        </GroupCard>;
      })}

      <GroupCard className="mt-4">
        <Row label="Categories" value={draft.categories.length} sub={draft.categories.join(", ") || undefined} onClick={() => setPopup({ kind: "categories" })} />
        <Row label="Organize" value={draft.categories.length || "Organize Categories"} onClick={() => setOrganize(true)} />
        <Row label="Revenue Centers" value={draft.revenueCenters.length} sub={draft.revenueCenters.join(", ") || undefined} onClick={() => setPopup({ kind: "revenue" })} />
      </GroupCard>
      {existing && <Button variant="outline" aria-label={draft.archived ? "Restore menu" : "Archive menu"} title={draft.archived ? "Restore menu" : "Archive menu"} className="mt-6 min-h-ctl-lg w-full" onClick={() => { save({ ...draft, archived: !draft.archived }); toast.success(draft.archived ? "Menu restored" : "Menu archived"); onBack(); }}>
        <ArchiveGlyph className="size-4" /></Button>}
      <Caption>Changes save automatically. Demo only — menus don't change what New Order sells.</Caption>
    </ScreenBody>

    {popup?.kind === "categories" && <Picker title="Select Categories" options={CATEGORY_OPTIONS} selected={draft.categories} onChange={(categories) => update({ ...draft, categories })} onClose={() => setPopup(null)} />}
    {popup?.kind === "revenue" && <Picker title="Select Revenue Centers" options={REVENUE_CENTERS} selected={draft.revenueCenters} onChange={(revenueCenters) => update({ ...draft, revenueCenters })} onClose={() => setPopup(null)} />}
    {popup?.kind === "copy" && (() => {
      const c = draft.channels[popup.ch];
      const src = c.days[popup.day]!;
      return <Picker title="Select Days" options={[...WEEKDAYS]} selected={WEEKDAYS.filter((_, i) => c.days[i]!.on)}
        onChange={(sel) => setCh(popup.ch, { days: c.days.map((d, i) => sel.includes(WEEKDAYS[i]!) ? { on: true, start: src.start, end: src.end } : i === popup.day ? d : { ...d, on: false }) })}
        onClose={() => setPopup(null)} />;
    })()}
    <Dialog open={popup?.kind === "date" || popup?.kind === "time"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-xs rounded-lg">
        <DialogTitle className="text-center">{popup?.kind === "date" ? (popup.field === "start" ? "Start Date" : "End Date") : popup?.kind === "time" ? `${WEEKDAYS[popup.day]} ${popup.field === "start" ? "Start" : "End"} Time` : ""}</DialogTitle>
        <DialogDescription className="sr-only">Scroll to choose a value</DialogDescription>
        {popup?.kind === "date" && <WheelDatePicker value={temp} onChange={setTemp} />}
        {popup?.kind === "time" && <WheelTimePicker value={temp} onChange={setTemp} />}
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setPopup(null)}>Cancel</Button>
          <Button onClick={() => {
            if (popup?.kind === "date") setCh(popup.ch, { [popup.field]: temp });
            if (popup?.kind === "time") { const c = draft.channels[popup.ch]; setCh(popup.ch, { days: c.days.map((d, j) => (j === popup.day ? { ...d, [popup.field]: temp } : d)) }); }
            setPopup(null);
          }}>Set</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={popup?.kind === "exit"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Are you sure you want to exit?</DialogTitle>
        <DialogDescription className="text-center">If you go back now, you will lose the progress.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setPopup(null)}>Keep Editing</Button><Button onClick={onBack}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}

function OrganizeCategories({ items, onChange, onBack }: { items: string[]; onChange: (next: string[]) => void; onBack: () => void }) {
  const [drag, setDrag] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items]; const [x] = next.splice(from, 1); next.splice(to, 0, x!); onChange(next);
  };
  const list = useMemo(() => items, [items]);
  return <>
    <SubHeader title="Organize Categories" backLabel="Edit Menu" onBack={onBack} />
    <ScreenBody className="py-4">
      {list.length === 0 ? <p className="py-10 text-center t-row text-muted-foreground">Select categories first</p> :
        <GroupCard>{list.map((c, i) => <div key={c} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
          className={cn(settingsRowClass, "gap-3 bg-surface", drag === i && "opacity-50")}>
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground t-caption text-background">{i}</span>
          <span className="min-w-0 flex-1 t-row">{c}</span>
          <Button variant="ghost" size="icon" aria-label={`Move ${c} up`} disabled={i === 0} onClick={() => move(i, i - 1)}><ChevronUp /></Button>
          <Button variant="ghost" size="icon" aria-label={`Move ${c} down`} disabled={i === list.length - 1} onClick={() => move(i, i + 1)}><ChevronDown /></Button>
          <GripVertical className="size-5 cursor-grab text-muted-foreground" aria-hidden />
        </div>)}</GroupCard>}
      <Caption>Drag the handle or use the arrows to change the order.</Caption>
    </ScreenBody>
  </>;
}
