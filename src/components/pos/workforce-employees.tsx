import { useEffect, useRef, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Check, ChevronRight, Pencil, Plus, Search, UserRound } from "lucide-react";
import { ArchiveGlyph } from "@/components/pos/archive-glyph";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";
import { revenueCenters } from "@/lib/demo-data";
import { formatPhoneFor, phoneCountries, phoneCountryByName } from "@/lib/phone";
import { employeeErrorFor, employeeNoticeFor, employeeRoles, newWorkforceEmployee, referenceEmployees, type WorkforceEmployee } from "@/lib/workforce-employees";

const employeeFormRow = "relative flex min-h-12 w-full items-center gap-2 px-3 py-1 text-left after:absolute after:inset-x-3 after:bottom-0 after:border-b after:border-border last:after:hidden";
const employeeFormGroup = "rounded-lg! border-0 shadow-none!";
const employeeFormInput = "h-10 w-[48%] min-w-0 rounded-none border-0 bg-transparent px-0 text-right t-value shadow-none focus-visible:ring-0";
const employeeFormSelect = "h-10 w-[48%] min-w-0 justify-end gap-2 rounded-none border-0 px-0 text-right t-value text-muted-foreground shadow-none focus:ring-0 [&>svg]:hidden [&>span]:min-w-0 [&>span]:truncate";

