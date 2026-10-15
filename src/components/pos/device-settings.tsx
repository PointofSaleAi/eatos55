import { useState } from "react";
import { Check, ChevronRight, Clock, Info } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";
import { useAppearance, type Appearance } from "@/hooks/use-appearance";
import { deviceSettingGroups, type DevicePreferences } from "@/lib/device-settings";

type ChoiceKey = Exclude<keyof DevicePreferences, "toggles"> | "appTheme";
const choices: Record<ChoiceKey, { label: string; options: readonly string[] }> = {
  autoLockTimer: { label: "Auto Lock Timer", options: ["Never", "30 seconds", "1 minute", "2 minutes", "5 minutes", "10 minutes", "15 minutes"] },
  menuSort: { label: "Menu Sort", options: ["Drag & Drop", "Alphabetical"] },
  modifierStyle: { label: "Modifier Style", options: ["Standard", "Compact"] },
  designTheme: { label: "Design theme", options: ["Classic"] },
  appTheme: { label: "App Theme", options: ["Light", "Dark", "System"] },
};
export function DeviceSettings() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const { appearance, setAppearance } = useAppearance();
  const [picker, setPicker] = useState<ChoiceKey | null>(null);
  const preferences = settings.devicePreferences;
  const save = (patch: Partial<DevicePreferences>) => {
    if (canManageSettings) updateSettings({ devicePreferences: { ...preferences, ...patch } });
  };
  const value = (key: ChoiceKey) => key === "appTheme" ? appearance.charAt(0).toUpperCase() + appearance.slice(1) : preferences[key];
  const choiceRow = (key: ChoiceKey) => <Button key={key} variant="ghost" disabled={!canManageSettings}
    className={`${settingsRowClass} h-auto justify-start rounded-none whitespace-normal`} onClick={() => setPicker(key)}>
    {key === "autoLockTimer" && <Clock className="size-6 shrink-0 text-foreground" />}
    <span className="min-w-0 flex-1 t-row">{choices[key].label}</span>
    <span className="max-w-[45%] text-right t-value text-muted-foreground">{value(key)}</span>
    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
  </Button>;
  return <>
    <SubHeader title="Device Settings" backLabel="Control Center" backTo="/settings/control-center" />
    <ScreenBody className="py-4">
      <GroupCard>{choiceRow("autoLockTimer")}</GroupCard>
      {deviceSettingGroups.map((group) => <div key={group.label}>
        {group.label === "Ordering" && <><GroupLabel>Menu</GroupLabel><GroupCard>{choiceRow("menuSort")}{choiceRow("modifierStyle")}</GroupCard></>}
        <GroupLabel><span className="inline-flex items-center gap-2">{group.label}{group.label === "Kitchen Display System" && <Info className="size-4" aria-label="Kitchen Display System" />}</span></GroupLabel>
        <GroupCard>{group.rows.map(([key, label]) => <div key={key} className={settingsRowClass}>
          <span className="min-w-0 flex-1 t-row">{label}</span>
          <Switch className="shrink-0" checked={preferences.toggles[key]} disabled={!canManageSettings} aria-label={label}
            onCheckedChange={(checked) => save({ toggles: { ...preferences.toggles, [key]: checked } })} />
        </div>)}</GroupCard>
      </div>)}
      <GroupLabel>Appearance</GroupLabel><GroupCard>{choiceRow("designTheme")}{choiceRow("appTheme")}</GroupCard>
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
      <div className="h-6" />
    </ScreenBody>
    <Dialog open={picker !== null} onOpenChange={(open) => { if (!open) setPicker(null); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-lg">
        <DialogTitle>{picker ? choices[picker].label : "Device Settings"}</DialogTitle>
        <DialogDescription>Select an option.</DialogDescription>
        {picker && choices[picker].options.map((option) => <Button key={option} variant="ghost" className="min-h-11 justify-between whitespace-normal" onClick={() => {
          if (!canManageSettings) return;
          if (picker === "appTheme") setAppearance(option.toLowerCase() as Appearance);
          else save({ [picker]: option });
          setPicker(null);
        }}>{option}{value(picker) === option && <Check className="size-4 shrink-0" />}</Button>)}
        <Button variant="outline" onClick={() => setPicker(null)}>Cancel</Button>
      </DialogContent>
    </Dialog>
  </>;
}