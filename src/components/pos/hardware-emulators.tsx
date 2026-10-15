import { useState } from "react";
import { Copy, Inbox, Printer } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, IconNavRow, IconTile, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";

const emulatorRows = [
  { field: "printerEmulator", label: "Emulate printers", icon: Printer, color: "blue" },
  { field: "readerEmulator", label: "Emulate card readers", icon: Copy, color: "violet" },
  { field: "cashDrawerEmulator", label: "Emulate cash drawer", icon: Inbox, color: "green" },
  { field: "scannerEmulator", label: "Emulate scanner", icon: Copy, color: "orange" },
] as const;

export function HardwareEmulators() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const [labOpen, setLabOpen] = useState(false);
  return <>
    <SubHeader title="Hardware Emulators" backLabel="Hardware" backTo="/settings/hardware" />
    <ScreenBody className="py-4">
      <p className="px-4 pb-6 t-caption text-muted-foreground">
        These toggles do not remove Printer, Card Reader, or Cash Drawer from Hardware. When Emulate printers is ON, all POS print commands (Charge receipt, KOT, bill, Test Printer, etc.) show an in-memory preview and do not print to physical hardware. OFF restores normal printer behavior. Cash drawer and scanner toggles gate lab actions; card emulate does not cut over live Adyen Charge. Receipt designs live under Payments → Receipts.
      </p>
      <GroupCard>
        {emulatorRows.map(({ field, label, icon, color }) => <div key={field} className={settingsRowClass}>
          <IconTile icon={icon} color={color} />
          <span className="min-w-0 flex-1 t-row">{label}</span>
          <Switch className="shrink-0" aria-label={label} checked={settings[field]} disabled={!canManageSettings}
            onCheckedChange={checked => { if (canManageSettings) updateSettings({ [field]: checked }); }} />
        </div>)}
        <IconNavRow title="Peripheral emulator lab" icon={Printer} color="blue" onClick={() => setLabOpen(true)} />
      </GroupCard>
      <Caption>Emulator controls are demo preferences only; they do not change printing, payments or connected hardware.</Caption>
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
    </ScreenBody>
    <Dialog open={labOpen} onOpenChange={setLabOpen}>
      <DialogContent className="rounded-lg">
        <DialogTitle>Peripheral emulator lab</DialogTitle>
        <DialogDescription>Live peripheral emulation and print previews are not available in this demo. No printer, card reader, cash drawer or scanner action is performed.</DialogDescription>
        <Button variant="outline" onClick={() => setLabOpen(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  </>;
}