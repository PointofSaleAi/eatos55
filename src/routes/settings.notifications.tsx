import { createFileRoute } from "@tanstack/react-router";
import { Bell, MessageSquare, Volume2 } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconToggleRow } from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications - EATOS Handheld settings" },
      {
        name: "description",
        content: "Choose which order and shift alerts this handheld shows.",
      },
      { property: "og:title", content: "Notifications - EATOS Handheld settings" },
      {
        property: "og:description",
        content: "Choose which order and shift alerts this handheld shows.",
      },
    ],
  }),
  component: NotificationSettings,
});

function NotificationSettings() {
  const { settings, updateSettings } = usePos();

  return (
    <>
      <SubHeader title="Notifications" />
      <ScreenBody className="py-2">
        <GroupCard>
          <IconToggleRow
            title="Order Alerts"
            icon={Bell}
            color="grey"
            checked={settings.showSoldOut}
            onChange={(v) => updateSettings({ showSoldOut: v })}
          />
          <IconToggleRow
            title="Sound"
            icon={Volume2}
            color="sky"
            checked={settings.hapticFeedback}
            onChange={(v) => updateSettings({ hapticFeedback: v })}
          />
          <IconToggleRow
            title="Email Receipts"
            icon={MessageSquare}
            color="blue"
            checked={settings.emailReceipts}
            onChange={(v) => updateSettings({ emailReceipts: v })}
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
