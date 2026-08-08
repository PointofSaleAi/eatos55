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
  IconToggleRow,
  IconValueRow,
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
          <IconToggleRow
            title="Device Service"
            value={settings.deviceService}
            checked={settings.tableService}
            onChange={(v) => {
              updateSettings({ tableService: v });
              toast.success(v ? "Table Service enabled" : "Table Service disabled");
            }}
          />
        </GroupCard>

        <GroupCard className="mt-6">
          <IconNavRow
            title="Restaurant Information"
            icon={Store}
            color="slate"
            onClick={() => toast.info(settings.restaurantName)}
          />
          <IconNavRow
            title="Restaurant Settings"
            icon={SettingsIcon}
            color="violet"
            onClick={() => toast.info("Restaurant settings are managed in Back Office")}
          />
          <IconValueRow
            title="Language"
            value={settings.language}
            icon={Globe}
            color="pink"
            onClick={() => toast.info("English is the only installed language")}
          />
          <IconNavRow
            title="Currency"
            icon={CircleDollarSign}
            color="green"
            onClick={() => toast.info(`Currency: ${settings.currency}`)}
          />
          <IconValueRow
            title="Tax Alias"
            value={settings.taxAlias}
            icon={Percent}
            color="sky"
            onClick={() =>
              updateSettings({ taxAlias: settings.taxAlias === "Tax" ? "VAT" : "Tax" })
            }
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
            onClick={() => toast.info("Shift schedule syncs from Back Office")}
          />
          <IconNavRow
            title="Timed Pricing"
            icon={Timer}
            color="purple"
            onClick={() => toast.info("No timed pricing rules on this device")}
          />
        </GroupCard>

        <GroupCard className="mt-6">
          <IconValueRow
            title="About"
            value={settings.appVersion}
            icon={Info}
            color="blue"
            chevron
            onClick={() => toast.info(`Handheld ${settings.appVersion}`)}
          />
        </GroupCard>
        <div className="h-6" />
      </ScreenBody>
    </>
  );
}
