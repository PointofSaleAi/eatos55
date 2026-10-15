import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { Users } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  GroupCard,
  IconNavRow,
} from "@/components/pos/settings-rows";

export const Route = createFileRoute("/settings/workforce")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  return (
    <>
      <SubHeader title="Workforce" />
      <ScreenBody className="py-2">
        <GroupCard>
          <IconNavRow title="Employee" icon={Users} color="black" topic="employee" />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
