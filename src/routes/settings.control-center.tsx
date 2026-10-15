import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { Clock, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  Caption,
  GroupCard,
  GroupLabel,
  IconNavRow,
  IconToggleRow,
  IconValueRow,
} from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/control-center")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Control Center - ${brand.appName} Handheld settings` },
      {
        name: "description",
        content: "Device settings, hardware control, guest facing display and the scheduled app restart time.",
      },
      { property: "og:title", content: `Control Center - ${brand.appName} Handheld settings` },
      {
        property: "og:description",
        content: "Device settings, hardware control, guest facing display and the scheduled app restart time.",
      },
    ],
  }),
  component: ControlCenter,
});

const times = ["12:30 AM", "02:30 AM", "02:30 PM", "04:30 PM", "11:30 PM"];

function ControlCenter() {
  const { settings, updateSettings } = usePos();

  return (
    <>
      <SubHeader title="Control Center" />
      <ScreenBody className="py-2">
        <GroupCard>
          <IconNavRow title="Device Settings" to="/settings/device-settings" />
          <IconNavRow title="Hardware Control" to="/settings/hardware-control" />
          <IconNavRow title="Guest Facing Display" to="/settings/guest-facing-display" />
        </GroupCard>

        <GroupLabel>App Restart</GroupLabel>
        <GroupCard>
          <IconToggleRow
            title="Restart App"
            icon={RotateCw}
            color="orange"
            checked={settings.restartApp}
            onChange={(v) => updateSettings({ restartApp: v })}
          />
          <IconValueRow
            title="Choose Time"
            value={settings.restartTime}
            icon={Clock}
            color="slate"
            chevron
            onClick={() => {
              const next = times[(times.indexOf(settings.restartTime) + 1) % times.length];
              if (!next) return;
              updateSettings({ restartTime: next });
              toast.success(`Restart time set to ${next}`);
            }}
          />
        </GroupCard>
        <Caption>
          Restart time is set automatically to 2 hours after your Auto End of Day time.
        </Caption>
        <Caption tone="danger">
          Changing the restart time may cause the app to restart during business hours and could
          interrupt active orders or other operations.
        </Caption>
      </ScreenBody>
    </>
  );
}
