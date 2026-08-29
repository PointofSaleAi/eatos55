import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import {
  BarChart3,
  BedDouble,
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
  IconToggleRow,
  IconValueRow,
  SegmentRow,
} from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/general")({
  head: () => ({
    meta: [
      { title: `General - ${brand.appName} Handheld settings` },
      {
        name: "description",
        content: "Device service, restaurant information, language, currency and tax alias.",
      },
      { property: "og:title", content: `General - ${brand.appName} Handheld settings` },
      {
        property: "og:description",
        content: "Device service, restaurant information, language, currency and tax alias.",
      },
    ],
  }),
  component: GeneralSettings,
});

function GeneralSettings() {
  const { settings, updateSettings, canManageSettings } = usePos();

  return (
    <>
      <SubHeader title="General" />
      <ScreenBody className="py-2">
        <GroupLabel>Device Service</GroupLabel>
        <GroupCard>
          <IconValueRow title="Device Name" value={settings.deviceName} topic="device-name" />
          <SegmentRow
            title="Device Service"
            options={["Table Service", "Quick Service"]}
            value={settings.deviceService}
            onChange={(v) => {
              if (!canManageSettings) {
                toast.error("Only managers can change these settings.");
                return;
              }
              updateSettings({ deviceService: v as typeof settings.deviceService });
              toast.success(`${v} selected`);
            }}
          />
          {/* Rooms / room service is a hotel module, off unless switched on here. */}
          <IconToggleRow
            title="Room Service"
            value="Show the Rooms screen"
            icon={BedDouble}
            color="sky"
            checked={settings.roomService}
            onChange={(v) => {
              if (!canManageSettings) {
                toast.error("Only managers can change these settings.");
                return;
              }
              updateSettings({ roomService: v });
              toast.success(v ? "Room service on" : "Room service off");
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
