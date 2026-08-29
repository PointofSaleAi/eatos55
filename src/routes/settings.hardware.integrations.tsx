import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ScreenBody, SubHeader } from "@/components/pos/shell";

export const Route = createFileRoute("/settings/hardware/integrations")({
  head: () => ({
    meta: [
      { title: `Integrations - ${brand.appName} Handheld hardware` },
      { name: "description", content: "Manage third-party integrations on the Handheld app." },
      { property: "og:title", content: `Integrations - ${brand.appName} Handheld hardware` },
      {
        property: "og:description",
        content: "Manage third-party integrations on the Handheld app.",
      },
    ],
  }),
  component: HardwareIntegrations,
});

function HardwareIntegrations() {
  return (
    <>
      <SubHeader title="Integrations" backLabel="Hardware" />
      <ScreenBody className="grid place-items-center">
        <p className="max-w-[18rem] text-center text-fs-sm leading-relaxed text-muted-foreground">
          Manage third-party integrations on the Handheld app.
        </p>
      </ScreenBody>
    </>
  );
}
