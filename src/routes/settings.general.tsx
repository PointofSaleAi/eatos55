import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  Globe,
  Info,
  Percent,
  Store,
  Timer,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  GroupCard,
  GroupLabel,
  IconNavRow,
  IconValueRow,
  SegmentRow,
} from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/general")({
  head: () => ({
    meta: [
      { title: "General — EATOS Handheld settings" },
      {
        name: "description",
        content: "Device service, restaurant information, language, currency and tax alias.",
      },
      { property: "og:title", content: "General — EATOS Handheld settings" },
      {
        property: "og:description",
        content: "Device service, restaurant information, language, currency and tax alias.",
      },
    ],
  }),
  component: GeneralSettings,
});

function GeneralSettings() {
  const { settings, updateSettings } = usePos();

  return (
    <>
      <SubHeader title="General" />
      <ScreenBody className="py-2">
        <GroupLabel>Device Service</GroupLabel>
        <GroupCard>
          <IconValueRow title="Device Name" value={settings.deviceName} />
          <SegmentRow
            title="Device Service"
            options={["Table Service", "Quick Service"]}
            value={settings.deviceService}
            onChange={(v) => {
              updateSettings({ deviceService: v as typeof settings.deviceService });
              toast.success(`${v} selected`);
            }}
          />
        </GroupCard>

        <GroupCard className="mt-6">
          <IconNavRow
            title="Restaurant Information"
            icon={Store}
            color="slate"
            topic="restaurant-information"
          />
          <IconNavRow
            title="Restaurant Settings"
            icon={SettingsIcon}
            color="violet"
            topic="restaurant-settings"
          />
          <IconValueRow
            title="Language"
            value={settings.language}
            icon={Globe}
            color="pink"
            topic="language"
          />
          <IconNavRow
            title="Currency"
            value={settings.currency}
            icon={CircleDollarSign}
            color="green"
            topic="currency"
          />
          <IconValueRow
            title="Tax Alias"
            value={settings.taxAlias}
            icon={Percent}
            color="sky"
            topic="tax-alias"
          />
        </GroupCard>

        <GroupCard className="mt-6">
          <IconNavRow
            title="End Of Day"
            icon={BarChart3}
            color="orange"
            to="/settings/sales-summary"
          />
          <IconNavRow
            title="Schedule Info"
            icon={CalendarClock}
            color="violet"
            topic="schedule-info"
          />
          <IconNavRow title="Timed Pricing" icon={Timer} color="purple" topic="timed-pricing" />
        </GroupCard>

        <GroupCard className="mt-6">
          <IconValueRow
            title="About"
            value={settings.appVersion}
            icon={Info}
            color="blue"
            chevron
            topic="about"
          />
        </GroupCard>
        <div className="h-6" />
      </ScreenBody>
    </>
  );
}
