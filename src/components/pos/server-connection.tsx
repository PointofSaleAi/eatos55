import { useState } from "react";
import { CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";
import type { ServerConnectionPreferences } from "@/lib/server-connection";
import { cn } from "@/lib/utils";

type Editor = "deviceName" | "cloudAddress" | "edgeAddress" | "numberRangeStart" | "status";
const labels: Record<Editor, string> = {
  deviceName: "Device Name", cloudAddress: "IP Address", edgeAddress: "edgeOS IP Address",
  numberRangeStart: "Number Range", status: "Cloud sync status",
};

export function ServerConnection() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const preferences = settings.serverConnection;
  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const save = (patch: Partial<ServerConnectionPreferences>) => {
    if (canManageSettings) updateSettings({ serverConnection: { ...preferences, ...patch } });
  };
  const open = (key: Editor) => {
    setDraft(key === "status" ? "" : preferences[key]);
    setError("");
    setEditor(key);
  };
  const section = (label: string, key: "cloudEnabled" | "offlineNumbers" | "edgeEnabled") => (
    <div className="flex min-h-11 items-center justify-between gap-3 px-2 pt-4 pb-2">
      <span className="min-w-0 t-section text-muted-foreground">{label}</span>
      <Switch aria-label={label} checked={preferences[key]} disabled={!canManageSettings}
        className="data-[state=checked]:bg-gate-success data-[state=unchecked]:bg-destructive"
        onCheckedChange={(checked) => save(key === "cloudEnabled" && !checked ? { cloudEnabled: false, edgeEnabled: true } : { [key]: checked })} />
    </div>
  );
  const row = (label: string, value: string, options: { editor?: Editor; disabled?: boolean; verified?: boolean; refresh?: boolean } = {}) => (
    <Button variant="ghost" disabled={options.disabled || (options.editor !== "status" && !canManageSettings && !!options.editor)}
      className={cn(settingsRowClass, "h-auto justify-start rounded-none whitespace-normal font-normal", !options.editor && !options.refresh && "pointer-events-none")}
      onClick={() => options.editor ? open(options.editor) : options.refresh ? toast.info("Demo only: no server order number was refreshed.") : undefined}>
      <span className="min-w-0 flex-1 t-row">{label}</span>
      <span className="max-w-[55%] break-words text-right t-value text-muted-foreground">{value}</span>
      {options.verified && <CheckCircle2 className="shrink-0 text-gate-success" />}
      {options.refresh ? <RefreshCw /> : options.editor && !options.verified ? <ChevronRight className="text-muted-foreground" /> : null}
    </Button>
  );
  const syncButtons = (enabled: boolean, edge = false) => <div className="mt-4 grid grid-cols-2 gap-3">
    {["MANUAL SYNC", "FORCE SYNC"].map((label, index) => <Button key={label} variant={index === 0 ? "default" : "outline"}
      disabled={!enabled || !canManageSettings} className={cn("h-16 flex-col gap-0 px-2 whitespace-normal text-fs-base font-bold", index === 0 ? "text-primary-foreground" : "text-foreground")}
      onClick={() => toast.info(`Demo only: ${label.toLowerCase()} does not connect to a server.`)}>
      {label}{edge && <span className="text-fs-xs font-medium">CLOUD SERVER</span>}
    </Button>)}
  </div>;

  return <>
    <SubHeader title="Server Connection" backLabel="Network" backTo="/settings/network" />
    <ScreenBody className="py-4">
      <p className="px-2 pb-3 text-fs-sm leading-relaxed text-muted-foreground">A system of interconnected computers or devices that communicate and share resources, enabling data exchange and collaboration.</p>
      {section("CLOUD SERVER", "cloudEnabled")}
      <GroupCard>
        {row("Device Name", preferences.deviceName, { editor: "deviceName", disabled: !preferences.cloudEnabled })}
        {row("IP Address", preferences.cloudAddress, { editor: "cloudAddress", verified: preferences.cloudEnabled, disabled: !preferences.cloudEnabled })}
        {row("Cloud sync status", preferences.cloudEnabled ? "Connected" : "Disabled", { editor: "status" })}
      </GroupCard>
      {syncButtons(preferences.cloudEnabled)}
      <p className="px-2 pt-4 text-fs-sm leading-relaxed text-muted-foreground">Staging experiment: does not disconnect the cloud. When the cloud is unreachable, this device mints order numbers from its own claimed 5-digit block instead of failing. Each range locks to this device name so other POS units must pick a different block. Off by default. Do not clear app cache/storage while this is in use — it stores the claim and last-minted number locally.</p>
      {section("Offline Order Number Generation", "offlineNumbers")}
      <GroupCard>{row("Number Range", preferences.numberRangeStart ? `${preferences.numberRangeStart}–${Number(preferences.numberRangeStart) + 9999}` : "Tap to select a range", { editor: "numberRangeStart", disabled: !preferences.offlineNumbers })}</GroupCard>
      <p className="px-2 pt-6 pb-3 text-fs-sm leading-relaxed text-muted-foreground">The local server acts as a backup to the cloud server, ensuring continuous operation and enhanced network reliability.</p>
      {section("edgeOS + CLOUD SERVER", "edgeEnabled")}
      <GroupCard>
        {row("Device Name", preferences.deviceName, { disabled: !preferences.edgeEnabled })}
        {row("edgeOS IP Address", preferences.edgeAddress, { editor: "edgeAddress", disabled: !preferences.edgeEnabled })}
        {row("Last Order Number", "6", { refresh: true, disabled: !preferences.edgeEnabled })}
        {row("Cloud Server Address", preferences.cloudAddress, { verified: true, disabled: !preferences.edgeEnabled })}
      </GroupCard>
      {syncButtons(preferences.edgeEnabled, true)}
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
      <div className="h-6" />
    </ScreenBody>
    <Dialog open={editor !== null} onOpenChange={(next) => { if (!next) setEditor(null); }}>
      <DialogContent className="rounded-lg">
        <DialogTitle>{editor ? labels[editor] : "Server Connection"}</DialogTitle>
        <DialogDescription>{editor === "status" ? "Demo connection status. No live server connection or data exchange is performed." : editor === "numberRangeStart" ? "Choose the starting number for a 10,000-number demo block (10000–90000). This does not change order numbering." : "Update this device’s demo connection details."}</DialogDescription>
        {editor === "status" ? <p className="t-row">{preferences.cloudEnabled ? "Connected" : "Disabled"}</p> : <Input aria-label={editor ? labels[editor] : "Value"} value={draft} inputMode={editor === "numberRangeStart" ? "numeric" : "text"} onChange={(event) => { setDraft(event.target.value); setError(""); }} />}
        {error && <p role="alert" className="text-fs-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditor(null)}>{editor === "status" ? "Close" : "Cancel"}</Button>
          {editor && editor !== "status" && <Button disabled={!canManageSettings} onClick={() => {
            const value = draft.trim();
            if (!value) { setError("Enter a value."); return; }
            if (editor === "numberRangeStart" && (!/^\d{5}$/.test(value) || Number(value) > 90000)) { setError("Enter a starting number between 10000 and 90000."); return; }
            if ((editor === "cloudAddress" || editor === "edgeAddress") && !/^[a-zA-Z0-9.-]+(?::\d{1,5})?$/.test(value)) { setError("Enter a valid server hostname or IP address."); return; }
            save({ [editor]: value }); setEditor(null);
          }}>Save</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}