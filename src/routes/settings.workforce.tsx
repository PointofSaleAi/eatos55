import { createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, Users } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconNavRow } from "@/components/pos/settings-rows";

export const Route = createFileRoute("/settings/workforce")({
  head: () => ({
    meta: [
      { title: "Workforce — EATOS Handheld settings" },
      {
        name: "description",
        content: "Track employee clock-in and clock-out times from the handheld.",
      },
      { property: "og:title", content: "Workforce — EATOS Handheld settings" },
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
          <div className="px-6 pb-4 pt-6 text-center">
            <BriefcaseBusiness className="mx-auto size-14 text-foreground" strokeWidth={1.75} />
            <p className="mt-3 text-2xl font-medium text-foreground">Workforce</p>
            <p className="mt-4 text-lg leading-snug text-foreground">
              The ultimate tool for efficient workforce management. Access and track employee
              clock-in and clock-out times,…{" "}
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Access and track employee clock-in and clock-out times, manage breaks and review shift totals from Back Office.",
                  )
                }
                className="font-extrabold text-foreground underline-offset-4 hover:underline"
              >
                Learn more
              </button>
            </p>
          </div>
          <div className="border-t border-border">
            <IconNavRow
              title="Employee"
              icon={Users}
              color="indigo"
              onClick={() => toast.info("Employee list syncs from Back Office")}
            />
          </div>
        </GroupCard>
      </ScreenBody>
    </>
  );
}
