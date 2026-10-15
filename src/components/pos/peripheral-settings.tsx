import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, settingsRowClass } from "@/components/pos/settings-rows";
import { Switch } from "@/components/ui/switch";
import { usePos } from "@/lib/pos-store";
import { peripheralSettingScreens } from "@/lib/peripheral-settings";

function PeripheralSettings({ screen }: { screen: keyof typeof peripheralSettingScreens }) {
  const { settings, updateSettings, canManageSettings } = usePos();
  const definition = peripheralSettingScreens[screen];
  return <>
    <SubHeader title={definition.title} backLabel="Control Center" backTo="/settings/control-center" />
    <ScreenBody className="py-4">
      {definition.groups.map((group) => <div key={group.label}>
        <GroupLabel>{group.label}</GroupLabel>
        <GroupCard>{group.rows.map(([key, label]) => <div key={key} className={settingsRowClass}>
          <span className="min-w-0 flex-1 t-row">{label}</span>
          <Switch className="shrink-0" aria-label={label} checked={settings.peripheralPreferences[key]} disabled={!canManageSettings}
            onCheckedChange={(checked) => {
              if (canManageSettings) updateSettings({ peripheralPreferences: { ...settings.peripheralPreferences, [key]: checked } });
            }} />
        </div>)}</GroupCard>
      </div>)}
      {!canManageSettings && <Caption>Only managers can change these settings.</Caption>}
    </ScreenBody>
  </>;
}
export function HardwareControl() { return <PeripheralSettings screen="hardware" />; }
export function GuestFacingDisplay() { return <PeripheralSettings screen="guest" />; }