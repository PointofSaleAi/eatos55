import { createFileRoute } from "@tanstack/react-router";
import { StartEndOfDay } from "@/components/pos/end-of-day";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/settings/end-of-day/start")({
  head: () => ({ meta: [
    { title: `Start End of Day - ${brand.appName}` },
    { name: "description", content: "Review labour hours, daily sales, unpaid bills, open checks, employees and drawer activity." },
    { property: "og:title", content: `Start End of Day - ${brand.appName}` },
    { property: "og:description", content: "Review labour hours, daily sales, unpaid bills, open checks, employees and drawer activity." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: StartEndOfDay,
});