import { useNavigate } from "@tanstack/react-router";
import { MoneyInput } from "@/components/pos/money-input";
import { useState, type ReactNode } from "react";
import { AlertCircle, Check, ChevronRight, Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Picker } from "@/components/pos/tax-settings";
import { SwipeRow } from "@/components/pos/swipe-row";
import { ArchiveGlyph } from "@/components/pos/archive-glyph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePos } from "@/lib/pos-store";
import { referenceTaxes } from "@/lib/tax-settings";
import { cn } from "@/lib/utils";
import {
  formatServiceCharge, newServiceCharge, referenceServiceCharges, serviceChargeAppliedAs, serviceChargeErrors,
  serviceChargeOrderTypes, serviceChargeValid, type ServiceChargeAmountType, type ServiceChargeRule,
} from "@/lib/service-charge-settings";

const description = "Service Charge is a fee levied for processing financial transactions, covering the cost of services provided by the financial institution.";
const cols = "sm:grid sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_1rem]";

const ErrorLine = ({ text }: { text: string }) => <p role="alert" className="mt-1 flex basis-full items-center gap-1.5 t-caption text-destructive"><AlertCircle className="size-3.5 shrink-0" />{text}</p>;
const Help = ({ children }: { children: ReactNode }) => <p className="mb-1 mt-1.5 px-4 t-caption text-muted-foreground">{children}</p>;

