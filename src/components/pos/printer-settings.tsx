import { useState } from "react";
import { ChevronRight, Copy, Minus, Plus, Printer } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, IconNavRow, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";
import { brand } from "@/lib/brand";
import { defaultPrinterPreferences, printerSettingGroups, type PrinterPreferences, type PrinterToggleKey, type PrinterCopiesKey } from "@/lib/printer-settings";

type Editor = "detect" | "test" | "modifierSize" | "printWith" | "salesOver";
const editorTitles: Record<Editor, string> = {
  detect: "Detect Printer", test: "Test Printer", modifierSize: "Kitchen Order Ticket Modifier Size",
  printWith: "Kitchen Order Ticket Print With", salesOver: "For Sales Over",
};

export function Printers() {
  return <>
    <SubHeader title="Printers" backLabel="Hardware" backTo="/settings/hardware" />
    <ScreenBody>
      <GroupCard>
        <IconNavRow title="Paired Printers" icon={Printer} color="magenta" topic="paired-printers" />
        <IconNavRow title="Advanced Settings" icon={Copy} color="violet" topic="printer-advanced" />
      </GroupCard>
    </ScreenBody>
  </>;
}

export function PrinterSettings({ paired = false }: { paired?: boolean }) {
  const { settings, updateSettings, canManageSettings } = usePos();
  const preferences = { ...defaultPrinterPreferences, ...settings.printerPreferences };
  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState("");
  const [sizeDraft, setSizeDraft] = useState<string[]>([]);
  const [error, setError] = useState("");
  const save = (patch: Partial<PrinterPreferences>) => {
    if (canManageSettings) updateSettings({ printerPreferences: { ...preferences, ...patch } });
  };
  const open = (key: Editor) => {
    setDraft(key === "salesOver" ? preferences.salesOver.toFixed(2) : key === "printWith" ? preferences.printWith.join(", ") : "");
    setSizeDraft([...preferences.modifierSize]); setError(""); setEditor(key);
  };
  const toggle = (key: PrinterToggleKey, label: string) => <div key={key} className={settingsRowClass}>
    <span className="min-w-0 flex-1 t-row">{label}</span>
    <Switch className="shrink-0" aria-label={label} checked={preferences[key]} disabled={!canManageSettings} onCheckedChange={checked => save({ [key]: checked })} />
  </div>;
  const copies = (key: PrinterCopiesKey, caption: string, group: string) => <div className={settingsRowClass}>
    <div className="min-w-0 flex-1"><p className="t-row">Number of Copies</p><p className="t-caption text-muted-foreground">{caption}</p></div>
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`${group} number of copies`}>
      <Button variant="ghost" size="icon" className="rounded-full" title={`Decrease ${group} copies`} aria-label={`Decrease ${group} copies`} disabled={!canManageSettings || preferences[key] <= 1} onClick={() => save({ [key]: preferences[key] - 1 })}><Minus /></Button>
      <output className="w-5 text-center t-value" aria-label={`${group} copies`}>{preferences[key]}</output>
      <Button variant="ghost" size="icon" className="rounded-full" title={`Increase ${group} copies`} aria-label={`Increase ${group} copies`} disabled={!canManageSettings || preferences[key] >= 99} onClick={() => save({ [key]: preferences[key] + 1 })}><Plus /></Button>
    </div>
  </div>;
  const choice = (key: "modifierSize" | "printWith" | "salesOver", label: string, value: string, below = false) => <Button variant="ghost" disabled={!canManageSettings}
    className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal font-normal`} onClick={() => open(key)}>
    <span className="min-w-0 flex-1"><span className="block t-row">{label}</span>{below && value && <span className="block t-caption text-muted-foreground">{value}</span>}</span>
    {!below && <span className="max-w-[40%] break-words text-right t-value text-muted-foreground">{value}</span>}
    <ChevronRight className="shrink-0 text-muted-foreground" />
  </Button>;
  const amount = new Intl.NumberFormat(brand.locale, { style: "currency", currency: settings.currency || brand.currency }).format(preferences.salesOver);

  return <>
    <SubHeader title={paired ? "Paired Printers" : "Advanced Settings"} backLabel="Printers" backTo="/settings/detail/printer" />
    <ScreenBody className="py-4">
      {paired ? <>
        <div className="flex flex-wrap items-start gap-4 pb-3">
          <p className="min-w-0 flex-1 basis-64 text-fs-sm leading-relaxed text-muted-foreground">Printers can generate various reports, such as sales summaries, inventory reports, and employee timecards, to help restaurant owners manage their business effectively.</p>
          <Button disabled={!canManageSettings} className="min-h-11 text-primary-foreground" onClick={() => open("detect")}>Detect Printer</Button>
        </div>
        {["DEFAULT KOT PRINTER MODEL", "DEFAULT BILL/RECEIPT PRINTER", "DEFAULT CUSTOM ITEM PRINTER"].map(label => <section key={label} className="pb-3"><GroupLabel>{label}</GroupLabel><GroupCard><p className={`${settingsRowClass} text-muted-foreground t-row`}>No Device Connected</p></GroupCard></section>)}
        <Button variant="outline" className="mt-5 min-h-row w-full bg-surface t-row" onClick={() => open("test")}>Test Printer</Button>
      </> : <>
        <p className="px-4 pb-3 t-caption text-muted-foreground">Configure advanced settings for printers to customize printing preferences, optimize performance, and manage specific features according to your requirements.</p>
        {printerSettingGroups.map(group => <section key={group.label} className="pb-3">
          <GroupLabel>{group.label}</GroupLabel>
          <GroupCard>
            {group.rows.map(([key, label]) => toggle(key, label))}
            {copies(group.copies, group.caption, group.label)}
            {group.copies === "receiptCopies" && <>{toggle("suggestedTip", "Suggested tip on receipt")}{toggle("clockReport", "Print Clock-in, Clock-out and Break report")}</>}
            {group.copies === "kitchenCopies" && <>{choice("modifierSize", "Kitchen Order Ticket Modifier Size", preferences.modifierSize.join(", "), true)}{choice("printWith", "Kitchen Order Ticket Print With", preferences.printWith.join(", "), true)}</>}
          </GroupCard>
        </section>)}
        <GroupCard className="mt-4">{toggle("signatureTipLine", "Signature and Tip line")}{choice("salesOver", "For Sales Over", amount)}</GroupCard>
      </>}
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
    </ScreenBody>
    <Dialog open={editor !== null} onOpenChange={next => { if (!next) setEditor(null); }}>
      <DialogContent className="rounded-lg">
        <DialogTitle>{editor ? editorTitles[editor] : "Printers"}</DialogTitle>
        <DialogDescription>{editor === "detect" ? "Printer detection is not available in this demo. No device is connected." : editor === "test" ? "No Device Connected. Connect a printer before printing a test receipt; this demo does not send print jobs." : "Update this device’s demo printing preferences."}</DialogDescription>
        {editor === "modifierSize" && ["Tall", "Wide", "Bold"].map(option => <label key={option} className="flex min-h-11 items-center gap-3 t-row"><Checkbox checked={sizeDraft.includes(option)} onCheckedChange={checked => setSizeDraft(current => checked ? [...current, option] : current.filter(item => item !== option))} />{option}</label>)}
        {(editor === "salesOver" || editor === "printWith") && <Input aria-label={editorTitles[editor]} inputMode={editor === "salesOver" ? "decimal" : "text"} value={draft} onChange={event => { setDraft(event.target.value); setError(""); }} />}
        {error && <p role="alert" className="text-fs-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditor(null)}>{editor === "detect" || editor === "test" ? "Close" : "Cancel"}</Button>
          {editor && editor !== "detect" && editor !== "test" && <Button className="text-primary-foreground" disabled={!canManageSettings} onClick={() => {
            if (editor === "salesOver") {
              if (!/^\d+(\.\d{1,2})?$/.test(draft.trim()) || !Number.isFinite(Number(draft))) { setError("Enter an amount of zero or more, with up to two decimal places."); return; }
              save({ salesOver: Number(draft) });
            } else if (editor === "modifierSize") save({ modifierSize: sizeDraft });
            else save({ printWith: draft.split(",").map(value => value.trim()).filter(Boolean) });
            setEditor(null);
          }}>Save</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}