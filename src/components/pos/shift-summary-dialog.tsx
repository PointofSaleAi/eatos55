import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ChevronDown, Printer } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { WheelTimePicker } from "@/components/pos/time-picker";
import { EMark } from "@/components/pos/brand";
import { usePos } from "@/lib/pos-store";
import { formatMoney } from "@/lib/brand";
import type { Ticket } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dmy = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

function toMinutes(stamp: string): number | null {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(stamp);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3]?.toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

const field =
  "flex h-10 items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-[0.8125rem] font-semibold text-foreground hover:bg-muted";

type Filters = {
  range: DateRange;
  employees: string[];
  start: string;
  end: string;
  tips: string[];
  centre: string | null;
};

export function computeShiftSummary(tickets: Ticket[], f: Filters) {
  const from = f.range.from ? iso(f.range.from) : "";
  const to = f.range.to ? iso(f.range.to) : from;
  const startM = toMinutes(f.start) ?? 0;
  const endM = toMinutes(f.end) ?? 1439;
  const list = tickets.filter((t) => {
    if (t.paymentType === "Unpaid" || t.refund) return false;
    if (from && (t.date < from || t.date > to)) return false;
    if (f.employees.length && !f.employees.includes(t.server)) return false;
    if (f.centre && t.revenueCenter !== f.centre) return false;
    const m = toMinutes(t.arrivedAt);
    if (m != null && (m < startM || m > endM)) return false;
    const tipped = (t.tips ?? 0) > 0;
    if (f.tips.length === 1 && (f.tips[0] === "Tipout") !== tipped) return false;
    return true;
  });
  const rows = new Map<string, { qty: number; amount: number; tip: number }>();
  for (const t of list) {
    const type = t.paymentType ?? "Card";
    const r = rows.get(type) ?? { qty: 0, amount: 0, tip: 0 };
    r.qty += 1;
    r.amount += t.total;
    r.tip += t.tips ?? 0;
    rows.set(type, r);
  }
  const pick = (k: string) => rows.get(k) ?? { qty: 0, amount: 0, tip: 0 };
  const card = pick("Card");
  const cash = pick("Cash");
  const totalSales = list.reduce((s, t) => s + t.total, 0);
  const totalTips = list.reduce((s, t) => s + (t.tips ?? 0), 0);
  return {
    rows: [...rows.entries()],
    stats: [
      ["Total Card Sales", card.amount],
      ["Total Cash Sales", cash.amount],
      ["Total Sales", totalSales],
      ["Cash Tips", cash.tip],
      ["Card Tips", card.tip],
      ["Total Tips", totalTips],
    ] as const,
    cashOnHand: cash.amount - cash.tip,
    cashDrop: 0,
  };
}

