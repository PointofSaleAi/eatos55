import { createFileRoute } from "@tanstack/react-router";
import { TicketsScreen } from "@/components/pos/tickets-screen";

export const Route = createFileRoute("/tickets/")({
  head: () => ({
    meta: [
      { title: "Tickets - eatOS Point of Sale" },
      { name: "description", content: "Browse tickets by day with live status, totals and arrival times." },
      { property: "og:title", content: "Tickets - eatOS Point of Sale" },
      { property: "og:description", content: "Browse tickets by day with live status, totals and arrival times." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TicketsScreen />,
});
