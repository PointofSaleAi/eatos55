import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { brand } from "@/lib/brand";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconNavRow } from "@/components/pos/settings-rows";

export const Route = createFileRoute("/settings/reports")({
  head: () => ({
    meta: [
      { title: `Reports - ${brand.appName} Handheld` },
      { name: "description", content: "Daily performance reports for this venue." },
      { property: "og:title", content: `Reports - ${brand.appName} Handheld` },
      {
        property: "og:description",
        content: "Daily performance reports for this venue.",
      },
    ],
  }),
  component: ReportsHub,
});

function ReportsHub() {
  return (
    <>
      <SubHeader title="Reports" backLabel="Settings" backTo="/settings" />
      <ScreenBody className="py-2">
        <p className="px-1 pb-4 text-fs-sm text-muted-foreground">
          View your daily performance data.
        </p>
        <GroupCard>
          <IconNavRow
            title="Sales Summary Report"
            icon={FileText}
            color="slate"
            to="/settings/sales-summary"
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
