import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel } from "@/components/pos/primitives";
import { employees } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/workforce")({
  head: () => ({
    meta: [
      { title: "Workforce — EATOS Handheld" },
      { name: "description", content: "Employees, roles and clock status for the current shift." },
      { property: "og:title", content: "Workforce — EATOS Handheld" },
      {
        property: "og:description",
        content: "Employees, roles and clock status for the current shift.",
      },
    ],
  }),
  component: Workforce,
});

function Workforce() {
  const navigate = useNavigate();
  const { session } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Settings" title="Workforce" back />
      <ScreenBody>
        <SectionLabel>On shift</SectionLabel>
        <Card className="overflow-hidden">
          {employees.map((e) => (
            <ActionRow
              key={e.id}
              title={`${e.name}${e.name === session.name ? " (you)" : ""}`}
              detail={`${e.role} · ${e.state}`}
              onClick={() => toast.info(`${e.name} · ${e.state}`)}
            />
          ))}
        </Card>

        <SectionLabel>Time clock</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Clock in a teammate"
            detail="Opens the PIN pad"
            onClick={() => navigate({ to: "/access/clock-in" })}
          />
          <ActionRow
            title="Export timesheets"
            detail="Send this week to payroll"
            onClick={() => toast.success("Timesheets exported")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
