import { createFileRoute, useRouter } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { GuestBlock } from "@/components/pos/guest-block";
import { GuestSheet } from "@/components/pos/guest-sheet";
import { CustomItemWorkspace } from "@/components/pos/custom-item-workspace";

export const Route = createFileRoute("/order/custom-item")({
  head: () => ({
    meta: [
      { title: `Custom Item - ${brand.appName} Point of Sale` },
      { name: "description", content: "Ring in an open priced item with a custom name and amount." },
      { property: "og:title", content: `Custom Item - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Ring in an open priced item with a custom name and amount.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomItem,
});

function CustomItem() {
  const router = useRouter();
  const [guestOpen, setGuestOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center gap-2 bg-surface px-2 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="grid size-11 place-items-center rounded-pill text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="truncate text-fs-xl font-extrabold text-foreground">Custom Item</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <GuestBlock onEdit={() => setGuestOpen(true)} />
      </div>

      <CustomItemWorkspace />

      <GuestSheet open={guestOpen} onClose={() => setGuestOpen(false)} />
    </div>
  );
}
