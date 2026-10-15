import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";
import { defaultHardwareConnections, referenceReaders, referenceDrawers, type HardwareConnections } from "@/lib/hardware-connections";
import { cn } from "@/lib/utils";

export function HardwareConnectionsScreen({ drawer = false }: { drawer?: boolean }) {
  const { settings, updateSettings, canManageSettings } = usePos();
  const preferences = { ...defaultHardwareConnections, ...settings.hardwareConnections };
  const devices = drawer ? [...referenceDrawers, ...preferences.addedDrawers] : referenceReaders;
  const selectedId = drawer ? preferences.drawerId : preferences.readerId;
  const selected = devices.find(device => device.id === selectedId);
  const [dialog, setDialog] = useState<"detect" | "add" | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("PAX REGISTER");
  const [serial, setSerial] = useState("");
  const [error, setError] = useState("");
  const title = drawer ? "Cash Drawer" : "Card Reader";
  const save = (patch: Partial<HardwareConnections>) => {
    if (canManageSettings) updateSettings({ hardwareConnections: { ...preferences, ...patch } });
  };
  const columns = "grid grid-cols-[2.75rem_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-2 px-2 sm:grid-cols-[4rem_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-3 sm:px-4";

  return <>
    <SubHeader title={title} backLabel="Hardware" backTo="/settings/hardware" />
    <ScreenBody className="py-4">
      <div className="flex items-center gap-3 pb-4">
        <p className="min-w-0 flex-1 text-fs-sm leading-snug text-muted-foreground">{drawer ? "Administer the cash drawer to ensure smooth handling of your payments." : "Scans credit card data for transactions or access and can detect/pair with new card readers."}</p>
        <Button className="min-h-11 shrink-0" disabled={!canManageSettings} onClick={() => setDialog("detect")}>Detect</Button>
        {drawer && <Button size="icon" className="size-11 shrink-0" title="Add cash drawer" aria-label="Add cash drawer" disabled={!canManageSettings} onClick={() => { setName(""); setSerial(""); setType("PAX REGISTER"); setError(""); setDialog("add"); }}><Plus /></Button>}
      </div>
      <GroupCard className="mb-4">
        <div className={settingsRowClass}><span className="min-w-0 flex-1 t-row">{drawer ? "Cash Drawer" : "Selected Card Reader"}</span><span aria-label="Selected device" className="max-w-[55%] break-words text-right t-value text-muted-foreground">{selected?.name ?? "No Device Selected"}</span></div>
      </GroupCard>
      <GroupCard>
        <div role="table" aria-label={`${title} devices`}>
          <div role="row" className={cn(columns, "min-h-12 border-b border-border text-fs-xs font-bold")}>
            {["Active", "Device Name", "Device Type", "Serial Number"].map((label, index) => <span key={label} role="columnheader" className={cn("min-w-0 break-words", index ? "text-center" : "text-left")}>{label}</span>)}
          </div>
          {devices.map((device, index) => <div key={device.id} role="row" className={cn(columns, "min-h-12 border-b border-border py-2 last:border-b-0", index % 2 === 0 && "bg-muted/40")}>
            <div role="cell"><Button variant="ghost" size="icon" role="radio" aria-checked={selectedId === device.id} aria-label={`Select ${device.name}`} title={`Select ${device.name}`} className="size-10 rounded-full" disabled={!canManageSettings} onClick={() => save(drawer ? { drawerId: device.id } : { readerId: device.id })}>
              <span className={cn("grid size-5 place-items-center rounded-full border-2 border-foreground", selectedId === device.id && "bg-primary text-primary-foreground")}>{selectedId === device.id && <Check className="size-3" />}</span>
            </Button></div>
            <span role="cell" className="min-w-0 break-words text-center text-fs-xs sm:text-fs-sm [overflow-wrap:anywhere]">{device.name}</span>
            <span role="cell" className="min-w-0 break-words text-center text-fs-xs sm:text-fs-sm">{device.type}</span>
            <span role="cell" className="min-w-0 break-all text-right text-fs-xs sm:text-fs-sm">{device.serial}</span>
          </div>)}
        </div>
      </GroupCard>
      <Caption>Demo devices · No hardware connected.</Caption>
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
    </ScreenBody>
    <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }}>
      <DialogContent className="rounded-lg">
        <DialogTitle>{dialog === "add" ? "Add Cash Drawer" : `Detect ${title}`}</DialogTitle>
        <DialogDescription>{dialog === "add" ? "Add a demo drawer record. This does not connect physical hardware." : `Live ${drawer ? "cash drawer" : "card reader"} detection is not available in this demo. The list contains reference devices only.`}</DialogDescription>
        {dialog === "add" && <>
          <label className="space-y-2 text-fs-sm">Device Name<Input aria-label="Device Name" maxLength={80} value={name} onChange={event => { setName(event.target.value); setError(""); }} /></label>
          <label className="space-y-2 text-fs-sm">Device Type<Select value={type} onValueChange={setType}><SelectTrigger aria-label="Device Type"><SelectValue /></SelectTrigger><SelectContent>{["PAX REGISTER", "STAR CASH DRAWER - ETHERNET", "STAR CASH DRAWER - USB"].map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>
          <label className="space-y-2 text-fs-sm">Serial Number<Input aria-label="Serial Number" maxLength={80} value={serial} onChange={event => { setSerial(event.target.value); setError(""); }} /></label>
          {error && <p role="alert" className="text-fs-sm text-destructive">{error}</p>}
        </>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDialog(null)}>{dialog === "add" ? "Cancel" : "Close"}</Button>
          {dialog === "add" && <Button disabled={!canManageSettings} onClick={() => {
            if (!name.trim() || !serial.trim()) { setError("Enter a device name and serial number."); return; }
            if (devices.some(device => device.serial.toLowerCase() === serial.trim().toLowerCase())) { setError("A drawer with this serial number already exists."); return; }
            save({ addedDrawers: [...preferences.addedDrawers, { id: `drawer-${crypto.randomUUID()}`, name: name.trim(), type, serial: serial.trim() }] });
            setDialog(null);
          }}>Add</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}