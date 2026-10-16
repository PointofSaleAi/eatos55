import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronRight, Minus, Plus, Search } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { INVENTORY_CATEGORIES, isLow, isOut, useInventorySettings, type InvProduct, type InvVariant } from "@/lib/inventory-settings";
import { cn } from "@/lib/utils";

const INTRO = "Enter physical counts to record inventory adjustments. Variances are calculated automatically.";
const cols = "grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_1rem] items-center gap-2";
const vcols = "grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] items-center gap-2";
const th = "t-caption font-medium text-muted-foreground";
const fmt = (n: number) => String(Math.round(n * 1000) / 1000);
type StockFilter = "all" | "low" | "out";
const STOCK_LABEL: Record<StockFilter, string> = { all: "All Stock", low: "Low Stock", out: "Out of Stock" };

export function InventorySettings() {
  const navigate = useNavigate();
  const { products, patchVariant } = useInventorySettings();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const [stock, setStock] = useState<StockFilter>("all");
  const [cats, setCats] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const counts: Record<StockFilter, number> = {
    all: products.length,
    low: products.filter((p) => p.variants.some(isLow)).length,
    out: products.filter((p) => p.variants.some(isOut)).length,
  };
  const list = products
    .filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()))
    .filter((p) => !cats.length || cats.includes(p.category))
    .filter((p) => stock === "all" || p.variants.some(stock === "low" ? isLow : isOut))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return <>
    <SubHeader title="Inventory" backLabel="Back" onBack={() => navigate({ to: "/settings/menu" })}
      right={<Button variant="ghost" size="icon" aria-label="Search inventory" onClick={() => { setSearching((v) => !v); setQ(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searching && <div className="mb-3 flex items-center gap-2">
        <Input autoFocus aria-label="Search inventory" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="ghost" onClick={() => { setSearching(false); setQ(""); }}>Cancel</Button></div>}
      <p className="t-caption text-muted-foreground">{INTRO}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" size="sm">{STOCK_LABEL[stock]} ({counts[stock]})<ChevronDown /></Button></PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-1">
            {(Object.keys(STOCK_LABEL) as StockFilter[]).map((k) => <button key={k} type="button" onClick={() => setStock(k)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left t-body hover:bg-muted">
              <span>{STOCK_LABEL[k]} ({counts[k]})</span>{stock === k && <Check className="size-4" />}</button>)}
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" size="sm">{cats.length ? `${cats.length} Selected` : `All Categories (${INVENTORY_CATEGORIES.length})`}<ChevronDown /></Button></PopoverTrigger>
          <PopoverContent align="start" className="max-h-80 w-72 overflow-y-auto p-1">
            {INVENTORY_CATEGORIES.map((c) => { const on = cats.includes(c); return <button key={c} type="button" role="checkbox" aria-checked={on}
              onClick={() => setCats((x) => (on ? x.filter((y) => y !== c) : [...x, c]))}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left t-body hover:bg-muted">
              <span className={cn("grid size-4 shrink-0 place-items-center rounded border border-border", on && "bg-foreground text-background")}>{on && <Check className="size-3" />}</span>{c}</button>; })}
          </PopoverContent>
        </Popover>
      </div>
      <GroupCard className="mt-4">
        <div className={cn(cols, "hidden border-b border-border px-4 py-2 sm:grid")}>
          <span className={th}>Product Name</span><span className={cn(th, "text-center")}>SKU</span><span className={cn(th, "text-center")}>Variant</span><span className={cn(th, "text-right")}>Price</span><span />
        </div>
        {!list.length && <p className="px-4 py-6 text-center t-body text-muted-foreground">No Data Available</p>}
        {list.map((p) => <ProductRow key={p.id} p={p} open={open.includes(p.id)} onToggle={() => toggle(p.id)}
          onPatch={(vid, x) => patchVariant(p.id, vid, x)} />)}
      </GroupCard>
    </ScreenBody>
  </>;
}

function ProductRow({ p, open, onToggle, onPatch }: { p: InvProduct; open: boolean; onToggle: () => void; onPatch: (vid: string, x: Partial<InvVariant>) => void }) {
  return <div className="border-b border-border last:border-0">
    <button type="button" aria-expanded={open} onClick={onToggle} className="w-full bg-surface px-4 py-2.5 text-left hover:bg-muted">
      <div className={cn(cols, "hidden sm:grid")}>
        <span className="truncate t-body">{p.name}</span><span className="text-center t-body">{p.sku}</span>
        <span className="text-center t-body">{p.variants.length}</span><span className="text-right t-body tabular-nums">${p.price}</span>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex items-center gap-2 sm:hidden">
        <div className="min-w-0 flex-1"><p className="t-body">{p.name}</p><p className="t-caption text-muted-foreground">SKU {p.sku} · {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}</p></div>
        <span className="t-body tabular-nums">${p.price}</span>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </div>
    </button>
    {open && <div className="bg-surface px-3 pb-3 sm:px-6">
      <div className={cn(vcols, "hidden px-3 py-2 sm:grid")}>
        <span className={th}>Variant</span><span className={cn(th, "text-center")}>PAR</span><span className={cn(th, "text-center")}>Stock on Hand</span><span className={cn(th, "w-32 text-center")}>Adjustment</span>
      </div>
      {p.variants.map((v) => <VariantRow key={v.id} v={v} onPatch={(x) => onPatch(v.id, x)} />)}
    </div>}
  </div>;
}

function VariantRow({ v, onPatch }: { v: InvVariant; onPatch: (x: Partial<InvVariant>) => void }) {
  const low = isLow(v);
  const [par, setPar] = useState<string | null>(null);
  const [adj, setAdj] = useState("0");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const apply = (text = adj) => {
    if (timer.current) clearTimeout(timer.current);
    const n = Number(text);
    if (Number.isFinite(n) && n !== 0) onPatch({ onHand: Math.round((v.onHand + n) * 1000) / 1000 });
    setAdj("0");
  };
  const step = (d: number) => {
    const next = String((Number(adj) || 0) + d);
    setAdj(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => apply(next), 1200);
  };
  const commitPar = () => { if (par !== null) { const n = Number(par); if (Number.isFinite(n) && n >= 0) onPatch({ par: n }); setPar(null); } };
  const num = "w-full rounded-md bg-transparent px-1 py-1 text-center t-body tabular-nums outline-none focus:bg-muted";
  const parInput = <input aria-label={`${v.name} PAR`} inputMode="decimal" value={par ?? fmt(v.par)} onChange={(e) => setPar(e.target.value.replace(/[^\d.]/g, ""))}
    onBlur={commitPar} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} className={num} />;
  const stepper = <div className="flex w-32 items-center justify-between rounded-pill border border-border bg-surface">
    <Button variant="ghost" size="icon" className="size-9 rounded-pill" aria-label={`Decrease ${v.name} adjustment`} onClick={() => step(-1)}><Minus /></Button>
    <input aria-label={`${v.name} adjustment`} inputMode="decimal" value={adj}
      onChange={(e) => { if (timer.current) clearTimeout(timer.current); setAdj(e.target.value.replace(/[^\d.-]/g, "")); }}
      onBlur={() => apply()} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      className="w-10 bg-transparent text-center t-body tabular-nums outline-none" />
    <Button variant="ghost" size="icon" className="size-9 rounded-pill" aria-label={`Increase ${v.name} adjustment`} onClick={() => step(1)}><Plus /></Button>
  </div>;
  const name = <span className="flex min-w-0 items-center gap-2 t-body text-muted-foreground"><span className="truncate">{v.name}</span>
    {low && <AlertTriangle aria-label="Below PAR" className="size-4 shrink-0 text-warning" />}</span>;
  return <div className={cn("rounded-md px-3 py-1.5", low && "bg-warning/15")}>
    <div className={cn(vcols, "hidden sm:grid")}>{name}{parInput}<span className="text-center t-body tabular-nums">{fmt(v.onHand)}</span>{stepper}</div>
    <div className="space-y-2 py-1 sm:hidden">
      {name}
      <div className="grid grid-cols-2 gap-2">
        <label className="t-caption text-muted-foreground">PAR{parInput}</label>
        <div className="t-caption text-muted-foreground">Stock on Hand<p className="py-1 text-center t-body tabular-nums text-foreground">{fmt(v.onHand)}</p></div>
      </div>
      <div className="flex items-center justify-between"><span className="t-caption text-muted-foreground">Adjustment</span>{stepper}</div>
    </div>
  </div>;
}
