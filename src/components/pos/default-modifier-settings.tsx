import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ChevronRight, Plus, Search, UtensilsCrossed, XCircle } from "lucide-react";
import { ArchiveGlyph, ArchiveSwipeAction } from "@/components/pos/archive-glyph";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SwipeRow } from "@/components/pos/swipe-row";
import { DEFAULT_MODIFIER_TYPES, newDefaultModifier, useDefaultModifierSettings, type DefaultModifier } from "@/lib/default-modifier-settings";
import { cn } from "@/lib/utils";

const INTRO = "Default Modifiers detail dish components, informing customers. Transparency supports dietary choices, ensuring a more informed and satisfying dining experience.";
const cols = "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1rem] items-center gap-2";
const th = "t-caption font-medium text-muted-foreground";
type View = { kind: "list" } | { kind: "archive" } | { kind: "edit"; id: string | null };

export function DefaultModifierSettings() {
  const [view, setView] = useState<View>({ kind: "list" });
  if (view.kind === "edit") return <Editor id={view.id} onBack={() => setView({ kind: "list" })} />;
  return <List archived={view.kind === "archive"} onOpen={(id) => setView({ kind: "edit", id })}
    onArchive={() => setView({ kind: "archive" })} onBackFromArchive={() => setView({ kind: "list" })} />;
}

