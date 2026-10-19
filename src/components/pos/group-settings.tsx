import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, ChevronRight, Minus, Plus, Search, UtensilsCrossed, XCircle } from "lucide-react";
import { ArchiveGlyph } from "@/components/pos/archive-glyph";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, GroupLabel } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SwipeRow } from "@/components/pos/swipe-row";
import { Picker } from "@/components/pos/tax-settings";
import { useAddOnSettings, useModifierSettings } from "@/lib/modifier-settings";
import { useDefaultModifierSettings } from "@/lib/default-modifier-settings";
import { newGroup, useGroupSettings, type GroupRule, type GroupType } from "@/lib/group-settings";
import { cn } from "@/lib/utils";

const INTRO = "Groups customize dishes, catering to preferences. Enhance dining experiences by allowing customers to personalize their orders for satisfaction.";
const cols = "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1rem] items-center gap-2";
const th = "t-caption font-medium text-muted-foreground";
const row = "flex min-h-12 w-full items-center gap-3 border-b border-border bg-surface px-4 py-2 text-left last:border-0";
type View = { kind: "list" } | { kind: "archive" } | { kind: "edit"; id: string | null };

export function GroupSettings() {
  const [view, setView] = useState<View>({ kind: "list" });
  if (view.kind === "edit") return <Editor id={view.id} onBack={() => setView({ kind: "list" })} />;
  return <List archived={view.kind === "archive"} onOpen={(id) => setView({ kind: "edit", id })}
    onArchive={() => setView({ kind: "archive" })} onBackFromArchive={() => setView({ kind: "list" })} />;
}

