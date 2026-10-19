import { useNavigate } from "@tanstack/react-router";
import { MoneyInput } from "@/components/pos/money-input";
import { useMemo, useState, type ReactNode } from "react";
import { AlertCircle, CheckSquare, ChevronRight, Copy, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Picker } from "@/components/pos/tax-settings";
import { SwipeRow } from "@/components/pos/swipe-row";
import { ArchiveGlyph } from "@/components/pos/archive-glyph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePos } from "@/lib/pos-store";
import { taxProducts } from "@/lib/tax-settings";
import { cn } from "@/lib/utils";
import { defaultDiscountDays, discountCategories, discountErrors, discountValid, formatDiscount, newDiscount, referenceDiscounts, type DiscountDay, type DiscountRule, type DiscountType } from "@/lib/discount-settings";
import { scheduleDays } from "@/lib/restaurant-schedules";

const description = "Discount is a reduction in the total amount due for a purchase, often granted for early or prompt payment.";
const cols = "sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_1rem]";

function ErrorLine({ text }: { text: string }) {
  return <p role="alert" className="mt-1 flex basis-full items-center gap-1.5 t-caption text-destructive"><AlertCircle className="size-3.5 shrink-0" />{text}</p>;
}
const Help = ({ children }: { children: ReactNode }) => <p className="basis-full pt-1 t-caption text-muted-foreground">{children}</p>;

