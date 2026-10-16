import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownUp, Check, ChevronRight, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { employees } from "@/lib/demo-data";
import { formatMoney } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import { moneyDigitsToAmount, popMoneyDigit, pushMoneyDigit } from "@/lib/money-entry";
import { PAY_IN_REASONS, PAY_OUT_REASONS, todayKey, useCashManagement } from "@/lib/cash-management";
import { cn } from "@/lib/utils";

/** Cash-register style text input: digits fill from the right. */
function MoneyInput({ digits, onChange, label, autoFocus }: { digits: string; onChange: (d: string) => void; label: string; autoFocus?: boolean }) {
  return (
    <input aria-label={label} inputMode="numeric" autoFocus={autoFocus} value={formatMoney(moneyDigitsToAmount(digits))}
      className="min-h-11 min-w-0 flex-1 bg-transparent text-right t-value outline-none"
      onKeyDown={(e) => {
        if (/^\d$/.test(e.key)) { e.preventDefault(); onChange(pushMoneyDigit(digits, e.key)); }
        else if (e.key === "Backspace") { e.preventDefault(); onChange(popMoneyDigit(digits)); }
      }}
      onChange={(e) => onChange(pushMoneyDigit("", e.target.value.replace(/\D/g, "")))} />
  );
}

const th = "px-3 py-2 t-caption font-medium text-muted-foreground";
const td = "px-3 py-3 t-value";