function List({ archived, onOpen, onArchive, onBackFromArchive }: { archived: boolean; onOpen: (id: string | null) => void; onArchive: () => void; onBackFromArchive: () => void }) {
  const navigate = useNavigate();
  const { groups, patch } = useGroupSettings();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const list = groups.filter((x) => x.archived === archived && x.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return <>
    <SubHeader title={archived ? "Archived Groups" : "Groups"} backLabel="Back"
      onBack={archived ? onBackFromArchive : () => navigate({ to: "/settings/menu" })}
      right={<Button variant="ghost" size="icon" aria-label="Search groups" onClick={() => { setSearching((v) => !v); setQ(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searching && <div className="mb-3 flex items-center gap-2">
        <Input autoFocus aria-label="Search groups" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="ghost" onClick={() => { setSearching(false); setQ(""); }}>Cancel</Button></div>}
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 t-caption text-muted-foreground">{INTRO}</p>
        {!archived && <><Button variant="outline" size="icon" aria-label="Archived groups" onClick={onArchive}><ArchiveGlyph className="size-4" /></Button>
          <Button size="icon" aria-label="Add group" onClick={() => onOpen(null)}><Plus /></Button></>}
      </div>
      <GroupCard className="mt-4">
        <div className={cn(cols, "hidden border-b border-border px-4 py-2 sm:grid")}>
          <span className={th}>Group Name</span><span className={cn(th, "text-center")}>Type</span><span />
        </div>
        {!list.length && <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
          <UtensilsCrossed className="mb-2 size-12 text-muted-foreground" />
          <p className="t-body font-semibold">No item found</p><p className="t-caption text-muted-foreground">try to search with different word</p></div>}
        {list.map((x) => <SwipeRow key={x.id} className="rounded-none border-b border-border last:border-0"
          action={{ label: archived ? "Restore" : "Archive", destructive: !archived, icon: <ArchiveGlyph className="size-5" />, onAction: () => { patch(x.id, { archived: !archived }); toast.success(`Group ${archived ? "restored" : "archived"}`); } }}>
          <button type="button" onClick={() => onOpen(x.id)} className="w-full bg-surface px-4 py-3 text-left hover:bg-muted">
            <div className={cn(cols, "hidden sm:grid")}><span className="truncate t-body">{x.name}</span><span className="text-center t-body">{x.type || "—"}</span><ChevronRight className="size-4 text-muted-foreground" /></div>
            <div className="flex items-center gap-2 sm:hidden"><div className="min-w-0 flex-1"><p className="t-body">{x.name}</p><p className="t-caption text-muted-foreground">{x.type || "—"}</p></div><ChevronRight className="size-4 text-muted-foreground" /></div>
          </button>
        </SwipeRow>)}
      </GroupCard>
    </ScreenBody>
  </>;
}

function TextRow({ label, value, placeholder, numeric, onChange }: { label: string; value: string; placeholder: string; numeric?: boolean; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  if (!editing) return <button type="button" className={cn(row, "hover:bg-muted")} onClick={() => setEditing(true)}>
    <span className="flex-1 t-body font-medium">{label}</span>
    <span className={cn("max-w-[55%] truncate t-body", !value && "text-muted-foreground")}>{value || placeholder}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" />
  </button>;
  return <div className={row}>
    <span className="shrink-0 t-body font-medium">{label}</span>
    <input autoFocus aria-label={label} inputMode={numeric ? "numeric" : undefined} placeholder={placeholder === "Choose" ? "" : placeholder} value={value}
      onChange={(e) => onChange(numeric ? e.target.value.replace(/\D/g, "").slice(0, 3) : e.target.value)}
      onBlur={() => setEditing(false)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      className="min-w-0 flex-1 bg-transparent text-right t-body outline-none placeholder:text-muted-foreground" />
    {value && <button type="button" aria-label={`Clear ${label}`} onMouseDown={(e) => e.preventDefault()} onClick={() => onChange("")}><XCircle className="size-4 text-muted-foreground" /></button>}
  </div>;
}

function NavRow({ label, value, onClick }: { label: string; value?: string; onClick: () => void }) {
  return <button type="button" className={cn(row, "hover:bg-muted")} onClick={onClick}>
    <span className="flex-1 t-body font-medium">{label}</span>
    {value !== undefined && <span className={cn("max-w-[55%] truncate t-body", value === "Choose" || value === "Select Type" ? "text-muted-foreground" : "")}>{value}</span>}
    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
  </button>;
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div className={row}><span className="flex-1 t-body font-medium">{label}</span><Switch aria-label={label} checked={checked} onCheckedChange={onChange} /></div>;
}

function StepRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <div className={row}><span className="flex-1 t-body font-medium">{label}</span>
    <div className="flex items-center rounded-pill border border-border bg-surface">
      <Button variant="ghost" size="icon" className="size-10 rounded-pill" aria-label={`Decrease ${label}`} disabled={value <= 1} onClick={() => onChange(value - 1)}><Minus /></Button>
      <span className="w-8 text-center t-value tabular-nums">{value}</span>
      <Button variant="ghost" size="icon" className="size-10 rounded-pill" aria-label={`Increase ${label}`} disabled={value >= 99} onClick={() => onChange(value + 1)}><Plus /></Button>
    </div></div>;
}

const summary = (xs: string[]) => (xs.length ? (xs.length === 1 ? xs[0]! : `${xs.length} Selected`) : "Choose");

function Editor({ id, onBack }: { id: string | null; onBack: () => void }) {
  const { groups, save, patch } = useGroupSettings();
  const modifiers = useModifierSettings().modifiers.filter((m) => !m.archived).map((m) => m.name);
  const addOns = useAddOnSettings().modifiers.filter((m) => !m.archived).map((m) => m.name);
  const defaults = useDefaultModifierSettings().items.filter((m) => !m.archived).map((m) => m.name);
  const existing = groups.find((x) => x.id === id);
  const [draft, setDraft] = useState<GroupRule>(() => existing ?? newGroup());
  const [popup, setPopup] = useState<"type" | "items" | "defaults" | "organize" | "exit" | null>(null);
  const stored = groups.find((x) => x.id === draft.id);
  const update = (q: Partial<GroupRule>) => {
    const next = { ...draft, ...q };
    setDraft(next);
    if (next.name.trim() && next.type) save({ ...next, name: next.name.trim(), displayName: next.displayName.trim() || next.name.trim() });
  };
  const back = () => (!stored && (draft.name.trim() || draft.type) && !(draft.name.trim() && draft.type) ? setPopup("exit") : onBack());
  const isMod = draft.type === "Modifier";
  const noun = isMod ? "Modifier" : "Add-On";
  const move = (i: number, d: number) => { const xs = [...draft.items]; const j = i + d; if (j < 0 || j >= xs.length) return; [xs[i], xs[j]] = [xs[j]!, xs[i]!]; update({ items: xs }); };

  let advanced: ReactNode;
  if (isMod) advanced = <>
    <SwitchRow label="Is This Modifier Group Mandatory?" checked={draft.mandatory} onChange={(v) => update({ mandatory: v })} />
    {draft.mandatory && <StepRow label="Minimum Number Of Selections" value={draft.min} onChange={(v) => update({ min: v, max: Math.max(draft.max, v) })} />}
    <SwitchRow label="Number of Selections" checked={draft.limit} onChange={(v) => update({ limit: v })} />
    {draft.limit && <StepRow label="Maximum Number Of Selections" value={draft.max} onChange={(v) => update({ max: Math.max(v, draft.mandatory ? draft.min : 1) })} />}
  </>;
  else advanced = <>
    <SwitchRow label="Maximum Number of Selections" checked={draft.limit} onChange={(v) => update({ limit: v })} />
    {draft.limit && <StepRow label="Selections" value={draft.max} onChange={(v) => update({ max: v })} />}
  </>;

  return <>
    <SubHeader title={existing ? "Edit Groups" : "Add Groups"} backLabel="Groups" onBack={back} />
    <ScreenBody className="py-2">
      <GroupLabel>GROUP INFORMATION</GroupLabel>
      <GroupCard>
        <TextRow label="Group Name" value={draft.name} placeholder="Enter Name"
          onChange={(v) => update({ name: v, displayName: !draft.displayName || draft.displayName === draft.name ? v : draft.displayName })} />
        <TextRow label="Group Display Name" value={draft.displayName} placeholder="Enter Name" onChange={(v) => update({ displayName: v })} />
        <NavRow label="Group Type" value={draft.type || "Select Type"} onClick={() => setPopup("type")} />
        <NavRow label={noun} value={summary(draft.items)} onClick={() => draft.type ? setPopup("items") : toast("Please select group type first")} />
        {isMod && <>
          <NavRow label="Default Modifiers" value={summary(draft.defaults)} onClick={() => setPopup("defaults")} />
          <NavRow label="Organize" onClick={() => draft.items.length ? setPopup("organize") : toast("Choose modifiers to organize")} />
        </>}
        <TextRow label={`${noun} Group Position`} value={draft.position} placeholder="Choose" numeric onChange={(v) => update({ position: v })} />
      </GroupCard>
      <GroupLabel>MODIFIER GROUP ADVANCED</GroupLabel>
      <GroupCard>{advanced}</GroupCard>
      {stored && <Button variant="outline" aria-label={stored.archived ? "Restore group" : "Archive group"} title={stored.archived ? "Restore group" : "Archive group"} className="mt-6 w-full" onClick={() => {
        patch(stored.id, { archived: !stored.archived }); toast.success(`Group ${stored.archived ? "restored" : "archived"}`); onBack();
      }}><ArchiveGlyph className="size-4" /></Button>}
    </ScreenBody>

    <Dialog open={popup === "type"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm gap-0 overflow-hidden p-0">
        <DialogTitle className="px-4 py-3 text-center t-row font-bold">Group Type</DialogTitle>
        <DialogDescription className="sr-only">Choose the group type.</DialogDescription>
        {(["Modifier", "Add-On"] as GroupType[]).map((t) => <button key={t} type="button"
          onClick={() => { update(t === draft.type ? {} : { type: t, items: [], defaults: [] }); setPopup(null); }}
          className="flex w-full items-center border-t border-border px-4 py-3 text-left t-row hover:bg-muted">
          <span className="flex-1">{t}</span>{draft.type === t && <CheckCircle2 className="size-5 fill-foreground text-background" />}</button>)}
      </DialogContent>
    </Dialog>
    {popup === "items" && <Picker title={isMod ? "Applicable Modifiers" : "Applicable Add-Ons"} options={isMod ? modifiers : addOns}
      selected={draft.items} onChange={(xs) => update({ items: xs })} onClose={() => setPopup(null)} />}
    {popup === "defaults" && <Picker title="Default Modifiers" options={defaults} selected={draft.defaults} onChange={(xs) => update({ defaults: xs })} onClose={() => setPopup(null)} />}
    <Dialog open={popup === "organize"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="flex max-h-[80dvh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogTitle className="px-4 py-3 text-center t-row font-bold">Organize</DialogTitle>
        <DialogDescription className="sr-only">Reorder the modifiers in this group.</DialogDescription>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {draft.items.map((x, i) => <div key={x} className="flex items-center gap-2 border-t border-border px-4 py-2">
            <span className="w-6 t-caption text-muted-foreground">{i + 1}</span><span className="min-w-0 flex-1 break-words t-row">{x}</span>
            <Button variant="ghost" size="icon" aria-label={`Move ${x} up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp /></Button>
            <Button variant="ghost" size="icon" aria-label={`Move ${x} down`} disabled={i === draft.items.length - 1} onClick={() => move(i, 1)}><ArrowDown /></Button>
          </div>)}
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={popup === "exit"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Are you sure you want to exit?</DialogTitle>
        <DialogDescription className="text-center">Group name and type are required. If you go back now, you will lose the progress.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setPopup(null)}>Cancel</Button><Button onClick={onBack}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
