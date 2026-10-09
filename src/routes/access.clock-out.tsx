import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Banknote,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ReceiptText,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ClockPanel } from "@/components/pos/clock-panel";
import { PinPad } from "@/components/pos/pin-pad";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { employees, money, stageMeta, type Ticket } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/access/clock-out")({
  head: () => ({
    meta: [
      { title: `Close Checks to Clock Out - ${brand.appName}` },
      { name: "description", content: "Charge, transfer, tip and close your checks before clocking out." },
      { property: "og:title", content: `Close Checks to Clock Out - ${brand.appName}` },
      { property: "og:description", content: "Charge, transfer, tip and close your checks before clocking out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClockOut,
});

type Tab = "unpaid" | "open";
type ConfirmState =
  | { kind: "transfer"; employee: string; ids: string[]; reassignment: boolean }
  | { kind: "close"; ids: string[] }
  | { kind: "clock-out" }
  | null;

/** Shift totals captured at the moment the shift ends. */
type ShiftSummary = { name: string; hours: string; sales: number; tips: number; checks: number };

const actionClass = "min-h-11 flex-1 rounded-md text-fs-sm font-extrabold";

function checkTitle(ticket: Ticket) {
  if (ticket.table) return `Dine In · T${ticket.table}`;
  if (ticket.mode === "delivery") return "Delivery";
  if (ticket.mode === "takeaway") return "Take Out";
  if (ticket.mode === "bar") return "Bar";
  return "Curb Side";
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("");
}

function liveTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function minutesOf(label: string) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim());
  if (!match) return null;
  const hour = (Number(match[1]) % 12) + (/pm/i.test(match[3] ?? "") ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function hoursSince(from: string) {
  const start = minutesOf(from);
  if (start === null) return "--:--";
  const now = new Date();
  const end = now.getHours() * 60 + now.getMinutes();
  const diff = end >= start ? end - start : end + 1440 - start;
  return `${Math.floor(diff / 60)}h ${String(diff % 60).padStart(2, "0")}m`;
}

function isFullyPaid(ticket: Ticket) {
  if (ticket.status === "paid") return true;
  const paid = (ticket.payments ?? []).reduce((sum, payment) => sum + payment.amount, 0);
  return paid >= ticket.total && ticket.total > 0;
}

/** Status pill on a card, read from the check itself — never from its list position. */
function cardStatus(ticket: Ticket, tab: Tab): { label: string; tone: string } {
  if (tab === "unpaid") {
    if (ticket.status === "payment") return { label: "PARTIAL PAID", tone: "text-warning" };
    return { label: "UNPAID", tone: "text-destructive" };
  }
  return stageMeta[ticket.stage ?? "served"];
}

function ClockOut() {
  const navigate = useNavigate();
  const { tickets, session, settings, clockOut, openTicket, transferTickets, closeTickets, addTip } = usePos();
  const [tab, setTab] = useState<Tab>("unpaid");
  const [selected, setSelected] = useState<string[]>([]);
  const [tipFor, setTipFor] = useState<string | null>(null);
  const [tipDigits, setTipDigits] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [now, setNow] = useState(liveTime);
  const [done, setDone] = useState<ShiftSummary | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(liveTime()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const ownUnpaid = tickets.filter((ticket) => ticket.server === session.name && !ticket.closed && !isFullyPaid(ticket));
  const open = tickets.filter((ticket) => ticket.server === session.name && !ticket.closed && isFullyPaid(ticket));
  const transferred = tickets.filter(
    (ticket) => ticket.transferOrigin === session.name && ticket.server !== session.name && !ticket.closed && !isFullyPaid(ticket),
  );
  const visible = tab === "unpaid" ? ownUnpaid : open;
  const selectedTickets = tickets.filter((ticket) => selected.includes(ticket.id));
  const selectedOne = selectedTickets.length === 1 ? selectedTickets[0] : undefined;
  const allSelected = visible.length > 0 && visible.every((ticket) => selected.includes(ticket.id));
  const allClear = ownUnpaid.length === 0 && open.length === 0;
  const transferGroups = useMemo(() => {
    const groups = new Map<string, Ticket[]>();
    for (const ticket of transferred) groups.set(ticket.server, [...(groups.get(ticket.server) ?? []), ticket]);
    return [...groups.entries()];
  }, [transferred]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setSelected([]);
    setTipFor(null);
    setPickerOpen(false);
    setConfirm(null);
  };

  const toggle = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setPickerOpen(false);
    setConfirm(null);
  };

  const selectVisible = () => {
    setSelected((current) => allSelected ? current.filter((id) => !visible.some((ticket) => ticket.id === id)) : [...new Set([...current, ...visible.map((ticket) => ticket.id)])]);
  };

  const finishTransfer = () => {
    if (!confirm || confirm.kind !== "transfer") return;
    transferTickets(confirm.ids, confirm.employee);
    toast.success(`${confirm.ids.length} check${confirm.ids.length === 1 ? "" : "s"} transferred to ${confirm.employee}`);
    setSelected([]);
    setPickerOpen(false);
    setConfirm(null);
  };

  const finishClose = () => {
    if (!confirm || confirm.kind !== "close") return;
    closeTickets(confirm.ids);
    toast.success(`${confirm.ids.length} check${confirm.ids.length === 1 ? "" : "s"} closed`);
    setSelected([]);
    setConfirm(null);
  };

  const finishClockOut = () => {
    if (!confirm || confirm.kind !== "clock-out") return;
    const mine = tickets.filter((ticket) => ticket.server === session.name);
    const summary: ShiftSummary = {
      name: session.name,
      hours: hoursSince(settings.clockedInAt),
      sales: mine.reduce((sum, ticket) => sum + ticket.total, 0),
      tips: mine.reduce((sum, ticket) => sum + (ticket.tips ?? 0), 0),
      checks: mine.filter((ticket) => ticket.closed).length,
    };
    setConfirm(null);
    if (!clockOut()) {
      toast.error("Clear your unpaid and open checks first");
      return;
    }
    setDone(summary);
  };

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 grid grid-cols-1 bg-gate-overlay p-6 opacity-70 md:grid-cols-2 md:gap-12 md:p-12">
        <ClockPanel gate className="hidden min-w-0 md:flex" />
        <PinPad
          pin=""
          onDigit={() => undefined}
          onClear={() => undefined}
          onEnter={() => undefined}
          onClockOut={() => undefined}
          onBreak={() => undefined}
          onClockIn={() => undefined}
          clockedIn
          revenueCenter={session.station ?? "Main dining"}
          className="mx-auto h-full max-h-[34rem] w-full max-w-[28rem]"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gate-overlay/80" />
      <main className="relative z-20 flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="clock-out-title"
          className="relative flex max-h-full w-full max-w-[46rem] flex-col overflow-visible rounded-md border border-border bg-surface shadow-xl"
        >
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Close clock out"
            onClick={() => navigate({ to: "/access/clock-in" })}
            className="absolute right-2 top-0 z-30 size-9 -translate-y-[calc(100%+0.375rem)] rounded-full sm:right-0 sm:translate-x-1/4"
          >
            <X />
          </Button>

          {done ? (
            <ShiftSummaryView summary={done} onExit={() => navigate({ to: "/access/clock-in", replace: true })} />
          ) : (
            <>
              <header className="shrink-0 border-b border-border px-3 pb-3 pt-4 sm:px-4">
                <div className="text-center">
                  <h1 id="clock-out-title" className="text-fs-lg font-extrabold text-foreground">Clock Out</h1>
                  <p className="mt-1 text-fs-xs text-muted-foreground">Complete your shift by transferring unpaid checks and closing open checks.</p>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-fs-xs font-extrabold text-foreground">{initials(session.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-fs-sm font-extrabold text-foreground">{greeting()}, {session.name}</span>
                    <span className="flex items-center gap-1 text-fs-xs text-muted-foreground"><Clock3 className="size-3" /> {settings.clockedInAt} → {now}</span>
                  </span>
                </div>
              </header>

              <div className="grid shrink-0 grid-cols-2 gap-2 px-3 pt-3 sm:px-4">
                <TabButton active={tab === "unpaid"} count={ownUnpaid.length} badge="bg-destructive text-destructive-foreground" label="Unpaid Checks" onClick={() => switchTab("unpaid")} />
                <TabButton active={tab === "open"} count={open.length} badge="bg-warning text-warning-foreground" label="Open Checks" onClick={() => switchTab("open")} />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-2 sm:px-4">
                {tipFor ? (
                  <TipEntry
                    digits={tipDigits}
                    onDigit={(digit) => setTipDigits((value) => `${value}${digit}`.replace(/^0+/, "").slice(0, 7))}
                    onClear={() => setTipDigits("")}
                    onBack={() => { setTipFor(null); setTipDigits(""); }}
                    onAdd={() => {
                      const amount = Number(tipDigits || 0) / 100;
                      if (!amount) return;
                      addTip(tipFor, amount);
                      setTipFor(null);
                      setTipDigits("");
                      setSelected([]);
                      toast.success("Tip added");
                    }}
                  />
                ) : (
                  <>
                    <SelectionBar count={visible.length} selected={selected.filter((id) => visible.some((ticket) => ticket.id === id)).length} checked={allSelected} onToggle={selectVisible} />
                    {visible.length ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {visible.map((ticket) => (
                          <CheckCard
                            key={ticket.id}
                            ticket={ticket}
                            active={selected.includes(ticket.id)}
                            status={cardStatus(ticket, tab)}
                            onClick={() => toggle(ticket.id)}
                          />
                        ))}
                      </div>
                    ) : tab === "open" ? (
                      <EmptyState label="No open checks" />
                    ) : (
                      <EmptyState label="No unpaid checks" />
                    )}

                    {tab === "unpaid" && transferGroups.length ? (
                      <TransferredGroups groups={transferGroups} selected={selected} onToggle={toggle} onSelectGroup={(group) => setSelected(group.every((ticket) => selected.includes(ticket.id)) ? selected.filter((id) => !group.some((ticket) => ticket.id === id)) : [...new Set([...selected, ...group.map((ticket) => ticket.id)])])} />
                    ) : null}
                  </>
                )}
              </div>

              {!tipFor ? (
                <footer className="relative shrink-0 border-t border-border p-3 sm:p-4">
                  {confirm ? (
                    <ConfirmPanel confirm={confirm} onCancel={() => setConfirm(null)} onConfirm={confirm.kind === "transfer" ? finishTransfer : confirm.kind === "close" ? finishClose : finishClockOut} />
                  ) : pickerOpen ? (
                    <EmployeePicker
                      list={employees}
                      current={session.name}
                      count={selected.length}
                      onCancel={() => setPickerOpen(false)}
                      onPick={(employee) => setConfirm({ kind: "transfer", employee, ids: [...selected], reassignment: selectedTickets.some((ticket) => Boolean(ticket.transferOrigin)) })}
                    />
                  ) : allClear ? (
                    <Button className={cn(actionClass, "w-full bg-primary text-primary-foreground")} onClick={() => setConfirm({ kind: "clock-out" })}>Clock Out</Button>
                  ) : selected.length && tab === "unpaid" ? (
                    <div className="flex gap-2">
                      {selectedOne && selectedOne.server === session.name ? (
                        <Button className={cn(actionClass, "bg-accent text-accent-foreground")} onClick={() => {
                          sessionStorage.setItem("pos:return-clock-out", "1");
                          openTicket(selectedOne.id);
                          void navigate({ to: "/payment/method" });
                        }}><CreditCard /> Charge</Button>
                      ) : null}
                      <Button variant="outline" className={actionClass} onClick={() => setPickerOpen(true)}><ArrowLeftRight /> {selectedTickets.some((ticket) => Boolean(ticket.transferOrigin)) ? "Reassign" : "Transfer"}{selected.length > 1 ? ` (${selected.length})` : ""}</Button>
                    </div>
                  ) : selected.length && tab === "open" ? (
                    <div className="flex gap-2">
                      {selectedOne && !selectedOne.tips ? (
                        <Button className={cn(actionClass, "bg-accent text-accent-foreground")} onClick={() => { setTipFor(selectedOne.id); setTipDigits(""); }}><Banknote /> Add Tip</Button>
                      ) : null}
                      <Button variant="outline" className={actionClass} onClick={() => setConfirm({ kind: "close", ids: [...selected] })}><ReceiptText /> Close Check{selected.length > 1 ? "s" : ""}</Button>
                    </div>
                  ) : (
                    <p className="text-center text-fs-xs font-bold text-muted-foreground">Select a check to continue</p>
                  )}
                </footer>
              ) : null}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function TabButton({ active, count, badge, label, onClick }: { active: boolean; count: number; badge: string; label: string; onClick: () => void }) {
  return <Button type="button" variant={active ? "default" : "secondary"} onClick={onClick} className={cn("h-9 rounded-full text-fs-xs font-extrabold", active && "text-primary-foreground")}><ReceiptText /> {label} {count ? <span className={cn("rounded px-1.5 py-0.5 text-[0.65rem]", active ? "bg-foreground text-background" : badge)}>{count}</span> : null}</Button>;
}

function SelectionBar({ count, selected, checked, onToggle }: { count: number; selected: number; checked: boolean; onToggle: () => void }) {
  if (!count) return null;
  return <div className="mb-2 flex min-h-7 items-center justify-between gap-2 text-fs-xs text-muted-foreground"><Button type="button" variant="ghost" size="sm" onClick={onToggle} className="h-7 gap-1 px-0 hover:bg-transparent hover:text-foreground"><span className={cn("grid size-4 place-items-center rounded-sm border", checked && "border-primary bg-primary text-primary-foreground")}>{checked ? <Check className="size-3" /> : null}</span>Select All ({count})</Button><span>{selected ? `${selected} check${selected === 1 ? "" : "s"} selected` : ""}</span></div>;
}

function CheckCard({ ticket, active, status, onClick, transferredTo }: { ticket: Ticket; active: boolean; status: { label: string; tone: string }; onClick: () => void; transferredTo?: string }) {
  return <Button type="button" variant="outline" onClick={onClick} className={cn("h-auto min-h-[4.1rem] w-full justify-start whitespace-normal rounded-md p-2 text-left", active && "border-primary ring-1 ring-primary", transferredTo && "opacity-80")}><span className="flex w-full flex-col gap-1"><span className="flex items-center justify-between gap-1"><span className="flex min-w-0 items-center gap-1 truncate text-[0.7rem] font-extrabold"><Utensils className="size-3 shrink-0" />{checkTitle(ticket)}</span><span className="shrink-0 text-fs-xs font-extrabold tabular-nums">{money(ticket.total)}</span></span><span className="flex items-center justify-between gap-1 text-[0.65rem] text-muted-foreground"><span className="flex min-w-0 items-center gap-1 truncate"><UserRound className="size-3 shrink-0" />{ticket.label}</span>{ticket.tips ? <span className="shrink-0 font-extrabold text-warning">Tip: {money(ticket.tips)}</span> : <span className={cn("shrink-0 font-extrabold uppercase", status.tone)}>{status.label}</span>}</span>{transferredTo ? <span className="text-right text-[0.62rem] text-muted-foreground">→ {transferredTo} · Tap to reassign</span> : null}</span></Button>;
}

function TransferredGroups({ groups, selected, onToggle, onSelectGroup }: { groups: [string, Ticket[]][]; selected: string[]; onToggle: (id: string) => void; onSelectGroup: (tickets: Ticket[]) => void }) {
  return <div className="mt-4"><div className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase text-muted-foreground"><span className="h-px flex-1 bg-border" />Transferred<span className="h-px flex-1 bg-border" /></div><div className="space-y-4">{groups.map(([employee, group]) => { const all = group.every((ticket) => selected.includes(ticket.id)); return <section key={employee}><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-2 text-fs-xs font-bold text-foreground"><span className="grid size-6 place-items-center rounded-full bg-muted text-[0.6rem]">{initials(employee)}</span>{employee} ({group.length} check{group.length === 1 ? "" : "s"})</span><Button variant="ghost" size="sm" className="h-7 text-[0.7rem]" onClick={() => onSelectGroup(group)}>{all ? "Deselect All" : "Select All"}</Button></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{group.map((ticket) => <CheckCard key={ticket.id} ticket={ticket} active={selected.includes(ticket.id)} status={{ label: "Transferred", tone: "text-muted-foreground" }} transferredTo={employee} onClick={() => onToggle(ticket.id)} />)}</div></section>; })}</div></div>;
}

function EmployeePicker({ list, current, count, onCancel, onPick }: { list: typeof employees; current: string; count: number; onCancel: () => void; onPick: (name: string) => void }) {
  return <div className="mx-auto max-w-md rounded-md border border-border bg-popover p-2 shadow-lg"><div className="flex items-center justify-between px-2 py-1"><span><strong className="block text-fs-sm text-foreground">Transfer to Employee</strong><small className="text-muted-foreground">{count} check{count === 1 ? "" : "s"} selected</small></span><Button variant="ghost" size="icon" className="size-8" onClick={onCancel}><X /></Button></div><div className="max-h-52 overflow-y-auto">{list.map((employee) => {
    const isCurrent = employee.name === current;
    const offShift = employee.state.startsWith("Clocked out");
    const blocked = isCurrent || offShift;
    return <Button key={employee.id} variant="ghost" disabled={blocked} className={cn("h-auto w-full justify-start gap-3 px-2 py-2 text-left", blocked && "opacity-50")} onClick={() => onPick(employee.name)}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[0.65rem] font-extrabold">{initials(employee.name)}</span><span className="min-w-0"><strong className="block truncate text-fs-xs text-foreground">{employee.name}{isCurrent ? <span className="ml-1 font-medium text-muted-foreground">(current)</span> : null}</strong><small className="flex items-center gap-1 text-muted-foreground"><span className="text-warning">{employee.role}</span><span aria-hidden>•</span><span>{offShift ? employee.state : employee.level}</span></small></span></Button>;
  })}</div></div>;
}

function ConfirmPanel({ confirm, onCancel, onConfirm }: { confirm: Exclude<ConfirmState, null>; onCancel: () => void; onConfirm: () => void }) {
  const transfer = confirm.kind === "transfer";
  const close = confirm.kind === "close";
  const count = transfer || close ? confirm.ids.length : 0;
  const plural = count === 1 ? "" : "s";
  const title = transfer
    ? confirm.reassignment ? "Check Already Transferred" : `You are about to transfer ${count} unpaid check${plural} to ${confirm.employee}.`
    : close ? `You are about to close ${count} open check${plural}.` : "Ready to clock out?";
  const detail = transfer
    ? confirm.reassignment ? `This check was transferred to ${confirm.employee}. Do you want to reassign it?` : "This action cannot be undone."
    : close ? "This action cannot be undone." : "This will end your current shift.";
  const label = transfer ? confirm.reassignment ? "Confirm Reassign" : "Confirm Transfer" : close ? "Confirm Close" : "Clock Out";
  return <div className="rounded-md border border-border bg-muted p-3"><div className="flex gap-2"><CircleDollarSign className="mt-0.5 size-4 shrink-0 text-warning" /><span><strong className="block text-fs-xs text-foreground">{title}</strong><small className="text-muted-foreground">{detail}</small></span></div><div className="mt-3 flex gap-2"><Button variant="outline" className={actionClass} onClick={onCancel}>Cancel</Button><Button className={actionClass} onClick={onConfirm}>{label}</Button></div></div>;
}

function TipEntry({ digits, onDigit, onClear, onBack, onAdd }: { digits: string; onDigit: (digit: string) => void; onClear: () => void; onBack: () => void; onAdd: () => void }) {
  const amount = Number(digits || 0) / 100;
  return <div className="mx-auto max-w-sm py-2"><div className="text-center"><p className="text-[0.65rem] font-bold uppercase text-muted-foreground">Tip Amount</p><p className="mt-1 text-fs-money font-extrabold tabular-nums text-foreground">{money(amount)}</p></div><div className="mx-auto mt-4 grid max-w-[18rem] grid-cols-3 gap-2">{["1","2","3","4","5","6","7","8","9","0","00"].map((digit) => <Button key={digit} variant="secondary" className="h-12 text-fs-lg font-extrabold" onClick={() => onDigit(digit)}>{digit}</Button>)}<Button variant="destructive" className="h-12 text-fs-lg font-extrabold" onClick={onClear}>C</Button></div><div className="mt-4 flex gap-2"><Button variant="outline" className={actionClass} onClick={onBack}>Back</Button><Button disabled={!amount} className={cn(actionClass, "bg-accent text-accent-foreground")} onClick={onAdd}><Banknote /> Add Tip</Button></div></div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="grid min-h-48 place-items-center text-center text-muted-foreground"><span><CircleDollarSign className="mx-auto size-10 opacity-40" /><span className="mt-2 block text-fs-sm">{label}</span></span></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border bg-background px-3 py-2 text-left"><dt className="text-[0.62rem] font-bold uppercase text-muted-foreground">{label}</dt><dd className="mt-0.5 text-fs-sm font-extrabold tabular-nums text-foreground">{value}</dd></div>;
}

function ShiftSummaryView({ summary, onExit }: { summary: ShiftSummary; onExit: () => void }) {
  return <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center sm:px-8">
    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-foreground text-background"><CircleDollarSign className="size-7" /></span>
    <span>
      <strong id="clock-out-title" className="block text-fs-xl font-extrabold text-foreground">Clocked Out!</strong>
      <small className="mt-0.5 block text-fs-sm text-muted-foreground">Great shift, {summary.name}</small>
    </span>
    <dl className="mt-2 grid w-full max-w-md grid-cols-2 gap-2">
      <SummaryRow label="Hours" value={summary.hours} />
      <SummaryRow label="Sales" value={money(summary.sales)} />
      <SummaryRow label="Tips" value={money(summary.tips)} />
      <SummaryRow label="Checks closed" value={String(summary.checks)} />
    </dl>
    <Button className={cn(actionClass, "w-full max-w-md bg-primary text-primary-foreground")} onClick={onExit}>Back to PIN screen</Button>
  </div>;
}
