import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel } from "@/components/pos/primitives";
import { usePos, type SortKey } from "@/lib/pos-store";

export const Route = createFileRoute("/tickets/sort")({
  head: () => ({
    meta: [
      { title: "Sort tickets — EATOS Handheld" },
      { name: "description", content: "Sort the live queue by arrival time or ticket value." },
      { property: "og:title", content: "Sort tickets — EATOS Handheld" },
      {
        property: "og:description",
        content: "Sort the live queue by arrival time or ticket value.",
      },
    ],
  }),
  component: SortTickets,
});

const options: { id: SortKey; title: string; detail: string }[] = [
  { id: "newest", title: "Newest first", detail: "Most recent arrivals on top" },
  { id: "oldest", title: "Oldest first", detail: "Longest waiting tickets on top" },
  { id: "highest", title: "Highest value", detail: "Largest check totals on top" },
  { id: "lowest", title: "Lowest value", detail: "Smallest check totals on top" },
];

function SortTickets() {
  const navigate = useNavigate();
  const { sortKey, setSortKey } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Tickets" title="Sort tickets" back />
      <ScreenBody>
        <SectionLabel>Time and value sorting</SectionLabel>
        <Card className="overflow-hidden">
          {options.map((o) => (
            <ActionRow
              key={o.id}
              title={o.title}
              detail={o.detail}
              right={
                sortKey === o.id ? (
                  <Check className="size-5 shrink-0 text-accent" />
                ) : (
                  <span className="size-5 shrink-0" />
                )
              }
              onClick={() => {
                setSortKey(o.id);
                navigate({ to: "/tickets" });
              }}
            />
          ))}
        </Card>
      </ScreenBody>
    </>
  );
}
