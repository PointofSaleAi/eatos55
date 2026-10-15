import { createFileRoute } from "@tanstack/react-router";
import { GuestFacingDisplay } from "@/components/pos/peripheral-settings";
import { brand } from "@/lib/brand";
export const Route = createFileRoute("/settings/guest-facing-display")({
  head: () => ({ meta: [
    { title: `Guest Facing Display - ${brand.appName} Point of Sale` },
    { name: "description", content: "Customer display, card reader tips and QR payment display preferences." },
    { property: "og:title", content: `Guest Facing Display - ${brand.appName} Point of Sale` },
    { property: "og:description", content: "Manage guest facing display preferences from Control Center." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: GuestFacingDisplay,
});