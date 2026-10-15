import { useState } from "react";
import { Archive, ArchiveRestore, ChevronRight, Copy, Plus, Search, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";
import { emptyScheduleDays, referenceSchedules, scheduleDays, type RestaurantSchedule, type ScheduleDay } from "@/lib/restaurant-schedules";

const dateLabel = (date: string) => date ? date.split("-").reverse().join("/") : "—";
export function ScheduleInformation() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const schedules = settings.restaurantSchedules ?? referenceSchedules;
  const [archived, setArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [draft, setDraft] = useState<RestaurantSchedule | null>(null);
  const [error, setError] = useState("");
  const [copyFrom, setCopyFrom] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);
  const [dayQuery, setDayQuery] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<RestaurantSchedule | null>(null);
  const saveCollection = (next: RestaurantSchedule[]) => updateSettings({ restaurantSchedules: next });
  const openDraft = (schedule: RestaurantSchedule) => { setDraft({ ...schedule, days: schedule.days.map(day => ({ ...day })) }); setError(""); };
  const updateDay = (index: number, patch: Partial<ScheduleDay>) => setDraft(current => current ? { ...current, days: current.days.map((day, i) => i === index ? { ...day, ...patch } : day) } : current);
  const save = () => {
    if (!draft || !canManageSettings) return;
    if (!draft.name.trim() || !draft.startDate || !draft.endDate) { setError("Enter a schedule name, start date and end date."); return; }
    if (draft.endDate < draft.startDate) { setError("End date must be on or after start date."); return; }
    if (!draft.days.some(day => day.enabled)) { setError("Select at least one day."); return; }
    if (draft.days.some(day => day.enabled && (!day.start || !day.end))) { setError("Choose start and end times for each selected day."); return; }
    const next = { ...draft, name: draft.name.trim() };
    saveCollection(schedules.some(schedule => schedule.id === draft.id) ? schedules.map(schedule => schedule.id === draft.id ? next : schedule) : [...schedules, next]);
    setDraft(null); toast.success("Schedule saved");
  };
  const visible = schedules.filter(schedule => schedule.archived === archived && schedule.name.toLowerCase().includes(query.trim().toLowerCase()));
  const daysLabel = (schedule: RestaurantSchedule) => schedule.days.flatMap((day, index) => day.enabled ? [scheduleDays[index]?.slice(0, 3)] : []).join(", ") || "—";
  return <>
    <SubHeader title={draft ? schedules.some(schedule => schedule.id === draft.id) ? "Edit Schedule" : "Add Schedule" : "Schedule Information"} backLabel="General" backTo="/settings/general" right={draft ? <Button variant="ghost" onClick={() => { setDraft(null); setError(""); }}>Back</Button> : <Button variant="ghost" size="icon" aria-label="Search schedules" title="Search schedules" onClick={() => setSearchOpen(open => !open)}><Search /></Button>} />
    <ScreenBody className="py-4">
      {draft ? <>
        <GroupCard>
          <div className={settingsRowClass}><label htmlFor="schedule-name" className="min-w-0 flex-1 t-row">Restaurant Schedule</label><Input id="schedule-name" placeholder="Enter Name" value={draft.name} disabled={!canManageSettings} onChange={event => setDraft({ ...draft, name: event.target.value })} className="w-[48%] min-w-0 t-value" maxLength={100} /></div>
          <div className={settingsRowClass}><label htmlFor="schedule-start" className="min-w-0 flex-1 t-row">Start Date</label><Input id="schedule-start" type="date" value={draft.startDate} disabled={!canManageSettings} onChange={event => setDraft({ ...draft, startDate: event.target.value })} className="w-[48%] min-w-0 t-value" /></div>
          <div className={settingsRowClass}><label htmlFor="schedule-end" className="min-w-0 flex-1 t-row">End Date</label><Input id="schedule-end" type="date" min={draft.startDate} value={draft.endDate} disabled={!canManageSettings} onChange={event => setDraft({ ...draft, endDate: event.target.value })} className="w-[48%] min-w-0 t-value" /></div>
        </GroupCard>
        <GroupCard className="mt-6">
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-2 border-b border-border px-2 py-4 t-caption font-bold"><span>Days</span><span>Start Time</span><span>End Time</span><span /></div>
          {scheduleDays.map((day, index) => <div key={day} className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] items-center gap-2 border-b border-border bg-muted/30 px-2 py-3 last:border-b-0">
            <label className="flex min-w-0 flex-wrap items-center gap-2 t-caption"><Checkbox className="rounded-full" aria-label={day} disabled={!canManageSettings} checked={draft.days[index]?.enabled ?? false} onCheckedChange={enabled => updateDay(index, { enabled: enabled === true })} /><span className="break-words">{day}</span></label>
            <Input type="time" aria-label={`${day} start time`} className="min-w-0 px-1 t-caption" value={draft.days[index]?.start ?? ""} disabled={!canManageSettings || !draft.days[index]?.enabled} onChange={event => updateDay(index, { start: event.target.value })} />
            <Input type="time" aria-label={`${day} end time`} className="min-w-0 px-1 t-caption" value={draft.days[index]?.end ?? ""} disabled={!canManageSettings || !draft.days[index]?.enabled} onChange={event => updateDay(index, { end: event.target.value })} />
            <Button variant="ghost" size="icon" className="size-9" aria-label={`Copy ${day} times`} title={`Copy ${day} times`} disabled={!canManageSettings || !draft.days[index]?.start || !draft.days[index]?.end} onClick={() => { setCopyFrom(index); setCopyTargets([]); setDayQuery(""); }}><Copy className="size-4" /></Button>
          </div>)}
        </GroupCard>
        {error && <p role="alert" className="mt-4 t-caption text-destructive">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {schedules.some(schedule => schedule.id === draft.id) && canManageSettings && <Button variant="outline" onClick={() => setArchiveTarget(draft)}>{draft.archived ? <ArchiveRestore /> : <Archive />}{draft.archived ? "Restore" : "Archive"}</Button>}
          <Button variant="outline" onClick={() => { setDraft(null); setError(""); }}>Cancel</Button><Button disabled={!canManageSettings} onClick={save}>Save</Button>
        </div>
      </> : <>
        <div className="mb-5 flex items-center gap-3"><div className="min-w-0 flex-1"><p className="t-caption text-muted-foreground">Manage and create the different operating schedules of your restaurant</p>{archived && <p className="mt-2 t-row font-bold">Archived Schedules</p>}</div><Button variant={archived ? "default" : "outline"} size="icon" aria-label={archived ? "Show active schedules" : "Show archived schedules"} title={archived ? "Show active schedules" : "Archive"} onClick={() => setArchived(value => !value)}><Archive /></Button><Button size="icon" aria-label="Add new schedule" title="Add New" disabled={!canManageSettings} onClick={() => openDraft({ id: `schedule-${crypto.randomUUID()}`, name: "", startDate: "", endDate: "", archived: false, days: emptyScheduleDays() })}><Plus /></Button></div>
        {searchOpen && <div className="relative mb-4"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input autoFocus aria-label="Search schedules" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} className="pl-10" /></div>}
        <GroupCard>
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_1rem] gap-3 border-b border-border px-4 py-4 t-caption font-bold sm:grid"><span>Name</span><span>Start Date</span><span>End Date</span><span className="text-right">Days</span><span /></div>
          {visible.map(schedule => <Button key={schedule.id} variant="ghost" className="grid h-auto w-full grid-cols-[minmax(0,1fr)_1rem] gap-3 rounded-none border-b border-border bg-muted/30 px-4 py-4 text-left whitespace-normal last:border-b-0 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_1rem]" onClick={() => openDraft(schedule)}>
            <span className="min-w-0 break-words t-row">{schedule.name}<span className="mt-1 block t-caption text-muted-foreground sm:hidden">{dateLabel(schedule.startDate)} – {dateLabel(schedule.endDate)}<span className="mt-1 block">{daysLabel(schedule)}</span></span></span>
            <span className="hidden t-caption sm:block">{dateLabel(schedule.startDate)}</span><span className="hidden t-caption sm:block">{dateLabel(schedule.endDate)}</span><span className="hidden min-w-0 break-words text-right t-caption sm:block">{daysLabel(schedule)}</span><ChevronRight className="size-4 text-muted-foreground" />
          </Button>)}
          {!visible.length && <p className="px-4 py-8 text-center t-row text-muted-foreground">{query ? "No schedules found" : archived ? "No archived schedules" : "No schedules"}</p>}
        </GroupCard>
      </>}
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
    </ScreenBody>
    <Dialog open={copyFrom !== null} onOpenChange={open => { if (!open) setCopyFrom(null); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg"><DialogTitle>Select Days</DialogTitle><DialogDescription>To copy schedule please select days</DialogDescription><div className="flex items-center gap-2"><Input aria-label="Search days" placeholder="Search" value={dayQuery} onChange={event => setDayQuery(event.target.value)} /><Button variant="ghost" size="icon" aria-label="Select all days" title="Select all days" onClick={() => setCopyTargets(copyTargets.length === 6 ? [] : scheduleDays.flatMap((_, index) => index !== copyFrom ? [index] : []))}><CheckSquare /></Button></div>
      {scheduleDays.map((day, index) => index !== copyFrom && day.toLowerCase().includes(dayQuery.toLowerCase()) ? <label key={day} className="flex min-h-11 items-center justify-between gap-3 border-b border-border py-2 t-row"><span>{day}</span><Checkbox aria-label={`Copy to ${day}`} checked={copyTargets.includes(index)} onCheckedChange={checked => setCopyTargets(values => checked ? [...values, index] : values.filter(value => value !== index))} /></label> : null)}
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCopyFrom(null)}>Cancel</Button><Button disabled={!copyTargets.length} onClick={() => { const source = copyFrom !== null ? draft?.days[copyFrom] : undefined; if (!source || !draft) return; setDraft({ ...draft, days: draft.days.map((day, index) => copyTargets.includes(index) ? { ...source, enabled: true } : day) }); setCopyFrom(null); }}>Apply</Button></div>
    </DialogContent></Dialog>
    <Dialog open={archiveTarget !== null} onOpenChange={open => { if (!open) setArchiveTarget(null); }}><DialogContent className="w-[calc(100%-2rem)] rounded-lg"><DialogTitle>{archiveTarget?.archived ? "Restore Schedule" : "Archive Schedule"}</DialogTitle><DialogDescription>{archiveTarget?.name}</DialogDescription><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setArchiveTarget(null)}>Cancel</Button><Button onClick={() => { if (!archiveTarget || !canManageSettings) return; saveCollection(schedules.map(schedule => schedule.id === archiveTarget.id ? { ...schedule, archived: !schedule.archived } : schedule)); setArchived(!archiveTarget.archived); setArchiveTarget(null); setDraft(null); toast.success(archiveTarget.archived ? "Schedule restored" : "Schedule archived"); }}>{archiveTarget?.archived ? "Restore" : "Archive"}</Button></div></DialogContent></Dialog>
  </>;
}
