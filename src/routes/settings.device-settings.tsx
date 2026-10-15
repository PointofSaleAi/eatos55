import { createFileRoute } from "@tanstack/react-router";
import { DeviceSettings } from "@/components/pos/device-settings";
import { brand } from "@/lib/brand";
export const Route = createFileRoute("/settings/device-settings")({
  head: () => ({ meta: [
    { title: `Device Settings - ${brand.appName} Point of Sale` },
    { name: "description", content: "Device preferences for PIN and security, menu, ordering, payments, orderOS, tables, kitchen display and appearance." },
    { property: "og:title", content: `Device Settings - ${brand.appName} Point of Sale` },
    { property: "og:description", content: "Manage point-of-sale device preferences from Control Center." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: DeviceSettings,
});