function Choice<T extends string>({ value, options, onPick, disabled, label }: { value: T; options: readonly T[]; onPick: (v: T) => void; disabled?: boolean; label: string }) {
  const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><button type="button" aria-label={label} disabled={disabled} className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 t-value text-muted-foreground hover:bg-muted">{value}<ChevronRight className="size-4" /></button></PopoverTrigger>
    <PopoverContent align="end" className="w-48 p-1">{options.map(o => <button key={o} type="button" onClick={() => { onPick(o); setOpen(false); }} className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left t-row hover:bg-muted">{o}{value === o && <Check className="size-4 shrink-0" />}</button>)}</PopoverContent>
  </Popover>;
}

export function ServiceChargeSettings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = usePos();
  // Demo settings, like Taxes and Discounts: anyone signed in can manage them.
  const canManageSettings = true;
  const charges = settings.serviceChargeRules ?? referenceServiceCharges;
  const taxNames = (settings.taxRules ?? referenceTaxes).map(t => t.name).filter(Boolean);
  const [draft, setDraft] = useState<ServiceChargeRule | null>(null);
  const [touched, setTouched] = useState(false);
  const [picker, setPicker] = useState<"taxes" | "orderTypes" | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const exists = !!draft && charges.some(c => c.id === draft.id);

  const update = (patch: Partial<ServiceChargeRule>) => {
    if (!draft || !canManageSettings) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    if (serviceChargeValid(next)) {
      const clean = { ...next, name: next.name.trim() };
      updateSettings({ serviceChargeRules: charges.some(c => c.id === clean.id) ? charges.map(c => c.id === clean.id ? clean : c) : [...charges, clean] });
    }
  };
  const close = () => { setDraft(null); setTouched(false); setConfirmExit(false); setConfirmDelete(false); };
  const back = () => { if (draft && !exists && (draft.name || draft.value) && !serviceChargeValid(draft)) { setTouched(true); setConfirmExit(true); } else close(); };
  const errors = draft ? serviceChargeErrors(draft) : { name: "", value: "", seats: "" };
  const show = (k: keyof typeof errors) => (touched || exists) && errors[k] ? errors[k] : "";

  const pickRow = (label: string, values: string[], onClick: () => void) => <button type="button" disabled={!canManageSettings} onClick={onClick} className={cn(settingsRowClass, "w-full text-left hover:bg-muted")}>
    <span className="min-w-0 flex-1"><span className="block t-row">{label}</span>{values.length > 0 && <span className="mt-0.5 line-clamp-2 block t-caption text-muted-foreground">{values.join(", ")}</span>}</span>
    <span className="shrink-0 t-value text-muted-foreground">{values.length || "Choose"}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" />
  </button>;

  if (draft) return <>
    <SubHeader title={exists ? "Edit Service Charge" : "Add Service Charge"} backLabel="Service Charge" onBack={back} />
    <ScreenBody className="py-4">
      <GroupCard>
        <div className={cn(settingsRowClass, "flex-wrap")}>
          <label htmlFor="sc-name" className="t-row">Name</label>
          <Input id="sc-name" placeholder="Enter Name" maxLength={60} disabled={!canManageSettings} value={draft.name} onBlur={() => setTouched(true)} onChange={e => update({ name: e.target.value })} className="min-w-0 flex-1 border-0 bg-transparent text-right shadow-none t-value focus-visible:ring-0" />
          {show("name") && <ErrorLine text={show("name")} />}
        </div>
        <div className={cn(settingsRowClass, "flex-wrap")}>
          <label htmlFor="sc-value" className="t-row">Amount</label>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            {draft.type === "Amount" && <span className="t-value text-muted-foreground">$</span>}
            {draft.type === "Amount" ? <MoneyInput id="sc-value" disabled={!canManageSettings} value={draft.value} onBlur={() => setTouched(true)} onChange={value => update({ value })} className="w-24 bg-transparent text-right t-value outline-none" /> : <Input id="sc-value" inputMode="decimal" placeholder="0.00" disabled={!canManageSettings} value={draft.value} onBlur={() => setTouched(true)} onChange={e => update({ value: e.target.value.replace(/[^\d.]/g, "") })} className="w-24 border-0 bg-transparent text-right shadow-none t-value focus-visible:ring-0" />}
            {draft.type === "Percentage" && <span className="t-value text-muted-foreground">%</span>}
            <Choice<ServiceChargeAmountType> label="Amount type" value={draft.type} options={["Percentage", "Amount"]} disabled={!canManageSettings} onPick={t => update({ type: t })} />
          </div>
          {show("value") && <ErrorLine text={show("value")} />}
        </div>
      </GroupCard>

      <GroupCard className="mt-6"><div className={settingsRowClass}><span className="min-w-0 flex-1 t-row">Only Show Name</span><Switch aria-label="Only Show Name" checked={draft.onlyShowName} disabled={!canManageSettings} onCheckedChange={v => update({ onlyShowName: v })} /></div></GroupCard>
      <Help>On order details and receipts, show only the service charge name instead of a prefixed label</Help>

      <GroupCard className="mt-6">{pickRow("Tax Applicable", draft.taxes, () => setPicker("taxes"))}</GroupCard>
      <GroupCard className="mt-6">{pickRow("Order Type", draft.orderTypes, () => setPicker("orderTypes"))}</GroupCard>

      <GroupCard className="mt-6"><div className={settingsRowClass}><span className="t-row">Applied as</span><Choice label="Applied as" value={draft.appliedAs} options={serviceChargeAppliedAs} disabled={!canManageSettings} onPick={v => update({ appliedAs: v })} /></div></GroupCard>
      <Help>Choose this as a 'large table' service charge</Help>

      <GroupCard className="mt-6">
        <div className={settingsRowClass}><span className="min-w-0 flex-1 t-row">Automatically apply this service charge?</span><Switch aria-label="Automatically apply this service charge" checked={draft.autoApply} disabled={!canManageSettings} onCheckedChange={v => update({ autoApply: v })} /></div>
        <div className={settingsRowClass}>
          <span className="min-w-0 flex-1 t-row">Apply to table with seats at least</span>
          <span className="w-8 text-right t-value tabular-nums">{draft.minSeats}</span>
          <div className="flex overflow-hidden rounded-md border border-border">
            <button type="button" aria-label="Fewer seats" disabled={!canManageSettings || draft.minSeats <= 0} onClick={() => update({ minSeats: Math.max(0, draft.minSeats - 1) })} className="grid size-8 place-items-center hover:bg-muted disabled:opacity-40"><Minus className="size-4" /></button>
            <button type="button" aria-label="More seats" disabled={!canManageSettings || draft.minSeats >= 99} onClick={() => update({ minSeats: Math.min(99, draft.minSeats + 1) })} className="grid size-8 place-items-center border-l border-border hover:bg-muted disabled:opacity-40"><Plus className="size-4" /></button>
          </div>
        </div>
      </GroupCard>
      {show("seats") ? <div className="px-4"><ErrorLine text={show("seats")} /></div> : <Help>Table size must be greater than 0</Help>}

      {exists && canManageSettings && <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        {confirmDelete ? <><span className="t-caption text-muted-foreground">Delete this service charge?</span><Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="destructive" onClick={() => { updateSettings({ serviceChargeRules: charges.filter(c => c.id !== draft.id) }); toast.success("Service charge deleted"); close(); }}>Delete</Button></> : <Button variant="outline" onClick={() => setConfirmDelete(true)}><Trash2 />Delete Service Charge</Button>}
      </div>}
      {!exists && touched && !serviceChargeValid(draft) && <p className="mt-4 t-caption text-muted-foreground">The service charge saves automatically once the name and amount are filled in.</p>}
    </ScreenBody>
    {picker === "taxes" && <Picker title="Tax Applicable" options={taxNames} selected={draft.taxes} onChange={v => update({ taxes: v })} onClose={() => setPicker(null)} />}
    {picker === "orderTypes" && <Picker title="Order Type" options={serviceChargeOrderTypes} selected={draft.orderTypes} onChange={v => update({ orderTypes: v })} onClose={() => setPicker(null)} />}
    <Dialog open={confirmExit} onOpenChange={o => { if (!o) setConfirmExit(false); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xs gap-0 p-0 text-center">
        <div className="p-5"><DialogTitle className="t-row font-bold">Are you sure you want to exit?</DialogTitle><DialogDescription className="mt-1 t-caption">If you go back now, you will lose the progress.</DialogDescription></div>
        <div className="grid grid-cols-2 border-t border-border"><Button variant="ghost" className="rounded-none" onClick={() => setConfirmExit(false)}>Keep Editing</Button><Button variant="ghost" className="rounded-none border-l border-border text-destructive" onClick={close}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;

  const list = charges.filter(c => !c.archived && c.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <SubHeader title="Service Charge" backLabel="Payments" onBack={() => void navigate({ to: "/settings/payments" })} right={<Button variant="ghost" size="icon" aria-label="Search service charges" title="Search service charges" onClick={() => { setSearchOpen(v => !v); setQuery(""); }}><Search /></Button>} />
    <ScreenBody className="py-4">
      {searchOpen && <div className="mb-4 flex items-center gap-2"><Input autoFocus aria-label="Search service charges" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} /><Button variant="ghost" onClick={() => { setSearchOpen(false); setQuery(""); }}>Cancel</Button></div>}
      <div className="mb-5 flex items-start gap-3"><p className="min-w-0 flex-1 t-caption text-muted-foreground">{description}</p><Button size="icon" aria-label="Add service charge" title="Add Service Charge" disabled={!canManageSettings} onClick={() => { setDraft(newServiceCharge()); setTouched(false); }}><Plus /></Button></div>
      <GroupCard>
        <div className={cn("hidden gap-3 border-b border-border px-4 py-4 t-caption font-bold", cols)}><span>Service Charge Name</span><span>Amount</span><span className="text-right">Tax Applicable</span><span /></div>
        {list.length === 0 ? <p className="p-6 text-center t-caption text-muted-foreground">{charges.length ? "No service charges match your search." : "No service charges yet. Tap + to add one."}</p> : list.map(c => <SwipeRow key={c.id} className="rounded-none border-b border-border last:border-0" action={{ label: "Archive", destructive: true, icon: <ArchiveGlyph className="size-5" />, onAction: () => { updateSettings({ serviceChargeRules: charges.map(x => x.id === c.id ? { ...x, archived: true } : x) }); toast.success("Service charge archived"); } }}><button type="button" aria-label={`Edit ${c.name}`} onClick={() => { setDraft({ ...c, taxes: [...c.taxes], orderTypes: [...c.orderTypes] }); setTouched(true); }} className={cn("flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-muted", cols)}>
          <span className="min-w-0 flex-1 sm:contents"><span className="block break-words t-row">{c.name}</span><span className="block t-caption text-muted-foreground sm:hidden">{formatServiceCharge(c)}</span><span className="hidden t-row sm:block">{formatServiceCharge(c)}</span></span>
          <span className="shrink-0 t-row sm:text-right">{c.taxes.length}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button></SwipeRow>)}
      </GroupCard>
    </ScreenBody>
  </>;
}
