import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Receipt } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import wordmark from "@/assets/eatos-wordmark-black.png.asset.json";
import { RECEIPT_DESIGNS, RECEIPT_TYPES, useReceiptSettings, type ReceiptPrefs, type ReceiptType } from "@/lib/receipt-settings";
import { cn } from "@/lib/utils";

function Chips<T extends string>({ value, options, onChange, label, round }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string; round?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={cn("min-h-9 border border-border t-caption transition-colors", round ? "size-9 rounded-full" : "rounded-full px-3",
            value === o.id ? "border-foreground bg-foreground text-background" : "bg-surface text-foreground hover:bg-muted")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ReceiptSettings() {
  const navigate = useNavigate();
  const [type, setType] = useState<ReceiptType | null>(null);
  if (type) return <ReceiptTypeScreen type={type} onBack={() => setType(null)} />;
  return <>
    <SubHeader title="Receipts" backLabel="Payments" onBack={() => navigate({ to: "/settings/payments" })} />
    <ScreenBody className="py-4">
      <Caption>Choose a named design per channel. Designs apply to emulator print preview today. Physical printers stay Classic Thermal until a later release. Email/SMS store the preference now and use the same design when a text body path exists.</Caption>
      <GroupCard className="mt-3">
        {RECEIPT_TYPES.map((t) => (
          <Button key={t.id} variant="ghost" onClick={() => setType(t.id)} className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`}>
            <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-foreground"><Receipt className="size-4" /></span>
            <span className="min-w-0 flex-1 text-left t-row">{t.title}</span><ChevronRight />
          </Button>
        ))}
      </GroupCard>
    </ScreenBody>
  </>;
}

function ReceiptTypeScreen({ type, onBack }: { type: ReceiptType; onBack: () => void }) {
  const { all, update } = useReceiptSettings();
  const prefs = all[type];
  const meta = RECEIPT_TYPES.find((t) => t.id === type)!;
  const set = (p: Partial<ReceiptPrefs>) => update(type, p);
  return <>
    <SubHeader title={meta.title} backLabel="Receipts" onBack={onBack} />
    <ScreenBody className="py-4">
      <Caption>{meta.description}</Caption>
      <GroupCard className="mt-3">
        <div className="space-y-2 px-4 py-3">
          <Chips label="Design" value={prefs.design} options={RECEIPT_DESIGNS} onChange={(design) => set({ design })} />
          <p className="t-caption text-muted-foreground">{RECEIPT_DESIGNS.find((d) => d.id === prefs.design)!.note}</p>
        </div>
      </GroupCard>
      <GroupCard className="mt-4">
        <label className={settingsRowClass}><span className="min-w-0 flex-1 t-row">Show store logo</span>
          <Switch aria-label="Show store logo" checked={prefs.logo} onCheckedChange={(logo) => set({ logo })} /></label>
        <div className={cn(settingsRowClass, "flex-wrap")}><span className="min-w-0 flex-1 t-row">Font style</span>
          <Chips label="Font style" value={prefs.fontStyle} options={[{ id: "thermal", label: "Thermal" }, { id: "clean", label: "Clean" }]} onChange={(fontStyle) => set({ fontStyle })} /></div>
        <div className={cn(settingsRowClass, "flex-wrap border-b-0")}><span className="min-w-0 flex-1 t-row">Font size</span>
          <Chips round label="Font size" value={prefs.fontSize} options={(["S", "M", "L"] as const).map((s) => ({ id: s, label: s }))} onChange={(fontSize) => set({ fontSize })} /></div>
      </GroupCard>
      <GroupLabel>Live preview</GroupLabel>
      <ReceiptPreview type={type} prefs={prefs} />
      <Caption>Demo only — nothing prints, emails or texts, and checkout receipts are unchanged.</Caption>
    </ScreenBody>
  </>;
}

const items = [{ qty: 1, name: "Tanqueray Gin Seville", price: 3.5 }, { qty: 1, name: "House Fries", price: 4 }];

function ReceiptPreview({ type, prefs }: { type: ReceiptType; prefs: ReceiptPrefs }) {
  const { design } = prefs;
  const full = design === "classic";
  const total = type === "payment" ? 3.5 : 7.5;
  const lines = type === "payment" ? items.slice(0, 1) : items;
  const vat = Math.round((total - total / 1.1) * 100) / 100;
  const sep = design === "bistro" ? null : <div aria-hidden>------------</div>;
  const orderTable = <><div>Order: 98</div><div>Table: 12</div></>;
  const size = { S: "text-[10px]", M: "text-[12px]", L: "text-[14px]" }[prefs.fontSize];
  const row = (l: string, r: string, strong = false) => <div className={cn("flex justify-between gap-4", strong && design === "bistro" && "font-bold")}><span>{l}</span><span>{r}</span></div>;
  return (
    <div className="mx-auto w-full max-w-xs rounded-card border border-border bg-muted p-3">
      <div data-testid="receipt-preview" className={cn("rounded-sm bg-surface p-4 leading-snug text-foreground shadow-sm", size, prefs.fontStyle === "thermal" ? "font-mono" : "font-sans")}>
        {prefs.logo && <img src={wordmark.url} alt="eatOS" className="mx-auto mb-3 h-6 w-auto dark:invert" />}
        {type === "kot" ? <>
          <div className="font-bold">KITCHEN</div>
          {design === "guest" && orderTable}
          {full && <><div>Device: Dining Room POS</div><div>Printer: Emulator</div></>}
          {design !== "guest" && orderTable}
          {sep}
          {items.map((i) => <div key={i.name}>{i.qty}x {i.name}</div>)}
          {sep}
          <div className="font-bold">FIRE NOW</div>
        </> : <>
          {design === "guest" && orderTable}
          <div className="font-bold">eatOS Demo</div>
          {design !== "compact" && <div>Boulton Road</div>}
          {full && <><div>Device: Dining Room POS</div><div>Printer: Emulator</div></>}
          {design !== "guest" && orderTable}
          {sep}
          {row("QTY ITEMS", "AMOUNT")}
          {lines.map((i) => row(`${i.qty} ${i.name}`, `$${i.price.toFixed(2)}`))}
          {row("SUBTOTAL", `$${(total - vat).toFixed(2)}`)}
          {row("VAT @ 10.00%", `$${vat.toFixed(2)}`)}
          {row("TOTAL DUE", `$${total.toFixed(2)}`, true)}
          {type === "payment" && <div>Paid: ${total.toFixed(2)} CARD</div>}
          <div>Thanks for visiting!</div>
        </>}
        <p className="mt-3 font-sans text-[10px] text-muted-foreground">Sample preview — not a physical print</p>
      </div>
    </div>
  );
}
