import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WheelTimePicker } from "@/components/pos/time-picker";
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

function ControlCenter() {
  const { settings, updateSettings } = usePos();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState(settings.restartTime);

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
              setDraft(settings.restartTime);
              setPickerOpen(true);
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

      <Dialog open={pickerOpen} onOpenChange={(open) => { if (!open) setPickerOpen(false); }}>
        <DialogContent className="max-w-sm rounded-lg p-5">
          <DialogTitle>Choose Time</DialogTitle>
          <DialogDescription>Scroll to pick the app restart time.</DialogDescription>
          <WheelTimePicker value={draft} onChange={setDraft} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPickerOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                updateSettings({ restartTime: draft });
                toast.success(`Restart time set to ${draft}`);
                setPickerOpen(false);
              }}
            >
              Set Time
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