function MultiSelect({
  label,
  options,
  value,
  onChange,
  single,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  single?: boolean;
}) {
  const shown = value.length === 0 ? label : single ? value[0] : value.length === 1 ? value[0] : `${value.length} selected`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={cn(field, "min-w-[9rem] max-w-[14rem]")}>
          <span className="truncate">{shown}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-72 w-60 overflow-y-auto p-1">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(single ? (on ? [] : [o]) : on ? value.filter((v) => v !== o) : [...value, o])}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[0.8125rem] hover:bg-muted"
            >
              <Checkbox checked={on} className="pointer-events-none" />
              <span className="min-w-0 break-words">{o}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export function ShiftSummaryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { tickets, session, settings } = usePos();
  const today = useMemo(() => new Date(), []);
  const [filters, setFilters] = useState<Filters>({
    range: { from: today, to: today },
    employees: [session.name],
    start: "12:00 AM",
    end: "11:59 PM",
    tips: [],
    centre: null,
  });
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(filters.range);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeStep, setTimeStep] = useState<null | "start" | "end">(null);
  const [draftTime, setDraftTime] = useState({ start: filters.start, end: filters.end });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(id);
  }, [open, filters]);

  const employees = useMemo(() => {
    const names = new Set<string>([session.name]);
    settings.workforceEmployees.filter((e) => !e.archived).forEach((e) => names.add(`${e.firstName} ${e.lastName}`.trim()));
    tickets.forEach((t) => names.add(t.server));
    return [...names];
  }, [session.name, settings.workforceEmployees, tickets]);
  const centres = useMemo(
    () => [...new Set(tickets.map((t) => t.revenueCenter).filter(Boolean) as string[])],
    [tickets],
  );
  const summary = useMemo(() => computeShiftSummary(tickets, filters), [tickets, filters]);
  const set = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));
  const rangeLabel = `${filters.range.from ? dmy(filters.range.from) : ""} - ${filters.range.to ? dmy(filters.range.to) : filters.range.from ? dmy(filters.range.from) : ""}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-xl">
        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-[1.125rem] font-extrabold uppercase tracking-wide">Shift Summary</DialogTitle>
            <Button
              variant="outline"
              size="icon"
              aria-label="Print shift summary"
              className="size-10 shrink-0"
              onClick={() => toast.success("Shift summary sent to printer (demo)")}
            >
              <Printer className="size-5" />
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Popover
              open={dateOpen}
              onOpenChange={(o) => {
                setDateOpen(o);
                if (o) setDraftRange(filters.range);
              }}
            >
              <PopoverTrigger asChild>
                <button type="button" className={cn(field, "min-w-[12rem]")}>
                  <span className="tabular-nums">{rangeLabel}</span>
                  <CalendarDays className="size-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <div className="bg-foreground px-4 py-3 text-background">
                  <p className="text-[0.625rem] font-bold uppercase tracking-wider opacity-70">Select range</p>
                  <p className="text-[0.9375rem] font-semibold">
                    {draftRange?.from ? dmy(draftRange.from) : "Start Date"} – {draftRange?.to ? dmy(draftRange.to) : "End Date"}
                  </p>
                </div>
                <Calendar mode="range" selected={draftRange} onSelect={setDraftRange} defaultMonth={filters.range.from ?? today} className="pointer-events-auto p-3" />
                <div className="flex justify-end gap-2 border-t border-border p-2">
                  <Button variant="ghost" size="sm" onClick={() => setDateOpen(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    disabled={!draftRange?.from}
                    onClick={() => {
                      if (draftRange?.from) set({ range: { from: draftRange.from, to: draftRange.to ?? draftRange.from } });
                      setDateOpen(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <MultiSelect label="Employees" options={employees} value={filters.employees} onChange={(v) => set({ employees: v })} />

            <button
              type="button"
              className={field}
              onClick={() => {
                setDraftTime({ start: filters.start, end: filters.end });
                setTimeStep("start");
              }}
            >
              <span className="tabular-nums">{filters.start} - {filters.end}</span>
            </button>

          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <MultiSelect label="Select Tip" options={["Tipout", "No Tipout"]} value={filters.tips} onChange={(v) => set({ tips: v })} />
            <MultiSelect
              single
              label="Select Revenue Center"
              options={centres}
              value={filters.centre ? [filters.centre] : []}
              onChange={(v) => set({ centre: v[0] ?? null })}
            />
          </div>

          <div className="mt-5 border-t-2 border-border" />

          {loading ? (
            <div className="flex justify-center py-14" aria-live="polite" aria-label="Loading shift summary">
              <EMark className="size-14 animate-pulse" />
            </div>
          ) : (
            <div className="pt-4">
              <div className="grid grid-cols-3 gap-x-4 gap-y-3 sm:flex sm:justify-end sm:gap-6">
                {summary.stats.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <p className="text-[0.625rem] font-bold text-muted-foreground">{label}</p>
                    <p className="text-[1rem] font-extrabold tabular-nums">{formatMoney(value)}</p>
                  </div>
                ))}
              </div>

              <table className="mt-5 w-full text-[0.875rem]">
                <thead>
                  <tr className="border-b-2 border-foreground text-left">
                    <th className="py-2 font-bold">Type</th>
                    <th className="py-2 text-center font-bold">Quantity</th>
                    <th className="py-2 text-center font-bold">Amount</th>
                    <th className="py-2 text-right font-bold">Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary.rows.length ? summary.rows : [["", { qty: 0, amount: 0, tip: 0 }] as const]).map(([type, r]) => (
                    <tr key={type || "empty"} className="border-b border-border">
                      <td className="py-2.5">{type}</td>
                      <td className="py-2.5 text-center tabular-nums">{r.qty}</td>
                      <td className="py-2.5 text-center tabular-nums">{formatMoney(r.amount)}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatMoney(r.tip)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end gap-8 border-b-2 border-foreground pb-4">
                <div>
                  <p className="text-[0.625rem] font-bold text-muted-foreground">Total Cash On Hand</p>
                  <p className="text-[1.125rem] font-extrabold tabular-nums">{formatMoney(summary.cashOnHand)}</p>
                </div>
                <div>
                  <p className="text-[0.625rem] font-bold text-muted-foreground">Cash Drop</p>
                  <p className="text-[1.125rem] font-extrabold tabular-nums">{formatMoney(summary.cashDrop)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Dialog open={timeStep !== null} onOpenChange={(o) => !o && setTimeStep(null)}>
          <DialogContent className="max-w-sm">
            <DialogTitle className="text-[0.9375rem] font-bold">
              {timeStep === "end" ? "Select End Time" : "Select Start Time"}
            </DialogTitle>
            {timeStep && (
              <WheelTimePicker
                key={timeStep}
                value={draftTime[timeStep]}
                onChange={(v) => setDraftTime((d) => ({ ...d, [timeStep]: v }))}
              />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setTimeStep(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (timeStep === "start") return setTimeStep("end");
                  set({ start: draftTime.start, end: draftTime.end });
                  setTimeStep(null);
                }}
              >
                {timeStep === "start" ? "Next" : "OK"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