export function DiscountSettings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = usePos();
  // Demo settings: anyone signed in can manage discounts (same as Taxes).
  const canManageSettings = true;
  const discounts = settings.discountRules ?? referenceDiscounts;
  const products = useMemo(taxProducts, []);
  const categories = useMemo(discountCategories, []);
  const [draft, setDraft] = useState<DiscountRule | null>(null);
  const [touched, setTouched] = useState(false);
  const [picker, setPicker] = useState<"categories" | "products" | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copyFrom, setCopyFrom] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);
  const [dayQuery, setDayQuery] = useState("");
  const exists = !!draft && discounts.some(d => d.id === draft.id);
  const days = draft && draft.days?.length === 7 ? draft.days : defaultDiscountDays();
  const updateDay = (index: number, patch: Partial<DiscountDay>) => { if (draft) update({ days: days.map((d, i) => i === index ? { ...d, ...patch } : d) }); };

  const update = (patch: Partial<DiscountRule>) => {
    if (!draft || !canManageSettings) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    if (discountValid(next)) {
      const clean = { ...next, name: next.name.trim() };
      updateSettings({ discountRules: discounts.some(d => d.id === clean.id) ? discounts.map(d => d.id === clean.id ? clean : d) : [...discounts, clean] });
    }
  };
  const close = () => { setDraft(null); setTouched(false); setConfirmExit(false); setConfirmDelete(false); };
  const back = () => { if (draft && !exists && (draft.name || draft.value) && !discountValid(draft)) { setTouched(true); setConfirmExit(true); } else close(); };
  const errors = draft ? discountErrors(draft) : { name: "", value: "", schedule: "" };
  const show = (k: keyof typeof errors) => (touched || exists) && errors[k] ? errors[k] : "";

  const toggleRow = (label: string, checked: boolean, onChange: (v: boolean) => void, help?: string, extra?: ReactNode) => <div className={cn(settingsRowClass, "flex-wrap")}>
    <span className="min-w-0 flex-1"><span className="block t-row">{label}</span>{extra}</span>
    <Switch aria-label={label} checked={checked} disabled={!canManageSettings} onCheckedChange={onChange} />
    {help && <Help>{help}</Help>}
  </div>;
  const inputRow = (id: string, label: string, value: string, onChange: (v: string) => void, type = "text", placeholder = "") => <div className={settingsRowClass}>
    <label htmlFor={id} className="t-row">{label}</label>
    <Input id={id} type={type} placeholder={placeholder} disabled={!canManageSettings} value={value} onChange={e => onChange(e.target.value)} className="ml-auto w-[55%] min-w-0 border-0 bg-transparent text-right shadow-none t-value focus-visible:ring-0" />
  </div>;

  if (draft) return <>
    <SubHeader title={exists ? "Edit Discount" : "Add Discount"} backLabel="Discounts" onBack={back} />
    <ScreenBody className="py-4">
      <GroupCard>
        <div className={cn(settingsRowClass, "flex-wrap")}>
          <label htmlFor="disc-name" className="t-row">Name</label>
          <Input id="disc-name" placeholder="Required" maxLength={60} disabled={!canManageSettings} value={draft.name} onBlur={() => setTouched(true)} onChange={e => update({ name: e.target.value })} className="min-w-0 flex-1 border-0 bg-transparent text-right shadow-none t-value focus-visible:ring-0" />
          {show("name") && <ErrorLine text={show("name")} />}
        </div>
        {!draft.open && <div className={cn(settingsRowClass, "flex-wrap")}>
          <label htmlFor="disc-value" className="t-row">Discount</label>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">{draft.type === "Amount" && <span className="t-value text-muted-foreground">$</span>}{draft.type === "Amount" ? <MoneyInput id="disc-value" placeholder="Required" disabled={!canManageSettings} value={draft.value} onBlur={() => setTouched(true)} onChange={value => update({ value })} className="w-28 bg-transparent text-right t-value outline-none placeholder:text-muted-foreground" /> : <Input id="disc-value" inputMode="decimal" placeholder="Required" disabled={!canManageSettings} value={draft.value} onBlur={() => setTouched(true)} onChange={e => update({ value: e.target.value.replace(/[^\d.]/g, "") })} className="w-28 border-0 bg-transparent text-right shadow-none t-value focus-visible:ring-0" />}{draft.type === "Percentage" && <span className="t-value text-muted-foreground">%</span>}</div>
          {show("value") && <ErrorLine text={show("value")} />}
        </div>}
        <div className={settingsRowClass}>
          <span className="t-row">Discount Type</span>
          {draft.open ? <span className="ml-auto t-value text-muted-foreground">Amount</span> : <Popover open={typeOpen} onOpenChange={setTypeOpen}>
            <PopoverTrigger asChild><button type="button" disabled={!canManageSettings} className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 t-value text-muted-foreground hover:bg-muted">{draft.type}<ChevronRight className="size-4" /></button></PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1">{(["Percentage", "Amount"] as DiscountType[]).map(t => <button key={t} type="button" onClick={() => { update({ type: t }); setTypeOpen(false); }} className={cn("flex w-full rounded-sm px-3 py-2 text-left t-row hover:bg-muted", draft.type === t && "font-semibold")}>{t}</button>)}</PopoverContent>
          </Popover>}
        </div>
      </GroupCard>

      {!draft.open && <>
        <GroupCard className="mt-6">{toggleRow("Apply Individual Discount", draft.individual, v => update({ individual: v }), "When enabled, this discount applies only to applicable/selected products as a product-level discount. When disabled, it applies to the entire order (product list is ignored for order-level apply).")}</GroupCard>
        <GroupCard className="mt-6">{toggleRow("Applicable Categories", draft.categoriesOn, v => { update({ categoriesOn: v, ...(v ? {} : { categories: [] }) }); if (v) setPicker("categories"); }, undefined,
          draft.categoriesOn && draft.categories.length > 0 ? <button type="button" onClick={() => setPicker("categories")} className="mt-0.5 block text-left t-caption text-muted-foreground hover:underline">{draft.categories.join(", ")}</button> : undefined)}</GroupCard>
        <GroupCard className="mt-6">
          <button type="button" disabled={!canManageSettings} onClick={() => setPicker("products")} className={cn(settingsRowClass, "w-full text-left hover:bg-muted")}>
            <span className="min-w-0 flex-1"><span className="block t-row">Applicable Products</span>{draft.products.length > 0 && <span className="mt-0.5 line-clamp-3 block t-caption text-muted-foreground">{draft.products.join(", ")}</span>}</span>
            <span className="shrink-0 t-value text-muted-foreground">{draft.products.length || "Select Product"}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </GroupCard>
      </>}

      <GroupCard className="mt-6">{toggleRow("Require Manager PIN", draft.managerPin, v => update({ managerPin: v }), "Manager must enter their pin in order to apply discount to the transaction.")}</GroupCard>
      <GroupCard className="mt-6">{toggleRow("Only Show Name", draft.onlyShowName, v => update({ onlyShowName: v }), "On order details and receipts, show only the discount name instead of a prefixed label.")}</GroupCard>
      <GroupCard className="mt-6">{toggleRow("Open Discount", draft.open, v => update({ open: v, ...(v ? { type: "Amount" as DiscountType, value: "", individual: false, categoriesOn: false, categories: [], products: [] } : {}) }), "Marks this discount as a deposit (open) discount. Deposit discounts must be a fixed amount, not a percentage; the amount is entered at checkout.")}</GroupCard>

      <p className="mb-2 mt-6 px-1 t-caption font-semibold text-muted-foreground">Scheduled Discount</p>
      <GroupCard>
        {toggleRow("Configure Scheduled Discount Availability?", draft.scheduled, v => update({ scheduled: v }), "Set a duration for your promotions and discounts.")}
        {draft.scheduled && <>
          {inputRow("disc-start-date", "Start Date", draft.startDate, v => update({ startDate: v }), "date")}
          {inputRow("disc-end-date", "End Date", draft.endDate, v => update({ endDate: v }), "date")}
          {errors.schedule && <div className="px-4 pb-3"><ErrorLine text={errors.schedule} /></div>}
        </>}
      </GroupCard>

      {draft.scheduled && <>
        <p className="mb-2 mt-6 px-1 t-caption font-semibold text-muted-foreground">Select Time</p>
        <GroupCard>
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-2 border-b border-border px-2 py-4 t-caption font-bold"><span>Days</span><span>Start Time</span><span>End Time</span><span /></div>
          {days.map((day, index) => <div key={scheduleDays[index]} className={cn("grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-2 border-b border-border px-2 py-3 last:border-b-0", index % 2 === 0 && "bg-muted/40")}>
            <label className="flex min-w-0 flex-wrap items-center gap-2 t-caption"><Checkbox className="rounded-full" aria-label={scheduleDays[index]} disabled={!canManageSettings} checked={day.enabled} onCheckedChange={enabled => updateDay(index, { enabled: enabled === true })} /><span className="break-words">{scheduleDays[index]}</span></label>
            <Input type="time" aria-label={`${scheduleDays[index]} start time`} disabled={!canManageSettings} className="min-w-0 px-1 t-caption" value={day.start} onChange={event => updateDay(index, { start: event.target.value })} />
            <Input type="time" aria-label={`${scheduleDays[index]} end time`} disabled={!canManageSettings} className="min-w-0 px-1 t-caption" value={day.end} onChange={event => updateDay(index, { end: event.target.value })} />
            <Button variant="ghost" size="icon" className="size-9" aria-label={`Copy ${scheduleDays[index]} times`} title={`Copy ${scheduleDays[index]} times`} disabled={!canManageSettings} onClick={() => { setCopyFrom(index); setCopyTargets([]); setDayQuery(""); }}><Copy className="size-4" /></Button>
          </div>)}
        </GroupCard>
      </>}

      {exists && canManageSettings && <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        {confirmDelete ? <><span className="t-caption text-muted-foreground">Delete this discount?</span><Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="destructive" onClick={() => { updateSettings({ discountRules: discounts.filter(d => d.id !== draft.id) }); toast.success("Discount deleted"); close(); }}>Delete</Button></> : <Button variant="outline" onClick={() => setConfirmDelete(true)}><Trash2 />Delete Discount</Button>}
      </div>}
      {!exists && touched && !discountValid(draft) && <p className="mt-4 t-caption text-muted-foreground">The discount saves automatically once the name and value are filled in.</p>}
    </ScreenBody>
    {picker === "categories" && <Picker title="Applicable Categories" options={categories} selected={draft.categories} onChange={v => update({ categories: v })} onClose={() => { setPicker(null); if (!draft.categories.length) update({ categoriesOn: false }); }} />}
    {picker === "products" && <Picker title="Applicable Product" options={products} selected={draft.products} onChange={v => update({ products: v })} onClose={() => setPicker(null)} />}
    <Dialog open={confirmExit} onOpenChange={o => { if (!o) setConfirmExit(false); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xs gap-0 p-0 text-center">
        <div className="p-5"><DialogTitle className="t-row font-bold">Are you sure you want to exit?</DialogTitle><DialogDescription className="mt-1 t-caption">If you go back now, you will lose the progress.</DialogDescription></div>
        <div className="grid grid-cols-2 border-t border-border"><Button variant="ghost" className="rounded-none" onClick={() => setConfirmExit(false)}>Keep Editing</Button><Button variant="ghost" className="rounded-none border-l border-border text-destructive" onClick={close}>Exit</Button></div>
      </DialogContent>
    </Dialog>
  </>;

  const list = discounts.filter(d => !d.archived && d.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <SubHeader title="Discounts" backLabel="Payments" onBack={() => void navigate({ to: "/settings/payments" })} right={<Button variant="ghost" size="icon" aria-label="Search discounts" title="Search discounts" onClick={() => setSearchOpen(v => !v)}><Search /></Button>} />
    <ScreenBody className="py-4">
      <div className="mb-5 flex items-start gap-3"><p className="min-w-0 flex-1 t-caption text-muted-foreground">{description}</p><Button size="icon" aria-label="Add discount" title="Add Discount" disabled={!canManageSettings} onClick={() => { setDraft(newDiscount()); setTouched(false); }}><Plus /></Button></div>
      {searchOpen && <Input autoFocus className="mb-4" aria-label="Search discounts" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />}
      <GroupCard>
        <div className={cn("hidden gap-3 border-b border-border px-4 py-4 t-caption font-bold", cols)}><span>Discount Name</span><span className="text-center">Amount</span><span className="text-center">Require Manager PIN</span><span className="text-right">Applicable Products</span><span /></div>
        {list.length === 0 ? <p className="p-6 text-center t-caption text-muted-foreground">{discounts.length ? "No discounts match your search." : "No discounts yet. Tap + to add one."}</p> : list.map(d => <SwipeRow key={d.id} className="rounded-none border-b border-border last:border-0" action={{ label: "Archive", destructive: true, icon: <ArchiveGlyph className="size-5" />, onAction: () => { updateSettings({ discountRules: discounts.map(x => x.id === d.id ? { ...x, archived: true } : x) }); toast.success("Discount archived"); } }}><button type="button" aria-label={`Edit ${d.name}`} onClick={() => { setDraft({ ...d, categories: [...d.categories], products: [...d.products] }); setTouched(true); }} className={cn("flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-muted", cols)}>
          <span className="min-w-0 flex-1 sm:contents"><span className="block break-words t-row">{d.name}</span><span className="block t-caption text-muted-foreground sm:hidden">{formatDiscount(d)} · PIN {d.managerPin ? "Yes" : "No"}</span><span className="hidden text-center t-row sm:block">{formatDiscount(d)}</span><span className="hidden text-center t-row sm:block">{d.managerPin ? "Yes" : "No"}</span></span>
          <span className="shrink-0 t-row sm:text-right">{d.products.length}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button></SwipeRow>)}
      </GroupCard>
    </ScreenBody>
  </>;
}
