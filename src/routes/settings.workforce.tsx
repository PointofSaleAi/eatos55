import { createFileRoute, Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { BriefcaseBusiness, Eye, Users } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  GroupCard,
  GroupLabel,
  IconNavRow,
  IconToggleRow,
  IconValueRow,
} from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/workforce")({
  head: () => ({
    meta: [
      { title: `Workforce - ${brand.appName} Handheld settings` },
      {
        name: "description",
        content: "Track employee clock-in and clock-out times from the handheld.",
      },
      { property: "og:title", content: `Workforce - ${brand.appName} Handheld settings` },
      {
        property: "og:description",
        content: "Track employee clock-in and clock-out times from the handheld.",
      },
    ],
  }),
  component: WorkforceSettings,
});

function WorkforceSettings() {
  const { settings, updateSettings, canManageSettings } = usePos();
  return (
    <>
      <SubHeader title="Workforce" />
      <ScreenBody className="py-2">
        <GroupCard>
          <div className="px-6 pb-4 pt-6 text-center">
            <BriefcaseBusiness className="mx-auto size-14 text-foreground" strokeWidth={1.75} />
            <p className="mt-3 text-fs-lg font-extrabold text-foreground">Workforce</p>
            <p className="mt-4 text-fs-sm leading-relaxed text-muted-foreground">
              The ultimate tool for efficient workforce management. Access and track employee
              clock-in and clock-out times,…
            </p>
            <p className="text-fs-sm leading-relaxed">
              <Link
                to="/system/article/$slug"
                params={{ slug: "close-shift" }}
                className="tap-safe font-extrabold text-foreground transition-colors hover:text-accent active:text-accent focus-visible:text-accent"
              >
                Learn more
              </Link>
            </p>
          </div>
          <div className="border-t border-border">
            <IconNavRow title="Employee" icon={Users} color="indigo" topic="employee" />
          </div>
        </GroupCard>

        <GroupLabel>Shift dashboard</GroupLabel>
        <GroupCard>
          {canManageSettings ? (
            <IconToggleRow
              title="Show shift totals to servers"
              subtitle="Sale, tip and hour figures on the pull down dashboard"
              icon={Eye}
              color="green"
              checked={settings.serverShiftTotals}
              onChange={(v) => updateSettings({ serverShiftTotals: v })}
            />
          ) : (
            <IconValueRow
              title="Show shift totals to servers"
              subtitle="A manager controls this switch"
              icon={Eye}
              color="grey"
              value={settings.serverShiftTotals ? "On" : "Off"}
            />
          )}
        </GroupCard>
      </ScreenBody>
    </>
  );
}
