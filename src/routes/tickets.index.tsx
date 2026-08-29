import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { TicketsScreen } from "@/components/pos/tickets-screen";

export const Route = createFileRoute("/tickets/")({
  head: () => ({
    meta: [
      { title: `Tickets - ${brand.appName} Point of Sale` },
      { name: "description", content: "Browse tickets by day with live status, totals and arrival times." },
      { property: "og:title", content: `Tickets - ${brand.appName} Point of Sale` },
      { property: "og:description", content: "Browse tickets by day with live status, totals and arrival times." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TicketsScreen />,
});
