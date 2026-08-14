import { createFileRoute } from "@tanstack/react-router";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconValueRow } from "@/components/pos/settings-rows";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/sales-summary")({
  head: () => ({
    meta: [
      { title: "Sales Summary Report - EATOS Handheld" },
      { name: "description", content: "Net sales, tickets and payment mix for the current day." },
      { property: "og:title", content: "Sales Summary Report - EATOS Handheld" },
      {
        property: "og:description",
        content: "Net sales, tickets and payment mix for the current day.",
      },
    ],
  }),
  component: SalesSummary,
});

function SalesSummary() {
  const { visibleTickets, ticketDate } = usePos();
  const list = visibleTickets("all");
  const paid = list.filter((t) => t.status === "paid");
  const net = paid.reduce((s, t) => s + t.total, 0);

  return (
    <>
      <SubHeader title="Sales Summary Report" />
      <ScreenBody className="py-2">
        <p className="px-1 pb-4 text-fs-sm text-muted-foreground">{ticketDate}</p>
        <GroupCard>
          <IconValueRow title="Tickets" value={String(list.length)} />
          <IconValueRow title="Closed tickets" value={String(paid.length)} />
          <IconValueRow title="Net sales" value={money(net)} />
          <IconValueRow
            title="Open tickets"
            value={String(list.length - paid.length)}
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
