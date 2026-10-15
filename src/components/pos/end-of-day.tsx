import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, ReceiptText, ContactRound, Banknote } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { employees } from "@/lib/demo-data";
import { formatMoney } from "@/lib/brand";
import { usePos, type AppSettings } from "@/lib/pos-store";

type ToggleField = "eodReminder" | "eodTasks" | "eodClockOut" | "eodCloseDrawer" | "eodPrintReport" | "eodPrintEmployees" | "eodClosePaid" | "eodCancelUnpaid";

export function EndOfDaySettings() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const [picker, setPicker] = useState<"device" | "recipients" | null>(null);
  const [draftRecipients, setDraftRecipients] = useState<string[]>([]);
  const tasks: [ToggleField, string][] = [
    ["eodClockOut", "Clock Out Employees"], ["eodCloseDrawer", "Close Drawer"],
    ["eodPrintReport", "Print EOD Receipt Report"], ["eodPrintEmployees", "Print Employee Data"],
    ["eodClosePaid", "Close Paid Orders"], ["eodCancelUnpaid", "Cancel Unpaid Tickets"],
  ];
  const rowBare = settingsRowClass.replace(" border-b border-border", "");
  const toggle = (field: ToggleField, label: string, disabled = false, noBorder = false) => (
    <div className={noBorder ? rowBare : settingsRowClass} key={field}>
      <span className="min-w-0 flex-1 t-row">{label}</span>
      <Switch checked={settings[field]} disabled={!canManageSettings || disabled} aria-label={label}
        onCheckedChange={(value) => updateSettings({ [field]: value } as Partial<AppSettings>)} />
    </div>
  );
  const time = (field: "eodReminderTime" | "eodAutoTime", label: string, disabled: boolean, noBorder = false) => (
    <div className={noBorder ? rowBare : settingsRowClass}>
      <label htmlFor={field} className="min-w-0 flex-1 t-row">{label}</label>
      <input id={field} aria-label={label} type="time" value={settings[field]}
        disabled={!canManageSettings || disabled}
        className="min-h-11 w-32 shrink-0 rounded-md border border-border bg-surface px-2 t-value text-muted-foreground disabled:opacity-50"
        onChange={(e) => { if (e.target.value) updateSettings({ [field]: e.target.value }); }} />
    </div>
  );
  return <>
    <SubHeader title="End of Day" backLabel="General" backTo="/settings/general" />
    <ScreenBody className="py-4">
      <Button asChild variant="outline" className="mb-4 min-h-ctl-lg w-full t-row"><Link to="/settings/end-of-day/start">Start End of Day</Link></Button>
      <GroupCard>
        <Button variant="ghost" className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`} disabled={!canManageSettings} onClick={() => setPicker("device")}>
          <span className="min-w-0 flex-1 t-row">End Of Day Device</span><span className="max-w-[45%] break-words t-value text-muted-foreground">{settings.deviceName}</span><ChevronRight />
        </Button>
        {toggle("eodReminder", "End of Day Reminder")}
        {time("eodReminderTime", "Reminder Time", !settings.eodReminder)}
      </GroupCard>
      <Caption>By default, we set end-of-day reminder to be 10 minutes after closing time.</Caption>
      <GroupLabel>Automatic Tasks</GroupLabel>
      <GroupCard>
        {toggle("eodTasks", "End of Day Tasks")}
        {time("eodAutoTime", "Auto End of Day", !settings.eodTasks, true)}
        <p className="border-b border-border px-4 pb-3 t-caption text-muted-foreground">Auto end-of-day task triggers 10 minutes after setting a reminder by default.</p>
        {tasks.map(([field, label]) => <div key={field} className="border-b border-border">{toggle(field, label, !settings.eodTasks, field === "eodPrintEmployees")}{field === "eodPrintEmployees" && <p className="px-4 pb-3 t-caption text-muted-foreground">Enable to print employee data on sales summary report</p>}</div>)}
        <Button variant="ghost" className={`${rowBare} h-auto justify-start rounded-none whitespace-normal`} disabled={!canManageSettings || !settings.eodTasks}
          onClick={() => { setDraftRecipients(settings.eodRecipients); setPicker("recipients"); }}>
          <span className="min-w-0 flex-1 t-row">Send Daily Reports</span><span className="shrink-0 t-value text-muted-foreground">{settings.eodRecipients.length} Employees</span><ChevronRight />
        </Button>
        <p className="px-4 pb-3 t-caption text-muted-foreground">Enable to select and send daily operations reports to one or multiple employees</p>
      </GroupCard>
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
    </ScreenBody>
    <Dialog open={picker !== null} onOpenChange={(open) => { if (!open) setPicker(null); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogTitle>{picker === "device" ? "End Of Day Device" : "Send Daily Reports"}</DialogTitle>
        <DialogDescription>{picker === "device" ? "Current device" : "Select employees"}</DialogDescription>
        {picker === "device" ? <p className="t-row">{settings.deviceName}</p> : employees.map((employee) => <label key={employee.id} className="flex min-h-11 items-center gap-3 border-b border-border py-3">
          <Checkbox checked={draftRecipients.includes(employee.id)} onCheckedChange={(checked) => setDraftRecipients((ids) => checked ? [...ids, employee.id] : ids.filter((id) => id !== employee.id))} />
          <span className="min-w-0 flex-1 t-row">{employee.name}<span className="block t-caption text-muted-foreground">{employee.role}</span></span>
        </label>)}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPicker(null)}>Cancel</Button>
          {picker === "recipients" && <Button onClick={() => { updateSettings({ eodRecipients: draftRecipients }); setPicker(null); toast.success("Report recipients updated"); }}>Save</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}

export function StartEndOfDay() {
  const { tickets, ticketDate, settings, session, canManageSettings } = usePos();
  const [detail, setDetail] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [complete, setComplete] = useState(false);
  const today = ticketDate;
  const dayTickets = tickets.filter((ticket) => ticket.date === today);
  const unpaid = dayTickets.filter((ticket) => ticket.status !== "paid" && !ticket.closed);
  const open = dayTickets.filter((ticket) => ticket.status === "paid" && !ticket.closed);
  const staff = employees.filter((employee) => employee.name === session.name ? session.clockedIn : employee.state.startsWith("Clocked in") || employee.state.startsWith("Break"));
  const cash = dayTickets.flatMap((ticket) => (ticket.payments ?? []).filter((payment) => payment.method.toLowerCase() === "cash").map((payment) => ({ ticket, payment })));
  const minutes = staff.reduce((sum, employee) => { const match = /(\d+)h\s+(\d+)m/.exec(employee.state); return sum + (match ? Number(match[1]) * 60 + Number(match[2]) : 0); }, 0);
  const rows = [
    { title: "Unpaid Bills", count: unpaid.length, icon: ReceiptText },
    { title: "Open Checks", count: open.length, icon: ReceiptText },
    { title: "Clocked In Employees", count: staff.length, icon: ContactRound },
    { title: "Cash Drawer Activity", count: cash.length, icon: Banknote },
  ];
  const metrics = [
    { label: "Total Number of Labour Hours", value: `${String(Math.floor(minutes / 60)).padStart(2, "0")} hrs : ${String(minutes % 60).padStart(2, "0")} mins` },
    { label: "Total Number of Orders Today", value: String(dayTickets.length).padStart(2, "0") },
    { label: "Today's Sales", value: formatMoney(dayTickets.filter((ticket) => ticket.status === "paid").reduce((sum, ticket) => sum + ticket.total, 0)) },
  ];
  return <>
    <SubHeader title="Start End Of Day" backLabel="End of Day" backTo="/settings/end-of-day" />
    <ScreenBody className="py-4">
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map((metric) => <div key={metric.label} className="grid grid-rows-[1fr_auto] overflow-hidden rounded-card border border-border bg-surface text-center">
          <div className="flex min-h-16 items-center justify-center bg-primary px-3 py-3 t-row text-primary-foreground">{metric.label}</div>
          <p className="px-2 py-4 t-row">{metric.value}</p>
        </div>)}
      </div>
      <GroupLabel>Things to do</GroupLabel>
      <GroupCard>{rows.map(({ title, count, icon: Icon }) => <Button key={title} variant="ghost" className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`} onClick={() => setDetail(title)}>
        <Icon className="text-muted-foreground" /><span className="min-w-0 flex-1 t-row">{title}</span><span className="t-value text-muted-foreground">{count}</span><ChevronRight />
      </Button>)}</GroupCard>
      <Button className="mt-8 min-h-ctl-lg w-full" disabled={!canManageSettings || complete} onClick={() => setConfirm(true)}>{complete ? "END OF DAY REVIEWED" : "CLOSE RESTAURANT"}</Button>
      {!canManageSettings && <Caption>Only managers can close the restaurant.</Caption>}
    </ScreenBody>
    <Dialog open={detail !== null} onOpenChange={(isOpen) => { if (!isOpen) setDetail(null); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogTitle>{detail}</DialogTitle><DialogDescription>{today}</DialogDescription>
        {(detail === "Unpaid Bills" || detail === "Open Checks") && <>{(detail === "Unpaid Bills" ? unpaid : open).map((ticket) => <Button key={ticket.id} asChild variant="outline" className="min-h-11 justify-between whitespace-normal"><Link to="/tickets/$ticketId" params={{ ticketId: ticket.id }}>Order #{ticket.number} · {ticket.label}<span>{formatMoney(ticket.total)}</span></Link></Button>)}{(detail === "Unpaid Bills" ? unpaid : open).length === 0 && <p className="t-row">No {detail.toLowerCase()}</p>}</>}
        {detail === "Clocked In Employees" && staff.map((employee) => <div key={employee.id} className="border-b border-border py-3"><p className="t-row">{employee.name}</p><p className="t-caption text-muted-foreground">{employee.role} · {employee.name === session.name && !session.clockedIn ? "Clocked out" : employee.state}</p></div>)}
        {detail === "Cash Drawer Activity" && <><p className="t-caption text-muted-foreground">{settings.cashDrawerAssigned}</p>{cash.length === 0 ? <p className="t-row">No cash payments today</p> : cash.map(({ ticket, payment }, index) => <p key={`${ticket.id}-${index}`} className="border-b border-border py-3 t-row">Order #{ticket.number} · {formatMoney(payment.amount)}</p>)}</>}
        <Button variant="outline" onClick={() => setDetail(null)}>Back</Button>
      </DialogContent>
    </Dialog>
    <Dialog open={confirm} onOpenChange={setConfirm}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-lg">
        <DialogTitle>Close Restaurant</DialogTitle>
        <DialogDescription>This is a demo end-of-day review. Orders and employee shifts will not be changed, and no reports will be printed or sent.</DialogDescription>
        <p className="t-row">{unpaid.length} unpaid bills · {open.length} open checks · {staff.length} clocked in employees</p>
        <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={() => { setConfirm(false); setComplete(true); toast.success("Demo end-of-day review complete"); }}>Complete Demo Review</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}