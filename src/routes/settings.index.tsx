import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BottomTabs, ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, NavRow, SectionLabel } from "@/components/pos/primitives";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — EATOS Handheld" },
      { name: "description", content: "Account, venue, menu and payment settings for this device." },
      { property: "og:title", content: "Settings — EATOS Handheld" },
      {
        property: "og:description",
        content: "Account, venue, menu and payment settings for this device.",
      },
    ],
  }),
  component: SettingsHub,
});

function SettingsHub() {
  const navigate = useNavigate();
  const { session, settings, signOut } = usePos();

  return (
    <>
      <ScreenHeader eyebrow={settings.restaurantName} title="Settings" />
      <ScreenBody>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-foreground">
            {session.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-foreground">{session.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {session.role} · {session.station ?? "No station"}
            </p>
          </div>
        </Card>

        <SectionLabel>Venue</SectionLabel>
        <Card className="overflow-hidden">
          <NavRow to="/settings/general" title="General" detail="Venue, timezone, currency" />
          <NavRow to="/settings/menu" title="Menu" detail="Items, categories, availability" />
          <NavRow to="/settings/payment" title="Payment" detail="Tips, receipts, tenders" />
          <NavRow to="/settings/workforce" title="Workforce" detail="Employees and roles" />
        </Card>

        <SectionLabel>Device</SectionLabel>
        <Card className="overflow-hidden">
          <NavRow to="/system" title="Control Center" detail="Network, hardware, integrations" />
          <NavRow to="/tickets/whats-new" title="What is new" detail="Version 4.12" />
          <NavRow to="/settings/more" title="More" detail="Legal, support, advanced" />
        </Card>

        <SectionLabel>Session</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Sync now"
            detail="Push offline tickets to the cloud"
            onClick={() => toast.success("All tickets synced")}
          />
          <ActionRow
            title="Sign out"
            tone="danger"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
          />
        </Card>
      </ScreenBody>
      <BottomTabs />
    </>
  );
}
