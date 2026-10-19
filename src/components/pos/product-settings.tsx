import { useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { Camera, ChevronDown, ChevronRight, CheckCircle2, Circle, Images, Plus, ScanBarcode, Search, XCircle } from "lucide-react";
import { ArchiveGlyph, ArchiveSwipeAction } from "@/components/pos/archive-glyph";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SwipeRow } from "@/components/pos/swipe-row";
import { MoneyInput } from "@/components/pos/money-input";
import { Picker } from "@/components/pos/tax-settings";
import { COURSES, PRINTERS, useCategorySettings } from "@/lib/category-settings";
import { useAddOnSettings, useModifierSettings } from "@/lib/modifier-settings";
import { referenceTaxes } from "@/lib/tax-settings";
import { referenceDiscounts } from "@/lib/discount-settings";
import { referenceTimedPricing } from "@/lib/timed-pricing";
import { UOMS, newProduct, newVariant, uomShort, useProductSettings, type ProductRule, type Variant } from "@/lib/product-settings";
import { cn } from "@/lib/utils";

const cols = "grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_1rem] items-center gap-2";
const th = "t-caption font-medium text-muted-foreground";
const money = (v: string) => `$${(Number(v) || 0).toFixed(2)}`;
const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "NA";
const INTRO = "Products are offerings listed for purchase. They encompass dishes, beverages, and desserts, showcasing a restaurant's culinary offerings and variety.";

/** Modifier groups as shown in the recording; items are demo labels only. */
const MODIFIER_GROUPS: { name: string; items: string[] }[] = [
  { name: "Allergen", items: ["Vegetarian", "Celery Allergy", "Specify Allergen", "Gluten Allergy", "Nut Allergy", "Vegan", "Dairy Allergy", "Egg Allergy", "Cereal Allergy", "Shellfish-Free", "Soy-Free"] },
  { name: "Sandwich Bread Choice", items: ["Brown Bread", "Ciabatta", "White Bread", "Gluten Free Bread"] },
  { name: "Burger and Sandwich Sides Choice", items: ["Chips", "Salad", "No Side"] },
  { name: "Choice of Side", items: ["Chips", "Salad", "Seasonal Veg"] },
  { name: "Gammon Side Choice", items: ["Chips", "Salad"] },
  { name: "Sandwich Side Choice", items: ["Chips", "Salad"] },
  { name: "Sausage & Mash Sides", items: ["Chips", "Beans"] },
  { name: "Steak Pie Sides", items: ["Chips", "Seasonal Veg"] },
  { name: "Egg Style Choice", items: ["Fried", "Poached", "Scrambled"] },
  { name: "Wine Glasses", items: ["125ml", "175ml", "250ml"] },
  { name: "Mixer Options", items: ["Tonic Water", "Slimline Tonic"] },
];

type View = { kind: "list" } | { kind: "archive" } | { kind: "edit"; id: string | null };

export function ProductSettings() {
  const [view, setView] = useState<View>({ kind: "list" });
  if (view.kind === "edit") return <ProductEditor id={view.id} onBack={() => setView({ kind: "list" })} />;
  return <ProductList archived={view.kind === "archive"} onOpen={(id) => setView({ kind: "edit", id })}
    onArchive={() => setView({ kind: "archive" })} onBackFromArchive={() => setView({ kind: "list" })} />;
}

