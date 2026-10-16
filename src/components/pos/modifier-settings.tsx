import { useNavigate } from "@tanstack/react-router";
import { MoneyInput } from "@/components/pos/money-input";
import { useState, type ReactNode } from "react";
import { Archive, ChevronRight, Minus, Plus, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SwipeRow } from "@/components/pos/swipe-row";
import { Picker } from "@/components/pos/tax-settings";
import { ORDER_TYPE_TAGS, newModifier, optId, useAddOnSettings, useModifierSettings, type ModifierOption, type ModifierRule, type RuleStoreHook } from "@/lib/modifier-settings";
import { cn } from "@/lib/utils";

const cols = "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_1rem] items-center gap-2";
const th = "t-caption font-medium text-muted-foreground";
const money = (p: string) => `$${(Number(p) || 0).toFixed(2)}`;
const summary = (m: ModifierRule) => {
  const first = m.hasOptions ? m.options[0] : undefined;
  return { type: first?.name || "Regular", count: m.maxOn ? m.max : Math.max(1, m.hasOptions ? m.options.length : 1), price: money(first?.price ?? "0") };
};

type View = { kind: "list" } | { kind: "archive" } | { kind: "edit"; id: string | null };

type Copy = { one: string; many: string; nameCol: string; intro: string; editTitle: string; addTitle: string; info: string; options: string; nameLabel: string; served: boolean; eightySix: string; hasOptions: string; useStore: RuleStoreHook };
const MODIFIER_COPY: Copy = { one: "Modifier", many: "Modifiers", nameCol: "Modifier Name", addTitle: "Add Modifier", editTitle: "Edit Modifier", info: "Modifier Information", options: "Modifier Options", nameLabel: "Modifier Name", served: true,
  eightySix: "86 this Modifier?", hasOptions: "Does this modifier have options?", useStore: useModifierSettings,
  intro: "Modifiers customize dishes, catering to preferences. Enhance dining experiences by allowing customers to personalize their orders for satisfaction." };
const ADDON_COPY: Copy = { one: "Add-On", many: "Add-Ons", nameCol: "Name", addTitle: "Add Add-Ons", editTitle: "Edit Add-Ons", info: "Add-Ons Information", options: "Add-Ons Options", nameLabel: "Name", served: false,
  eightySix: "86 this Add-On?", hasOptions: "Does this Add-Ons have options?", useStore: useAddOnSettings,
  intro: "Explore a culinary revolution with food add-ons – from truffle-infused salts to exotic spice blends, transforming ordinary dishes into extraordinary experiences." };

export function ModifierSettings() { return <RuleSettings c={MODIFIER_COPY} />; }
export function AddOnSettings() { return <RuleSettings c={ADDON_COPY} />; }

function RuleSettings({ c }: { c: Copy }) {
  const [view, setView] = useState<View>({ kind: "list" });
  if (view.kind === "edit") return <ModifierEditor c={c} id={view.id} onBack={() => setView({ kind: "list" })} />;
  return <ModifierList c={c} archived={view.kind === "archive"} onOpen={(id) => setView({ kind: "edit", id })}
    onArchive={() => setView({ kind: "archive" })} onBackFromArchive={() => setView({ kind: "list" })} />;
}

