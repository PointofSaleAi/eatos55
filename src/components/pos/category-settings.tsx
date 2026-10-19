import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Check, ChevronRight, Plus, Search, XCircle } from "lucide-react";
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
import { menu as demoMenu } from "@/lib/demo-data";
import { COURSES, PRINTERS, newCategory, useCategorySettings, type CategoryRule } from "@/lib/category-settings";
import { cn } from "@/lib/utils";

const PRODUCTS = Array.from(new Set(demoMenu.map((m) => m.name))).sort((a, b) => a.localeCompare(b));
const cols = "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_3rem_1rem] items-center gap-2";
const th = "t-caption font-medium text-muted-foreground";

type View = { kind: "list" } | { kind: "archive" } | { kind: "edit"; id: string | null };

export function CategorySettings() {
  const [view, setView] = useState<View>({ kind: "list" });
  if (view.kind === "edit") return <CategoryEditor id={view.id} onBack={() => setView({ kind: "list" })} />;
  return <CategoryList archived={view.kind === "archive"} onOpen={(id) => setView({ kind: "edit", id })}
    onArchive={() => setView({ kind: "archive" })} onBackFromArchive={() => setView({ kind: "list" })} />;
}

function CategoryList({ archived, onOpen, onArchive, onBackFromArchive }: { archived: boolean; onOpen: (id: string | null) => void; onArchive: () => void; onBackFromArchive: () => void }) {
  const navigate = useNavigate();
  const { categories, patch } = useCategorySettings();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = categories
    .filter((c) => c.archived === archived && (c.name.toLowerCase().includes(query) || c.parent.toLowerCase().includes(query)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const course = (c: CategoryRule) => (c.course === "None" ? "1" : c.course);
  return <>
    <SubHeader title={archived ? "Archived Categories" : "Categories"} backLabel={archived ? "Categories" : "Back"}
      onBack={archived ? onBackFromArchive : () => navigate({ to: "/settings/menu" })}
      right={<Button variant="ghost" size="icon" aria-label="Search categories" onClick={() => { setSearching((v) => !v); setQ(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searching && <div className="mb-3 flex items-center gap-2">
        <Input autoFocus aria-label="Search categories" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="ghost" onClick={() => { setSearching(false); setQ(""); }}>Cancel</Button></div>}
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 t-caption text-muted-foreground">Categories organize dishes by type, facilitating navigation. Common categories include appetizers, entrées, desserts, and beverages for easy customer selection.</p>
        {!archived && <><Button variant="outline" size="icon" aria-label="Archived categories" onClick={onArchive}><ArchiveGlyph className="size-4" /></Button>
          <Button size="icon" aria-label="Add category" onClick={() => onOpen(null)}><Plus /></Button></>}
      </div>
      <GroupCard className="mt-4">
        <div className={cn(cols, "hidden border-b border-border px-4 py-2 sm:grid")}>
          <span className={th}>Category Name</span><span className={cn(th, "text-center")}>Parent</span><span className={cn(th, "text-center")}>Category Position</span><span className={cn(th, "text-right")}>Course</span><span />
        </div>
        {list.map((c) => <SwipeRow key={c.id} className="rounded-none border-b border-border last:border-0"
          action={{ label: archived ? "Restore" : "Archive", destructive: !archived, icon: <ArchiveGlyph className="size-5" />, onAction: () => { patch(c.id, { archived: !archived }); toast.success(archived ? "Category restored" : "Category archived"); } }}>
          <button type="button" onClick={() => onOpen(c.id)} className="w-full bg-surface px-4 py-2 text-left hover:bg-muted">
            <div className={cn(cols, "hidden min-h-10 sm:grid")}>
              <span className="min-w-0 break-words t-row">{c.name}</span>
              <span className="text-center t-value text-muted-foreground">{c.parent || "-"}</span>
              <span className="text-center t-value">{c.position || "-"}</span>
              <span className="text-right t-value">{course(c)}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
            <div className="flex min-h-12 items-center gap-2 sm:hidden">
              <span className="min-w-0 flex-1"><span className="block break-words t-row">{c.name}</span>
                <span className="block t-caption text-muted-foreground">Parent: {c.parent || "-"} · Position: {c.position || "-"} · Course: {course(c)}</span></span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </button>
        </SwipeRow>)}
        {list.length === 0 && <p className="px-4 py-10 text-center t-row text-muted-foreground">{archived ? "No archived categories" : "No categories found"}</p>}
      </GroupCard>
      <Caption>Swipe left on a category to {archived ? "restore" : "archive"} it. Demo only — categories don't change New Order or printing.</Caption>
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

function TextRow({ label, value, placeholder, onChange, numeric }: { label: string; value: string; placeholder: string; onChange: (v: string) => void; numeric?: boolean }) {
  return <label className={settingsRowClass}><span className="shrink-0 t-row">{label}</span>
    <input aria-label={label} placeholder={placeholder} value={value} inputMode={numeric ? "numeric" : undefined}
      onChange={(e) => onChange(numeric ? e.target.value.replace(/\D/g, "").slice(0, 4) : e.target.value)}
      className="min-h-11 min-w-0 flex-1 bg-transparent text-right t-value outline-none placeholder:text-muted-foreground" />
    {value && <Button variant="ghost" size="icon" aria-label={`Clear ${label}`} onClick={(e) => { e.preventDefault(); onChange(""); }}><XCircle className="text-muted-foreground" /></Button>}
  </label>;
}

function SinglePicker({ title, options, value, onPick, onClose }: { title: string; options: string[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const shown = options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase()));
  return <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="flex max-h-[80dvh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0">
      <DialogTitle className="px-4 pt-4 text-center t-row font-bold">{title}</DialogTitle>
      <DialogDescription className="sr-only">Choose one {title.toLowerCase()}.</DialogDescription>
      <div className="relative border-b border-border p-3"><Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label={`Search ${title}`} placeholder="Search" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="overflow-y-auto">
        {shown.map((o) => <button key={o} type="button" onClick={() => { onPick(o === value ? "" : o); onClose(); }}
          className="flex min-h-12 w-full items-center border-b border-border px-4 text-left t-row last:border-0 hover:bg-muted">
          <span className="flex-1">{o}</span>{o === value && <Check className="size-4" />}</button>)}
        {shown.length === 0 && <p className="px-4 py-8 text-center t-caption text-muted-foreground">No results</p>}
      </div>
    </DialogContent>
  </Dialog>;
}

type Popup = "printers" | "parent" | "products" | "course" | "exit" | null;

function CategoryEditor({ id, onBack }: { id: string | null; onBack: () => void }) {
  const { categories, save, patch } = useCategorySettings();
  const existing = categories.find((c) => c.id === id);
  const [draft, setDraft] = useState<CategoryRule>(() => existing ?? newCategory());
  const [popup, setPopup] = useState<Popup>(null);
  const saved = categories.some((c) => c.id === draft.id);

  const update = (p: Partial<CategoryRule>) => {
    const next = { ...draft, ...p };
    if (!next.printers.length) next.labelPrinting = false;
    setDraft(next);
    if (next.name.trim()) save(next);
  };
  const back = () => (!draft.name.trim() && (!saved || draft !== existing) && JSON.stringify({ ...draft, id: "" }) !== JSON.stringify({ ...newCategory(), id: "" }) ? setPopup("exit") : onBack());
  const parents = categories.filter((c) => !c.parent && !c.archived && c.id !== draft.id).map((c) => c.name);
  const hasParent = !!draft.parent;

  return <>
    <SubHeader title={existing ? "Edit Category" : "Add Category"} backLabel="Categories" onBack={back} />
    <ScreenBody className="py-4">
      <GroupCard>
        <TextRow label="Category Name" placeholder="Enter Category Name" value={draft.name} onChange={(name) => update({ name })} />
        {!draft.name.trim() && <p className="px-4 pb-3 t-caption text-destructive">Category name cannot be empty</p>}
        <TextRow label="Position" placeholder="Enter Position" numeric value={draft.position} onChange={(position) => update({ position })} />
        {hasParent && <Row label="Default course" value={draft.course} onClick={() => setPopup("course")} />}
        <TextRow label="Menu Display Name" placeholder="Enter Display Name" value={draft.displayName} onChange={(displayName) => update({ displayName })} />
        <TextRow label="Category Code" placeholder="Enter Category Code" value={draft.code} onChange={(code) => update({ code })} />
        {hasParent && <>
          <Row label="Assigned Printer" value={draft.printers.length || "Select Printers"} sub={draft.printers.join(", ") || undefined} onClick={() => setPopup("printers")} />
          {draft.printers.length > 0 && <label className={settingsRowClass}><span className="flex-1 t-row">Label Printing</span>
            <Switch aria-label="Label Printing" checked={draft.labelPrinting} onCheckedChange={(labelPrinting) => update({ labelPrinting })} /></label>}
          <label className={settingsRowClass}><span className="flex-1 t-row">Show Allergen Prompt</span>
            <Switch aria-label="Show Allergen Prompt" checked={draft.allergenPrompt} onCheckedChange={(allergenPrompt) => update({ allergenPrompt })} /></label>
        </>}
        <Row label="Parent Category" value={draft.parent || "Select Category"} onClick={() => setPopup("parent")} />
        <Row label="Products" value={draft.products.length || "Select Products"} sub={draft.products.join(", ") || undefined} onClick={() => setPopup("products")} />
      </GroupCard>
      <Caption>Changes save automatically. Demo only — doesn't change New Order or printing.</Caption>
    </ScreenBody>
    {popup === "printers" && <Picker title="Assigned Printers" options={PRINTERS} selected={draft.printers} onChange={(printers) => update({ printers })} onClose={() => setPopup(null)} />}
    {popup === "products" && <Picker title="Applicable Products" options={PRODUCTS} selected={draft.products} onChange={(products) => update({ products })} onClose={() => setPopup(null)} />}
    {popup === "parent" && <SinglePicker title="Parent Category" options={parents} value={draft.parent} onPick={(parent) => update({ parent, ...(parent ? {} : { course: "None", printers: [], allergenPrompt: false }) })} onClose={() => setPopup(null)} />}
    {popup === "course" && <SinglePicker title="Default Course" options={COURSES} value={draft.course} onPick={(course) => update({ course: course || "None" })} onClose={() => setPopup(null)} />}
    <Dialog open={popup === "exit"} onOpenChange={(o) => { if (!o) setPopup(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Are you sure you want to exit?</DialogTitle>
        <DialogDescription className="text-center">Category name is required. If you go back now, you will lose the progress.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setPopup(null)}>Keep Editing</Button><Button onClick={onBack}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
