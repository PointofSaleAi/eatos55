import { createFileRoute } from "@tanstack/react-router";
import { TicketsScreen } from "@/components/pos/tickets-screen";

export const Route = createFileRoute("/tickets/filter")({
  head: () => ({
    meta: [
      { title: "Filter tickets — eatOS Point of Purchase" },
      { name: "description", content: "Narrow tickets by revenue center, employee, order type and payment." },
      { property: "og:title", content: "Filter tickets — eatOS Point of Purchase" },
      { property: "og:description", content: "Narrow tickets by revenue center, employee, order type and payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TicketsScreen initialOverlay="filter" />,
});
