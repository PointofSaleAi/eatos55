import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, EmptyState, SectionLabel } from "@/components/pos/primitives";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/system/help-center")({
  head: () => ({
    meta: [
      { title: "Help center — EATOS Handheld" },
      { name: "description", content: "Guides for tickets, payments, hardware and shift handover." },
      { property: "og:title", content: "Help center — EATOS Handheld" },
      {
        property: "og:description",
        content: "Guides for tickets, payments, hardware and shift handover.",
      },
    ],
  }),
  component: HelpCenter,
});

const articles = [
  { id: "first-order", title: "Take your first order", detail: "Ordering basics · 3 min read" },
  { id: "split-check", title: "Split a check between guests", detail: "Payments · 4 min read" },
  { id: "pair-card-reader", title: "Re-pair a card reader", detail: "Hardware · 2 min read" },
  { id: "close-shift", title: "Close out a shift", detail: "Manager tasks · 5 min read" },
  { id: "work-offline", title: "Work offline safely", detail: "Network · 3 min read" },
];

function HelpCenter() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const results = articles.filter((a) => a.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <ScreenHeader eyebrow="System" title="Help center" back />
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search guides"
            placeholder="Search guides"
            className="h-12 rounded-row bg-background pl-9"
          />
        </div>
      </div>
      <ScreenBody>
        <SectionLabel>Popular guides</SectionLabel>
        {results.length ? (
          <Card className="overflow-hidden">
            {results.map((a) => (
              <ActionRow
                key={a.id}
                title={a.title}
                detail={a.detail}
                onClick={() => navigate({ to: "/system/article/$slug", params: { slug: a.id } })}
              />
            ))}
          </Card>
        ) : (
          <EmptyState title="No guides found" detail="Try a different keyword or contact support." />
        )}
      </ScreenBody>
    </>
  );
}
