import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { Card, SectionLabel } from "@/components/pos/primitives";
import { releaseNotes } from "@/lib/demo-data";

export const Route = createFileRoute("/tickets/whats-new")({
  head: () => ({
    meta: [
      { title: "What is new - EATOS Handheld" },
      { name: "description", content: "Product updates shipped to the EATOS handheld app." },
      { property: "og:title", content: "What is new - EATOS Handheld" },
      { property: "og:description", content: "Product updates shipped to the EATOS handheld app." },
    ],
  }),
  component: WhatsNew,
});

function WhatsNew() {
  return (
    <>
      <ScreenHeader eyebrow="Tickets" title="What is new" back />
      <ScreenBody>
        <Card className="flex items-start gap-3 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-accent" />
          <div className="min-w-0">
            <p className="text-fs-sm font-extrabold text-foreground">You are on version 4.12</p>
            <p className="text-fs-xs text-muted-foreground">Updated automatically overnight.</p>
          </div>
        </Card>
        <SectionLabel>Product updates</SectionLabel>
        <div className="space-y-3">
          {releaseNotes.map((n) => (
            <Card key={n.version} className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="truncate text-fs-sm font-extrabold text-foreground">{n.title}</p>
                <span className="shrink-0 rounded-pill bg-muted px-2 py-0.5 text-fs-xs font-bold text-muted-foreground">
                  {n.version}
                </span>
              </div>
              <p className="mt-1 text-fs-xs text-muted-foreground">{n.date}</p>
              <p className="mt-2 text-fs-sm text-foreground">{n.body}</p>
            </Card>
          ))}
        </div>
      </ScreenBody>
    </>
  );
}
