import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { TicketsScreen } from "@/components/pos/tickets-screen";

export const Route = createFileRoute("/tickets/sort")({
  head: () => ({
    meta: [
      { title: `Sort tickets - ${brand.appName} Point of Sale` },
      { name: "description", content: "Order the ticket list by arrival time or order number." },
      { property: "og:title", content: `Sort tickets - ${brand.appName} Point of Sale` },
      { property: "og:description", content: "Order the ticket list by arrival time or order number." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TicketsScreen initialOverlay="sort" />,
});
