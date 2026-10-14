import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { OrderOSBoard } from "@/components/pos/orderos/orderos-board";

export const Route = createFileRoute("/board/")({
  head: () => ({
    meta: [
      { title: `orderOS - ${brand.appName} Point of Sale` },
      { name: "description", content: "orderOS board: accept, prepare, ready and complete online and dine-in orders." },
      { property: "og:title", content: `orderOS - ${brand.appName} Point of Sale` },
      { property: "og:description", content: "orderOS board: accept, prepare, ready and complete online and dine-in orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderOSBoard,
});
