import { createFileRoute } from "@tanstack/react-router";
import { EndOfDaySettings } from "@/components/pos/end-of-day";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/settings/end-of-day/")({
  head: () => ({ meta: [
    { title: `End of Day - ${brand.appName} Settings` },
    { name: "description", content: "End-of-day device, reminders, automatic tasks and daily report recipients." },
    { property: "og:title", content: `End of Day - ${brand.appName} Settings` },
    { property: "og:description", content: "End-of-day device, reminders, automatic tasks and daily report recipients." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: EndOfDaySettings,
});