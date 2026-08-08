import { createFileRoute } from "@tanstack/react-router";
import { TicketsScreen } from "@/components/pos/tickets-screen";

export const Route = createFileRoute("/tickets/search")({
  head: () => ({
    meta: [
      { title: "Search tickets — eatOS Point of Purchase" },
      { name: "description", content: "Search tickets by order number, table or guest name." },
      { property: "og:title", content: "Search tickets — eatOS Point of Purchase" },
      { property: "og:description", content: "Search tickets by order number, table or guest name." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TicketsScreen initialOverlay="search" />,
});
