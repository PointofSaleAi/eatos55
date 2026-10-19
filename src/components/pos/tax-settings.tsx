import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, ListChecks, Plus, Search, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";
import { formatTaxAmount, newTax, referenceTaxes, taxApplicableTo, taxErrors, taxProducts, taxValid, type TaxRule, type TaxType } from "@/lib/tax-settings";

const description = "Taxes are levies imposed on financial transactions or income, collected by government authorities to fund public services and infrastructure.";

function ErrorLine({ text }: { text: string }) {
  if (!text) return null;
  return <p role="alert" className="mt-1 flex items-center gap-1.5 t-caption text-destructive"><AlertCircle className="size-3.5 shrink-0" />{text}</p>;
}

export function Picker({ title, options, selected, onChange, onClose }: { title: string; options: string[]; selected: string[]; onChange: (next: string[]) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const shown = options.filter(o => o.toLowerCase().includes(query.trim().toLowerCase()));
  const allSelected = shown.length > 0 && shown.every(o => selected.includes(o));
  const toggleAll = () => onChange(allSelected ? selected.filter(s => !shown.includes(s)) : Array.from(new Set([...selected, ...shown])));
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="flex max-h-[80dvh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0">
      <DialogTitle className="px-4 pt-4 text-center t-row font-bold">{title}</DialogTitle>
      <DialogDescription className="sr-only">Select one or more {title.toLowerCase()} options.</DialogDescription>
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={`Search ${title}`} placeholder="Search" className="pl-9" value={query} onChange={e => setQuery(e.target.value)} /></div>
        <Button variant="ghost" size="icon" aria-label={allSelected ? "Clear selection" : "Select all"} title={allSelected ? "Clear selection" : "Select all"} onClick={toggleAll}><ListChecks /></Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {shown.length === 0 ? <p className="p-6 text-center t-caption text-muted-foreground">No matches found.</p> : shown.map(option => { const on = selected.includes(option); return <button key={option} type="button" aria-pressed={on} onClick={() => onChange(on ? selected.filter(s => s !== option) : [...selected, option])} className={cn("flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left t-row last:border-b-0 hover:bg-muted", on && "bg-muted/60")}>
          <span className="min-w-0 flex-1 break-words">{option}</span>{on && <CheckCircle2 className="size-5 shrink-0 fill-foreground text-background" />}
        </button>; })}
      </div>
    </DialogContent>
  </Dialog>;
}

export function TaxSettings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = usePos();
  // Taxes are demo-only settings, so every signed-in employee can add and edit them.
  const canManageSettings = true;
  const taxes = settings.taxRules ?? referenceTaxes;
  const products = useMemo(taxProducts, []);
  const [draft, setDraft] = useState<TaxRule | null>(null);
  const [touched, setTouched] = useState(false);
  const [warned, setWarned] = useState(false);
  const [picker, setPicker] = useState<"to" | "products" | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const exists = !!draft && taxes.some(t => t.id === draft.id);

  const update = (patch: Partial<TaxRule>) => {
    if (!draft || !canManageSettings) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    if (taxValid(next)) {
      const clean = { ...next, name: next.name.trim() };
      updateSettings({ taxRules: taxes.some(t => t.id === clean.id) ? taxes.map(t => t.id === clean.id ? clean : t) : [...taxes, clean] });
    }
  };
  const close = () => { setDraft(null); setTouched(false); setWarned(false); setConfirmDelete(false); };
  // First back on an incomplete new tax shows what is missing; a second back discards it.
  const back = () => { if (draft && !exists && !taxValid(draft) && !warned && canManageSettings) { setTouched(true); setWarned(true); return; } close(); };
  const errors = draft ? taxErrors(draft) : { name: "", amount: "", type: "" };
  const show = (key: keyof typeof errors) => (touched || exists) ? errors[key] : "";

  const summaryRow = (label: string, values: string[], onOpen: () => void) => <button type="button" disabled={!canManageSettings} onClick={onOpen} className={cn(settingsRowClass, "w-full text-left hover:bg-muted")}>
    <span className="min-w-0 flex-1"><span className="block t-row">{label}</span>{values.length > 0 && <span className="mt-0.5 line-clamp-3 block t-caption text-muted-foreground">{values.join(", ")}</span>}</span>
    <span className="shrink-0 t-value text-muted-foreground">{values.length ? values.length : "Choose"}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" />
  </button>;

  if (draft) return <>
    <SubHeader title={exists ? "Edit Tax" : "Add Tax"} backLabel="Back" onBack={back} />
    <ScreenBody className="py-4">
      <GroupCard>
        <div className={cn(settingsRowClass, "flex-wrap")}>
          <label htmlFor="tax-name" className="t-row">Name</label>
          <Input id="tax-name" placeholder="Required" maxLength={60} disabled={!canManageSettings} value={draft.name} onBlur={() => setTouched(true)} onChange={e => update({ name: e.target.value })} className="min-w-0 flex-1 border-0 bg-transparent text-right shadow-none t-value focus-visible:ring-0" /><ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          {show("name") && <div className="basis-full"><ErrorLine text={show("name")} /></div>}
        </div>
        <div className={cn(settingsRowClass, "flex-wrap")}>
          <label htmlFor="tax-amount" className="t-row">Amount</label>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1"><Input id="tax-amount" inputMode="decimal" placeholder="0.00" disabled={!canManageSettings} value={draft.amount} onBlur={() => setTouched(true)} onChange={e => update({ amount: e.target.value.replace(/[^\d.]/g, "") })} className="w-28 border-0 bg-transparent text-right shadow-none t-value focus-visible:ring-0" /><span className="t-value text-muted-foreground">%</span><ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" /></div>
          {show("amount") && <div className="basis-full"><ErrorLine text={show("amount")} /></div>}
        </div>
        <div className={cn(settingsRowClass, "flex-wrap")}>
          <span className="t-row">Type</span>
          <Popover open={typeOpen} onOpenChange={setTypeOpen}>
            <PopoverTrigger asChild><button type="button" disabled={!canManageSettings} className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 t-value text-muted-foreground hover:bg-muted">{draft.type || "Choose"}<ChevronRight className="size-4" /></button></PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1">{(["Exclusive", "Inclusive"] as TaxType[]).map(t => <button key={t} type="button" onClick={() => { setTouched(true); update({ type: t }); setTypeOpen(false); }} className={cn("flex w-full items-center justify-between rounded-sm px-3 py-2 text-left t-row hover:bg-muted", draft.type === t && "font-semibold")}>{t}</button>)}</PopoverContent>
          </Popover>
          {show("type") && <div className="basis-full"><ErrorLine text={show("type")} /></div>}
        </div>
        {summaryRow("Applicable To", draft.applicableTo, () => setPicker("to"))}
      </GroupCard>
      <GroupCard className="mt-6">{summaryRow("Applicable Products", draft.products, () => setPicker("products"))}</GroupCard>
      {exists && canManageSettings && <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        {confirmDelete ? <><span className="t-caption text-muted-foreground">Delete this tax?</span><Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="destructive" onClick={() => { updateSettings({ taxRules: taxes.filter(t => t.id !== draft.id) }); toast.success("Tax deleted"); close(); }}>Delete</Button></> : <Button variant="outline" onClick={() => setConfirmDelete(true)}><Trash2 />Delete Tax</Button>}
      </div>}
      {!exists && touched && !taxValid(draft) && <p className="mt-4 t-caption text-muted-foreground">The tax saves automatically once the name, amount and type are filled in. Tap Back again to discard it.</p>}
    </ScreenBody>
    {picker === "to" && <Picker title="Applicable To" options={taxApplicableTo} selected={draft.applicableTo} onChange={v => update({ applicableTo: v })} onClose={() => setPicker(null)} />}
    {picker === "products" && <Picker title="Applicable Product" options={products} selected={draft.products} onChange={v => update({ products: v })} onClose={() => setPicker(null)} />}
  </>;

  const list = taxes.filter(t => t.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <SubHeader title="Taxes" backLabel="Payments" onBack={() => void navigate({ to: "/settings/payments" })} right={<Button variant="ghost" size="icon" aria-label="Search taxes" title="Search taxes" onClick={() => setSearchOpen(v => !v)}><Search /></Button>} />
    <ScreenBody className="py-4">
      <div className="mb-5 flex items-start gap-3"><p className="min-w-0 flex-1 t-caption text-muted-foreground">{description}</p><Button size="icon" aria-label="Add tax" title="Add Tax" disabled={!canManageSettings} onClick={() => { setDraft(newTax()); setTouched(false); }}><Plus /></Button></div>
      {searchOpen && <Input autoFocus className="mb-4" aria-label="Search taxes" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />}
      <GroupCard>
        <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_1rem] gap-3 border-b border-border px-4 py-4 t-caption font-bold sm:grid"><span>Tax Name</span><span>Amount</span><span>Type</span><span className="text-right">Applicable To</span><span /></div>
        {list.length === 0 ? <p className="p-6 text-center t-caption text-muted-foreground">{taxes.length ? "No taxes match your search." : "No taxes yet. Tap + to add one."}</p> : list.map(t => <button key={t.id} type="button" aria-label={`Edit ${t.name}`} onClick={() => { setDraft({ ...t, applicableTo: [...t.applicableTo], products: [...t.products] }); setTouched(true); }} className="flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left last:border-b-0 hover:bg-muted sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_1rem]">
          <span className="min-w-0 flex-1 sm:contents"><span className="block break-words t-row">{t.name}</span><span className="block t-caption text-muted-foreground sm:hidden">{formatTaxAmount(t.amount, 1)} · {t.type}</span><span className="hidden t-row sm:block">{formatTaxAmount(t.amount, 1)}</span><span className="hidden t-row sm:block">{t.type}</span></span>
          <span className="shrink-0 t-row sm:text-right">{t.applicableTo.length}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>)}
      </GroupCard>
    </ScreenBody>
  </>;
}
