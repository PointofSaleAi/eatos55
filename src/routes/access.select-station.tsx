import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel } from "@/components/pos/primitives";
import { stations } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/access/select-station")({
  head: () => ({
    meta: [
      { title: "Select station — EATOS Handheld" },
      { name: "description", content: "Choose the revenue center you are working tonight." },
      { property: "og:title", content: "Select station — EATOS Handheld" },
      {
        property: "og:description",
        content: "Choose the revenue center you are working tonight.",
      },
    ],
  }),
  component: SelectStation,
});

function SelectStation() {
  const navigate = useNavigate();
  const { setStation, session } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Access" title="Select station" back />
      <ScreenBody>
        <p className="text-sm text-muted-foreground">
          Tickets, printers and menus follow the station you pick.
        </p>
        <SectionLabel>Revenue centers</SectionLabel>
        <Card className="overflow-hidden">
          {stations.map((s) => (
            <ActionRow
              key={s.id}
              title={s.name}
              detail={s.hint}
              right={
                session.station === s.name ? (
                  <span className="shrink-0 text-xs font-bold text-accent">Current</span>
                ) : undefined
              }
              onClick={() => {
                setStation(s.name);
                toast.success(`Station set to ${s.name}`);
                navigate({ to: "/tickets" });
              }}
            />
          ))}
        </Card>
      </ScreenBody>
    </>
  );
}