function ModifierList({ c, archived, onOpen, onArchive, onBackFromArchive }: { c: Copy; archived: boolean; onOpen: (id: string | null) => void; onArchive: () => void; onBackFromArchive: () => void }) {
  const navigate = useNavigate();
  const { modifiers, patch } = c.useStore();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const list = modifiers.filter((m) => m.archived === archived && m.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return <>
    <SubHeader title={archived ? `Archived ${c.many}` : c.many} backLabel={archived ? c.many : "Back"}
      onBack={archived ? onBackFromArchive : () => navigate({ to: "/settings/menu" })}
      right={<Button variant="ghost" size="icon" aria-label={`Search ${c.many.toLowerCase()}`} onClick={() => { setSearching((v) => !v); setQ(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searching && <div className="mb-3 flex items-center gap-2">
        <Input autoFocus aria-label={`Search ${c.many.toLowerCase()}`} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="ghost" onClick={() => { setSearching(false); setQ(""); }}>Cancel</Button></div>}
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 t-caption text-muted-foreground">{c.intro}</p>
        {!archived && <><Button variant="outline" size="icon" aria-label={`Archived ${c.many.toLowerCase()}`} onClick={onArchive}><Archive /></Button>
          <Button size="icon" aria-label={`Add ${c.one.toLowerCase()}`} onClick={() => onOpen(null)}><Plus /></Button></>}
      </div>
      <GroupCard className="mt-4">
        <div className={cn(cols, "hidden border-b border-border px-4 py-2 sm:grid")}>
          <span className={th}>{c.nameCol}</span><span className={cn(th, "text-center")}>Type</span><span className={cn(th, "text-center")}>Selected Options</span><span className={cn(th, "text-right")}>Price</span><span />
        </div>
        {list.map((m) => {
          const s = summary(m);
          return <SwipeRow key={m.id} className="rounded-none border-b border-border last:border-0"
            action={{ label: archived ? "Restore" : "Archive", destructive: !archived, onAction: () => { patch(m.id, { archived: !archived }); toast.success(`${c.one} ${archived ? "restored" : "archived"}`); } }}>
            <button type="button" onClick={() => onOpen(m.id)} className="w-full bg-surface px-4 py-2 text-left hover:bg-muted">
              <div className={cn(cols, "hidden min-h-10 sm:grid")}>
                <span className="min-w-0 break-words t-row">{m.name}</span>
                <span className="min-w-0 break-words text-center t-value text-muted-foreground">{s.type}</span>
                <span className="text-center t-value">{s.count}</span>
                <span className="text-right t-value">{s.price}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
              <div className="flex min-h-12 items-center gap-2 sm:hidden">
                <span className="min-w-0 flex-1"><span className="block break-words t-row">{m.name}</span>
                  <span className="block t-caption text-muted-foreground">{s.type} · {s.count} option{s.count === 1 ? "" : "s"}</span></span>
                <span className="t-value">{s.price}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          </SwipeRow>;
        })}
        {list.length === 0 && <p className="px-4 py-10 text-center t-row text-muted-foreground">{archived ? `No archived ${c.many.toLowerCase()}` : `No ${c.many.toLowerCase()} found`}</p>}
      </GroupCard>
      <Caption>Swipe left to {archived ? "restore" : "archive"}. Demo only — {c.many.toLowerCase()} don't change New Order or prices.</Caption>
    </ScreenBody>
  </>;
}

function Row({ label, value, onClick, sub }: { label: string; value: ReactNode; onClick: () => void; sub?: string | undefined }) {
  return <Button variant="ghost" onClick={onClick} className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`}>
    <span className="min-w-0 flex-1 text-left"><span className="block t-row">{label}</span>
      {sub && <span className="line-clamp-2 block t-caption text-muted-foreground">{sub}</span>}</span>
    <span className="max-w-[55%] break-words text-right t-value text-muted-foreground">{value}</span><ChevronRight />
  </Button>;
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className={settingsRowClass}><span className="flex-1 t-row">{label}</span><Switch aria-label={label} checked={checked} onCheckedChange={onChange} /></label>;
}


function PriceField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="flex min-h-11 cursor-text items-center justify-end t-value">
    <span className={cn(value ? "text-foreground" : "text-muted-foreground")}>$</span>
    <MoneyInput aria-label={label} value={value} onChange={onChange}
      style={{ width: `${Math.max(value.length, 4) + 0.5}ch` }}
      className="min-h-11 min-w-0 bg-transparent text-right tabular-nums outline-none placeholder:text-muted-foreground" />
  </label>;
}

function OptionRow({ opt, onChange, onRemove, focus }: { focus?: boolean; opt: ModifierOption; onChange: (o: ModifierOption) => void; onRemove: () => void }) {
  return <SwipeRow className="rounded-none border-b border-border" action={{ label: "Remove", destructive: true, onAction: onRemove }}>
    <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-center gap-2 bg-surface px-4">
      <input autoFocus={focus} aria-label="Option name" placeholder="Enter Option Name" value={opt.name} onChange={(e) => onChange({ ...opt, name: e.target.value })} className="min-h-11 min-w-0 bg-transparent t-row outline-none placeholder:text-muted-foreground" />
      <PriceField label={`${opt.name || "Option"} price`} value={opt.price} onChange={(price) => onChange({ ...opt, price })} />
      <Button variant="ghost" size="icon" aria-label={`Remove ${opt.name || "option"}`} onClick={onRemove}><XCircle className="text-muted-foreground" /></Button>
    </div>
  </SwipeRow>;
}

function ModifierEditor({ c, id, onBack }: { c: Copy; id: string | null; onBack: () => void }) {
  const { modifiers, save, patch } = c.useStore();
  const existing = modifiers.find((m) => m.id === id);
  const [draft, setDraft] = useState<ModifierRule>(() => existing ?? newModifier());
  const [picker, setPicker] = useState(false);
  const [exit, setExit] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const saved = modifiers.some((m) => m.id === draft.id);

  const update = (p: Partial<ModifierRule>) => {
    const next = { ...draft, ...p };
    const limit = Math.max(1, next.options.length);
    if (next.max > limit) next.max = limit;
    if (next.max < 1) next.max = 1;
    setDraft(next);
    if (next.name.trim()) save(next);
  };
  const touched = JSON.stringify({ ...draft, id: "" }) !== JSON.stringify({ ...newModifier(), id: "" });
  const back = () => (!draft.name.trim() && touched ? setExit(true) : onBack());
  const setOpt = (o: ModifierOption) => update({ options: draft.options.map((x) => (x.id === o.id ? o : x)) });
  const addOpt = (name: string) => { if (!name.trim()) { setNewName(name); return; } setNewName(""); const id = optId(); setFocusId(id); update({ options: [...draft.options, { id, name, price: newPrice }] }); setNewPrice(""); };

  return <>
    <SubHeader title={existing ? c.editTitle : c.addTitle} backLabel={c.many} onBack={back} />
    <ScreenBody className="py-4">
      <GroupLabel>Order Type Applicable</GroupLabel>
      <GroupCard>
        <Row label="Order Type Tag" value={draft.orderTypes.length || "Choose"} sub={draft.orderTypes.join(", ") || undefined} onClick={() => setPicker(true)} />
      </GroupCard>

      <GroupLabel>{c.info}</GroupLabel>
      <GroupCard>
        <label className={settingsRowClass}><span className="shrink-0 t-row">{c.nameLabel}</span>
          <input aria-label={c.nameLabel} placeholder="Enter Name" value={draft.name} onChange={(e) => update({ name: e.target.value })}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-right t-value outline-none placeholder:text-muted-foreground" />
          {draft.name && <Button variant="ghost" size="icon" aria-label="Clear name" onClick={(e) => { e.preventDefault(); setDraft({ ...draft, name: "" }); }}><XCircle className="text-muted-foreground" /></Button>}
        </label>
        {!draft.name.trim() && touched && <p className="px-4 pb-3 t-caption text-destructive">{c.one} name cannot be empty</p>}
        {c.served && <ToggleRow label="Can this modifier be served?" checked={draft.served} onChange={(served) => update({ served })} />}
        <ToggleRow label={c.eightySix} checked={draft.eightySixed} onChange={(eightySixed) => update({ eightySixed })} />
        <ToggleRow label={c.hasOptions} checked={draft.hasOptions} onChange={(hasOptions) => update({ hasOptions })} />
      </GroupCard>

      {draft.hasOptions && <>
        <GroupLabel>{c.options}</GroupLabel>
        <GroupCard>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-2 border-b border-border px-4 py-2">
            <span className={th}>Name</span><span className={cn(th, "text-right")}>Price</span><span />
          </div>
          {draft.options.map((o) => <OptionRow key={o.id} focus={o.id === focusId} opt={o} onChange={setOpt} onRemove={() => update({ options: draft.options.filter((x) => x.id !== o.id) })} />)}
          <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-center gap-2 px-4">
            <input aria-label="Add option" placeholder="Add Option" value={newName} onChange={(e) => addOpt(e.target.value)} className="min-h-11 min-w-0 bg-transparent t-row outline-none placeholder:text-muted-foreground" />
            <PriceField label="New option price" value={newPrice} onChange={setNewPrice} /><span />
          </div>
        </GroupCard>
        {draft.options.length === 0 && <p className="px-4 pt-2 t-caption text-destructive">At least 1 option should be added</p>}
      </>}

      <GroupCard className="mt-4">
        <ToggleRow label="Maximum Number of Selections" checked={draft.maxOn} onChange={(maxOn) => update({ maxOn })} />
        {draft.maxOn && <div className={settingsRowClass}>
          <span className="flex-1 t-value" aria-live="polite">{draft.max}</span>
          <Button variant="outline" size="icon" aria-label="Decrease maximum selections" disabled={draft.max <= 1} onClick={() => update({ max: draft.max - 1 })}><Minus /></Button>
          <Button variant="outline" size="icon" aria-label="Increase maximum selections" disabled={draft.max >= Math.max(1, draft.options.length)} onClick={() => update({ max: draft.max + 1 })}><Plus /></Button>
        </div>}
      </GroupCard>

      {saved && <GroupCard className="mt-4">
        <Button variant="ghost" className={cn(settingsRowClass, "h-auto justify-center rounded-none", !draft.archived && "text-destructive")}
          onClick={() => { patch(draft.id, { archived: !draft.archived }); toast.success(`${c.one} ${draft.archived ? "restored" : "archived"}`); onBack(); }}>
          {draft.archived ? `Restore ${c.one}` : `Archive ${c.one}`}</Button>
      </GroupCard>}
      <Caption>Changes save automatically. Demo only — doesn't change New Order or prices.</Caption>
    </ScreenBody>
    {picker && <Picker title="Order Type Tag" options={ORDER_TYPE_TAGS} selected={draft.orderTypes} onChange={(orderTypes) => update({ orderTypes })} onClose={() => setPicker(false)} />}
    <Dialog open={exit} onOpenChange={setExit}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Are you sure you want to exit?</DialogTitle>
        <DialogDescription className="text-center">{c.one} name is required. If you go back now, you will lose the progress.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setExit(false)}>Keep Editing</Button><Button onClick={onBack}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