function List({ archived, onOpen, onArchive, onBackFromArchive }: { archived: boolean; onOpen: (id: string | null) => void; onArchive: () => void; onBackFromArchive: () => void }) {
  const navigate = useNavigate();
  const { items, patch } = useDefaultModifierSettings();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const list = items.filter((x) => x.archived === archived && x.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return <>
    <SubHeader title={archived ? "Archived Default Modifiers" : "Default Modifiers"} backLabel="Back"
      onBack={archived ? onBackFromArchive : () => navigate({ to: "/settings/menu" })}
      right={<Button variant="ghost" size="icon" aria-label="Search default modifiers" onClick={() => { setSearching((v) => !v); setQ(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searching && <div className="mb-3 flex items-center gap-2">
        <Input autoFocus aria-label="Search default modifiers" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="ghost" onClick={() => { setSearching(false); setQ(""); }}>Cancel</Button></div>}
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 t-caption text-muted-foreground">{INTRO}</p>
        {!archived && <><Button variant="outline" size="icon" aria-label="Archived default modifiers" onClick={onArchive}><ArchiveGlyph className="size-4" /></Button>
          <Button size="icon" aria-label="Add default modifier" onClick={() => onOpen(null)}><Plus /></Button></>}
      </div>
      <GroupCard className="mt-4">
        <div className={cn(cols, "hidden border-b border-border px-4 py-2 sm:grid")}>
          <span className={th}>Default Modifier Name</span><span className={cn(th, "text-center")}>Type</span><span />
        </div>
        {!list.length && <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
          <UtensilsCrossed className="mb-2 size-12 text-muted-foreground" />
          <p className="t-body font-semibold">No item found</p><p className="t-caption text-muted-foreground">try to search with different word</p></div>}
        {list.map((x) => <SwipeRow key={x.id} className="rounded-none border-b border-border last:border-0"
          action={{ label: archived ? "Restore" : "Archive", destructive: !archived, icon: <ArchiveSwipeAction archived={archived} />, onAction: () => { patch(x.id, { archived: !archived }); toast.success(`Default modifier ${archived ? "restored" : "archived"}`); } }}>
          <button type="button" onClick={() => onOpen(x.id)} className="w-full bg-surface px-4 py-3 text-left hover:bg-muted">
            <div className={cn(cols, "hidden sm:grid")}><span className="truncate t-body">{x.name}</span><span className="text-center t-body">{x.type}</span><ChevronRight className="size-4 text-muted-foreground" /></div>
            <div className="flex items-center gap-2 sm:hidden"><div className="min-w-0 flex-1"><p className="t-body">{x.name}</p><p className="t-caption text-muted-foreground">{x.type}</p></div><ChevronRight className="size-4 text-muted-foreground" /></div>
          </button>
        </SwipeRow>)}
      </GroupCard>
    </ScreenBody>
  </>;
}

function Editor({ id, onBack }: { id: string | null; onBack: () => void }) {
  const { items, save, patch } = useDefaultModifierSettings();
  const existing = items.find((x) => x.id === id);
  const [draft, setDraft] = useState<DefaultModifier>(() => existing ?? newDefaultModifier());
  const [editing, setEditing] = useState(false);
  const [popup, setPopup] = useState<"type" | "exit" | null>(null);
  const stored = items.find((x) => x.id === draft.id);
  const update = (q: Partial<DefaultModifier>) => {
    const next = { ...draft, ...q };
    setDraft(next);
    if (next.name.trim()) save({ ...next, name: next.name.trim() });
  };
  const back = () => (!draft.name.trim() && !stored && draft.type !== "Normal" ? setPopup("exit") : onBack());
  const row = "flex min-h-12 w-full items-center gap-3 border-b border-border bg-surface px-4 py-2 text-left last:border-0";
  return <>
    <SubHeader title={existing ? "Edit Default Modifiers" : "Add Default Modifiers"} backLabel="Back" onBack={back} />
    <ScreenBody className="py-4">
      <GroupCard>
        {editing ? <div className={row}>
          <span className="shrink-0 t-body font-medium">Add Default Modifiers</span>
          <input autoFocus aria-label="Default modifier name" placeholder="Enter Modifier" value={draft.name} onChange={(e) => update({ name: e.target.value })}
            onBlur={() => setEditing(false)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            className="min-w-0 flex-1 bg-transparent text-right t-body outline-none placeholder:text-muted-foreground" />
          {draft.name && <button type="button" aria-label="Clear name" onMouseDown={(e) => e.preventDefault()} onClick={() => update({ name: "" })}><XCircle className="size-4 text-muted-foreground" /></button>}
        </div> : <button type="button" className={cn(row, "hover:bg-muted")} onClick={() => setEditing(true)}>
          <span className="flex-1 t-body font-medium">Add Default Modifiers</span>
          <span className={cn("t-body", !draft.name && "text-muted-foreground")}>{draft.name || "Choose"}</span><ChevronRight className="size-4 text-muted-foreground" />
        </button>}
        <button type="button" className={cn(row, "hover:bg-muted")} onClick={() => setPopup("type")}>
          <span className="flex-1 t-body font-medium">Add Default Modifier Category</span>
          <span className="t-body text-muted-foreground">{draft.type}</span><ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </GroupCard>
      {stored && <Button variant="outline" className="mt-6 w-full" onClick={() => {
        patch(stored.id, { archived: !stored.archived }); toast.success(`Default modifier ${stored.archived ? "restored" : "archived"}`); onBack();
      }}><ArchiveGlyph className="size-4" />{stored.archived ? "Restore" : "Archive"}</Button>}
    </ScreenBody>
    <Dialog open={popup === "type"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm gap-0 overflow-hidden p-0">
        <DialogTitle className="px-4 py-3 text-center t-row font-bold">Default Modifier Category</DialogTitle>
        <DialogDescription className="sr-only">Choose one category.</DialogDescription>
        {DEFAULT_MODIFIER_TYPES.map((t) => <button key={t} type="button" onClick={() => { update({ type: t }); setPopup(null); }}
          className="flex w-full items-center border-t border-border px-4 py-3 text-left t-row hover:bg-muted">
          <span className="flex-1">{t}</span>{draft.type === t && <CheckCircle2 className="size-5 fill-foreground text-background" />}</button>)}
      </DialogContent>
    </Dialog>
    <Dialog open={popup === "exit"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Are you sure you want to exit?</DialogTitle>
        <DialogDescription className="text-center">Default modifier name is required. If you go back now, you will lose the progress.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setPopup(null)}>Cancel</Button><Button onClick={onBack}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
