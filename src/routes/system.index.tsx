import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, NavRow, SectionLabel } from "@/components/pos/primitives";
import { hardware } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/system/")({
  head: () => ({
    meta: [
      { title: "Control Center — EATOS Handheld" },
      { name: "description", content: "Device operations: network, hardware, integrations, support." },
      { property: "og:title", content: "Control Center — EATOS Handheld" },
      {
        property: "og:description",
        content: "Device operations: network, hardware, integrations, support.",
      },
    ],
  }),
  component: ControlCenter,
});

function ControlCenter() {
  const { settings } = usePos();
  const issues = hardware.filter((h) => !h.ok).length;

  return (
    <>
      <ScreenHeader eyebrow="System" title="Control Center" back />
      <ScreenBody>
        <Card className="p-4">
          <p className="text-sm font-extrabold text-foreground">
            {issues ? `${issues} device${issues > 1 ? "s" : ""} need attention` : "All systems normal"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {settings.offlineMode ? "Offline mode is on" : "Connected to EATOS cloud"} · Version 4.12
          </p>
        </Card>

        <SectionLabel>Device</SectionLabel>
        <Card className="overflow-hidden">
          <NavRow to="/system/network" title="Network" detail="Wi-Fi, cellular, sync" />
          <NavRow to="/system/hardware" title="Hardware" detail={`${hardware.length} devices`} />
          <NavRow to="/system/integrations" title="Integrations" detail="Delivery, accounting, loyalty" />
        </Card>

        <SectionLabel>Help</SectionLabel>
        <Card className="overflow-hidden">
          <NavRow to="/system/customer-support" title="Customer support" detail="24/7 live agents" />
          <NavRow to="/system/help-center" title="Help center" detail="Guides and videos" />
        </Card>

        <SectionLabel>Maintenance</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Restart app"
            detail="Reloads the handheld shell"
            onClick={() => toast.success("App restarted")}
          />
          <ActionRow
            title="Run diagnostics"
            detail="Check printers, reader and network"
            onClick={() => toast.success("Diagnostics complete · 1 warning")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