export function CashManagement() {
  const navigate = useNavigate();
  const { settings, session, canManageSettings } = usePos();
  const cash = useCashManagement();
  const me = session.name || "Manager";
  const [digits, setDigits] = useState("");
  const amount = moneyDigitsToAmount(digits);
  const [view, setView] = useState<null | "in" | "out">(null);
  const [tillOpen, setTillOpen] = useState(false);
  const [tillDigits, setTillDigits] = useState("");
  const [disclaimer, setDisclaimer] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [date, setDate] = useState(todayKey());
  const logs = cash.state.logs.filter((l) => l.date === date);

  if (view) return <PayScreen kind={view} amount={amount} onBack={() => setView(null)}
    onDone={(emp, reason, note) => { cash.record(view, amount, emp, reason, note); setDigits(""); setView(null); toast.success(view === "in" ? "Pay in recorded" : "Pay out recorded"); }} tips={cash.state.tips} />;

  const needAmount = (kind: "in" | "out") => {
    if (!cash.state.tillOpen) { toast.error("Open the till balance first"); return; }
    if (amount <= 0) { toast.error("Enter an amount first"); return; }
    if (kind === "out" && amount > cash.estimated) { toast.error("Pay out is more than the cash in drawer"); return; }
    setView(kind);
  };
  const disabled = !canManageSettings;

  return <>
    <SubHeader title="Cash Management" backLabel="Payments" onBack={() => navigate({ to: "/settings/payments" })} />
    <ScreenBody className="py-4">
      <Caption>Cash Management involves optimizing the handling of cash flows, liquidity, and investments to enhance financial efficiency and stability.</Caption>
      <GroupCard className="mt-3">
        <Button variant="ghost" className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`} onClick={() => navigate({ to: "/settings/detail/$topic", params: { topic: "cash-drawer" } })}>
          <span className="min-w-0 flex-1 text-left t-row">Cash Drawer</span><span className="t-value text-muted-foreground">{settings.cashDrawerAssigned}</span><ChevronRight />
        </Button>
      </GroupCard>
      <GroupCard className="mt-4">
        {[["Previous Day's Closing Balance", cash.state.previousClose], ["Estimated Cash in Drawer", cash.estimated], ["Opening Till Balance", cash.state.openingTill]].map(([l, v]) =>
          <div key={l as string} className={settingsRowClass}><span className="min-w-0 flex-1 t-row">{l}</span><span className="t-value text-muted-foreground">{formatMoney(v as number)}</span></div>)}
      </GroupCard>
      <GroupCard className="mt-4">
        <div className={settingsRowClass}>
          <span className="shrink-0 t-row">Pay In / Pay Out</span>
          <MoneyInput label="Pay in or pay out amount" digits={digits} onChange={setDigits} />
          {digits && <Button variant="ghost" size="icon" aria-label="Clear amount" onClick={() => setDigits("")}><XCircle className="text-muted-foreground" /></Button>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {([["Pay In", () => needAmount("in"), false], ["Pay Out", () => needAmount("out"), false],
            ["Open Till Balance", () => { setTillDigits(""); setTillOpen(true); }, cash.state.tillOpen],
            ["Close", () => setCloseConfirm(true), !cash.state.tillOpen]] as const).map(([label, fn, off], i) =>
            <Button key={label} variant="ghost" disabled={disabled || off} onClick={fn}
              className={cn("min-h-12 rounded-none border-border t-row whitespace-normal hover:bg-muted", i % 2 === 1 && "border-l", i >= 2 && "border-t sm:border-t-0", i === 2 && "sm:border-l")}>{label}</Button>)}
        </div>
      </GroupCard>
      {disabled && <Caption>Only managers can use cash management.</Caption>}

      <GroupLabel>Cash Logs</GroupLabel>
      <GroupCard>
        <label className={settingsRowClass}><span className="min-w-0 flex-1 t-row">Select Date</span>
          <input type="date" aria-label="Select date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="min-h-11 bg-transparent t-value text-muted-foreground" />
        </label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left">
            <thead><tr className="border-b border-border"><th className={th}>Time</th><th className={th}>Name</th><th className={th}>Reason</th><th className={cn(th, "text-right")}>Pay In</th><th className={cn(th, "text-right")}>Pay Out</th></tr></thead>
            <tbody>{logs.map((l) => <tr key={l.id} className="border-b border-border last:border-0">
              <td className={td}>{l.time}</td><td className={td}>{l.name}</td><td className={td}>{l.reason}{l.note && <span className="block t-caption text-muted-foreground">{l.note}</span>}</td>
              <td className={cn(td, "text-right")}>{formatMoney(l.payIn)}</td><td className={cn(td, "text-right")}>{l.payOut ? `-${formatMoney(l.payOut)}` : formatMoney(0)}</td></tr>)}
              {logs.length === 0 && <tr><td colSpan={5} className={cn(td, "text-center text-muted-foreground")}>No cash activity on this date</td></tr>}
            </tbody>
          </table>
        </div>
      </GroupCard>

      <GroupLabel>Employee Tips</GroupLabel>
      <GroupCard>
        <table className="w-full text-left">
          <thead><tr className="border-b border-border"><th className={th}>Name</th><th className={cn(th, "text-right")}>Cash Tips</th><th className={cn(th, "text-right")}>Non Cash Tips</th></tr></thead>
          <tbody>{employees.map((e) => <tr key={e.id} className="border-b border-border last:border-0"><td className={td}>{e.name}</td><td className={cn(td, "text-right")}>{formatMoney(cash.state.tips[e.id] ?? 0)}</td><td className={cn(td, "text-right")}>{formatMoney(0)}</td></tr>)}</tbody>
        </table>
      </GroupCard>
      <Caption>Demo only — no real cash drawer opens and checkout totals are not changed.</Caption>
    </ScreenBody>

    <Dialog open={tillOpen} onOpenChange={setTillOpen}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Opening Till Balance</DialogTitle>
        <DialogDescription className="sr-only">Enter the starting cash amount</DialogDescription>
        <div className="flex items-center gap-2 rounded-md border border-border px-3"><span className="t-row">Enter Amount</span>
          <MoneyInput autoFocus label="Opening till amount" digits={tillDigits} onChange={setTillDigits} />
          {tillDigits && <Button variant="ghost" size="icon" aria-label="Clear amount" onClick={() => setTillDigits("")}><XCircle className="text-muted-foreground" /></Button>}
        </div>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setTillOpen(false)}>Back</Button>
          <Button disabled={!tillDigits} onClick={() => { setTillOpen(false); setDisclaimer(true); }}>Yes</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={disclaimer} onOpenChange={setDisclaimer}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Disclaimer</DialogTitle>
        <DialogDescription className="text-center">Please note, once the open till balance has been added it cannot be adjusted. Should you require to adjust, you will need to close the drawer first and re-select open till balance.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setDisclaimer(false)}>No</Button>
          <Button onClick={() => { cash.openTill(moneyDigitsToAmount(tillDigits), me); setDisclaimer(false); toast.success(`Till opened with ${formatMoney(moneyDigitsToAmount(tillDigits))}`); }}>Yes</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={closeConfirm} onOpenChange={setCloseConfirm}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogTitle className="text-center">Close Drawer</DialogTitle>
        <DialogDescription className="text-center">{formatMoney(cash.estimated)} will be recorded as the closing balance.</DialogDescription>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setCloseConfirm(false)}>Cancel</Button>
          <Button onClick={() => { cash.closeDrawer(me); setCloseConfirm(false); toast.success("Drawer closed successfully"); }}>Close Drawer</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}

function PayScreen({ kind, amount, onBack, onDone, tips }: {
  kind: "in" | "out"; amount: number; tips: Record<string, number>; onBack: () => void;
  onDone: (emp: { id: string; name: string }, reason: string, note: string) => void;
}) {
  const [q, setQ] = useState("");
  const [asc, setAsc] = useState(true);
  const [emp, setEmp] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const reasons = kind === "in" ? PAY_IN_REASONS : PAY_OUT_REASONS;
  const list = useMemo(() => employees.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (asc ? 1 : -1) * a.name.localeCompare(b.name)), [q, asc]);
  const chosen = employees.find((e) => e.id === emp);
  const needNote = reason === "Other" && !note.trim();
  return <>
    <SubHeader title={kind === "in" ? "Pay In" : "Pay Out"} backLabel="Cash Management" onBack={onBack} />
    <ScreenBody className="py-4">
      <p className="t-row">{kind === "in" ? "Select an employee to receive pay in" : "Select an employee for pay out"} · <span className="text-muted-foreground">{formatMoney(amount)}</span></p>
      <div className="mt-3 flex gap-2">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-md bg-muted px-3"><Search className="size-4 text-muted-foreground" />
          <input aria-label="Search employees" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="min-w-0 flex-1 bg-transparent t-value outline-none" /></label>
        <Button variant="outline" size="icon" className="size-11" aria-label="Sort by name" onClick={() => setAsc((v) => !v)}><ArrowDownUp /></Button>
      </div>
      <GroupCard className="mt-3">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border px-4 py-2 t-caption text-muted-foreground"><span>Name</span><span className="w-20 text-right">Cash Tips</span><span className="w-24 text-right">Other Amount</span></div>
        {list.map((e) => <button key={e.id} type="button" onClick={() => setEmp(e.id)} aria-pressed={emp === e.id}
          className="grid min-h-11 w-full grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border px-4 py-2 text-left last:border-0 hover:bg-muted">
          <span className="t-row">{e.name}</span><span className="w-20 text-right t-value">{(tips[e.id] ?? 0).toFixed(2)}</span>
          <span className="flex w-24 items-center justify-end gap-1 t-value">0.00{emp === e.id && <Check className="size-4" />}</span></button>)}
      </GroupCard>
      <GroupLabel>{kind === "in" ? "Reason for the pay in" : "Reason for the payout"}</GroupLabel>
      <GroupCard>{reasons.map((r) => <button key={r} type="button" onClick={() => setReason(r)} aria-pressed={reason === r}
        className={cn(settingsRowClass, "w-full text-left hover:bg-muted")}><span className="flex-1 t-row">{r}</span>{reason === r && <Check className="size-4" />}</button>)}</GroupCard>
      <GroupLabel>Notes</GroupLabel>
      <GroupCard><textarea aria-label="Notes" placeholder={reason === "Other" ? "Add a note (required)" : "Add a note"} value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full resize-none bg-transparent px-4 py-3 t-value outline-none" /></GroupCard>
      <Button className="mt-6 min-h-ctl-lg w-full" disabled={!chosen || !reason || needNote}
        onClick={() => chosen && reason && onDone(chosen, reason, note.trim())}>{kind === "in" ? "Pay In" : "Pay Out"} {formatMoney(amount)}</Button>
    </ScreenBody>
  </>;
}
