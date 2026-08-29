import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, NavRow, SectionLabel, ToggleRow } from "@/components/pos/primitives";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/tickets/manager-controls")({
  head: () => ({
    meta: [
      { title: `Manager controls - ${brand.appName} Handheld` },
      { name: "description", content: "Session controls, alerts and protected shift actions." },
      { property: "og:title", content: `Manager controls - ${brand.appName} Handheld` },
      {
        property: "og:description",
        content: "Session controls, alerts and protected shift actions.",
      },
    ],
  }),
  component: ManagerControls,
});

function ManagerControls() {
  const navigate = useNavigate();
  const { session, clockOut, signOut, settings, updateSettings, managerUnlocked } = usePos();

  if (!managerUnlocked) {
    return (
      <>
        <ScreenHeader eyebrow="Tickets" title="Manager controls" back />
        <ScreenBody>
          <Card className="p-6 text-center">
            <LockKeyhole className="mx-auto size-6 text-accent" />
            <p className="mt-3 text-fs-sm font-extrabold text-foreground">Manager approval needed</p>
            <p className="mt-1 text-fs-xs text-muted-foreground">
              Enter a manager PIN to open session controls.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/access/manager-pin",
                  search: { action: "Manager controls", next: "manager-controls" },
                })
              }
              className="mt-4 inline-flex min-h-ctl-lg items-center rounded-pill bg-accent px-5 text-fs-sm font-bold text-accent-foreground"
            >
              Enter manager PIN
            </button>
          </Card>
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <ScreenHeader eyebrow="Tickets" title="Manager controls" back />
      <ScreenBody>
        <SectionLabel>Session</SectionLabel>
        <Card className="overflow-hidden">
          <NavRow to="/access/select-station" title="Change station" detail={session.station ?? "Not set"} />
          <ActionRow
            title="Clock out"
            detail={session.clockedIn ? "End your shift now" : "Already clocked out"}
            onClick={() => {
              clockOut();
              toast.success("Clocked out");
              navigate({ to: "/access/clock-in" });
            }}
          />
          <ActionRow
            title="Sign out of device"
            detail="Return to the sign in screen"
            tone="danger"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
          />
        </Card>

        <SectionLabel>Alerts</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            title="Require manager for voids"
            detail="PIN prompt before removing paid items"
            checked={settings.requireManagerVoid}
            onChange={(v) => updateSettings({ requireManagerVoid: v })}
          />
          <ToggleRow
            title="Slow ticket alerts"
            detail="Maya flags tickets waiting over 12 minutes"
            checked={settings.hapticFeedback}
            onChange={(v) => updateSettings({ hapticFeedback: v })}
          />
        </Card>

        <SectionLabel>Shift tools</SectionLabel>
        <Card className="overflow-hidden">
          <NavRow to="/settings/workforce" title="Workforce" detail="Employees and time" />
          <NavRow to="/system" title="Control Center" detail="Device operations" />
          <ActionRow
            title="Print shift report"
            detail="Sales, tips and voids since open"
            onClick={() => toast.success("Shift report sent to the kitchen printer")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
