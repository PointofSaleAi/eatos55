import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconValueRow } from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/network")({
  head: () => ({
    meta: [
      { title: "Network — EATOS Handheld settings" },
      {
        name: "description",
        content: "Server connection used for data exchange between the handheld and the venue.",
      },
      { property: "og:title", content: "Network — EATOS Handheld settings" },
      {
        property: "og:description",
        content: "Server connection used for data exchange between the handheld and the venue.",
      },
    ],
  }),
  component: NetworkSettings,
});

function NetworkSettings() {
  const { settings } = usePos();

  return (
    <>
      <SubHeader title="Network" />
      <ScreenBody className="py-2">
        <p className="px-1 pb-4 text-lg leading-snug text-muted-foreground">
          Enabling seamless communication between client and server for data exchange.
        </p>
        <GroupCard>
          <IconValueRow
            title="Servers"
            value={settings.deviceName}
            icon={Server}
            color="green"
            chevron
            onClick={() => toast.success(`Connected to ${settings.deviceName}`)}
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