function ProductList({ archived, onOpen, onArchive, onBackFromArchive }: { archived: boolean; onOpen: (id: string | null) => void; onArchive: () => void; onBackFromArchive: () => void }) {
  const navigate = useNavigate();
  const { products, patch } = useProductSettings();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const list = products.filter((p) => p.archived === archived && p.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return <>
    <SubHeader title={archived ? "Archived Products" : "Products"} backLabel={archived ? "Products" : "Back"}
      onBack={archived ? onBackFromArchive : () => navigate({ to: "/settings/menu" })}
      right={<Button variant="ghost" size="icon" aria-label="Search products" onClick={() => { setSearching((v) => !v); setQ(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searching && <div className="mb-3 flex items-center gap-2">
        <Input autoFocus aria-label="Search products" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="ghost" onClick={() => { setSearching(false); setQ(""); }}>Cancel</Button></div>}
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 t-caption text-muted-foreground">{INTRO}</p>
        {!archived && <><Button variant="outline" size="icon" aria-label="Archived products" onClick={onArchive}><ArchiveGlyph className="size-4" /></Button>
          <Button size="icon" aria-label="Add product" onClick={() => onOpen(null)}><Plus /></Button></>}
      </div>
      <GroupCard className="mt-4">
        <div className={cn(cols, "hidden border-b border-border px-4 py-2 sm:grid")}>
          <span className={th}>Product Name</span><span className={cn(th, "text-center")}>SKU</span><span className={cn(th, "text-center")}>Variant</span><span className={cn(th, "text-right")}>Price</span><span />
        </div>
        {list.map((p) => {
          const v = p.variants[0];
          return <SwipeRow key={p.id} className="rounded-none border-b border-border last:border-0"
            action={{ label: archived ? "Restore" : "Archive", destructive: !archived, icon: <ArchiveSwipeAction archived={archived} />, onAction: () => { patch(p.id, { archived: !archived }); toast.success(`Product ${archived ? "restored" : "archived"}`); } }}>
            <button type="button" onClick={() => onOpen(p.id)} className="w-full bg-surface px-4 py-2 text-left hover:bg-muted">
              <div className={cn(cols, "hidden min-h-10 sm:grid")}>
                <span className="min-w-0 break-words t-row">{p.name}</span>
                <span className="min-w-0 break-words text-center t-value text-muted-foreground">{v?.sku || "—"}</span>
                <span className="text-center t-value">{p.variants.length}</span>
                <span className="text-right t-value">{money(v?.price ?? "0")}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
              <div className="flex min-h-12 items-center gap-2 sm:hidden">
                <span className="min-w-0 flex-1"><span className="block break-words t-row">{p.name}</span>
                  <span className="block t-caption text-muted-foreground">SKU {v?.sku || "—"} · {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}</span></span>
                <span className="t-value">{money(v?.price ?? "0")}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          </SwipeRow>;
        })}
        {list.length === 0 && <p className="px-4 py-10 text-center t-row text-muted-foreground">{archived ? "No Data Available" : "No products found"}</p>}
      </GroupCard>
      <Caption>Swipe left to {archived ? "restore" : "archive"}. Demo only — products here don't change New Order or prices.</Caption>
    </ScreenBody>
  </>;
}

function Row({ label, value, onClick, sub }: { label: string; value: ReactNode; onClick: () => void; sub?: string | undefined }) {
  return <Button variant="ghost" onClick={onClick} className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`}>
    <span className="min-w-0 flex-1 text-left"><span className="block t-row">{label}</span>
      {sub && <span className="line-clamp-3 block t-caption text-muted-foreground">{sub}</span>}</span>
    <span className="max-w-[55%] break-words text-right t-value text-muted-foreground">{value}</span><ChevronRight />
  </Button>;
}
function TextRow({ label, value, onChange, placeholder = "Enter Name", extra }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; extra?: ReactNode }) {
  return <label className={settingsRowClass}><span className="shrink-0 t-row">{label}</span>
    <input aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
      className="min-h-11 min-w-0 flex-1 bg-transparent text-right t-value outline-none placeholder:text-muted-foreground" />
    {extra}
    {value && <Button variant="ghost" size="icon" aria-label={`Clear ${label}`} onClick={(e) => { e.preventDefault(); onChange(""); }}><XCircle className="text-muted-foreground" /></Button>}
  </label>;
}
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className={settingsRowClass}><span className="flex-1 t-row">{label}</span><Switch aria-label={label} checked={checked} onCheckedChange={onChange} /></label>;
}
const multi = (label: string, sel: string[], placeholder: string, open: () => void) =>
  <Row label={label} value={sel.length || placeholder} sub={sel.join(", ") || undefined} onClick={open} />;

type PickerKey = "printers" | "categories" | "course" | "defaultModifiers" | "vat" | "discounts" | "modifiers" | "addOns" | { uom: string } | { timed: string } | null;

function ProductEditor({ id, onBack }: { id: string | null; onBack: () => void }) {
  const navigate = useNavigate();
  const { products, save, patch } = useProductSettings();
  const { categories } = useCategorySettings();
  const { modifiers: mods } = useModifierSettings();
  const { modifiers: addOnRules } = useAddOnSettings();
  const existing = id ? products.find((p) => p.id === id) : undefined;
  const [draft, setDraft] = useState<ProductRule>(() => existing ?? newProduct());
  const [picker, setPicker] = useState<PickerKey>(null);
  const [photo, setPhoto] = useState(false);
  const [exit, setExit] = useState(false);
  const [newVar, setNewVar] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const saved = products.some((p) => p.id === draft.id);

  const update = (q: Partial<ProductRule>) => { const next = { ...draft, ...q }; setDraft(next); if (next.name.trim()) save(next); };
  const setName = (name: string) => {
    const follow = (v: string) => (!v || v === draft.name ? name : v);
    update({ name, menuName: follow(draft.menuName), displayName: follow(draft.displayName), printerName: follow(draft.printerName) });
  };
  const touched = JSON.stringify({ ...draft, id: "" }) !== JSON.stringify({ ...newProduct(), id: "" });
  const back = () => (!draft.name.trim() && touched ? setExit(true) : onBack());
  const setVar = (v: Variant) => update({ variants: draft.variants.map((x) => (x.id === v.id ? v : x)) });
  const addVar = (name: string) => { if (!name.trim()) { setNewVar(name); return; } setNewVar(""); const v = newVariant(name); setFocusId(v.id); update({ variants: [...draft.variants, v] }); };
  const single = (cur: string, next: string[]) => next.find((n) => n !== cur) ?? cur;

  return <>
    <SubHeader title={existing ? "Edit Product" : "Add Product"} backLabel="Products" onBack={back} />
    <ScreenBody className="py-4">
      <div className="flex flex-col items-center gap-2 pb-2">
        <button type="button" aria-label="Product photo" onClick={() => (draft.name.trim() ? setPhoto(true) : toast("Please enter product name first"))}
          className="relative grid size-20 place-items-center rounded-full bg-muted t-row font-bold text-foreground">
          {draft.photo ? <img src={draft.photo} alt="" className="size-full rounded-full object-cover" /> : initials(draft.name)}
          <span className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border border-border bg-surface"><Camera className="size-4" /></span>
        </button>
        {draft.name && <p className="t-row font-bold">{draft.name}</p>}
      </div>

      <GroupLabel>Product Information</GroupLabel>
      <GroupCard>
        <TextRow label="Product Name" value={draft.name} onChange={setName} />
        {!draft.name.trim() && touched && <p className="px-4 pb-3 t-caption text-destructive">Product name cannot be empty</p>}
        <TextRow label="Menu Display Name" value={draft.menuName} onChange={(menuName) => update({ menuName })} />
        <TextRow label="Display Name" value={draft.displayName} onChange={(displayName) => update({ displayName })} />
        {multi("Assigned Printers", draft.printers, "Select Printers", () => setPicker("printers"))}
        <TextRow label="Printer Name" value={draft.printerName} onChange={(printerName) => update({ printerName })} />
        <TextRow label="Product Code" value={draft.code} placeholder="Enter code" onChange={(code) => update({ code })} />
        <TextRow label="Barcode" value={draft.barcode} placeholder="Enter barcode" onChange={(barcode) => update({ barcode })}
          extra={<Button variant="ghost" size="icon" aria-label="Scan barcode" onClick={(e) => { e.preventDefault(); toast("Barcode scanning isn't available in this demo"); }}><ScanBarcode className="text-muted-foreground" /></Button>} />
        {multi("Category", draft.categories, "Select Categories", () => setPicker("categories"))}
        <Row label="Default course" value={draft.course} onClick={() => setPicker("course")} />
      </GroupCard>

      <GroupLabel>Modifier Groups</GroupLabel>
      <GroupCard>
        {multi("Modifiers", draft.modifiers, "Select Modifiers", () => setPicker("modifiers"))}
        {multi("AddOns", draft.addOns, "Select AddOns", () => setPicker("addOns"))}
      </GroupCard>

      <GroupLabel>Description</GroupLabel>
      <GroupCard>
        <textarea aria-label="Description" placeholder="Enter Description" maxLength={1000} rows={3} value={draft.description} onChange={(e) => update({ description: e.target.value })}
          className="block w-full resize-none bg-transparent px-4 py-3 t-row outline-none placeholder:text-muted-foreground" />
      </GroupCard>
      <Caption>Maximum 1000 characters</Caption>

      <GroupCard className="mt-4">
        <ToggleRow label="Add to Menu?" checked={draft.addToMenu} onChange={(addToMenu) => update({ addToMenu })} />
        <ToggleRow label="86 this Product" checked={draft.eightySixed} onChange={(eightySixed) => update({ eightySixed })} />
        <ToggleRow label="Inventory Tracking" checked={draft.inventory} onChange={(inventory) => update({ inventory })} />
        <ToggleRow label="Negative Inventory" checked={draft.negative} onChange={(negative) => update({ negative })} />
        <ToggleRow label="Show UOM & Decimals on KOT" checked={draft.uomOnKot} onChange={(uomOnKot) => update({ uomOnKot })} />
      </GroupCard>

      <GroupCard className="mt-4 overflow-x-auto">
        <VariantTable draft={draft} focusId={focusId} newVar={newVar} onNew={addVar} onChange={setVar}
          onRemove={(v) => update({ variants: draft.variants.filter((x) => x.id !== v.id) })}
          onUom={(vid) => setPicker({ uom: vid })} onTimed={(vid) => setPicker({ timed: vid })} />
      </GroupCard>
      {draft.variants.length === 0 && <p className="px-4 pt-2 t-caption text-destructive">At least one variant is required</p>}

      <GroupLabel>Product Settings</GroupLabel>
      <GroupCard>
        {multi("Default Modifiers", draft.defaultModifiers, "Select Default Modifiers", () => setPicker("defaultModifiers"))}
        {multi("VAT", draft.vat, "Select VAT", () => setPicker("vat"))}
        {multi("Discounts", draft.discounts, "Select Discounts", () => setPicker("discounts"))}
        <Row label="Order Options" value="Course, Sides…" sub="Turn order prompts off, optional or required for New Order" onClick={() => navigate({ to: "/settings/detail/$topic", params: { topic: "product-order-options" } })} />
      </GroupCard>

      {saved && <GroupCard className="mt-4">
        <Button variant="ghost" className={cn(settingsRowClass, "h-auto justify-center rounded-none", !draft.archived && "text-destructive")}
          onClick={() => { patch(draft.id, { archived: !draft.archived }); toast.success(`Product ${draft.archived ? "restored" : "archived"}`); onBack(); }}>
          <ArchiveGlyph className="size-4" />{draft.archived ? "Restore Product" : "Archive Product"}</Button>
      </GroupCard>}
      <Caption>Changes save automatically. Demo only — doesn't change New Order, prices, printing or taxes.</Caption>
    </ScreenBody>

    {picker === "printers" && <Picker title="Assigned Printers" options={PRINTERS} selected={draft.printers} onChange={(printers) => update({ printers })} onClose={() => setPicker(null)} />}
    {picker === "categories" && <Picker title="Category" options={categories.filter((c) => !c.archived).map((c) => c.name)} selected={draft.categories} onChange={(cs) => update({ categories: cs })} onClose={() => setPicker(null)} />}
    {picker === "course" && <Picker title="Select default course" options={COURSES} selected={[draft.course]} onChange={(n) => { update({ course: single(draft.course, n) }); setPicker(null); }} onClose={() => setPicker(null)} />}
    {picker === "defaultModifiers" && <Picker title="Default Modifiers" options={mods.filter((m) => !m.archived).map((m) => m.name)} selected={draft.defaultModifiers} onChange={(defaultModifiers) => update({ defaultModifiers })} onClose={() => setPicker(null)} />}
    {picker === "vat" && <Picker title="VAT" options={referenceTaxes.map((t) => t.name)} selected={draft.vat} onChange={(vat) => update({ vat })} onClose={() => setPicker(null)} />}
    {picker === "discounts" && <Picker title="Discounts" options={referenceDiscounts.map((d) => d.name)} selected={draft.discounts} onChange={(discounts) => update({ discounts })} onClose={() => setPicker(null)} />}
    {picker === "modifiers" && <GroupPicker title="Modifiers" groups={MODIFIER_GROUPS} selected={draft.modifiers} onChange={(modifiers) => update({ modifiers })} onClose={() => setPicker(null)} />}
    {picker === "addOns" && <GroupPicker title="Add-Ons" groups={[{ name: "Pizza Toppings", items: addOnRules.filter((a) => !a.archived).map((a) => a.name) }, { name: "Add Ons", items: ["Add Two Eggs", "Add Vegetables"] }]} selected={draft.addOns} onChange={(addOns) => update({ addOns })} onClose={() => setPicker(null)} />}
    {picker && typeof picker === "object" && "uom" in picker && (() => { const v = draft.variants.find((x) => x.id === picker.uom); return v && <Picker title="UOM" options={UOMS} selected={v.uom ? [v.uom] : []} onChange={(n) => { setVar({ ...v, uom: single(v.uom, n) }); setPicker(null); }} onClose={() => setPicker(null)} />; })()}
    {picker && typeof picker === "object" && "timed" in picker && (() => { const v = draft.variants.find((x) => x.id === picker.timed); return v && <Picker title="Timed Pricing" options={referenceTimedPricing.filter((t) => !t.archived).map((t) => t.name)} selected={v.timed ? [v.timed] : []} onChange={(n) => { setVar({ ...v, timed: single(v.timed, n) }); setPicker(null); }} onClose={() => setPicker(null)} />; })()}

    <PhotoDialog open={photo} name={draft.name} onClose={() => setPhoto(false)} onPick={(src) => { update({ photo: src }); setPhoto(false); }} />
    <Dialog open={exit} onOpenChange={setExit}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Are you sure you want to exit?</DialogTitle>
        <DialogDescription className="text-center">Product name is required. If you go back now, you will lose the progress.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setExit(false)}>Keep Editing</Button><Button onClick={onBack}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}

const vcols = "grid min-w-[46rem] grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.8fr))_minmax(0,0.8fr)_repeat(2,minmax(0,0.9fr))_minmax(0,1fr)] items-center gap-2 px-4";
const cell = "min-h-11 min-w-0 bg-transparent text-center t-value outline-none placeholder:text-muted-foreground";
function VariantTable({ draft, focusId, newVar, onNew, onChange, onRemove, onUom, onTimed }: {
  draft: ProductRule; focusId: string | null; newVar: string; onNew: (n: string) => void; onChange: (v: Variant) => void; onRemove: (v: Variant) => void; onUom: (id: string) => void; onTimed: (id: string) => void;
}) {
  const inv = draft.inventory;
  return <div>
    <div className={cn(vcols, "border-b border-border py-2")}>
      {["Variant Name", "SKU", "Barcode", "Inventory", "Threshold", "UOM", "Price", "Adjusted Price", "Timed Price"].map((h, i) =>
        <span key={h} className={cn(th, i === 0 ? "text-left" : i === 8 ? "text-right" : "text-center")}>{h}</span>)}
    </div>
    {draft.variants.map((v) => <SwipeRow key={v.id} className="min-w-[46rem] rounded-none border-b border-border" action={{ label: "Remove", destructive: true, onAction: () => onRemove(v) }}>
      <div className={cn(vcols, "bg-surface")}>
        <input autoFocus={v.id === focusId} aria-label="Variant name" placeholder="Variant Name" value={v.name} onChange={(e) => onChange({ ...v, name: e.target.value })} className={cn(cell, "text-left t-row")} />
        <input aria-label="SKU" placeholder="SKU" value={v.sku} onChange={(e) => onChange({ ...v, sku: e.target.value })} className={cell} />
        <input aria-label="Variant barcode" placeholder="Enter barcode" value={v.barcode} onChange={(e) => onChange({ ...v, barcode: e.target.value })} className={cell} />
        <input aria-label="Inventory" inputMode="decimal" placeholder="0" disabled={!inv} value={v.inventory} onChange={(e) => onChange({ ...v, inventory: e.target.value.replace(/[^\d.]/g, "") })} className={cn(cell, !inv && "opacity-50")} />
        <input aria-label="Threshold" inputMode="decimal" placeholder="0" disabled={!inv} value={v.threshold} onChange={(e) => onChange({ ...v, threshold: e.target.value.replace(/[^\d.]/g, "") })} className={cn(cell, !inv && "opacity-50")} />
        <button type="button" onClick={() => onUom(v.id)} className={cn(cell, "rounded hover:bg-muted", !v.uom && "text-muted-foreground")}>{v.uom ? uomShort(v.uom) : "Choose"}</button>
        <Money label="Price" value={v.price} onChange={(price) => onChange({ ...v, price })} />
        <Money label="Adjusted price" value={v.adjusted} onChange={(adjusted) => onChange({ ...v, adjusted })} />
        <button type="button" onClick={() => onTimed(v.id)} className={cn(cell, "rounded text-right hover:bg-muted", !v.timed && "text-muted-foreground")}>{v.timed || "Choose"}</button>
      </div>
    </SwipeRow>)}
    <div className={vcols}>
      <input aria-label="Add variant" placeholder="Variant Name" value={newVar} onChange={(e) => onNew(e.target.value)} className={cn(cell, "text-left t-row")} />
      <span className="col-span-8 t-caption text-muted-foreground">Type a name to add a variant · swipe left to remove</span>
    </div>
  </div>;
}
function Money({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="flex min-h-11 items-center justify-center t-value"><span className="text-muted-foreground">$</span>
    <MoneyInput aria-label={label} value={value} onChange={onChange} className="w-14 min-w-0 bg-transparent text-center tabular-nums outline-none placeholder:text-muted-foreground" /></label>;
}

function GroupPicker({ title, groups, selected, onChange, onClose }: { title: string; groups: { name: string; items: string[] }[]; selected: string[]; onChange: (n: string[]) => void; onClose: () => void }) {
  const [open, setOpen] = useState<string | null>(groups[0]?.name ?? null);
  const [ask, setAsk] = useState<{ item: string; n: number } | null>(null);
  const all = Array.from(new Set(groups.flatMap((g) => g.items.map((i) => `${g.name}: ${i}`))));
  const allOn = all.length > 0 && all.every((k) => selected.includes(k));
  const toggle = (keys: string[], on: boolean) => onChange(on ? Array.from(new Set([...selected, ...keys])) : selected.filter((s) => !keys.includes(s)));
  const tick = (on: boolean) => on ? <CheckCircle2 className="size-5 shrink-0 fill-foreground text-background" /> : <Circle className="size-5 shrink-0 text-muted-foreground" />;
  const pickItem = (g: string, item: string) => {
    const key = `${g}: ${item}`;
    if (selected.includes(key)) return toggle([key], false);
    const others = groups.filter((x) => x.name !== g && x.items.includes(item));
    toggle([key], true);
    if (others.length) setAsk({ item, n: others.length + 1 });
  };
  return <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0">
      <DialogTitle className="px-4 pt-4 text-center t-row font-bold">{title}</DialogTitle>
      <DialogDescription className="sr-only">Select {title.toLowerCase()} by group.</DialogDescription>
      <button type="button" onClick={() => onChange(allOn ? [] : all)} className="m-3 flex items-center gap-2 self-start rounded-full bg-muted px-3 py-1.5 t-row">{tick(allOn)}Select All</button>
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-border">
        {groups.map((g) => {
          const keys = g.items.map((i) => `${g.name}: ${i}`);
          const on = keys.length > 0 && keys.every((k) => selected.includes(k));
          const expanded = open === g.name;
          return <div key={g.name} className="border-b border-border last:border-0">
            <div className="flex min-h-12 items-center gap-3 px-4 hover:bg-muted">
              <button type="button" aria-label={`Select ${g.name}`} onClick={() => toggle(keys, !on)}>{tick(on)}</button>
              <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left t-row" onClick={() => setOpen(expanded ? null : g.name)}>
                <span className="min-w-0 flex-1 break-words">{g.name}</span>{expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</button>
            </div>
            {expanded && g.items.map((i) => <button key={i} type="button" onClick={() => pickItem(g.name, i)} className="flex min-h-11 w-full items-center gap-3 border-t border-border py-2 pl-10 pr-4 text-left t-row hover:bg-muted">
              {tick(selected.includes(`${g.name}: ${i}`))}<span className="min-w-0 flex-1 break-words">{i}</span></button>)}
          </div>;
        })}
      </div>
      <div className="border-t border-border p-3"><Button className="w-full" onClick={onClose}>Done</Button></div>
    </DialogContent>
    <Dialog open={!!ask} onOpenChange={(o) => { if (!o) setAsk(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">"{ask?.item}" is present in {ask?.n} groups</DialogTitle>
        <DialogDescription className="text-center">Do you want to include this modifier in all other groups?</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setAsk(null)}>No</Button>
          <Button onClick={() => { if (ask) toggle(groups.filter((g) => g.items.includes(ask.item)).map((g) => `${g.name}: ${ask.item}`), true); setAsk(null); }}>Yes</Button></div>
      </DialogContent>
    </Dialog>
  </Dialog>;
}

function PhotoDialog({ open, name, onClose, onPick }: { open: boolean; name: string; onClose: () => void; onPick: (src: string) => void }) {
  const cam = useRef<HTMLInputElement>(null);
  const lib = useRef<HTMLInputElement>(null);
  const read = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => onPick(String(r.result)); r.readAsDataURL(f); };
  return <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
      <DialogDescription className="sr-only">Add a product photo</DialogDescription>
      <div className="flex flex-col items-center gap-3 py-2">
        <span className="grid size-20 place-items-center rounded-full bg-muted t-row font-bold">{initials(name)}</span>
        <DialogTitle className="text-center text-fs-xl font-bold">{name}</DialogTitle>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" aria-label="Take photo" onClick={() => cam.current?.click()}><Camera /></Button>
          <Button variant="outline" size="icon" aria-label="Choose from library" onClick={() => lib.current?.click()}><Images /></Button>
        </div>
        <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => read(e.target.files?.[0])} />
        <input ref={lib} type="file" accept="image/*" hidden onChange={(e) => read(e.target.files?.[0])} />
      </div>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
    </DialogContent>
  </Dialog>;
}
