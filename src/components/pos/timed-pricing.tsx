import { useRef, useState } from "react";
import { Archive, ArchiveRestore, CheckSquare, ChevronRight, Copy, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { revenueCenters } from "@/lib/demo-data";
import { scheduleDays, type ScheduleDay } from "@/lib/restaurant-schedules";
import { newTimedPricingDays, referenceTimedPricing, timedPricingDays, type TimedPricingRule } from "@/lib/timed-pricing";
import { usePos } from "@/lib/pos-store";

const dateLabel = (date: string) => date.split("-").reverse().join("/");
export function TimedPricing() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const rules = settings.timedPricingRules ?? referenceTimedPricing;
  const [draft, setDraft] = useState<TimedPricingRule | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [error, setError] = useState("");
  const [copyFrom, setCopyFrom] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);
  const [dayQuery, setDayQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<TimedPricingRule | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const swipe = useRef<{ id: string; x: number; y: number; horizontal: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const saveCollection = (next: TimedPricingRule[]) => { setRevealedId(null); updateSettings({ timedPricingRules: next }); };
  const open = (rule: TimedPricingRule) => { setDraft({ ...rule, days: rule.days.map(day => ({ ...day })) }); setError(""); };
  const updateDay = (index: number, patch: Partial<ScheduleDay>) => setDraft(current => current ? { ...current, days: current.days.map((day, i) => i === index ? { ...day, ...patch } : day) } : current);
  const save = () => {
    if (!draft || !canManageSettings) return;
    if (!draft.name.trim() || !draft.revenueCentre || !draft.orderingSource || !draft.startDate || !draft.endDate) { setError("Enter a name, revenue centre, ordering source and both dates."); return; }
    if (draft.endDate < draft.startDate) { setError("End date must be on or after start date."); return; }
    if (!draft.days.some(day => day.enabled)) { setError("Select at least one day."); return; }
    if (draft.days.some(day => day.enabled && (!day.start || !day.end))) { setError("Choose start and end times for each selected day."); return; }
    const next = { ...draft, name: draft.name.trim() };
    updateSettings({ timedPricingRules: rules.some(rule => rule.id === next.id) ? rules.map(rule => rule.id === next.id ? next : rule) : [...rules, next] });
    setDraft(null); toast.success("Timed pricing saved");
  };
  const selectRow = (label: string, field: "revenueCentre" | "orderingSource", placeholder: string, options: string[]) => draft && <div className={settingsRowClass}><label htmlFor={`timed-${field}`} className="min-w-0 flex-1 t-row">{label}</label><Select value={draft[field]} disabled={!canManageSettings} onValueChange={value => setDraft({ ...draft, [field]: value })}><SelectTrigger id={`timed-${field}`} className="w-[48%] min-w-0 t-value"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>;
  return <>
    <SubHeader title={draft ? rules.some(rule => rule.id === draft.id) ? "Edit Timed Pricing" : "Add Timed Pricing" : "Timed Pricing"} backLabel="General" backTo="/settings/general" right={draft ? undefined : <Button variant="ghost" size="icon" aria-label="Search timed pricing" title="Search timed pricing" onClick={() => setSearchOpen(value => !value)}><Search /></Button>} />
    <ScreenBody className="py-4">
      {draft ? <>
        <GroupCard>
          <div className={settingsRowClass}><label htmlFor="timed-name" className="min-w-0 flex-1 t-row">Timed Pricing Name</label><Input id="timed-name" placeholder="Enter Name" className="w-[48%] min-w-0 t-value" value={draft.name} maxLength={100} disabled={!canManageSettings} onChange={event => setDraft({ ...draft, name: event.target.value })} /></div>
          {selectRow("Revenue Centre", "revenueCentre", "Select Revenue Centre", revenueCenters)}
          {selectRow("Ordering Source", "orderingSource", "Select Ordering Source", ["Point of Sale", "Online", "Grubhub", "Uber Eats", "DoorDash"])}
        </GroupCard>
        <GroupCard className="mt-6">
          <div className={settingsRowClass}><label htmlFor="timed-start" className="min-w-0 flex-1 t-row">Start Date</label><Input id="timed-start" type="date" className="w-[48%] min-w-0 t-value" value={draft.startDate} disabled={!canManageSettings} onChange={event => setDraft({ ...draft, startDate: event.target.value })} /></div>
          <div className={settingsRowClass}><label htmlFor="timed-end" className="min-w-0 flex-1 t-row">End Date</label><Input id="timed-end" type="date" min={draft.startDate} className="w-[48%] min-w-0 t-value" value={draft.endDate} disabled={!canManageSettings} onChange={event => setDraft({ ...draft, endDate: event.target.value })} /></div>
        </GroupCard>
        <GroupCard className="mt-6">
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-2 border-b border-border px-2 py-4 t-caption font-bold"><span>Days</span><span>Start Time</span><span>End Time</span><span /></div>
          {timedPricingDays.map(index => { const day = scheduleDays[index]; return <div key={day} className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-2 border-b border-border bg-muted/30 px-2 py-3 last:border-b-0">
            <label className="flex min-w-0 flex-wrap items-center gap-2 t-caption"><Checkbox aria-label={day} className="rounded-full" disabled={!canManageSettings} checked={draft.days[index]?.enabled ?? false} onCheckedChange={value => updateDay(index, { enabled: value === true })} /><span className="break-words">{day}</span></label>
            <Input type="time" aria-label={`${day} start time`} className="min-w-0 px-1 t-caption" value={draft.days[index]?.start ?? ""} disabled={!canManageSettings} onChange={event => updateDay(index, { start: event.target.value })} />
            <Input type="time" aria-label={`${day} end time`} className="min-w-0 px-1 t-caption" value={draft.days[index]?.end ?? ""} disabled={!canManageSettings} onChange={event => updateDay(index, { end: event.target.value })} />
            <Button variant="ghost" size="icon" className="size-9" aria-label={`Copy ${day} times`} title={`Copy ${day} times`} disabled={!canManageSettings || !draft.days[index]?.start || !draft.days[index]?.end} onClick={() => { setCopyFrom(index); setCopyTargets([]); setDayQuery(""); }}><Copy className="size-4" /></Button>
          </div>; })}
        </GroupCard>
        {error && <p role="alert" className="mt-4 t-caption text-destructive">{error}</p>}
        <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => { setDraft(null); setError(""); }}>Cancel</Button><Button onClick={save} disabled={!canManageSettings}>Save</Button></div>
      </> : <>
        <div className="mb-5 flex items-center gap-3"><p className="min-w-0 flex-1 t-caption text-muted-foreground">Setup timed pricing for your restaurant based on demand and requirements</p><Button size="icon" aria-label="Add timed pricing" title="Add Timed Pricing" disabled={!canManageSettings} onClick={() => open({ id: `timed-${crypto.randomUUID()}`, name: "", revenueCentre: "", orderingSource: "", startDate: "", endDate: "", days: newTimedPricingDays() })}><Plus /></Button></div>
        {searchOpen && <Input autoFocus className="mb-4" aria-label="Search timed pricing" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} />}
        <GroupCard>
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_1rem] gap-3 border-b border-border px-4 py-4 t-caption font-bold sm:grid"><span>Timed Pricing Name</span><span>Start Date</span><span>End Date</span><span className="text-right">Days</span><span /></div>
          {rules.filter(rule => rule.name.toLowerCase().includes(query.trim().toLowerCase())).map(rule => { const days = timedPricingDays.flatMap(i => rule.days[i]?.enabled ? [scheduleDays[i]?.slice(0, 3)] : []).join(", ") || "—"; return <Button key={rule.id} variant="ghost" className="grid h-auto w-full grid-cols-[minmax(0,1fr)_1rem] gap-3 rounded-none border-b border-border bg-muted/30 px-4 py-4 text-left whitespace-normal last:border-b-0 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_1rem]" onClick={() => open(rule)}><span className="min-w-0 break-words t-row">{rule.name}<span className="mt-1 block t-caption text-muted-foreground sm:hidden">{dateLabel(rule.startDate)} – {dateLabel(rule.endDate)}<span className="mt-1 block">{days}</span></span></span><span className="hidden t-caption sm:block">{dateLabel(rule.startDate)}</span><span className="hidden t-caption sm:block">{dateLabel(rule.endDate)}</span><span className="hidden min-w-0 break-words text-right t-caption sm:block">{days}</span><ChevronRight className="size-4 text-muted-foreground" /></Button>; })}
          {!rules.some(rule => rule.name.toLowerCase().includes(query.trim().toLowerCase())) && <p className="px-4 py-8 text-center t-row text-muted-foreground">No timed pricing found</p>}
        </GroupCard>
      </>}
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
    </ScreenBody>
    <Dialog open={copyFrom !== null} onOpenChange={value => { if (!value) setCopyFrom(null); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg"><DialogTitle>Select Days</DialogTitle><DialogDescription>To copy schedule please select days</DialogDescription><div className="flex items-center gap-2"><Input aria-label="Search days" placeholder="Search" value={dayQuery} onChange={event => setDayQuery(event.target.value)} /><Button variant="ghost" size="icon" aria-label="Select all days" title="Select all days" onClick={() => setCopyTargets(copyTargets.length === 6 ? [] : timedPricingDays.filter(i => i !== copyFrom))}><CheckSquare /></Button></div>
      {timedPricingDays.map(index => index !== copyFrom && scheduleDays[index]?.toLowerCase().includes(dayQuery.toLowerCase()) ? <label key={index} className="flex min-h-11 items-center justify-between gap-3 border-b border-border py-2 t-row"><span>{scheduleDays[index]}</span><Checkbox aria-label={`Copy to ${scheduleDays[index]}`} checked={copyTargets.includes(index)} onCheckedChange={checked => setCopyTargets(values => checked ? [...values, index] : values.filter(i => i !== index))} /></label> : null)}
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCopyFrom(null)}>Cancel</Button><Button disabled={!copyTargets.length} onClick={() => { const source = copyFrom !== null ? draft?.days[copyFrom] : undefined; if (!draft || !source) return; setDraft({ ...draft, days: draft.days.map((day, i) => copyTargets.includes(i) ? { ...source, enabled: true } : day) }); setCopyFrom(null); }}>Apply</Button></div>
    </DialogContent></Dialog>
  </>;
}