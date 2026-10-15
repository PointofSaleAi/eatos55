import { createFileRoute } from "@tanstack/react-router";
import { HardwareControl } from "@/components/pos/peripheral-settings";
import { brand } from "@/lib/brand";
export const Route = createFileRoute("/settings/hardware-control")({
  head: () => ({ meta: [
    { title: `Hardware Control - ${brand.appName} Point of Sale` },
    { name: "description", content: "Card reader beep, kitchen display notifications and QR bill or receipt preferences." },
    { property: "og:title", content: `Hardware Control - ${brand.appName} Point of Sale` },
    { property: "og:description", content: "Manage hardware control preferences from Control Center." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: HardwareControl,
});