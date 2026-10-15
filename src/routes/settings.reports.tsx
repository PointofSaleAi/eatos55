import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronRight, Printer } from "lucide-react";
import { toast } from "sonner";
import { brand } from "@/lib/brand";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconToggleRow, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WheelTimePicker } from "@/components/pos/time-picker";
import { TENDER_LABELS, usePos, type TenderId } from "@/lib/pos-store";
import { menuModes } from "@/lib/demo-data";
import { useTapToPayTenderVisible } from "@/lib/device";
import { defaultSalesPreferences, type SalesPreferences } from "@/lib/sales-settings";
import { cn } from "@/lib/utils";

const fieldLabels = {
  startDate: "Start Date", endDate: "End Date", startTime: "Start Time", endTime: "End Time",
  serviceCharge: "Service Charge", orderType: "Order Type", paymentMethod: "Payment Method", discountType: "Discount Type",
} as const;
type Field = keyof typeof fieldLabels;
const switches = [
  ["discount", "Discount"], ["promoCode", "Promo Code"], ["includeServiceCharge", "Service Charge"],
  ["refund", "Refund"], ["vatInNet", "VAT in Net"], ["roomCharge", "Room Charge"],
] as const;
const displayDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
};

export const Route = createFileRoute("/settings/reports")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Sales - ${brand.appName} Handheld` },
      { name: "description", content: "Daily sales balancing, date ranges and sales report options for this venue." },
      { property: "og:title", content: `Sales - ${brand.appName} Handheld` },
      {
        property: "og:description",
        content: "Daily sales balancing, date ranges and sales report options for this venue.",
      },
    ],
  }),
  component: Sales,
});

function Sales() {
  const { settings, updateSettings } = usePos();
  const tapVisible = useTapToPayTenderVisible();
  const preferences = { ...defaultSalesPreferences, ...settings.salesPreferences };
  const [editor, setEditor] = useState<Field | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const save = (patch: Partial<SalesPreferences>) => updateSettings({ salesPreferences: { ...preferences, ...patch } });
  const open = (field: Field) => { setDraft(preferences[field]); setError(""); setEditor(field); };
  const isDate = editor === "startDate" || editor === "endDate";
  const isTime = editor === "startTime" || editor === "endTime";
  const options = editor === "serviceCharge" ? ["All", ...settings.serviceCharges.map((item) => item.name)]
    : editor === "orderType" ? ["All", ...menuModes.map((mode) => mode.name)]
    : editor === "paymentMethod" ? ["All", ...Object.entries(TENDER_LABELS).filter(([id]) => settings.tenders[id as TenderId] && (id !== "tap-to-pay" || tapVisible)).map(([, label]) => label)]
    : editor === "discountType" ? ["Select", "All", ...settings.discounts.map((item) => item.name)] : [];
  const row = (field: Field) => <Button key={field} variant="ghost" onClick={() => open(field)}
    className={cn(settingsRowClass, "h-auto justify-start rounded-none whitespace-normal font-normal")}>
    <span className="min-w-0 flex-1 t-row">{fieldLabels[field]}</span>
    <span className="max-w-[55%] break-words text-right t-value text-muted-foreground">{field.endsWith("Date") ? displayDate(preferences[field]) : preferences[field]}</span>
    <ChevronRight className="text-muted-foreground" />
  </Button>;
  return (
    <>
      <SubHeader title="Sales" backLabel="Settings" backTo="/settings" />
      <ScreenBody className="py-4">
        <div className="flex items-start justify-between gap-4 pb-4">
          <p className="px-1 text-fs-sm leading-relaxed text-muted-foreground">Daily sales balancing view with summary, category sales, and payment methods for the selected period.</p>
          <Button size="icon" className="size-11 shrink-0" aria-label="Print sales report" title="Print sales report"
            onClick={() => toast.info("Demo only: live sales reports and printing are not connected.")}><Printer /></Button>
        </div>
        <p className="pb-5 text-center t-row text-muted-foreground">No sales report loaded</p>
        <GroupCard>
          {(["startDate", "endDate", "startTime", "endTime"] as const).map(row)}
        </GroupCard>
        <GroupCard className="mt-4">{(["serviceCharge", "orderType", "paymentMethod", "discountType"] as const).map(row)}</GroupCard>
        <GroupCard className="mt-4">{switches.map(([key, label]) => <IconToggleRow key={key} title={label} checked={preferences[key]} onChange={(checked) => save({ [key]: checked })} />)}</GroupCard>
      </ScreenBody>
      <Dialog open={editor !== null} onOpenChange={(open) => { if (!open) setEditor(null); }}>
        <DialogContent className="rounded-lg">
          <DialogTitle>{editor ? fieldLabels[editor] : "Sales"}</DialogTitle>
          <DialogDescription>Choose the sales report {isDate ? "date" : isTime ? "time" : "filter"}.</DialogDescription>
          {isDate ? <Input type="date" aria-label={editor ? fieldLabels[editor] : "Date"} value={draft} onChange={(event) => { setDraft(event.target.value); setError(""); }} />
            : isTime ? <WheelTimePicker value={draft} onChange={setDraft} />
            : <div className="max-h-72 overflow-y-auto">{[...new Set(options)].map((option) => <Button key={option} variant="ghost" className="h-auto min-h-11 w-full justify-between whitespace-normal text-left" onClick={() => { if (editor) save({ [editor]: option }); setEditor(null); }}>
              {option}{editor && preferences[editor] === option && <Check />}
            </Button>)}</div>}
          {error && <p role="alert" className="text-fs-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditor(null)}>Cancel</Button>
            {(isDate || isTime) && <Button onClick={() => {
              if (!editor || !draft) { setError("Choose a value."); return; }
              const next = { ...preferences, [editor]: draft };
              if (next.startDate > next.endDate) { setError("End Date must be on or after Start Date."); return; }
              save({ [editor]: draft }); setEditor(null);
            }}>{isTime ? "Set Time" : "Set Date"}</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
