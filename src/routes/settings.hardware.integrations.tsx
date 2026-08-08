import { createFileRoute } from "@tanstack/react-router";
import { ScreenBody, SubHeader } from "@/components/pos/shell";

export const Route = createFileRoute("/settings/hardware/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — EATOS Handheld hardware" },
      { name: "description", content: "Manage third-party integrations on the Handheld app." },
      { property: "og:title", content: "Integrations — EATOS Handheld hardware" },
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
        <p className="max-w-[18rem] text-center text-lg leading-snug text-foreground">
          Manage third-party integrations on the Handheld app.
        </p>
      </ScreenBody>
    </>
  );
}