export function WorkforceEmployees() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const employees = settings.workforceEmployees ?? referenceEmployees;
  const [draft, setDraft] = useState<WorkforceEmployee | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [role, setRole] = useState("all");
  const [date, setDate] = useState("");
  const [descending, setDescending] = useState(false);
  const [archived, setArchived] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<WorkforceEmployee | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const swipe = useRef<{ id: string; x: number; y: number; horizontal: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef(0);
  const listRef = useRef(employees);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [phoneEdit, setPhoneEdit] = useState<{ country: string; phone: string } | null>(null);
  useEffect(() => { listRef.current = employees; }, [employees]);
  useEffect(() => () => window.clearTimeout(savedTimer.current), []);
  const isNewDraft = !!draft && !employees.some(employee => employee.id === draft.id);
  const commit = (next: WorkforceEmployee) => {
    const clean: WorkforceEmployee = { ...next, firstName: next.firstName.trim(), lastName: next.lastName.trim(), email: next.email.trim(), employeeId: next.employeeId.trim() };
    const base = listRef.current;
    const exists = base.some(employee => employee.id === clean.id);
    const list = exists ? base.map(employee => employee.id === clean.id ? clean : employee) : [...base, clean];
    listRef.current = list;
    updateSettings({ workforceEmployees: list });
    if (!exists) { setArchived(false); setQuery(""); setRole("all"); setDate(""); }
    setSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 1600);
  };
  const patch = (values: Partial<WorkforceEmployee>) => {
    if (!draft || !canManageSettings) return;
    const next = { ...draft, ...values };
    setDraft(next);
    if (!employeeErrorFor(next, employees, isNewDraft)) commit(next);
  };
  const closeDraft = () => { setDraft(null); setError(""); setPin(""); setConfirmPin(""); };
  useEffect(() => {
    if (!draft) { setError(""); return; }
    const message = employeeErrorFor(draft, employees, !employees.some(employee => employee.id === draft.id)) || employeeNoticeFor(draft);
    if (!message) { setError(""); return; }
    const timer = window.setTimeout(() => setError(message), 600);
    return () => window.clearTimeout(timer);
  }, [draft, employees]);
  const textRow = (label: string, field: "firstName" | "lastName" | "email" | "employeeId", placeholder: string) => draft && <div className={employeeFormRow}><label htmlFor={`employee-${field}`} className="min-w-0 flex-1 t-row font-normal">{label}</label><Input id={`employee-${field}`} type={field === "email" ? "email" : "text"} className={employeeFormInput} placeholder={placeholder} maxLength={100} value={draft[field]} disabled={!canManageSettings} onChange={event => patch({ [field]: event.target.value })} /><ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /></div>;
  const selectRow = (label: string, field: "role" | "revenueCentre" | "jobType", options: string[]) => draft && <div className={employeeFormRow}><label htmlFor={`employee-${field}`} className="min-w-0 flex-1 t-row font-normal">{label}</label><Select value={draft[field]} disabled={!canManageSettings} onValueChange={value => patch({ [field]: value })}><SelectTrigger id={`employee-${field}`} className={employeeFormSelect}><SelectValue placeholder="Choose" /><span aria-hidden="true"><ChevronRight className="size-4 shrink-0" /></span></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>;
  const toggleRow = (label: string, field: "dashboardAccess" | "payroll") => draft && <div className={employeeFormRow}><span className="min-w-0 flex-1 t-row font-normal">{label}</span><Switch aria-label={label} checked={draft[field]} disabled={!canManageSettings} onCheckedChange={checked => patch({ [field]: checked })} /></div>;
  const filtered = employees.filter(employee => employee.archived === archived && (role === "all" || employee.role === role) && (!date || !employee.addedOn || employee.addedOn <= date) && `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.phone}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) * (descending ? -1 : 1));
  return <>
    <SubHeader title={draft ? employees.some(employee => employee.id === draft.id) ? "Employee Information" : "Add New Employee" : archived ? "Archived Employees" : "Employees"} backLabel={draft ? "Employees" : "Workforce"} backTo="/settings/workforce" onBack={draft ? closeDraft : undefined} right={!draft ? <Button size="icon" variant="ghost" aria-label="Search employees" title="Search employees" onClick={() => setSearchOpen(value => !value)}><Search /></Button> : undefined} />
    <ScreenBody className="py-4">
      {draft ? <>
        <div className="mb-8 mt-4 flex justify-center"><div className="relative grid size-24 place-items-center rounded-full bg-muted text-muted-foreground"><UserRound className="size-12" /><Button size="icon" variant="ghost" className="absolute bottom-0 right-0 size-8 rounded-full bg-background" aria-label="Edit employee photo" title="Edit employee photo" disabled={!canManageSettings} onClick={() => toast.info("Employee photo uploads are not available in this demo.")}><Pencil className="size-4" /></Button></div></div>
        <GroupCard className={employeeFormGroup}>{textRow("First Name", "firstName", "Required")}{textRow("Last Name", "lastName", "Required")}</GroupCard>
        <GroupCard className={`${employeeFormGroup} mt-8`}>{textRow("Email", "email", "Optional")}<Button variant="ghost" className={`${employeeFormRow} h-auto justify-start rounded-none whitespace-normal`} disabled={!canManageSettings} onClick={() => setPhoneEdit({ country: draft.country, phone: draft.phone })}><span className="min-w-0 flex-1 t-row font-normal">Phone Number</span><span className="max-w-[48%] break-words text-right t-value text-muted-foreground">{draft.phone ? `${phoneCountryByName(draft.country).dial} ${formatPhoneFor(phoneCountryByName(draft.country), draft.phone)}` : "Optional"}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></Button></GroupCard>
        <div className="mt-4"><GroupLabel>Employee Information</GroupLabel></div><GroupCard className={employeeFormGroup}>
          {toggleRow("Dashboard Access", "dashboardAccess")}{textRow("Employee Id", "employeeId", "Optional")}{selectRow("Job Role", "role", employeeRoles)}{selectRow("Revenue centre", "revenueCentre", revenueCenters)}
          <Button variant="ghost" className={`${employeeFormRow} h-auto justify-start rounded-none whitespace-normal`} disabled={!canManageSettings} onClick={() => { setPin(""); setConfirmPin(""); setPinError(""); setPinOpen(true); }}><span className="min-w-0 flex-1 t-row font-normal">Create New Pin</span><span className="t-value text-muted-foreground">{draft.pinConfigured ? "PIN Set" : "Set PIN"}</span><ChevronRight className="size-4" /></Button>
          <Button variant="ghost" className={`${employeeFormRow} h-auto justify-start rounded-none whitespace-normal`} disabled={!canManageSettings} onClick={() => toast.info("Fingerprint enrollment requires a supported connected device and is not available in this demo.")}><span className="min-w-0 flex-1 t-row font-normal">Add Fingerprint</span><ChevronRight className="size-4" /></Button>
        </GroupCard>
        <div className="mt-4"><GroupLabel>Payroll Details</GroupLabel></div><GroupCard className={employeeFormGroup}>{toggleRow("Payroll", "payroll")}{selectRow("Job Type *", "jobType", ["Full Time", "Part Time", "Casual", "Contract"] )}</GroupCard><Caption>Manage payroll by specifying employee pay type, rates, and roles.</Caption>
        {error && <p role="alert" className="mt-4 t-caption text-destructive">{error}</p>}
        <div className="mt-6 flex min-h-9 flex-wrap items-center justify-between gap-3">
          {canManageSettings && employees.some(employee => employee.id === draft.id) ? <Button variant="outline" onClick={() => setArchiveTarget(draft)}><ArchiveGlyph className="size-4" />{draft.archived ? "Restore" : "Archive"}</Button> : <span aria-hidden="true" />}
          <span aria-live="polite" className="inline-flex items-center gap-1.5 t-caption text-muted-foreground">{saved ? <><Check className="size-3.5" aria-hidden="true" />Saved</> : "Changes save automatically"}</span>
        </div>
      </> : <>
        <div className="mb-5 flex items-center gap-3"><p className="min-w-0 flex-1 t-caption text-muted-foreground">Individuals employed by a company, contributing to its operations and collectively forming the organisation's human resources.</p><Button size="icon" variant={archived ? "default" : "outline"} aria-label={archived ? "Show active employees" : "Show archived employees"} title={archived ? "Active employees" : "Archived employees"} onClick={() => { setArchived(value => !value); setRevealedId(null); }}><ArchiveGlyph className="size-4" /></Button><Button size="icon" aria-label="Add new employee" title="Add New Employee" disabled={!canManageSettings} onClick={() => { setError(""); setSaved(false); setRevealedId(null); setDraft({ ...newWorkforceEmployee(), id: crypto.randomUUID(), addedOn: new Date().toLocaleDateString("en-CA") }); }}><Plus /></Button></div>
        {searchOpen && <Input aria-label="Search employees" placeholder="Search employees" className="mb-4" value={query} onChange={event => setQuery(event.target.value)} />}
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-2"><Select value={role} onValueChange={setRole}><SelectTrigger aria-label="Job Roles" className="w-full min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Job Roles</SelectItem>{employeeRoles.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><Input aria-label="Employees as of date" type="date" className="min-w-0" value={date} onChange={event => setDate(event.target.value)} /><Button variant="outline" size="icon" aria-label={descending ? "Sort employees ascending" : "Sort employees descending"} title="Sort employees" onClick={() => setDescending(value => !value)}>{descending ? <ArrowUpAZ /> : <ArrowDownAZ />}</Button></div>
        <GroupCard>{filtered.map(employee => <div key={employee.id} className="relative overflow-hidden border-b border-border last:border-b-0">
          {canManageSettings && revealedId === employee.id && <Button variant="ghost" className="absolute inset-y-0 right-0 h-full w-24 flex-col gap-1 rounded-none bg-muted text-foreground" aria-label={`${employee.archived ? "Restore" : "Archive"} ${employee.firstName} ${employee.lastName}`} onClick={() => setArchiveTarget(employee)}><ArchiveGlyph className="size-5" /><span className="t-caption">{employee.archived ? "Restore" : "Archive"}</span></Button>}
          <Button variant="ghost" aria-label={`Open ${employee.firstName} ${employee.lastName}`} aria-expanded={revealedId === employee.id} className={`${settingsRowClass} relative h-auto w-full touch-pan-y justify-start rounded-none border-b-0 bg-surface whitespace-normal transition-transform duration-200 motion-reduce:transition-none ${revealedId === employee.id ? "-translate-x-24" : "translate-x-0"}`}
            onPointerDown={event => { if (!canManageSettings || (event.pointerType === "mouse" && event.button !== 0)) return; swipe.current = { id: employee.id, x: event.clientX, y: event.clientY, horizontal: false }; }}
            onPointerMove={event => {
              const start = swipe.current;
              if (!start || start.id !== employee.id) return;
              const dx = event.clientX - start.x; const dy = event.clientY - start.y;
              if (!start.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { swipe.current = null; return; }
              if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                start.horizontal = true; suppressClickUntil.current = Date.now() + 500;
                event.currentTarget.setPointerCapture(event.pointerId);
                if (dx < -40) setRevealedId(employee.id); else if (dx > 40) setRevealedId(null);
              }
            }}
            onPointerUp={() => { if (swipe.current?.horizontal) suppressClickUntil.current = Date.now() + 500; swipe.current = null; }}
            onPointerCancel={() => { swipe.current = null; }}
            onKeyDown={event => { if (event.key === "ArrowLeft" && canManageSettings) { event.preventDefault(); setRevealedId(employee.id); } else if (event.key === "Escape" || event.key === "ArrowRight") setRevealedId(null); }}
            onClick={() => { if (Date.now() < suppressClickUntil.current) return; if (revealedId) { setRevealedId(null); return; } setDraft({ ...employee }); setError(""); setSaved(false); }}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground font-bold text-background">{employee.firstName.slice(0, 1)}</span><span className="min-w-0 flex-1 text-left"><span className="block break-words t-row font-semibold">{employee.firstName} {employee.lastName}</span><span className="block t-caption text-muted-foreground">{employee.role}</span><span className="mt-1 block break-all t-caption text-muted-foreground lg:hidden">{employee.phone && `${phoneCountryByName(employee.country).dial}${employee.phone}`} {employee.email}</span></span><span className="hidden min-w-0 max-w-[45%] break-all text-right t-caption text-muted-foreground lg:block">{employee.phone && <span className="block">{phoneCountryByName(employee.country).dial}{employee.phone}</span>}{employee.email}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></Button></div>)}{!filtered.length && <p className="px-4 py-8 text-center t-row text-muted-foreground">No {archived ? "archived " : ""}employees found</p>}</GroupCard>
      </>}
      {!canManageSettings && <Caption>Only managers can change employees.</Caption>}
    </ScreenBody>
    <Dialog open={!!phoneEdit} onOpenChange={open => { if (!open) setPhoneEdit(null); }}><DialogContent><DialogTitle>Phone Number</DialogTitle><DialogDescription>Employee contact number</DialogDescription>{phoneEdit && <><Select value={phoneEdit.country} onValueChange={country => setPhoneEdit({ country, phone: "" })}><SelectTrigger aria-label="Phone country"><SelectValue /></SelectTrigger><SelectContent>{phoneCountries.map(country => <SelectItem key={country.name} value={country.name}>{country.name} {country.dial}</SelectItem>)}</SelectContent></Select><Input aria-label="Phone Number" type="tel" placeholder="Optional" value={formatPhoneFor(phoneCountryByName(phoneEdit.country), phoneEdit.phone)} onChange={event => setPhoneEdit({ ...phoneEdit, phone: formatPhoneFor(phoneCountryByName(phoneEdit.country), event.target.value).replace(/\D/g, "") })} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPhoneEdit(null)}>Cancel</Button><Button onClick={() => { patch(phoneEdit); setPhoneEdit(null); }}>Done</Button></div></>}</DialogContent></Dialog>
    <Dialog open={!!archiveTarget} onOpenChange={open => { if (!open) setArchiveTarget(null); }}><DialogContent><DialogTitle>{archiveTarget?.archived ? "Restore Employee" : "Archive Employee"}</DialogTitle><DialogDescription>{archiveTarget?.firstName} {archiveTarget?.lastName}</DialogDescription><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setArchiveTarget(null)}>Cancel</Button><Button onClick={() => { if (!archiveTarget || !canManageSettings) return; updateSettings({ workforceEmployees: employees.map(employee => employee.id === archiveTarget.id ? { ...employee, archived: !employee.archived } : employee) }); setArchiveTarget(null); setRevealedId(null); closeDraft(); toast.success(archiveTarget.archived ? "Employee restored" : "Employee archived"); }}>{archiveTarget?.archived ? "Restore" : "Archive"}</Button></div></DialogContent></Dialog>
    <Dialog open={pinOpen} onOpenChange={open => { setPinOpen(open); if (!open) { setPin(""); setConfirmPin(""); } }}><DialogContent><DialogTitle>Create New Pin</DialogTitle><DialogDescription>Demo setup only. This PIN will not be stored or used for employee login.</DialogDescription><Input aria-label="New PIN" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, ""))} placeholder="New PIN" /><Input aria-label="Confirm PIN" type="password" inputMode="numeric" maxLength={4} value={confirmPin} onChange={event => setConfirmPin(event.target.value.replace(/\D/g, ""))} placeholder="Confirm PIN" />{pinError && <p role="alert" className="t-caption text-destructive">{pinError}</p>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setPinOpen(false); setPin(""); setConfirmPin(""); }}>Cancel</Button><Button disabled={!canManageSettings} onClick={() => { if (pin.length !== 4 || pin !== confirmPin) { setPinError("Enter matching four-digit PINs."); return; } patch({ pinConfigured: true }); setPinOpen(false); setPin(""); setConfirmPin(""); }}>Set PIN</Button></div></DialogContent></Dialog>
  </>;
}
